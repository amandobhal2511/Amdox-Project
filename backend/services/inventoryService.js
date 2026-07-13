/**
 * Inventory Service
 * CRUD with auto stock status updates
 */
const { query } = require('../config/database');
const { getStockStatus } = require('../utils/stockStatus');
const { buildSearchClause } = require('../utils/helpers');

class InventoryService {
  async getAll({ search, category, status, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM inventory WHERE 1=1';
    let countSql = 'SELECT COUNT(*) FROM inventory WHERE 1=1';
    const params = [];
    const countParams = [];
    let paramIndex = 1;

    if (search) {
      const searchResult = buildSearchClause(['product_name', 'category'], search, paramIndex);
      sql += searchResult.clause;
      countSql += searchResult.clause;
      params.push(...searchResult.params);
      countParams.push(...searchResult.params);
      paramIndex = searchResult.nextIndex;
    }

    if (category) {
      sql += ` AND category = $${paramIndex}`;
      countSql += ` AND category = $${paramIndex}`;
      params.push(category);
      countParams.push(category);
      paramIndex++;
    }

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      countSql += ` AND status = $${paramIndex}`;
      params.push(status);
      countParams.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query(countSql, countParams);

    return {
      products: result.rows.map(this.formatProduct),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async getById(id) {
    const result = await query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatProduct(result.rows[0]);
  }

  async create({ name, quantity, price, category }) {
    const status = getStockStatus(quantity);
    const result = await query(
      `INSERT INTO inventory (product_name, quantity, price, category, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, quantity, price, category, status]
    );
    return this.formatProduct(result.rows[0]);
  }

  async update(id, { name, quantity, price, category }) {
    const existing = await query('SELECT * FROM inventory WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const current = existing.rows[0];
    const newQuantity = quantity !== undefined ? quantity : current.quantity;
    const status = getStockStatus(newQuantity);

    const result = await query(
      `UPDATE inventory
      SET product_name = COALESCE($1, product_name),
          quantity = COALESCE($2, quantity),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          status = $5
      WHERE id = $6
      RETURNING *`,
      [name, quantity, price, category, status, id]
    );

    return this.formatProduct(result.rows[0]);
}

  async delete(id) {
    const result = await query('DELETE FROM inventory WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return { id: result.rows[0].id };
  }

  formatProduct(row) {
    return {
      id: row.id,
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

module.exports = new InventoryService();
/**
 * Order Service
 * CRUD with search, filter, and status management
 */
const { query } = require('../config/database');
const { buildSearchClause } = require('../utils/helpers');

class OrderService {
  async getAll({ search, status, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchResult = buildSearchClause(['customer_name', 'product_name'], search, paramIndex);
      sql += searchResult.clause;
      params.push(...searchResult.params);
      paramIndex = searchResult.nextIndex;
    }

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const statsResult = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Processing') AS processing,
        COUNT(*) FILTER (WHERE status = 'Delivered') AS delivered,
        COALESCE(SUM(price), 0) AS total_value
      FROM orders
    `);

    return {
      orders: result.rows.map(this.formatOrder),
      stats: {
        total: parseInt(statsResult.rows[0].total, 10),
        pending: parseInt(statsResult.rows[0].pending, 10),
        processing: parseInt(statsResult.rows[0].processing, 10),
        delivered: parseInt(statsResult.rows[0].delivered, 10),
        totalValue: parseFloat(statsResult.rows[0].total_value),
      },
    };
  }

  async getById(id) {
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatOrder(result.rows[0]);
  }

  async create({ customerName, productName, quantity, price, status = 'Pending' }) {
    const result = await query(
      `INSERT INTO orders (customer_name, product_name, quantity, price, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customerName, productName, quantity, price, status]
    );
    return this.formatOrder(result.rows[0]);
  }

  async update(id, { customerName, productName, quantity, price, status }) {
    const result = await query(
      `UPDATE orders
       SET customer_name = COALESCE($1, customer_name),
           product_name = COALESCE($2, product_name),
           quantity = COALESCE($3, quantity),
           price = COALESCE($4, price),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [customerName, productName, quantity, price, status, id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatOrder(result.rows[0]);
  }

  async delete(id) {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    return { id: result.rows[0].id };
  }

  formatOrder(row) {
    return {
      id: row.id,
      customerName: row.customer_name,
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

module.exports = new OrderService();

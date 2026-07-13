/**
 * Finance Service
 * Transaction CRUD with revenue, expense, and profit calculations
 */
const { query } = require('../config/database');
const { buildSearchClause } = require('../utils/helpers');

class FinanceService {
  async getAll({ search, type, status, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM finance WHERE 1=1';
    let countSql = 'SELECT COUNT(*) FROM finance WHERE 1=1';
    const params = [];
    const countParams = [];
    let paramIndex = 1;

    if (search) {
      const searchResult = buildSearchClause(['type', 'description'], search, paramIndex);
      sql += searchResult.clause;
      countSql += searchResult.clause;
      params.push(...searchResult.params);
      countParams.push(...searchResult.params);
      paramIndex = searchResult.nextIndex;
    }

    if (type) {
      sql += ` AND type = $${paramIndex}`;
      countSql += ` AND type = $${paramIndex}`;
      params.push(type);
      countParams.push(type);
      paramIndex++;
    }

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      countSql += ` AND status = $${paramIndex}`;
      params.push(status);
      countParams.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query(countSql, countParams);
    const summary = await this.getSummary();

    return {
      transactions: result.rows.map(this.formatTransaction),
      summary,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async getSummary() {
    const result = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Revenue' AND status = 'Completed' THEN amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END), 0) AS total_expense
      FROM finance
    `);

    const totalRevenue = parseFloat(result.rows[0].total_revenue);
    const totalExpense = parseFloat(result.rows[0].total_expense);

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
    };
  }

  async getById(id) {
    const result = await query('SELECT * FROM finance WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatTransaction(result.rows[0]);
  }

  async create({ type, amount, date, status = 'Pending', description }) {
    const result = await query(
      `INSERT INTO finance (type, amount, date, status, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [type, amount, date || new Date().toISOString().split('T')[0], status, description]
    );
    return this.formatTransaction(result.rows[0]);
  }

  async update(id, { type, amount, date, status, description }) {
    const result = await query(
      `UPDATE finance
       SET type = COALESCE($1, type),
           amount = COALESCE($2, amount),
           date = COALESCE($3, date),
           status = COALESCE($4, status),
           description = COALESCE($5, description)
       WHERE id = $6
       RETURNING *`,
      [type, amount, date, status, description, id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatTransaction(result.rows[0]);
  }

  async delete(id) {
    const result = await query('DELETE FROM finance WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return { id: result.rows[0].id };
  }

  formatTransaction(row) {
    return {
      id: row.id,
      type: row.type,
      amount: parseFloat(row.amount),
      date: row.date,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
    };
  }
}

module.exports = new FinanceService();

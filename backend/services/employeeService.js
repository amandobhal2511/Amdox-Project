/**
 * Employee Service
 * CRUD operations with search and filter
 */
const { query } = require('../config/database');
const { buildSearchClause } = require('../utils/helpers');

class EmployeeService {
  async getAll({ search, department, status, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchResult = buildSearchClause(['name', 'email', 'department'], search, paramIndex);
      sql += searchResult.clause;
      params.push(...searchResult.params);
      paramIndex = searchResult.nextIndex;
    }

    if (department) {
      sql += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) FROM employees WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (search) {
      const searchResult = buildSearchClause(['name', 'email', 'department'], search, countIndex);
      countSql += searchResult.clause;
      countParams.push(...searchResult.params);
      countIndex = searchResult.nextIndex;
    }
    if (department) {
      countSql += ` AND department = $${countIndex}`;
      countParams.push(department);
      countIndex++;
    }
    if (status) {
      countSql += ` AND status = $${countIndex}`;
      countParams.push(status);
    }

    const countResult = await query(countSql, countParams);

    return {
      employees: result.rows.map(this.formatEmployee),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async getById(id) {
    const result = await query('SELECT * FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatEmployee(result.rows[0]);
  }

  async create({ name, email, department, salary, status = 'Active' }) {
    // Create employee + broadcast notification in a single transaction
    const { getClient } = require('../config/database');
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const empResult = await client.query(
        `INSERT INTO employees (name, email, department, salary, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, email.toLowerCase(), department, salary, status]
      );

      const employee = empResult.rows[0];

      const usersResult = await client.query('SELECT id FROM users');
      const userIds = usersResult.rows.map((r) => r.id);

      if (userIds.length > 0) {
        const message = `New employee added: ${employee.name} (${employee.department})`;

        const values = [];
        const params = [];
        let i = 1;
        for (const userId of userIds) {
          values.push(`($${i++}, $${i++}, 'Unread')`);
          params.push(userId, message);
        }

        await client.query(
          `INSERT INTO notifications (user_id, message, status) VALUES ${values.join(', ')}`,
          params
        );
      }

      await client.query('COMMIT');
      return this.formatEmployee(employee);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id, { name, email, department, salary, status }) {
    const result = await query(
      `UPDATE employees
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           department = COALESCE($3, department),
           salary = COALESCE($4, salary),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [name, email?.toLowerCase(), department, salary, status, id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatEmployee(result.rows[0]);
  }

  async delete(id) {
    const result = await query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }
    return { id: result.rows[0].id };
  }

  formatEmployee(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      department: row.department,
      salary: parseFloat(row.salary),
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

module.exports = new EmployeeService();

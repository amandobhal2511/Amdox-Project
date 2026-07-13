/**
 * Notification Service
 * CRUD with read/unread status management
 */
const { query } = require('../config/database');

class NotificationService {
  async getAll(userId, { status, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const unreadResult = await query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND status = 'Unread'",
      [userId]
    );

    return {
      notifications: result.rows.map(this.formatNotification),
      unreadCount: parseInt(unreadResult.rows[0].count, 10),
    };
  }

  async getById(id, userId) {
    const result = await query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rows.length === 0) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatNotification(result.rows[0]);
  }

  async create(userId, { message, status = 'Unread' }) {
    const result = await query(
      `INSERT INTO notifications (user_id, message, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, message, status]
    );
    return this.formatNotification(result.rows[0]);
  }

  async update(id, userId, { message, status }) {
    const result = await query(
      `UPDATE notifications
       SET message = COALESCE($1, message),
           status = COALESCE($2, status)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [message, status, id, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return this.formatNotification(result.rows[0]);
  }

  async markAsRead(id, userId) {
    return this.update(id, userId, { status: 'Read' });
  }

  async markAllAsRead(userId) {
    const result = await query(
      "UPDATE notifications SET status = 'Read' WHERE user_id = $1 AND status = 'Unread'",
      [userId]
    );
    return { updated: result.rowCount };
  }

  async delete(id, userId) {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return { id: result.rows[0].id };
  }

  formatNotification(row) {
    return {
      id: row.id,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

module.exports = new NotificationService();

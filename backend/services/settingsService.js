/**
 * Settings Service
 * User preference management
 */
const { query } = require('../config/database');

class SettingsService {
  async getByUserId(userId) {
    let result = await query('SELECT * FROM settings WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO settings (user_id, dark_mode, notifications_enabled)
         VALUES ($1, TRUE, TRUE)
         RETURNING *`,
        [userId]
      );
    }

    const userResult = await query(
      'SELECT full_name, email, company_name FROM users WHERE id = $1',
      [userId]
    );

    return {
      ...this.formatSettings(result.rows[0]),
      profile: {
        fullName: userResult.rows[0].full_name,
        email: userResult.rows[0].email,
        companyName: userResult.rows[0].company_name,
      },
    };
  }

  async update(userId, { darkMode, notificationsEnabled, fullName, email, companyName }) {
    const settingsResult = await query(
      `INSERT INTO settings (user_id, dark_mode, notifications_enabled)
       VALUES ($1, COALESCE($2, TRUE), COALESCE($3, TRUE))
       ON CONFLICT (user_id) DO UPDATE
       SET dark_mode = COALESCE($2, settings.dark_mode),
           notifications_enabled = COALESCE($3, settings.notifications_enabled),
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, darkMode, notificationsEnabled]
    );

    if (fullName || email || companyName) {
      await query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             email = COALESCE($2, email),
             company_name = COALESCE($3, company_name)
         WHERE id = $4`,
        [fullName, email?.toLowerCase(), companyName, userId]
      );
    }

    return this.getByUserId(userId);
  }

  formatSettings(row) {
    return {
      id: row.id,
      userId: row.user_id,
      darkMode: row.dark_mode,
      notificationsEnabled: row.notifications_enabled,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new SettingsService();

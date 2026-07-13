/**
 * Authentication Service
 * Handles signup, login, logout, and session management
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const config = require('../config/env');
const { hashToken } = require('../utils/helpers');

class AuthService {
  /**
   * Register a new user
   */
  async signup({ fullName, email, password, companyName, role = 'Employee' }) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (full_name, email, password, company_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, company_name, role, created_at`,
      [fullName, email.toLowerCase(), hashedPassword, companyName, role]
    );

    const user = result.rows[0];

    // Create default settings for new user
    await query(
      `INSERT INTO settings (user_id, dark_mode, notifications_enabled)
       VALUES ($1, TRUE, TRUE)`,
      [user.id]
    );

    const { token, expiresAt } = await this.createSession(user.id);

    return {
      user: this.formatUser(user),
      token,
      expiresAt,
    };
  }

  /**
   * Authenticate user and create session
   */
  async login({ email, password }) {
    const result = await query(
      'SELECT id, full_name, email, password, company_name, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const { token, expiresAt } = await this.createSession(user.id);

    return {
      user: this.formatUser(user),
      token,
      expiresAt,
    };
  }

  /**
   * Create JWT token and store session in database
   */
  async createSession(userId) {
    const expiresAt = new Date(Date.now() + config.session.maxAge);

    const token = jwt.sign(
      { userId, sessionId: Date.now() },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const tokenHash = hashToken(token);

    await query(
      'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    return { token, expiresAt };
  }

  /**
   * Logout — destroy session
   */
  async logout(token) {
    const tokenHash = hashToken(token);
    await query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    return true;
  }

  /**
   * Clean up expired sessions (can be run periodically)
   */
  async cleanupExpiredSessions() {
    const result = await query('DELETE FROM sessions WHERE expires_at < NOW()');
    return result.rowCount;
  }

  /**
   * Format user object (exclude password)
   */
  formatUser(user) {
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      companyName: user.company_name,
      role: user.role,
      createdAt: user.created_at,
    };
  }
}

module.exports = new AuthService();

/**
 * Utility helpers
 */
const crypto = require('crypto');

/**
 * Wrap async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard API success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard API error response
 */
const sendError = (res, message, statusCode = 400, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Hash a token for secure session storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Parse pagination from query params
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build search ILIKE clause for PostgreSQL
 */
const buildSearchClause = (fields, searchTerm, paramIndex) => {
  if (!searchTerm) return { clause: '', params: [], nextIndex: paramIndex };

  const conditions = fields.map((field) => `${field} ILIKE $${paramIndex}`);
  return {
    clause: ` AND (${conditions.join(' OR ')})`,
    params: [`%${searchTerm}%`],
    nextIndex: paramIndex + 1,
  };
};

module.exports = {
  asyncHandler,
  sendSuccess,
  sendError,
  hashToken,
  isValidEmail,
  isValidPassword,
  getPagination,
  buildSearchClause,
};

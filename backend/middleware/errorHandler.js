/**
 * Global error handling middleware
 */
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. Record already exists.',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  // PostgreSQL auth / connection failures
  // 28P01 = invalid_password, 3D000 = invalid_catalog_name, ECONNREFUSED etc.
  if (err.code === '28P01' || err.code === '3D000' || err.code === 'ECONNREFUSED') {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Check backend/.env DB_* settings.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please login again.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && !err.statusCode ? { stack: err.stack } : {}),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };

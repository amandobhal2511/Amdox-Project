/**
 * JWT Authentication middleware
 * Verifies token and validates session in database
 */
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const config = require('../config/env');
const { hashToken } = require('../utils/helpers');

/**
 * Protect routes — requires valid JWT + active session
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify session exists and is not expired
    const tokenHash = hashToken(token);
    const sessionResult = await query(
      `SELECT s.id AS session_id, s.user_id, s.expires_at, u.id, u.full_name, u.email, u.company_name, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.',
      });
    }

    const session = sessionResult.rows[0];

    req.user = {
      id: session.user_id,
      fullName: session.full_name,
      email: session.email,
      companyName: session.company_name,
      role: session.role,
    };
    req.sessionId = session.session_id;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: error.name === 'TokenExpiredError'
          ? 'Token expired. Please login again.'
          : 'Invalid token.',
      });
    }
    next(error);
  }
};

/**
 * Optional authentication — attaches user if token present, does not block
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuth };

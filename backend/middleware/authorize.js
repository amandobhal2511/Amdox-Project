/**
 * Role-based authorization middleware
 */
const { hasPermission } = require('../utils/permissions');

/**
 * Authorize user based on required module permission
 * @param {string} module - Module name (employees, finance, etc.)
 */
const authorize = (module) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (!hasPermission(req.user.role, module)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Your role (${req.user.role}) does not have permission for ${module}.`,
    });
  }

  next();
};

/**
 * Restrict to specific roles
 * @param  {...string} roles
 */
const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }

  next();
};

module.exports = { authorize, requireRoles };

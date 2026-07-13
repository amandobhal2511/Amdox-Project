/**
 * Role-based permission definitions
 */
const ROLE_PERMISSIONS = {
  Admin: ['dashboard', 'employees', 'inventory', 'finance', 'orders', 'notifications', 'settings'],
  HR: ['dashboard', 'employees', 'notifications', 'settings'],
  Finance: ['dashboard', 'finance', 'orders', 'notifications', 'settings'],
  Employee: ['dashboard', 'inventory', 'notifications', 'settings']
};

/**
 * Check if a role has permission for a module
 */
const hasPermission = (role, module) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(module);
};

module.exports = { ROLE_PERMISSIONS, hasPermission };

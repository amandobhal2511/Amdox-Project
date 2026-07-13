/**
 * Validation rules for API requests
 */
const { body, param, query } = require('express-validator');

const authRules = {
  signup: [
    body('fullName').trim().notEmpty().withMessage('Full name is required')
      .isLength({ max: 150 }).withMessage('Name too long'),
    body('email').trim().isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
  ],
  login: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const employeeRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Valid salary is required'),
    body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid employee ID required'),
    body('name').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('department').optional().trim().notEmpty(),
    body('salary').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['Active', 'Inactive']),
  ],
  id: [param('id').isInt({ min: 1 }).withMessage('Valid ID required')],
};

const inventoryRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().notEmpty(),
    body('quantity').optional().isInt({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().trim().notEmpty(),
  ],
  id: [param('id').isInt({ min: 1 })],
};

const financeRules = {
  create: [
    body('type').isIn(['Revenue', 'Expense']).withMessage('Type must be Revenue or Expense'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
    body('date').optional().isISO8601().withMessage('Valid date required'),
    body('status').optional().isIn(['Completed', 'Pending']),
    body('description').optional().trim(),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('type').optional().isIn(['Revenue', 'Expense']),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('date').optional().isISO8601(),
    body('status').optional().isIn(['Completed', 'Pending']),
  ],
  id: [param('id').isInt({ min: 1 })],
};

const orderRules = {
  create: [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('status').optional().isIn(['Pending', 'Processing', 'Delivered']),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('customerName').optional().trim().notEmpty(),
    body('productName').optional().trim().notEmpty(),
    body('quantity').optional().isInt({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['Pending', 'Processing', 'Delivered']),
  ],
  id: [param('id').isInt({ min: 1 })],
};

const notificationRules = {
  create: [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('status').optional().isIn(['Read', 'Unread']),
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('message').optional().trim().notEmpty(),
    body('status').optional().isIn(['Read', 'Unread']),
  ],
  id: [param('id').isInt({ min: 1 })],
};

const settingsRules = {
  update: [
    body('darkMode').optional().isBoolean(),
    body('notificationsEnabled').optional().isBoolean(),
    body('fullName').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('companyName').optional().trim().notEmpty(),
  ],
};

module.exports = {
  authRules,
  employeeRules,
  inventoryRules,
  financeRules,
  orderRules,
  notificationRules,
  settingsRules,
};

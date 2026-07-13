/**
 * Employee Routes
 */
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireRoles } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { employeeRules } = require('../utils/validators');

router.use(authenticate, authorize('employees'));

router.get('/', asyncHandler(employeeController.getAll));
router.get('/:id', employeeRules.id, validate, asyncHandler(employeeController.getById));
// Admin-only mutations
router.post('/', requireRoles('Admin'), employeeRules.create, validate, asyncHandler(employeeController.create));
router.put('/:id', requireRoles('Admin'), employeeRules.update, validate, asyncHandler(employeeController.update));
router.delete('/:id', requireRoles('Admin'), employeeRules.id, validate, asyncHandler(employeeController.remove));

module.exports = router;

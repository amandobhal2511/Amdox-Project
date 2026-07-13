/**
 * Inventory Routes
 */

const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');
const { authorize, requireRoles } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { inventoryRules } = require('../utils/validators');

// All inventory routes require login
router.use(authenticate);

// Everyone with inventory permission can VIEW
router.get(
  '/',
  authorize('inventory'),
  asyncHandler(inventoryController.getAll)
);

router.get(
  '/:id',
  authorize('inventory'),
  inventoryRules.id,
  validate,
  asyncHandler(inventoryController.getById)
);

// Only Admin can CREATE
router.post(
  '/',
  requireRoles('Admin'),
  inventoryRules.create,
  validate,
  asyncHandler(inventoryController.create)
);

// Only Admin can UPDATE
router.put(
  '/:id',
  requireRoles('Admin'),
  inventoryRules.update,
  validate,
  asyncHandler(inventoryController.update)
);

// Only Admin can DELETE
router.delete(
  '/:id',
  requireRoles('Admin'),
  inventoryRules.id,
  validate,
  asyncHandler(inventoryController.remove)
);

module.exports = router;
/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { orderRules } = require('../utils/validators');

router.use(authenticate, authorize('orders'));

router.get('/', asyncHandler(orderController.getAll));
router.get('/:id', orderRules.id, validate, asyncHandler(orderController.getById));
router.post('/', orderRules.create, validate, asyncHandler(orderController.create));
router.put('/:id', orderRules.update, validate, asyncHandler(orderController.update));
router.delete('/:id', orderRules.id, validate, asyncHandler(orderController.remove));

module.exports = router;

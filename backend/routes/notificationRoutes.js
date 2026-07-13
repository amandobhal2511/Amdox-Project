/**
 * Notification Routes
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { notificationRules } = require('../utils/validators');

router.use(authenticate, authorize('notifications'));

router.get('/', asyncHandler(notificationController.getAll));
router.put('/read-all', asyncHandler(notificationController.markAllAsRead));
router.get('/:id', notificationRules.id, validate, asyncHandler(notificationController.getById));
router.post('/', notificationRules.create, validate, asyncHandler(notificationController.create));
router.put('/:id', notificationRules.update, validate, asyncHandler(notificationController.update));
router.put('/:id/read', notificationRules.id, validate, asyncHandler(notificationController.markAsRead));
router.delete('/:id', notificationRules.id, validate, asyncHandler(notificationController.remove));

module.exports = router;

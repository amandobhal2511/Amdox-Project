/**
 * Settings Routes
 */
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { settingsRules } = require('../utils/validators');

router.use(authenticate, authorize('settings'));

router.get('/', asyncHandler(settingsController.getSettings));
router.put('/', settingsRules.update, validate, asyncHandler(settingsController.updateSettings));

module.exports = router;

/**
 * Dashboard Routes
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { asyncHandler } = require('../utils/helpers');

router.get('/stats', authenticate, authorize('dashboard'), asyncHandler(dashboardController.getStats));

module.exports = router;

/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../utils/helpers');
const { authRules } = require('../utils/validators');

router.post('/signup', authLimiter, authRules.signup, validate, asyncHandler(authController.signup));
router.post('/login', authLimiter, authRules.login, validate, asyncHandler(authController.login));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getMe));

module.exports = router;

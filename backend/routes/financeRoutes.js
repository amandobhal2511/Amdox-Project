/**
 * Finance Routes
 */
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/helpers');
const { financeRules } = require('../utils/validators');

router.use(authenticate, authorize('finance'));

router.get('/summary', asyncHandler(financeController.getSummary));
router.get('/', asyncHandler(financeController.getAll));
router.get('/:id', financeRules.id, validate, asyncHandler(financeController.getById));
router.post('/', financeRules.create, validate, asyncHandler(financeController.create));
router.put('/:id', financeRules.update, validate, asyncHandler(financeController.update));
router.delete('/:id', financeRules.id, validate, asyncHandler(financeController.remove));

module.exports = router;

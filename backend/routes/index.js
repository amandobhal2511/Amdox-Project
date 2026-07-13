/**
 * Main route aggregator
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const employeeRoutes = require('./employeeRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const financeRoutes = require('./financeRoutes');
const orderRoutes = require('./orderRoutes');
const notificationRoutes = require('./notificationRoutes');
const settingsRoutes = require('./settingsRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finance', financeRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Cloud ERP API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

/**
 * Dashboard Controller
 */
const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/helpers');

const getStats = async (req, res) => {
  const stats = await dashboardService.getStats();
  sendSuccess(res, stats, 'Dashboard stats retrieved');
};

module.exports = { getStats };

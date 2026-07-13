/**
 * Settings Controller
 */
const settingsService = require('../services/settingsService');
const { sendSuccess } = require('../utils/helpers');

const getSettings = async (req, res) => {
  const settings = await settingsService.getByUserId(req.user.id);
  sendSuccess(res, settings, 'Settings retrieved');
};

const updateSettings = async (req, res) => {
  const settings = await settingsService.update(req.user.id, req.body);
  sendSuccess(res, settings, 'Settings updated');
};

module.exports = { getSettings, updateSettings };

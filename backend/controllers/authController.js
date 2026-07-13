/**
 * Authentication Controller
 */
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/helpers');

const signup = async (req, res) => {
  const { fullName, email, password, companyName } = req.body;
  const result = await authService.signup({ fullName, email, password, companyName });

  req.session.userId = result.user.id;

  sendSuccess(res, result, 'Account created successfully', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  req.session.userId = result.user.id;

  sendSuccess(res, result, 'Login successful');
};

const logout = async (req, res) => {
  if (req.token) {
    await authService.logout(req.token);
  }

  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err.message);
  });

  sendSuccess(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  sendSuccess(res, { user: req.user }, 'User profile retrieved');
};

module.exports = { signup, login, logout, getMe };

/**
 * Notification Controller
 */
const notificationService = require('../services/notificationService');
const { sendSuccess, getPagination } = require('../utils/helpers');

const getAll = async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const result = await notificationService.getAll(req.user.id, {
    status: req.query.status,
    limit,
    offset,
  });
  sendSuccess(res, { ...result, page, limit }, 'Notifications retrieved');
};

const getById = async (req, res) => {
  const notification = await notificationService.getById(req.params.id, req.user.id);
  sendSuccess(res, notification, 'Notification retrieved');
};

const create = async (req, res) => {
  const notification = await notificationService.create(req.user.id, req.body);
  sendSuccess(res, notification, 'Notification created', 201);
};

const update = async (req, res) => {
  const notification = await notificationService.update(req.params.id, req.user.id, req.body);
  sendSuccess(res, notification, 'Notification updated');
};

const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, notification, 'Notification marked as read');
};

const markAllAsRead = async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  sendSuccess(res, result, 'All notifications marked as read');
};

const remove = async (req, res) => {
  const result = await notificationService.delete(req.params.id, req.user.id);
  sendSuccess(res, result, 'Notification deleted');
};

module.exports = { getAll, getById, create, update, markAsRead, markAllAsRead, remove };

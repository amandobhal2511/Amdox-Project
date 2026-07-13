/**
 * Order Controller
 */
const orderService = require('../services/orderService');
const { sendSuccess, getPagination } = require('../utils/helpers');

const getAll = async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const result = await orderService.getAll({
    search: req.query.search,
    status: req.query.status,
    limit,
    offset,
  });
  sendSuccess(res, { ...result, page, limit }, 'Orders retrieved');
};

const getById = async (req, res) => {
  const order = await orderService.getById(req.params.id);
  sendSuccess(res, order, 'Order retrieved');
};

const create = async (req, res) => {
  const order = await orderService.create(req.body);
  sendSuccess(res, order, 'Order created', 201);
};

const update = async (req, res) => {
  const order = await orderService.update(req.params.id, req.body);
  sendSuccess(res, order, 'Order updated');
};

const remove = async (req, res) => {
  const result = await orderService.delete(req.params.id);
  sendSuccess(res, result, 'Order deleted');
};

module.exports = { getAll, getById, create, update, remove };

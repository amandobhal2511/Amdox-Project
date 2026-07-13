/**
 * Inventory Controller
 */
const inventoryService = require('../services/inventoryService');
const { sendSuccess, getPagination } = require('../utils/helpers');

const getAll = async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const result = await inventoryService.getAll({
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
    limit,
    offset,
  });
  sendSuccess(res, { ...result, page, limit }, 'Inventory retrieved');
};

const getById = async (req, res) => {
  const product = await inventoryService.getById(req.params.id);
  sendSuccess(res, product, 'Product retrieved');
};

const create = async (req, res) => {
  const product = await inventoryService.create(req.body);
  sendSuccess(res, product, 'Product created', 201);
};

const update = async (req, res) => {
  const product = await inventoryService.update(req.params.id, req.body);
  sendSuccess(res, product, 'Product updated');
};

const remove = async (req, res) => {
  const result = await inventoryService.delete(req.params.id);
  sendSuccess(res, result, 'Product deleted');
};

module.exports = { getAll, getById, create, update, remove };

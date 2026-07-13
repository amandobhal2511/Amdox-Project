/**
 * Finance Controller
 */
const financeService = require('../services/financeService');
const { sendSuccess, getPagination } = require('../utils/helpers');

const getAll = async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const result = await financeService.getAll({
    search: req.query.search,
    type: req.query.type,
    status: req.query.status,
    limit,
    offset,
  });
  sendSuccess(res, { ...result, page, limit }, 'Finance records retrieved');
};

const getById = async (req, res) => {
  const transaction = await financeService.getById(req.params.id);
  sendSuccess(res, transaction, 'Transaction retrieved');
};

const create = async (req, res) => {
  const transaction = await financeService.create(req.body);
  sendSuccess(res, transaction, 'Transaction created', 201);
};

const update = async (req, res) => {
  const transaction = await financeService.update(req.params.id, req.body);
  sendSuccess(res, transaction, 'Transaction updated');
};

const remove = async (req, res) => {
  const result = await financeService.delete(req.params.id);
  sendSuccess(res, result, 'Transaction deleted');
};

const getSummary = async (req, res) => {
  const summary = await financeService.getSummary();
  sendSuccess(res, summary, 'Finance summary retrieved');
};

module.exports = { getAll, getById, create, update, remove, getSummary };

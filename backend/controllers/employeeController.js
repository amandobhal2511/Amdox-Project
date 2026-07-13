/**
 * Employee Controller
 */
const employeeService = require('../services/employeeService');
const { sendSuccess } = require('../utils/helpers');
const { getPagination } = require('../utils/helpers');

const getAll = async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const result = await employeeService.getAll({
    search: req.query.search,
    department: req.query.department,
    status: req.query.status,
    limit,
    offset,
  });
  sendSuccess(res, { ...result, page, limit }, 'Employees retrieved');
};

const getById = async (req, res) => {
  const employee = await employeeService.getById(req.params.id);
  sendSuccess(res, employee, 'Employee retrieved');
};

const create = async (req, res) => {
  const employee = await employeeService.create(req.body);
  sendSuccess(res, employee, 'Employee created', 201);
};

const update = async (req, res) => {
  const employee = await employeeService.update(req.params.id, req.body);
  sendSuccess(res, employee, 'Employee updated');
};

const remove = async (req, res) => {
  const result = await employeeService.delete(req.params.id);
  sendSuccess(res, result, 'Employee deleted');
};

module.exports = { getAll, getById, create, update, remove };

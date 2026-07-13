/**
 * Request logging middleware using Morgan
 */
const morgan = require('morgan');
const config = require('../config/env');

const logger = config.nodeEnv === 'production'
  ? morgan('combined')
  : morgan('dev');

module.exports = logger;

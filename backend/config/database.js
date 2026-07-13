/**
 * PostgreSQL connection pool
 * Uses parameterized queries to prevent SQL injection
 */
const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  if (config.nodeEnv === 'development') {
    console.log('PostgreSQL pool connected');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Execute a parameterized query
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Query parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (config.nodeEnv === 'development') {
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms | rows: ${result.rowCount}`);
  }
  return result;
};

/**
 * Get a client for transactions
 */
const getClient = async () => pool.connect();

module.exports = { pool, query, getClient };

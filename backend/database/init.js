/**
 * Database initialization script
 * Creates database schema from schema.sql
 * Run: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Initializing database schema...');

  try {
    await pool.query(schema);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();

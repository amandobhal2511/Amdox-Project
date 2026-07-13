require('dotenv').config();
const { Pool } = require('pg');

console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => {
    console.log("Connected");
    process.exit();
  })
  .catch(err => {
    console.log("ERROR FULL:", err);
    process.exit();
  });
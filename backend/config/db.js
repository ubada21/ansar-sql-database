const mysql = require('mysql2/promise');

require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'ansar',       
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;


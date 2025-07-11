const mysql = require('mysql2/promise');
const fs = require('fs');

require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});
if (process.env.DB_SSL_CA) {
  pool.ssl = {
    ca: Buffer.from(process.env.DB_SSL_CA, 'base64').toString('utf8'),
    // Only CA cert needed for server verification
    rejectUnauthorized: true
  }
}
module.exports = pool;


const mysql = require('mysql2/promise');

require('dotenv').config()

const mysqlConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};

if (process.env.DB_SSL_CA) {
  mysqlConfig.ssl = {
    ca: Buffer.from(process.env.DB_SSL_CA, 'base64').toString('utf8'),
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool(mysqlConfig);
module.exports = pool;


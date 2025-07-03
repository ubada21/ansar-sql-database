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
  queueLimit: 0
});
if (process.env.SSL_CA_PATH) {
  pool.ssl = {
    ca: fs.readFileSync(process.env.SSL_CA_PATH),
  };
}
module.exports = pool;


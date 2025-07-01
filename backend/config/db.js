const mysql = require('mysql2/promise');
const fs = require('fs');

require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'ansar_db',
    ssl: {
      // optional if SSL mode is required and you have the CA cert file
      ca: fs.readFileSync(process.env.SSL_CA_PATH),
      // other SSL options depending on your provider, e.g. rejectUnauthorized: true
    },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;


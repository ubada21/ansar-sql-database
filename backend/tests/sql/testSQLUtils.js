const fs = require('fs');
const path = require('path');
const db = require('../../config/db')

// Use the main init.sql file for test DB setup
const sqlInitFile = path.join(__dirname, '../../../init.sql');
const initSql = fs.readFileSync(sqlInitFile, 'utf8');

async function initializeDatabase() {
  try {
    await db.query(initSql);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { initializeDatabase }


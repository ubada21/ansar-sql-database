const fs = require('fs');
const path = require('path');
const db = require('../../config/db')


// Read SQL file

const sqlInitFile = path.join(__dirname, 'test_init.sql');
const initSql = fs.readFileSync(sqlInitFile, 'utf8');
console.log(sqlInitFile)


async function initializeDatabase() {
  console.log(sqlInitFile)
  try {
    await db.query(initSql);
    console.log('Database initialized successfully.');

  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { initializeDatabase }


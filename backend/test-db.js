const pool = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database connected successfully!');
    console.log('Test result:', rows[0].result); // Should log: 2
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

testConnection();

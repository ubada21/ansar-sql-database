const express = require('express');
const router = express.Router();
const db = require('../config/db');

// CRUD OPERATIONS

// get all
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM USERS');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// get by UID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM USERS WHERE UID = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// post user
router.post('/users', async (req, res) => {
  const {
    FirstName,
    MiddleName,
    LastName,
    DOB,
    Email,
    PhoneNumber,
    Address,
    City,
    Province,
    PostalCode
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO USERS 
      (FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode]
    );

    res.status(201).json({ message: 'User created successfully', UID: result.insertId });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// update user
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const {
    FirstName,
    MiddleName,
    LastName,
    DOB,
    Email,
    PhoneNumber,
    Address,
    City,
    Province,
    PostalCode
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE USERS SET
        FirstName = ?,
        MiddleName = ?,
        LastName = ?,
        DOB = ?,
        Email = ?,
        PhoneNumber = ?,
        Address = ?,
        City = ?,
        Province = ?,
        PostalCode = ?
      WHERE UID = ?`,
      [FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User with UID ${id} updated successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM USERS WHERE UID = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User with UID ${id} deleted successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

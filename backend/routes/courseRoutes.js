const express = require('express');
const router = express.Router();
const db = require('../config/db');

// CRUD OPERATIONS

// get all
router.get('/courses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM COURSES');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// get by courseID
router.get('/courses/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM COURSES WHERE CourseID = ?', [cid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// post course
router.post('/courses', async (req, res) => {
  const {
    CourseID,
    Title,
    StartDate,
    EndDate,
    Schedule,
    Location
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO COURSES 
      (CourseID, Title, StartDate, EndDate, Schedule, Location)
      VALUES (?, ?, ?, ?, ?, ?)`, 
      [CourseID, Title, StartDate, EndDate, Schedule, Location]
    );

    res.status(201).json({ message: 'Course created successfully', CourseID: result.insertId });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// update course
router.put('/courses/:cid', async (req, res) => {
  const { cid } = req.params;
  const {
    CourseID,
    Title,
    StartDate,
    EndDate,
    Schedule,
    Location
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE COURSES SET
        Title = ?,
        StartDate = ?,
        EndDate = ?,
        Schedule = ?,
        Location = ?
      WHERE CourseID = ?`,
      [Title, StartDate, EndDate, Schedule, Location, cid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course with CourseID ${cid} updated successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// delete course
router.delete('/courses/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const [result] = await db.query('DELETE FROM COURSES WHERE CourseID = ?', [cid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course with CourseID ${cid} deleted successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

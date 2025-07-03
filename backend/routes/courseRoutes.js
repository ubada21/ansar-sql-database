const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController.js')


// get all
router.get('/courses', courseController.getAllCourses)

// get by courseID
router.get('/courses/:cid', courseController.getCourseById)

// post course
router.post('/courses', courseController.createCourse)

// update course
router.put('/courses/:cid', courseController.updateCourse)

// delete course
router.delete('/courses/:cid', courseController.deleteCourse)

module.exports = router;

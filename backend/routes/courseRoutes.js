const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController')
const { requirePermission } = require('../middlewares/rbacMiddleware')



// get all
router.get('/courses', courseController.getAllCourses)

// get by courseID
router.get('/courses/:cid', courseController.getCourseById)

// post course
router.post('/courses',requirePermission('modify_course'), courseController.createCourse)

// update course
router.put('/courses/:cid', requirePermission('modify_course'), courseController.updateCourse)

// delete course
router.delete('/courses/:cid', requirePermission('modify_course'), courseController.deleteCourse)

// assign instructor to course
router.post('/courses/:cid/instructors/:uid', requirePermission('assign_instructor'), courseController.assignInstructorToCourse)
module.exports = router;

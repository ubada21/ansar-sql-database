const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')



// get all
router.get('/courses', courseController.getAllCourses)

// get by courseID
router.get('/courses/:cid', courseController.getCourseById)

// post course
router.post('/courses',authJwtToken, requirePermission('modify_course'), courseController.createCourse)

// update course
router.put('/courses/:cid', authJwtToken, requirePermission('modify_course'), courseController.updateCourse)

router.post('/courses/:cid/schedule', authJwtToken, requirePermission('modify_course'), courseController.addCourseSchedule)

// delete course
router.delete('/courses/:cid', authJwtToken, requirePermission('modify_course'), courseController.deleteCourse)

// assign instructor to course
router.post('/courses/:cid/instructors/:uid', authJwtToken, requirePermission('assign_instructor'), courseController.assignInstructorToCourse)

// gett all instructors for a course
router.get('/courses/:cid/instructors', courseController.getCourseInstructors)

// assign instructor to course
router.post('/courses/:cid/students/:uid', courseController.enrollUserIntoCourse)

// get all students in a course
router.get('/courses/:cid/students', courseController.getAllStudentsInCourse)

// remove student from course
router.delete('/courses/:cid/students/:uid', courseController.removeStudentEnrollment)

// remove instructor from course
router.delete('/courses/:cid/instructors/:uid', courseController.removeInstructorFromCourse)

router.patch('/courses/:cid/students/:uid', courseController.updateEnrollment)

module.exports = router;

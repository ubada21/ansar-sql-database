const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController')
const { requirePermission } = require('../middlewares/rbacMiddleware')
const { authJwtToken } = require('../middlewares/authMiddleware')

router.get('/courses', courseController.getAllCourses)

router.get('/courses/:cid', courseController.getCourseById)

router.post('/courses',authJwtToken, requirePermission('modify_course'), courseController.createFullCourse)

router.put('/courses/:cid', authJwtToken, requirePermission('modify_course'), courseController.updateCourse)

router.post('/courses/:cid/schedule', authJwtToken, requirePermission('modify_course'), courseController.addCourseSchedule)

router.delete('/courses/:cid', authJwtToken, requirePermission('modify_course'), courseController.deleteCourse)

router.post('/courses/:cid/instructors/:uid', authJwtToken, requirePermission('assign_instructor'), courseController.assignInstructorToCourse)

router.get('/courses/:cid/instructors', courseController.getCourseInstructors)

router.get('/courses/:cid/schedule', courseController.getCourseSchedule)

router.post('/courses/:cid/students/:uid', courseController.enrollUserIntoCourse)

router.get('/courses/:cid/students', courseController.getAllStudentsInCourse)

router.delete('/courses/:cid/students/:uid', courseController.removeStudentEnrollment)

router.delete('/courses/:cid/instructors/:uid', courseController.removeInstructorFromCourse)

router.patch('/courses/:cid/students/:uid', courseController.updateEnrollment)

module.exports = router;

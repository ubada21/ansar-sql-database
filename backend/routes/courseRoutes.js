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

router.post('courses/:cid/schedule', authJwtToken, requirePermission('modify_course'), courseController.addCourseSchedule)

// delete course
router.delete('/courses/:cid', authJwtToken, requirePermission('modify_course'), courseController.deleteCourse)

// assign instructor to course
router.post('/courses/:cid/instructors/:uid', authJwtToken, requirePermission('assign_instructor'), courseController.assignInstructorToCourse)

module.exports = router;

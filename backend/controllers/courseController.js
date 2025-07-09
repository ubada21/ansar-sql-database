const courseModel = require('../models/courseModel')
const userService = require('../services/userService')
const courseService = require('../services/courseService')

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.getAllCourses();
    res.status(200).json({courses: courses})
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getCourseById = async (req, res) => {
  const { cid } = req.params;

  try {
    const rows = await courseModel.getCourseByCID(cid)

    if (rows.length === 0) {
      res.status(404).json({ message: 'Course not found' });
      return
    }
    res.status(200).json({course: rows[0]})
  } catch (err) {

    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};

exports.createCourse = async (req, res) => {
  courseData = req.body
  try {
    result = courseModel.createCourse(courseData)
    res.status(201).json({ message: 'Course created successfully', CourseID: result.insertId });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};

exports.updateCourse = async (req, res) => {
  const { cid } = req.params;
  const courseData = req.body
  try {
    result = await courseModel.updateCoursebyCID(cid, courseData)

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course with CourseID ${cid} updated successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
}

exports.deleteCourse = async (req, res) => {
  const { cid } = req.params;

  try {
    result = await courseModel.deleteCourseByCID(cid)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course with CourseID ${cid} deleted successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
}

exports.assignInstructorToCourse = async (req, res) => {
  const { cid, uid } = req.params
  try {
    const checkUser = await userService.checkUserExists(uid)
    if (!checkUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const checkCourse = await courseService.checkCourseExists(cid);

    if (!checkCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const userHasRole = await userService.userHasRole(uid, 'Instructor')
    if (!userHasRole) {
      return res.status(400).json({message: `User ${uid} is not an Instructor`})
    }

    result = await courseModel.assignInstructorToCourse(uid, cid)
    console.log("HERE")

    return res.status(200).json({message: `User ${uid} assigned to Course ${cid}`})

  } catch(err) {
    console.log(err)
    next(err)
  }
}



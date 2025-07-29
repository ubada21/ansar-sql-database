const courseModel = require('../models/courseModel')
const userService = require('../services/userService')
const courseService = require('../services/courseService');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.getAllCourses();
    res.status(200).json({courses: courses})
  } catch (err) {
    next(err)
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
    result = await courseModel.createCourse(courseData)
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

    return res.status(200).json({message: `User ${uid} assigned to Course ${cid}`})

  } catch(err) {
    console.log(err)
    next(err)
  }
}

exports.addCourseSchedule = async (req, res) => {
  const { cid } = req.params
  const { scheduleData } = req.body
  try {
    const checkCourse = await courseService.checkCourseExists(cid)

    if (!checkCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
  
    const result = await courseModel.addCourseSchedule({COURSEID: cid, ...scheduleData})
    if (result.affectedRows == 0) {
      res.status(404).json({message: 'Error adding schedule'})
    }
    res.status(200).json({message: `Schedule ${scheduleData.STARTDATE}, ${scheduleData.ENDDATE} on ${scheduleData.WEEKDAY} added to course ${cid}`})


  } catch(err) {
    next(err)
  }
}

exports.getCourseInstructors = async (req, res) => {
  const { cid } = req.params
  try {
    const checkCourse = await courseService.checkCourseExists(cid)

    if (!checkCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const instructors = await courseModel.getCourseInstructors(cid)
    if (instructors.length === 0) {
      return res.status(404).json({message: 'no instructors found'})
    }
      return res.status(200).json({instructors: instructors})
  } catch(err) {
    next(err)
  }
}

exports.enrollUserIntoCourse = async (req, res, next) => {
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

    const userHasRole = await userService.userHasRole(uid, 'Student')
    if (!userHasRole) {
      return res.status(400).json({message: `User ${uid} is not an Student`})
    }

    result = await courseModel.enrollUserIntoCourse(uid, cid)

    return res.status(200).json({message: `User ${uid} enrolled into Course ${cid}`})

  } catch(err) {
    next(err)
  }
}

exports.getAllStudentsInCourse = async(req, res) =>{
  const { cid } = req.params
  try {
    const checkCourse = await courseService.checkCourseExists(cid);

    if (!checkCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    result = await courseModel.getAllStudentsInCourse(cid)
    if (result.length === 0) {
      res.status(200).json({message: 'No students enrolled'})
    }

    res.status(200).json({students: result})
  } catch(err) {
    next(err)
  }
}

exports.removeStudentEnrollment = async(req, res) => {
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

    result = await courseModel.removeStudentEnrollment(uid, cid)

    if (result.affectedRows == 0) {
      return res.status(400).json({message: 'could not remove student'})
    }

    return res.status(200).json({message: `Instructor ${uid} removed from  Course ${cid}`})

  } catch(err) {
    next(err)
  }
}

exports.removeInstructorFromCourse = async(req, res) => {
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

    result = await courseModel.removeStudentEnrollment(uid, cid)

    if (result.affectedRows == 0) {
      return res.status(400).json({message: 'could not remove instructor'})
    }

    return res.status(200).json({message: `Instructor ${uid} removed from  Course ${cid}`})

  } catch(err) {
    next(err)
  }
}

exports.updateEnrollment = async (req, res, next) => {
  const { uid, cid } = req.params;
  const enrollmentData = req.body;

  try {
    const providedFields = Object.keys(enrollmentData).filter(key => enrollmentData[key] !== undefined);
    if (providedFields.length === 0) {
      return next(err);
    }

    const result = await courseModel.updateEnrollmentByUserAndCourse(uid, cid, enrollmentData);
    if (result.affectedRows === 0) {
      return next(err);
    }

    res.status(200).json({ message: `Enrollment for UID ${uid} in course ${cid} updated successfully.` });
  } catch (err) {
    if (err.message === 'Enrollment not found') {
      return next(err);
    }
    next(err);
  }
};

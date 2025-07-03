const courseModel = require('../models/courseModel.js')

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
      res.status(404).json({ message: 'course not found' });
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
    result = courseModel.updateCoursebyCID(cid, courseData)

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
    result = courseModel.deleteCourseByCID(cid)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course with CourseID ${cid} deleted successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
}

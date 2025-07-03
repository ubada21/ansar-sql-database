
const db = require('../config/db');

exports.getAllCourses = async () => {
  const [rows] = await db.query('SELECT * FROM COURSES');
  return rows;
};

exports.getCourseByCID = async (cid) => {
  const [rows] = await db.query('SELECT * FROM COURSES WHERE CourseID = ?', [cid]);

  return rows;
};

exports.updateCoursebyCID = async (cid, courseData) => {
  const {
    CourseID,
    Title,
    StartDate,
    EndDate,
    Schedule,
    Location
  } = courseData

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

  return result;
};

exports.createCourse = async (courseData) => {
  const {
    CourseID,
    Title,
    StartDate,
    EndDate,
    Schedule,
    Location
  } = courseData
  
    const [result] = await db.query(
      `INSERT INTO COURSES 
      (CourseID, Title, StartDate, EndDate, Schedule, Location)
      VALUES (?, ?, ?, ?, ?, ?)`, 
      [CourseID, Title, StartDate, EndDate, Schedule, Location]
    );

  return result

}

exports.deleteCourseByCID = async (cid) => {
  const [result] = await db.query('DELETE FROM COURSES WHERE CourseID = ?', [cid]);
  return result
}




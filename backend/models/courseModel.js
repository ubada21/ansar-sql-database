
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
    Title,
    StartDate,
    EndDate,
    Location
  } = courseData

    const [result] = await db.query(
      `UPDATE COURSES SET
        Title = ?,
        StartDate = ?,
        EndDate = ?,
        Location = ?
      WHERE CourseID = ?`,
      [Title, StartDate, EndDate, Location, cid]
    );

  return result;
};

exports.createCourse = async (courseData) => {
  const {
    CourseID,
    Title,
    StartDate,
    EndDate,
    Location
  } = courseData
  
    const [result] = await db.query(
      `INSERT INTO COURSES 
      (CourseID, Title, StartDate, EndDate, Location)
      VALUES (?, ?, ?, ?, ?, ?)`, 
      [CourseID, Title, StartDate, EndDate, Location]
    );

  return result

}

exports.addCourseSchedule = async (scheduleData) => {
  const {
    COURSEID,
    WEEKDAY,
    START_TIME,
    END_TIME,
  } = scheduleData

  const [result] = await db.query(
    `INSERT INTO COURSE_SCHEDULE
    (COURSEID, WEEKDAY, START_TIME, END_TIME)
    VALUES (?, ?, ?, ?)`,
    [COURSEID, WEEKDAY, START_TIME, END_TIME]
  );

  return result
}

exports.deleteCourseByCID = async (cid) => {
  const [result] = await db.query('DELETE FROM COURSES WHERE CourseID = ?', [cid]);
  return result
}

exports.assignInstructorToCourse = async (uid, cid) => {
  const [result] = await db.query(
    `INSERT INTO COURSE_INSTRUCTORS
    (UID, CourseID)
    VALUES (?, ?)`,
    [uid, cid]);
  return result
}






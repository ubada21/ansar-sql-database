
const db = require('../config/db');

exports.getAllCourses = async () => {
  const [rows] = await db.query('SELECT * FROM COURSES');
  console.log(rows)
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

exports.enrollUserIntoCourse = async(uid, cid) => {
  const [result] = await db.query('INSERT INTO ENROLLMENTS (UID, COURSEID) VALUES (?, ?)', [uid, cid])
  return result
}

exports.getAllStudentsInCourse = async(cid) => {
  const [result] = await db.query(`SELECT 
    u.UID,
    u.FIRSTNAME,
    u.LASTNAME,
    e.COURSEID,
    e.STATUS,
    e.FINAL_GRADE,
    e.ENROLL_DATE
    FROM ENROLLMENTS e
    JOIN USERS u ON e.UID = u.UID
    WHERE e.COURSEID = ?`, [cid])
  return result
}

exports.removeStudentEnrollment = async(uid, cid) => {
  const result = await db.query('DELETE FROM ENROLLMENTS WHERE UID = ? AND COURSEID = ?', [uid, cid])
  return result
}

exports.removeInstructorFromCourse = async(uid, cid) => {
  const result = await db.query('DELETE FROM COURSE_INSTRUCTORS WHERE UID = ? AND COURSEID = ?', [uid, cid])
  return result
}


exports.updateEnrollmentByUserAndCourse = async (uid, courseId, data) => {
  // Check if the enrollment exists first
  const [existing] = await db.query(
    'SELECT * FROM ENROLLMENTS WHERE UID = ? AND COURSEID = ?',
    [uid, courseId]
  );
  if (!existing || existing.length === 0) {
    throw new Error('Enrollment not found');
  }

  const allowedFields = ['STATUS', 'FINAL_GRADE', 'ENROLL_DATE'];

  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(data[field]);
    }
  });

  if (updateFields.length === 0) {
    return { affectedRows: 0 };
  }

  updateValues.push(uid, courseId);

  const query = `
    UPDATE ENROLLMENTS
    SET ${updateFields.join(', ')}
    WHERE UID = ? AND COURSEID = ?
  `;

  const [result] = await db.query(query, updateValues);
  return result;
};



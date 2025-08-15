const db = require('../config/db');

exports.getAllCourses = async () => {
  const [rows] = await db.query(`
    SELECT 
      c.*,
      GROUP_CONCAT(DISTINCT u.UID) as INSTRUCTOR_IDS,
      GROUP_CONCAT(DISTINCT CONCAT(u.FIRSTNAME, ' ', u.LASTNAME)) as INSTRUCTOR_NAMES
    FROM COURSES c
    LEFT JOIN COURSE_INSTRUCTORS ci ON c.COURSEID = ci.COURSEID
    LEFT JOIN USERS u ON ci.UID = u.UID
    GROUP BY c.COURSEID
    ORDER BY c.STARTDATE DESC
  `);

  return rows;
};

exports.getCourseByCID = async (cid) => {
  const [rows] = await db.query('SELECT * FROM COURSES WHERE CourseID = ?', [cid]);

  return rows;
};

exports.updateCoursebyCID = async (cid, courseData) => {
  const {
    title,
    startDate,
    endDate,
    location
  } = courseData

    const [result] = await db.query(
      `UPDATE COURSES SET
        Title = ?,
        StartDate = ?,
        EndDate = ?,
        Location = ?
      WHERE CourseID = ?`,
      [title, startDate, endDate, location, cid]
    );

  return result;
};

exports.createCourse = async (courseData, conn = db) => {
  const {
    title,
    startDate,
    endDate,
    location
  } = courseData;

  const [result] = await conn.query(
    `INSERT INTO COURSES 
    (TITLE, STARTDATE, ENDDATE, LOCATION)
    VALUES (?, ?, ?, ?)`,  
    [title, startDate, endDate, location]
  );

  return result;
};

exports.addCourseSchedule = async (scheduleData, conn=db) => {
  const {
    COURSEID,
    WEEKDAY,
    START_TIME,
    END_TIME,
  } = scheduleData

  const [result] = await conn.query(
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

exports.assignInstructorToCourse = async (uid, cid, conn=db) => {
  const [result] = await conn.query(
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

exports.getCourseInstructors = async(cid) => {
  const [result] = await db.query(`SELECT *
    FROM USERS U
    JOIN USER_ROLE UR ON U.UID = UR.UID
    JOIN ROLES R ON UR.ROLEID = R.ROLEID
    JOIN COURSE_INSTRUCTORS CI ON U.UID = CI.UID
    WHERE R.ROLENAME = 'Instructor' 
    AND CI.COURSEID = ?`, [cid])

  return result
}

exports.getCourseSchedule = async(cid) => {
  const [result] = await db.query(`SELECT 
    SCHEDULEID,
    WEEKDAY,
    START_TIME,
    END_TIME
    FROM COURSE_SCHEDULE
    WHERE COURSEID = ?
    ORDER BY 
      CASE WEEKDAY
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END`, [cid])

  return result
}



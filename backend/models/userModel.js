const db = require('../config/db');

exports.getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM USERS');
  return rows;
};

exports.getUserByUID = async (uid) => {
  const [rows] = await db.query('SELECT * FROM USERS WHERE UID = ?', [uid]);

  return rows[0];
};

exports.updateUserById = async (uid, userData) => {
  // Get current user data to merge with updates
  const currentUser = await this.getUserByUID(uid);
  if (!currentUser) {
    return { affectedRows: 0 };
  }

  // Define all possible fields
  const allowedFields = [
    'FIRSTNAME',
    'MIDDLENAME', 
    'LASTNAME',
    'DOB',
    'EMAIL',
    'PASSWORD',
    'PHONENUMBER',
    'ADDRESS',
    'CITY',
    'PROVINCE',
    'POSTALCODE'
  ];

  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (userData[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(userData[field]);
    }
  });

  // If no fields to update, return early
  if (updateFields.length === 0) {
    return { affectedRows: 0 };
  }

  // Add UID to the end for WHERE clause
  updateValues.push(uid);

  const query = `UPDATE USERS SET ${updateFields.join(', ')} WHERE UID = ?`;
  
  const [result] = await db.query(query, updateValues);
  return result;
};

exports.createUser = async (userData) => {
  const {
    FIRSTNAME,
    MIDDLENAME,
    LASTNAME,
    DOB,
    EMAIL,
    PASSWORD,
    PHONENUMBER,
    ADDRESS,
    CITY,
    PROVINCE,
    POSTALCODE
  } = userData
  
  const [result] = await db.query(
    `INSERT INTO USERS 
    (FIRSTNAME, MIDDLENAME, LASTNAME, DOB, EMAIL, PASSWORD, PHONENUMBER, ADDRESS, CITY, PROVINCE, POSTALCODE)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [FIRSTNAME, MIDDLENAME, LASTNAME, DOB, EMAIL, PASSWORD, PHONENUMBER, ADDRESS, CITY, PROVINCE, POSTALCODE]
  );

  return result

}

exports.deleteUserByUID = async (uid) => {
  const [result] = await db.query('DELETE FROM USERS WHERE UID = ?', [uid]);
  return result
}

exports.getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', [email])
  return rows[0]
}

exports.getUserByPhone = async (phone) => {
  const [rows] = await db.query('SELECT * FROM users WHERE PHONENUMBER = ?', [phone]);
  return rows[0];
};

exports.updatePassword = async (uid, newPassword) => {
  const rows = await db.query('UPDATE users SET PASSWORD = ? where UID = ?', [newPassword, uid])
  return rows
}

exports.updateUser = async (uid, userData) => {
  const {
    FIRSTNAME,
    MIDDLENAME,
    LASTNAME,
    DOB,
    EMAIL,
    PASSWORD,
    PHONENUMBER,
    ADDRESS,
    CITY,
    PROVINCE,
    POSTALCODE,
  } = userData;

  const [result] = await db.query(
    `UPDATE USERS SET
      FIRSTNAME = ?,
      MIDDLENAME = ?,
      LASTNAME = ?,
      DOB = ?,
      EMAIL = ?,
      PASSWORD = ?,
      PHONENUMBER = ?,
      ADDRESS = ?,
      CITY = ?,
      PROVINCE = ?,
      POSTALCODE = ?
    WHERE UID = ?`,
    [
      FIRSTNAME,
      MIDDLENAME,
      LASTNAME,
      DOB,
      EMAIL,
      PASSWORD,
      PHONENUMBER,
      ADDRESS,
      CITY,
      PROVINCE,
      POSTALCODE,
      uid
    ]
  );

  return result;
};


// exports.updateUserEmail = (req, res, next) => {
//   const { uid } = req.params;
//   const { email } = req.body;
// 
//   const sql = 'UPDATE USERS SET EMAIL = ? WHERE UID = ?';
//   db.query(sql, [email, uid], (err, result) => {
//     if (err) return next(err);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({ message: 'Email updated successfully' });
//   });
// };

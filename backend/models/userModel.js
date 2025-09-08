const db = require('../config/db');

exports.getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM USERS');
  return rows;
};

exports.getAllUsersWithRoles = async () => {
  try {
    // First, get all users
    const [users] = await db.query('SELECT * FROM USERS ORDER BY UID');
    
    // Then get all user roles
    const [userRoles] = await db.query(`
      SELECT 
        ur.UID,
        r.ROLEID,
        r.ROLENAME
      FROM USER_ROLE ur
      LEFT JOIN ROLES r ON ur.ROLEID = r.ROLEID
    `);
    
    // Group roles by user ID
    const rolesByUser = {};
    userRoles.forEach(role => {
      if (!rolesByUser[role.UID]) {
        rolesByUser[role.UID] = [];
      }
      if (role.ROLEID) {
        rolesByUser[role.UID].push({
          ROLEID: role.ROLEID,
          ROLENAME: role.ROLENAME
        });
      }
    });
    
    // Combine users with their roles
    const usersWithRoles = users.map(user => ({
      ...user,
      roles: rolesByUser[user.UID] || []
    }));
    
    return usersWithRoles;
  } catch (error) {
    throw error;
  }
};

exports.getUserByUID = async (uid) => {
  const [rows] = await db.query('SELECT * FROM USERS WHERE UID = ?', [uid]);
  return rows[0];
};

exports.updateUserById = async (uid, userData) => {

  const currentUser = await this.getUserByUID(uid);
  if (!currentUser) {
    throw new Error('User not found');
  }


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


  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (userData[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(userData[field]);
    }
  });


  if (updateFields.length === 0) {
    return { affectedRows: 0 };
  }


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




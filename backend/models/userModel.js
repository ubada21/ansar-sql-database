const db = require('../config/db');

exports.getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM USERS');
  return rows;
};

exports.getUserByUID = async (uid) => {
  const [rows] = await db.query('SELECT * FROM USERS WHERE UID = ?', [uid]);

  return rows;
};

exports.updateUserById = async (uid, userData) => {
  const {
    FirstName,
    MiddleName,
    LastName,
    DOB,
    Email,
    PhoneNumber,
    Address,
    City,
    Province,
    PostalCode
  } = userData;

  const [result] = await db.query(
    `UPDATE USERS SET
      FirstName = ?,
      MiddleName = ?,
      LastName = ?,
      DOB = ?,
      Email = ?,
      PhoneNumber = ?,
      Address = ?,
      City = ?,
      Province = ?,
      PostalCode = ?
    WHERE UID = ?`,
    [
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Email,
      PhoneNumber,
      Address,
      City,
      Province,
      PostalCode,
      uid
    ]
  );

  return result;
};

exports.createUser = async (userData) => {
  const {
    FirstName,
    MiddleName,
    LastName,
    DOB,
    Email,
    PhoneNumber,
    Address,
    City,
    Province,
    PostalCode
  } = userData
  
  const [result] = await db.query(
    `INSERT INTO USERS 
    (FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode]
  );

  return result

}

exports.deleteUserByUID = async (uid) => {
  const [result] = await db.query('DELETE FROM USERS WHERE UID = ?', [uid]);
  return result
}




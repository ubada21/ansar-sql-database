const db = require('../config/db');

exports.getRoleByRoleId = async (roleid) => {
  const [rows] = await db.query(`SELECT * FROM ROLES WHERE ROLEID = ?`, [roleid])
  return rows
}

exports.assignRoleToUser = async (roleData) => {
  const {
    UID,
    ROLEID
  } = roleData

  const [result] = await db.query(
    `INSERT INTO USER_ROLE
    (UID, RoleID)
    VALUES (?, ?)`,
    [UID, ROLEID]);

  return result
}

exports.getUserRoles = async (uid) => {
  // want to return roles: {roleid: xx, rolename: xx}
  const [rows] = await db.query(
    `SELECT R.ROLEID, R.ROLENAME
    FROM USER_ROLE AS UR
    JOIN ROLES R ON UR.ROLEID = R.ROLEID
    WHERE UR.UID = ?`, [uid])

  return rows

} 

exports.getAllRoles = async () => {
  const [rows] = await db.query(`SELECT * FROM ROLES`)
  return rows
}

exports.deleteUserRole = async (uid, roleid) => {
  const [result] = await db.query(`DELETE FROM USER_ROLE WHERE UID = ? AND ROLEID = ?`, [uid, roleid])
  return result
}

exports.getUsersByRole = async (ROLEID) => {
  const [rows] = await db.query(`SELECT * FROM USERS AS U JOIN USER_ROLE UR ON U.UID=UR.UID WHERE UR.ROLEID = ?`, [ROLEID])
  return rows
}

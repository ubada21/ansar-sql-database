const roleModel = require('../models/roleModel');
const userModel = require('../models/userModel');
const CustomError = require('../utils/customError');

exports.assignRoleToUser = async (req, res) => {
  roleData = req.body
  try {
    // first check if user exists
    const checkUser = await userModel.getUserByUID(roleData.UID)
    if (checkUser.length === 0) {
      return res.status(404).json({message: 'User not found'})
    }

    // check if role exists
    const checkRole = await roleModel.getRoleByRoleId(roleData.RoleId)
    if (checkRole.length === 0) {
      return res.status(404).json({message: 'Role not found'})
    }

    // both exists, so assign role to user
    // In this case, we can have a dupe role being assigned
    await roleModel.assignRoleToUser(roleData)

    res.status(201).json({message: `Role ${roleid} Assigned to User ${uid}`})

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User already has this role assigned.' })
    }
    console.log(err)
    next(err)  
  }
}

exports.getUserRoles = async (req, res) => {
  const { uid } = req.params
  try {
    const rows = await roleModel.getUserRoles(uid);

    if (rows.length === 0) {
      return res.status(404).json({message: 'user not found'})
    }

    res.status(200).json({roles: rows})
  } catch {
    console.log(err)
    next(err)
  }
}

// all available roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await roleModel.getAllRoles()
    res.status(200).json({roles: roles})

  } catch {
    console.log(err)
    next(err)
  }
}

exports.deleteUserRole = async (req, res) => {

  const { roleid, uid} = req.params;

  try {

    const checkUser = await userModel.getUserByUID(uid)
    if (checkUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // check if role exists
    const checkRole = await roleModel.getRoleByRoleId(roleid)
    if (checkRole.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    result = await roleModel.deleteUserRole(uid, roleid)
    if (result.affectedRows === 0) {
      return res.status(404).json({message: `No user found with role ${roleid}`})
    }
    res.status(200).json({ message: `Role ${roleid} removed from User with UID ${uid}.` });

  } catch {
    console.log(err)
    next(err)
  }
}

exports.getUsersByRole = async (req, res) => {
  const { roleid } = req.params
  try {
    const checkRole = await roleModel.getRoleByRoleId(roleid)
    if (checkRole.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    result = await roleModel.getUsersByRole(roleid)

    if (result.affectedRows === 0) {
      return res.status(404).json({message: `No users found with role ${roleid}`})
    }
    res.status(200).json({users: result})
  } catch {
    console.log(err)
    next(err)
  }

} 

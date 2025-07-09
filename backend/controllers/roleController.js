const roleModel = require('../models/roleModel');
const roleService = require('../services/roleService')
const CustomError = require('../utils/customError');

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


exports.getUsersByRole = async (req, res) => {
  const { roleid } = req.params
  try {

    const checkRole = await roleService.checkRoleExists(roleid)
    if (!checkRole) {
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

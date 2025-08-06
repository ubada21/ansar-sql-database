const roleModel = require('../models/roleModel');
const roleService = require('../services/roleService')
const CustomError = require('../utils/customError');

// all available roles
exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleModel.getAllRoles()
    res.status(200).json({roles: roles})
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.getUsersByRole = async (req, res, next) => {
  const { roleid } = req.params
  try {

    const checkRole = await roleService.checkRoleExists(roleid)
    if (!checkRole) {
      return next(new CustomError('Role not found', 404, 'ROLE_NOT_FOUND', { roleid }));
    }

    result = await roleModel.getUsersByRole(roleid)
    console.log(result)

    if (result.length === 0) {
      return next(new CustomError(`No users found with role ${roleid}`, 404, 'NO_USERS_FOR_ROLE', { roleid }));
    }
    res.status(200).json({users: result})
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }

}

exports.getUsersByRoleName = async (req, res, next) => {
  const { roleName } = req.params
  try {
    const users = await roleModel.getUsersByRoleName(roleName)
    
    if (users.length === 0) {
      return res.status(200).json({ users: [], message: `No users found with role ${roleName}` });
    }
    
    res.status(200).json({ users })
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
} 

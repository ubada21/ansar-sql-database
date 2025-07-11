const { rolePermissions }= require('./permissions/permissions')
const roleModel = require('../models/roleModel.js')

exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    // get logged in user's uid (JWT) TODO

    // Havent implements JWT auth yet, so hardcoded uid for testing.
    // const uid = req.user.uid
    const uid = req.user?.uid || 5; // 5 is hardcoded test uid
    const userRoles = req.user?.roles || ['Admin']
    //let userRoles = await roleModel.getUserRoles(uid)
    // userRoles = userRoles.map(role => role.ROLENAME)
    const hasPermission = userRoles.some((role) => {
      return rolePermissions[role].includes(permission)
    })



    if (hasPermission) {
      next()
    } else {
      return res.status(403).json({message: "Forbidden"})
    }
  }
}


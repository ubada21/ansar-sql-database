const { rolePermissions }= require('./permissions/permissions')
const roleModel = require('../models/roleModel.js')

exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    const uid = req.user?.uid
    const userRoles = req.user?.roles
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


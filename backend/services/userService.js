const roleModel = require('../models/roleModel')
const userModel = require('../models/userModel')
// checkUserExists TODO

exports.checkUserExists = async (uid) => {
    const checkUser = await userModel.getUserByUID(uid)
    return checkUser
}


exports.userHasRole = async (uid, role) => {
  let userRoles = await roleModel.getUserRoles(uid)
  userRoles = userRoles.map(r => r.ROLENAME)
  const hasRole = userRoles.some((r) => {
    return r === role
  })
  return hasRole
}

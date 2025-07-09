const roleModel = require('../models/roleModel')

exports.checkRoleExists = async (roleid) => {
    const checkRole = await roleModel.getRoleByRoleId(roleid)
    return checkRole.length > 0 
}

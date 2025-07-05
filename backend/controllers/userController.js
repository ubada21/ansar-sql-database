const userModel = require('../models/userModel')
const roleModel = require('../models/roleModel')
const CustomError = require('../utils/customError');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({users: users})
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getUserByUID = async (req, res, next) => {
  const { uid } = req.params;

  const rows = await userModel.getUserByUID(uid)

  if (rows.length === 0) {
    return next(new CustomError('User not found', 404));
  }

  res.json({user: rows[0]});
};


exports.createUser = async (req, res) => {
  userData = req.body
  try {
    result = userModel.createUser(userData)
    res.status(201).json({ message: 'User created successfully', UID: result.insertId });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};

exports.updateUser = async (req, res) => {
  const { uid } = req.params;
  const userData = req.body;

  try {
    const result = await userModel.updateUserById(uid, userData);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    res.status(200).json({ message: `User with UID ${uid} updated successfully.` });
  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};

exports.deleteUserByUID = async (req, res) => {
  const { uid } = req.params;

  try {
    result = await userModel.deleteUserByUID(uid)

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
     res.status(200).json({ message: `User with UID ${uid} deleted successfully.` });

  } catch (err) {
    console.error('MYSQL ERROR:', err);
    res.status(500).send('Server Error');
  }
};

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

// Delete User Role
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

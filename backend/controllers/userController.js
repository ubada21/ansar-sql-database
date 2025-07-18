const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const roleModel = require('../models/roleModel')
const userService = require('../services/userService')
const roleService = require('../services/roleService')
const tokenService = require('../services/tokenService')
const CustomError = require('../utils/customError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({users: users})
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.getUserByUID = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const rows = await userModel.getUserByUID(uid)
    if (rows.length === 0) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.json({user: rows});
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.createUser = async (req, res, next) => {
  userData = req.body
  try {
    result = await userModel.createUser(userData)
    res.status(201).json({ message: 'User created successfully', UID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return next(new CustomError('User with this email already exists', 409, 'DUPLICATE_USER', { email: userData.email }));
    }
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.updateUser = async (req, res, next) => {
  const { uid } = req.params;
  const userData = req.body;
  try {
    const result = await userModel.updateUserById(uid, userData);
    if (result.affectedRows === 0) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.status(200).json({ message: `User with UID ${uid} updated successfully.` });
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.deleteUserByUID = async (req, res, next) => {
  const { uid } = req.params;
  try {
    result = await userModel.deleteUserByUID(uid)
    if (result.affectedRows === 0) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.status(200).json({ message: `User with UID ${uid} deleted successfully.` });
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.assignRoleToUser = async (req, res, next) => {
  roleData = req.body
  try {
    const checkUser = await userService.checkUserExists(roleData.UID)
    if (!checkUser) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid: roleData.UID }));
    }
    const checkRole = await roleService.checkRoleExists(roleData.RoleID)
    if (!checkRole) {
      return next(new CustomError('Role not found', 404, 'ROLE_NOT_FOUND', { roleId: roleData.RoleID }));
    }
    await roleModel.assignRoleToUser(roleData)
    res.status(201).json({message: `Role ${roleData.RoleID} Assigned to User ${roleData.UID}`})
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return next(new CustomError('User already has this role assigned.', 409, 'DUPLICATE_ROLE_ASSIGNMENT', { uid: roleData.UID, roleId: roleData.RoleID }));
    }
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.getUserRoles = async (req, res, next) => {
  const { uid } = req.params
  try {
    const rows = await roleModel.getUserRoles(uid);
    if (rows.length === 0) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.status(200).json({roles: rows})
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.deleteUserRole = async (req, res, next) => {
  const { roleid, uid } = req.params;
  try {
    const checkUser = await userService.checkUserExists(uid)
    if (!checkUser) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    const checkRole = await roleService.checkRoleExists(roleid)
    if (!checkRole) {
      return next(new CustomError('Role not found', 404, 'ROLE_NOT_FOUND', { roleId: roleid }));
    }
    result = await roleModel.deleteUserRole(uid, roleid)
    if (result.affectedRows === 0) {
      return next(new CustomError(`User ${uid} does not have Role ${roleid}`, 404, 'USER_ROLE_NOT_FOUND', { uid, roleid }));
    }
    res.status(200).json({ message: `Role ${roleid} removed from User with UID ${uid}.` });
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.registerUser = async (req, res, next) => {
  try {
    const { FirstName, MiddleName, LastName, DOB, Email, Password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 12); // 12 salt rounds
    const userData = { FirstName, MiddleName, LastName, DOB, Email, Password: hashedPassword, ...rest };
    const result = await userModel.createUser(userData);
    res.status(201).json({ message: 'User registered successfully', UID: result.insertId });
  } catch (err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return next(new CustomError('Invalid email or password', 404, 'INVALID_CREDENTIALS', { email }));
    }
    const roles = await roleModel.getUserRoles(user.UID);
    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
    if (!passwordMatch) {
      return next(new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS', { email }));
    }
    const fields = { uid: user.UID, roles: roles.map(r => r.ROLENAME) };
    const secretKey = 'a-string-secret-at-least-256-bits-long';
    const token = jwt.sign(fields, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true if using https
      sameSite: 'Strict',
      maxAge: 2 * 60 * 60 * 1000 // 2 hrs
    });
    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    next(new CustomError('Server error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.logoutUser = (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      sameSite: 'Strict',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(new CustomError('Server error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};


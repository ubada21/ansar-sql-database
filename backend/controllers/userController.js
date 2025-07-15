const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const roleModel = require('../models/roleModel')
const userService = require('../services/userService')
const roleService = require('../services/roleService')
const tokenService = require('../services/tokenService')
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

  try {
    const rows = await userModel.getUserByUID(uid)

    if (rows.length === 0) {
      return next(new CustomError('User not found', 404));
    }

    res.json({user: rows});

  } catch(err) {
    console.log(err)
    res.status(500).send('Server Error');
  }
};


exports.createUser = async (req, res) => {
  userData = req.body
  try {
    result = await userModel.createUser(userData)
    res.status(201).json({ message: 'User created successfully', UID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User with this email already exists' })
    }
    console.log(err)
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

    const checkUser = await userService.checkUserExists(roleData.UID)
    if (!checkUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const checkRole = await roleService.checkRoleExists(roleData.RoleID)
    if (!checkRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await roleModel.assignRoleToUser(roleData)

    res.status(201).json({message: `Role ${roleData.RoleID} Assigned to User ${roleData.UID}`})

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User already has this role assigned.' })
    }
    console.log(err)
  }
}

exports.getUserRoles = async (req, res) => {
  const { uid } = req.params
  try {
    const rows = await roleModel.getUserRoles(uid);

    if (rows.length === 0) {
      return res.status(404).json({message: 'User not found'})
    }

    res.status(200).json({roles: rows})
  } catch {
    console.log(err)
    next(err)
  }
}

// Delete User Role
exports.deleteUserRole = async (req, res) => {

  const { roleid, uid } = req.params;

  try {

    const checkUser = await userService.checkUserExists(uid)
    if (!checkUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // check if role exists
    const checkRole = await roleService.checkRoleExists(roleid)
    if (!checkRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    result = await roleModel.deleteUserRole(uid, roleid)
    if (result.affectedRows === 0) {
      return res.status(404).json({message: `User ${uid} does not have Role ${roleid}`})
    }
    res.status(200).json({ message: `Role ${roleid} removed from User with UID ${uid}.` });

  } catch {
    console.log(err)
    next(err)
  }
}

// register User

exports.registerUser = async (req, res) => {

  try {
    const { 
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Email,
      Password,
      ...rest
    } = req.body;

    const hashedPassword = await bcrypt.hash(Password, 12); // 12 salt rounds

    const userData = {
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Email,
      Password: hashedPassword,
      ...rest
    };

    const result = await userModel.createUser(userData);
    res.status(201).json({ message: 'User registered successfully', UID: result.insertId });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: `Invalid email or password` });
    }
    const roles = await roleModel.getUserRoles(user.UID);

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ message: `Invalid email or password` });
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
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'Strict',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};


const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const userService = require('../services/userService');
const roleService = require('../services/roleService');
const tokenService = require('../services/tokenService');
const CustomError = require('../utils/customError');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getUserByUID = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const rows = await userModel.getUserByUID(uid);
    if (rows.length === 0) return next(new CustomError('User not found', 404));
    res.json({ user: rows });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

exports.createUser = async (req, res) => {
  const userData = req.body;
  try {
    const result = await userModel.createUser(userData);
    res.status(201).json({ message: 'User created successfully', UID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    console.log(err);
    res.status(500).json({ message: 'Server error during user creation' });
  }
};

exports.updateUser = async (req, res) => {
  const { uid } = req.params;
  const userData = req.body;

  try {
    const result = await userModel.updateUserById(uid, userData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
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
    const result = await userModel.deleteUserByUID(uid);
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
  const roleData = req.body;
  try {
    const checkUser = await userService.checkUserExists(roleData.UID);
    if (!checkUser) return res.status(404).json({ message: 'User not found' });

    const checkRole = await roleService.checkRoleExists(roleData.RoleID);
    if (!checkRole) return res.status(404).json({ message: 'Role not found' });

    await roleModel.assignRoleToUser(roleData);
    res.status(201).json({ message: `Role ${roleData.RoleID} Assigned to User ${roleData.UID}` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User already has this role assigned.' });
    }
    console.log(err);
    res.status(500).json({ message: 'Server error during role assignment' });
  }
};

exports.getUserRoles = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const rows = await roleModel.getUserRoles(uid);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ roles: rows });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.deleteUserRole = async (req, res, next) => {
  const { roleid, uid } = req.params;

  try {
    const checkUser = await userService.checkUserExists(uid);
    if (!checkUser) return res.status(404).json({ message: 'User not found' });

    const checkRole = await roleService.checkRoleExists(roleid);
    if (!checkRole) return res.status(404).json({ message: 'Role not found' });

    const result = await roleModel.deleteUserRole(uid, roleid);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `User ${uid} does not have Role ${roleid}` });
    }
    res.status(200).json({ message: `Role ${roleid} removed from User with UID ${uid}.` });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// ✅ FIXED: REGISTER USER
exports.registerUser = async (req, res, next) => {
  try {
    const {
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Email,
      Password,
      Phone,
      PhoneNumber,
      ...rest
    } = req.body;

    const hashedPassword = await bcrypt.hash(Password, 12);

    const userData = {
      FirstName,
      MiddleName,
      LastName,
      DOB,
      Email,
      Password: hashedPassword,
      Phone: Phone || PhoneNumber || '',
      ...rest
    };

    const result = await userModel.createUser(userData);
    res.status(201).json({ message: 'User registered successfully', UID: result.insertId });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    next(err);
  }
};

// ✅ LOGIN
exports.loginUser = async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await userModel.getUserByEmail(email);
    console.log("Fetched user from DB:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // 🐛 Debugging checks
    if (!user.Password) {
      console.log("❌ Password field missing from user object");
      return res.status(500).json({ message: 'Internal server error: Password missing' });
    }

    console.log("🔍 Raw Input Password:", password);
    console.log("🔐 Stored Hashed Password:", user.Password);
    console.log("🧪 Are both defined?",
      typeof password !== 'undefined',
      typeof user.Password !== 'undefined');

    // ✅ Perform bcrypt comparison
    const passwordMatch = await bcrypt.compare(password, user.Password);
    console.log("✅ Password Match Result:", passwordMatch);

    if (!passwordMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const roles = await roleModel.getUserRoles(user.UID);
    console.log("🎭 Roles fetched:", roles);

    const token = jwt.sign(
      { uid: user.UID, roles: roles.map(r => r.ROLENAME) },
      'a-string-secret-at-least-256-bits-long',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Login successful', token });

  } catch (err) {
    console.error("💥 Login error:", err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};



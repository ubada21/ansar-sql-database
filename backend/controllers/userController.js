const userModel = require('../models/userModel')
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

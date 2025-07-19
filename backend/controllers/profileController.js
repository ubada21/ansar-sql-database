const profileModel = require('../models/roleModel') 
const userModel = require('../models/userModel')
const CustomError = require('../utils/customError');

exports.getProfile = async (req, res, next) => {
  const uid = req.user.uid
  try {
    const rows = await userModel.getUserByUID(uid)
    if (!rows) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.json({user: rows});
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.updateProfile = async (req, res, next) => {
  const uid = req.user.uid;
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
}

exports.changePassword = async (req, res, next) => {
  try {
    // Not implemented
    next(new CustomError('Not implemented', 501, 'NOT_IMPLEMENTED'));
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
}

exports.deleteProfile = async (req, res, next) => {
  const uid = req.user.uid;
  console.log(uid)
  try {
    result = await userModel.deleteUserByUID(uid)
    if (result.affectedRows === 0) {
      return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { uid }));
    }
    res.status(200).json({ message: `User with UID ${uid} deleted successfully.` });
  } catch (err) {
    console.log(err)
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

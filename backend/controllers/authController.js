const otpService = require('../services/otpService')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const CustomError = require('../utils/customError');

exports.requestOtpReset = async (req, res, next) => {
  const { email, phone } = req.body;
  let contactType, contactValue, user;
  try {
    if (email) {
      contactType = 'email';
      contactValue = email;
      user = await userModel.getUserByEmail(email);
    } else if (phone) {
      contactType = 'phone';
      contactValue = phone;
      user = await userModel.getUserByPhone(phone);
    } else {
      return next(new CustomError('Email or phone number is required.', 400, 'MISSING_CONTACT'));
    }
    const otp = otpService.generateOtp();
    await otpService.storeOtp(user.UID, otp);
    console.log(`Sending OTP ${otp} to ${contactType}: ${contactValue}`);
    res.status(200).json({ message: 'If that contact exists, an OTP has been sent.' });
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.verifyOtpAndResetPassword = async (req, res, next) => {
  const { email, phone, otp, newPassword } = req.body;
  let contactType, contactValue, user;
  try {
    if (email) {
      contactType = 'email';
      contactValue = email;
      user = await userModel.getUserByEmail(email);
    } else if (phone) {
      contactType = 'phone';
      contactValue = phone;
      user = await userModel.getUserByPhone(phone);
    } else {
      return next(new CustomError('Email or phone number is required.', 400, 'MISSING_CONTACT'));
    }
    if (!user) return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', { email, phone }));
    const isValid = await otpService.verifyOtp(user.UID, otp);
    if (!isValid) {
      return next(new CustomError('Invalid or expired OTP', 400, 'INVALID_OTP', { otp }));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await userModel.updatePassword(user.UID, hashedPassword);
    if (result.affectedRows === 0) {
      return next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: 'Password update failed' }));
    }
    res.status(200).json({ message: 'Password reset successful' });
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

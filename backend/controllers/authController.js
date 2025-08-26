const otpService = require('../services/otpService')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const CustomError = require('../utils/customError');

exports.requestOtpReset = async (req, res, next) => {
  console.log(req.body)
  const {contact} = req.body;
  const contactValidation = validateContact(contact)
  let user;
  try {
    // 1) use regex to determine whether we have an email or a 10-digit phone number
    if (contactValidation.type === 'email') {
      user = await userModel.getUserByEmail(contact);
    } else if (contactValidation.type === 'phone') {
      user = await userModel.getUserByPhone(contact);
    } else {
      return next(new CustomError('Please provide a valid email or phone number', 400, 'MISSING_CONTACT'));
    }
    const otp = otpService.generateOtp();
    await otpService.storeOtp(user.UID, otp);

    console.log(`OTP for ${contact}: ${otp}`);

    res.status(200).json({ message: 'If that contact exists, an OTP has been sent.' });
  } catch(err) {
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

const validateContact = (contact) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  if (emailRegex.test(contact)) {
  return {
    isValid: true,
    type: 'email'
  }
  } else if (phoneRegex.test(contact)) {
  return {
    isValid: true,
    type: 'phone'
  }
}
  return {
    isValid: false,
    type: ''
  }
}

exports.verifyOtpAndResetPassword = async (req, res, next) => {
  const { contact, otp, newPassword } = req.body;
  let user;
  const contactValidation = validateContact(contact)
  try {
    // 1) use regex to determine whether we have an email or a 10-digit phone number
    if (contactValidation.type === 'email') {
      user = await userModel.getUserByEmail(contact);
    } else if (contactValidation.type === 'phone') {
      user = await userModel.getUserByPhone(contact);
    } else {
      return next(new CustomError('Please provide a valid email or phone number', 400, 'MISSING_CONTACT'));
    }
    if (!user) return next(new CustomError('User not found', 404, 'USER_NOT_FOUND', {contact}));
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
    console.log(err)
    next(new CustomError('Server Error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

exports.checkAuthStatus = async (req, res, next) => {
  try {
  if (req.user) {
    return res.status(200).json({message: 'Authorized'})
  }
  return res.status(401).json({message: "Unauthorized"})
  } catch(err) {

  }
}

exports.getTestToken = async (req, res, next) => {
  try {

    if (process.env.NODE_ENV === 'production') {
      return next(new CustomError('Test token not available in production', 403, 'FORBIDDEN'));
    }
    

    const testUser = {
      uid: 999,
      roles: ['Admin', 'Instructor', 'Parent', 'Student', 'Donor']
    };
    
    const secretKey = 'a-string-secret-at-least-256-bits-long';
    const token = jwt.sign(testUser, secretKey, { expiresIn: '24h' });
    
    res.status(200).json({ 
      message: 'Test token generated successfully',
      token: token,
      expiresIn: '24h',
      user: testUser
    });
  } catch (err) {
    next(new CustomError('Server error', 500, 'SERVER_ERROR', { error: err.message }));
  }
};

const otpService = require('../services/otpService')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')


exports.requestOtpReset = async (req, res) => {
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
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  // Always respond with success for security (don't leak if user exists)
  const otp = otpService.generateOtp();
  await otpService.storeOtp(user.UID, otp);

  console.log(`Sending OTP ${otp} to ${contactType}: ${contactValue}`);
  // TODO: send via email or SMS based on phone or email

  res.status(200).json({ message: 'If that contact exists, an OTP has been sent.' });
  } catch(err) {
    console.log(err)
  }
};

exports.verifyOtpAndResetPassword = async (req, res) => {
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
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const isValid = await otpService.verifyOtp(user.UID, otp);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  if (!user) return res.status(404).json({ error: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const result = await userModel.updatePassword(user.UID, hashedPassword);
  if (result.affectedRows === 0) {
    return res.status(500).json({message: 'Server Error'})
  }
  res.status(200).json({ message: 'Password reset successful' });
  } catch(err) {
    console.log(err)
    res.status(500).json({message: 'Server Error'})
  }
};

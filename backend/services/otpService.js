const crypto = require('crypto');
const otpModel = require('../models/otpModel')

const generateOtp = (length = 6) => {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
};

const storeOtp = async (uid, otp, expiresIn = 300) => {
  const expiresAt = new Date((Date.now() + expiresIn * 1000))
  try {
  result = await otpModel.createOtp(uid, otp, expiresAt)
  } catch(err) {
    console.log(err)
  }
};

const verifyOtp = async (uid, submittedOtp) => {
  try {
    const result = await otpModel.findValidOtp(uid, submittedOtp)
    if (!result) {
      return false
    } 

    await otpModel.markOtpUsed(result[0])
    return true
  } catch (err) {
    console.log(err)
  }
};

module.exports = { generateOtp, storeOtp, verifyOtp };


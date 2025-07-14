const db = require('../config/db')

exports.createOtp = async (uid, otp, expiresAt) => {
  await db.query(
    'INSERT INTO PASSWORD_RESET_OTPS (UID, OTP, EXPIRESAT) VALUES (?, ?, ?)',
    [uid, otp, expiresAt]
  );
};

exports.findValidOtp = async (uid, submittedOtp) => {
  const [rows] = await db.query(
    'SELECT * FROM PASSWORD_RESET_OTPS WHERE UID = ? AND OTP = ? AND USED = FALSE AND EXPIRESAT > NOW()',
    [uid, submittedOtp]
  );
  return rows[0]; 
};

exports.markOtpUsed = async (otpId) => {
  await db.query('UPDATE PASSWORD_RESET_OTPS SET USED = TRUE WHERE ID = ?', [otpId]);
};


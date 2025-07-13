const jwt = require('jsonwebtoken')
const crypto = require('crypto');

exports.verifyToken = (token) => {
  return jwt.verify(token, 'a-string-secret-at-least-256-bits-long')
}

// exports.generatePasswordToken = () => {
//   return crypto.randomBytes(32).toString('hex');
// }
// 
// exports.hashPasswordToken = (token) => {
//   return crypto.createHash('sha256').update(token).digest('hex');
// }
// 
// exports.getExpiryDate = (minutes = 5) => {
//   const expires = new Date()
//   expires.setMinutes(expires.getMinutes() + minutes)
//   return expires
// }





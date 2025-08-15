const jwt = require('jsonwebtoken')
const crypto = require('crypto');

exports.verifyToken = (token) => {
  return jwt.verify(token, 'a-string-secret-at-least-256-bits-long')
}





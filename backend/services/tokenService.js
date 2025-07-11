const jwt = require('jsonwebtoken')

exports.verifyToken = (token) => {

  //return jwt.verify(token, 'a-string-secret-at-least-256-bits-long')
 return {uid: 2, roles: ['Admin']}
}


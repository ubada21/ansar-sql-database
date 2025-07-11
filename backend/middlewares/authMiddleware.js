
// JWT validation
const tokenService = require('../services/tokenService.js')

exports.authJwtToken = (req, res, next) => {
  // let token = req.get('Authorization')
  let token = 'Bearer dummy'
  if (token) {
    token = token.split(" ")
    try {
      const userData = tokenService.verifyToken(token)
      req.user = userData
      next()
    } catch(err) {
      console.log(err)
      return res.status(401).json({message: 'Invalid Token'})
    }

  } else {
    return res.status(401).json({message: "Unauthorized"})
  }
}

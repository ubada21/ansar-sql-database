
// JWT validation
const tokenService = require('../services/tokenService.js')

exports.authJwtToken = (req, res, next) => {
  let token = req.cookies.token
  if (!token) {
    return res.status(401).json({message: "Unauthorized"})
  } 
  try {
    const userData = tokenService.verifyToken(token)
    req.user = userData
    console.log(userData)
    next()
  } catch(err) {
    console.log(err)
    return res.status(401).json({message: 'Invalid Token'})
  }

}


// JWT validation
const jwt =  require('jsonwebtoken')

exports.authJwtToken = (req, res, next) => {
  let token = req.get('Authorization')
  console.log(token)
  if (token) {
    token = token.split(" ")
    const userData = jwt.verify(token[1], 'a-string-secret-at-least-256-bits-long')
    req.user = userData
    next()
  } else {
  return res.status(401).json({message: "Unauthorized"})
  }
}

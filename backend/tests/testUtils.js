const jwt = require('jsonwebtoken');

const SECRET = 'a-string-secret-at-least-256-bits-long';

function generateToken(payload = { uid: 1, roles: ['Admin'] }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function generateInvalidToken() {
  return jwt.sign({ uid: 1, roles: ['Admin'] }, 'wrong-secret', { expiresIn: '1h' });
}

module.exports = {
  generateToken,
  generateInvalidToken
};

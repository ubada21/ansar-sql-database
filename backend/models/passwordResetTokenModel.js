const db = require('../config/db')

exports.createResetToken = async (userId, tokenHash, expiresAt) => {
  const result = await db.query(
    'INSERT INTO password_reset_tokens (uid, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );

  return result
};

// exports.removeOldTokens = async (userId)


const jwt = require('jsonwebtoken')

const accessSecret = process.env.ACCESS_TOKEN_SECRET_KEY
const refreshSecret = process.env.REFRESH_TOKEN_SECRET_KEY
const accessExpire = process.env.ACCESS_TOKEN_EXPIRE || '15m'
const refreshExpire = process.env.REFRESH_TOKEN_EXPIRE || '7d'

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'EMPLOYEE',
  }
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpire })
}

function generateRefreshToken(user, options = {}) {
  const payload = { id: user.id }
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpire })
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}

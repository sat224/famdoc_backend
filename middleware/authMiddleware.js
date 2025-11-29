const { verifyAccessToken } = require('../utility/jwt')

function authenticate(req, res, next) {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' })

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Invalid authorization header' })
  }

  const token = parts[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token' })
  }
}

// role-based middleware
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'Not authenticated' })
    if (allowedRoles.length === 0) return next()
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden: insufficient rights' })
    }
    next()
  }
}

module.exports = {
  authenticate,
  authorize,
}

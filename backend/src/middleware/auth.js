const jwt = require('jsonwebtoken')

// ─── protect ──────────────────────────────────────────────────────────────────
// Middleware that protects private routes.
// Reads the JWT from the Authorization header and attaches user info to req.user
// Usage: router.get('/me', protect, handler)
// ─────────────────────────────────────────────────────────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Not authorized. Please log in first.'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // { id, email, role }
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Your session has expired. Please log in again.'
    })
  }
}

// ─── requireRole ──────────────────────────────────────────────────────────────
// Restricts a route to specific roles.
// Usage: router.get('/admin-only', protect, requireRole('ADMIN'), handler)
// ─────────────────────────────────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. This route requires role: ${roles.join(' or ')}`
    })
  }
  next()
}

module.exports = { protect, requireRole }

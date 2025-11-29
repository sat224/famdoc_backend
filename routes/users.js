// routes/users.js
const express = require('express')
const router = express.Router()
const { readJSON } = require('../utility/storage')
const { authenticate, authorize } = require('../middleware/authMiddleware')

// employee can get own profile
router.get('/me', authenticate, async (req, res) => {
  const users = await readJSON('users.json')
  const user = users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ msg: 'user not found' })
  const publicUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }
  return res.json(publicUser)
})

// admin-only: list all users
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  const users = await readJSON('users.json')
  const publicUsers = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
  }))
  return res.json(publicUsers)
})

module.exports = router

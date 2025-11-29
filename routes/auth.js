const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const { readJSON, writeJSON } = require('../utility/storage')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utility/jwt')

const USERS_FILE = 'users.json'
const RT_FILE = 'refreshTokens.json' // store { token, userId, createdAt }

const SALT_ROUNDS = 10

// register
router.post('/register', async (req, res) => {
  if (!req.body) res.status(400).json({ msg: 'bad request' })
  const { username, password, email, role } = req.body
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ msg: 'username, password and email are required' })
  }

  const users = await readJSON(USERS_FILE)
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ msg: 'username already exists' })
  }
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ msg: 'email already exists' })
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS)
  const newId = users.length ? users[users.length - 1].id + 1 : 1
  const newUser = {
    id: newId,
    username,
    password: hashed,
    email,
    role: role || 'EMPLOYEE',
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  await writeJSON(USERS_FILE, users)

  const publicUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  }
  return res.status(201).json({ msg: 'User created', user: publicUser })
})

// login -> returns access + refresh tokens
router.post('/login', async (req, res) => {
  if (!req.body) res.status(400).json({ msg: 'bad request' })
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ msg: 'username and password required' })

  const users = await readJSON(USERS_FILE)
  const user = users.find((u) => u.username === username)
  if (!user)
    return res.status(400).json({ msg: 'invalid username or password' })

  const match = await bcrypt.compare(password, user.password)
  if (!match)
    return res.status(400).json({ msg: 'invalid username or password' })

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // store refresh token
  const rts = await readJSON(RT_FILE)
  rts.push({
    token: refreshToken,
    userId: user.id,
    createdAt: new Date().toISOString(),
    id: uuidv4(),
  })
  await writeJSON(RT_FILE, rts)

  // NOTE: In production send refresh token as httpOnly secure cookie.
  return res.status(200).json({
    msg: 'success',
    accessToken,
    refreshToken,
  })
})

// refresh endpoint
router.post('/refresh', async (req, res) => {
  // accept refresh token in body or cookie
  if (!req.body) res.status(400).json({ msg: 'bad request' })
  const { refreshToken } = req.body
  if (!refreshToken)
    return res.status(400).json({ msg: 'refresh token required' })

  try {
    const payload = verifyRefreshToken(refreshToken)
    const rts = await readJSON(RT_FILE)
    const stored = rts.find((r) => r.token === refreshToken)
    if (!stored)
      return res.status(403).json({ msg: 'refresh token not recognized' })

    // optional: rotate tokens (invalidate old RT and issue new RT)
    // For now we'll return a fresh access token
    const users = await readJSON(USERS_FILE)
    const user = users.find((u) => u.id === payload.id)
    if (!user) return res.status(403).json({ msg: 'user not found' })

    const newAccessToken = generateAccessToken(user)
    return res.status(200).json({ accessToken: newAccessToken })
  } catch (err) {
    return res.status(401).json({ msg: 'invalid or expired refresh token' })
  }
})

// logout -> invalidate refresh token
router.post('/logout', async (req, res) => {
  if (!req.body) res.status(400).json({ msg: 'bad request' })
  const { refreshToken } = req.body
  if (!refreshToken)
    return res.status(400).json({ msg: 'refresh token required' })

  const rts = await readJSON(RT_FILE)
  const remaining = rts.filter((r) => r.token !== refreshToken)
  await writeJSON(RT_FILE, remaining)
  // If you use cookies, clear cookie here
  return res.status(200).json({ msg: 'logged out' })
})

module.exports = router

require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000

const USERS = [
  {
    username: 'satyender',
    password: '12345',
    email: 'satyender123@example.com',
  },
  {
    username: 'gaurav',
    password: '12345gaurav',
    email: 'gaurav123@example.com',
  },
  {
    username: 'mayur',
    password: 'mayur@123',
    email: 'mayur123@example.com',
  },
]

app.use(express.json())
app.use('/', (req, res, next) => {
  const user = req.body
  const isUserExist = USERS.find(
    (usr) => usr.username === user.username && usr.password === user.password
  )
  if (!isUserExist) {
    return res.status(400).json({ msg: 'invalid username or password' })
  }
  const userCopy = { ...isUserExist }
  delete userCopy.password
  console.log(USERS, 'USERS')
  console.log(userCopy, 'USERS')
  req.user = userCopy
  next()
})

app.post('/user', (req, res) => {
  res.status(200).json({ msg: 'success', data: req.user })
})

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})

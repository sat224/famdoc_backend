require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8000

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/users', userRoutes)

app.get('/', (req, res) => {
  res.json({ msg: 'Auth server running' })
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})

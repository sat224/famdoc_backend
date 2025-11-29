// scripts/createUser.js
require('dotenv').config()
const bcrypt = require('bcrypt')
const { readJSON, writeJSON } = require('../utility/storage')

async function create(username, password, email, role = 'ADMIN') {
  const users = await readJSON('users.json')
  const hashed = await bcrypt.hash(password, 10)
  const newId = users.length ? users[users.length - 1].id + 1 : 1
  const newUser = { id: newId, username, password: hashed, email, role }
  users.push(newUser)
  await writeJSON('users.json', users)
  console.log('Created user:', {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    createdAt: new Date().toISOString(),
  })
}

const [, , username, password, email, role] = process.argv
if (!username || !password || !email) {
  console.log(
    'usage: node scripts/createUser.js <username> <password> <email> [role]'
  )
  process.exit(1)
}
create(username, password, email, role).catch((err) => console.error(err))

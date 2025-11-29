// utility/storage.js
const fs = require('fs').promises
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {}
}

function filePath(filename) {
  return path.join(DATA_DIR, filename)
}

async function readJSON(filename) {
  await ensureDataDir()
  const fp = filePath(filename)
  try {
    const raw = await fs.readFile(fp, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(fp, '[]')
      return []
    }
    throw err
  }
}

async function writeJSON(filename, data) {
  await ensureDataDir()
  const fp = filePath(filename)
  // atomic-ish write: write temp then rename
  const tmp = fp + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tmp, fp)
}

module.exports = {
  readJSON,
  writeJSON,
}

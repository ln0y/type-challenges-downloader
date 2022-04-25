const fs = require('fs/promises')
const path = require('path')

function dirExists (dir) {
  return fs.stat(dir).then(stat => stat.isDirectory()).catch(() => false)
}

function fileExists (file) {
  return fs.stat(file).then(stat => stat.isFile()).catch(() => false)
}

async function readOrMkdir (dirPath) {
  if (await dirExists(dirPath)) return fs.readdir(dirPath)

  // create directory recursively
  const dirs = dirPath.split(path.sep)
  let tempPath = ''
  for (const d of dirs) {
    tempPath += `${d}${path.sep}`
    const exists = await dirExists(tempPath)
    if (!exists) await fs.mkdir(tempPath)
  }
  return fs.readdir(tempPath)
}

module.exports = {
  dirExists,
  fileExists,
  readOrMkdir,
}

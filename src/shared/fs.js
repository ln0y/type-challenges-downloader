const fs = require('fs/promises')

function dirExists (dir) {
  return fs.stat(dir).then(stat => stat.isDirectory()).catch(() => false)
}

function fileExists (file) {
  return fs.stat(file).then(stat => stat.isFile()).catch(() => false)
}

async function readOrMkdir (dir) {
  const exists = await dirExists(dir)
  if (exists) return fs.readdir(dir)
  else return fs.mkdir(dir).then(() => fs.readdir(dir))
}

module.exports = {
  dirExists,
  fileExists,
  readOrMkdir,
}

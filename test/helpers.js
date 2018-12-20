const fs = require('fs')
const { promisify } = require('util')

const fsp = {
  unlink: promisify(fs.unlink),
  writeFile: promisify(fs.writeFile),
  access: promisify(fs.access)
}

const safeUnlink = async (path) => {
  try {
    await fsp.unlink(path)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

module.exports = {
  fsp,
  safeUnlink
}

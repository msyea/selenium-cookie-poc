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

const waitForAssertions = (driver, assertionsFunc) => {
  const start = new Date();
  return new Promise((resolve, reject) => {
    const t = setInterval(async () => {
      let lastErr
      try {
        await assertionsFunc(driver);
        clearInterval(t);
        return resolve();
      } catch (err) {
        lastErr = err
      }

      if (new Date() - start > 10000) {
        clearInterval(t);
        return reject(`timeout for: ${lastErr}`);
      }

      return null;
    }, 100);
  });
}

module.exports = {
  fsp,
  safeUnlink,
  waitForAssertions
}

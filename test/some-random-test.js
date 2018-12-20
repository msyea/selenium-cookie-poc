const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')

const { fsp, safeUnlink } = require('./helpers')

const SCREENSHOT_PATH = __dirname + '/screenshot.png'

describe('selenium playing well with certificates', function () {
  this.timeout(10000)
  let driver
  beforeEach(() => (
    driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://selenium:4444/wd/hub')
      .build()
  ))
  afterEach(() => driver.quit())
  it ('should load a secure page without crying', async () => {
    await driver.get('http://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  })
  it ('should take a screenshot of a page', async () => {
    await safeUnlink(SCREENSHOT_PATH)
    await driver.get('http://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('BALLS', Key.RETURN);
    await driver.wait(until.titleIs('BALLS - Google Search'), 1000);
    const image = await driver.takeScreenshot()
    await fsp.writeFile(SCREENSHOT_PATH, image, 'base64')
    await fsp.access(SCREENSHOT_PATH) // will throw if no file
  })
})
const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')

const { fsp, safeUnlink, waitForAssertions } = require('./helpers')

const SCREENSHOT_PATH = __dirname + '/screenshot.png'

const COOKIE_MONSTER_HTTP = 'http://cookie_monster:4080'
const COOKIE_MONSTER_HTTPS = 'https://cookie_monster:4443'

const NOT_THE_COOKIE_MONSTER_HTTP = 'http://not_the_cookie_monster:4080'
const NOT_THE_COOKIE_MONSTER_HTTPS = 'https://not_the_cookie_monster:4443'

describe('selenium playing well with certificates', function () {
  this.timeout(15000)
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
    await driver.findElement(By.name('q')).sendKeys('Christmas', Key.RETURN);
    await driver.wait(until.titleIs('Christmas - Google Search'), 1000);
    const image = await driver.takeScreenshot()
    await fsp.writeFile(SCREENSHOT_PATH, image, 'base64')
    await fsp.access(SCREENSHOT_PATH) // will throw if no file
  })
  it ('should set a cookie', async () => {
    await driver.get(`${COOKIE_MONSTER_HTTP}/set-cookie?mycookie=myvalue1`)
    await driver.get(`${COOKIE_MONSTER_HTTP}/get-cookie`)
    await waitForAssertions(driver, async (driver) => {
      assert.equal(await driver.executeScript('return document.cookie'), 'mycookie=myvalue1')
    })
  })
  it ('should set a secure cookie', async () => {
    await driver.get(`${COOKIE_MONSTER_HTTPS}/set-cookie?mycookie=myvalue2`)
    await driver.get(`${COOKIE_MONSTER_HTTPS}/get-cookie`)
    await waitForAssertions(driver, async (driver) => {
      assert.equal(await driver.executeScript('return document.cookie'), 'mycookie=myvalue2')
    })
  })
  it ('should secure cookies should not be accessible over http', async () => {
    await driver.get(`${COOKIE_MONSTER_HTTPS}/set-cookie?mycookie=myvalue3`)
    await driver.get(`${COOKIE_MONSTER_HTTP}/get-cookie`)
    await waitForAssertions(driver, async (driver) => {
      assert.equal(await driver.executeScript('return document.readyState === "complete" ? document.cookie : null'), '')
    })
  })
  it ('should not load info from a mixed protocol page', async () => {
    await driver.get(`${COOKIE_MONSTER_HTTPS}/mixed-page`)
    await waitForAssertions(driver, async (driver) => {
      assert.equal(await driver.executeScript('return document.readyState === "complete" ? typeof output : null'), 'undefined')
    })
  })
  it ('should load info from a mixed protocol page', async () => {
    await driver.get(`${COOKIE_MONSTER_HTTPS}/not-mixed-page`)
    await waitForAssertions(driver, async (driver) => {
      assert.equal(await driver.executeScript('return document.readyState === "complete" ? output : null'), 'Hello world!')
    })
  })
})
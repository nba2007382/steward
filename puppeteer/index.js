const puppeteer = require('puppeteer');
let browser;
// define a function to launch browser if not exist
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
  }
  return browser;
}
// use the function to get browser instance
async function getBrowserInstance() {
  try {
    const Browser = await getBrowser();
    return Browser;
  } catch (err) {
    console.log(err);
    // or handle the error in other ways
  }
}
module.exports = getBrowserInstance;
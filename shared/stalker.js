const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer');

const CACHE_TTL = 5 * 60 * 1000;
const CACHE_SIZE = 1000;

class InstagramStories {
  constructor(username, cache) {
    this.cache = cache;
    this.username = username;
    this.browser = null;
    this.page = null;
    this.SELECTOR_FUNCTION_CALL_COUNT = 1;
    this.STORIES_SELECTOR = '.col-12.col-md-6.col-lg-4.mb-3';
  }

  async initView() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        waitUntil: 'networkidle2',
      });
      this.page = await this.browser.newPage();
      const userAgent = randomUseragent.getRandom();
      console.log(userAgent);
      await this.page.setUserAgent(userAgent);
      await this.page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getStories() {
    const cachedStories = await this.cache.has(this.username);

    if (cachedStories) {
      console.log('returning from cache');
      return await this.cache.get(this.username);
    }

    await this.initView();

    const storiesArray = await this.run(this.username);

    if (storiesArray) {
      await this.cache.set(this.username, {
        stories: storiesArray,
        time: Date.now(),
      });
    }

    return storiesArray;
  }

  async run(profile_username) {
    return await this.findStories(
      profile_username,
      this.SELECTOR_FUNCTION_CALL_COUNT
    );
  }

  async findStories(username, CALL_COUNT) {
    await this.page.goto(`https://iganony.com/profile/${username}`, {
      waitUntil: 'domcontentloaded',
    });

    try {
      if (CALL_COUNT < 5) {
        const stories = await this.findStoriesFromPage(
          this.page,
          this.STORIES_SELECTOR,
          CALL_COUNT * 3000 + 2000
        );

        return stories;
      } else {
        console.log('No stories found');
        return [];
      }
    } catch (error) {
      console.log('The user has no stories to show');
      console.log('Trying to call the selector again');
      await this.findStories(username, ++this.SELECTOR_FUNCTION_CALL_COUNT);
    }

    await this.closeBrowser();
  }

  async findStoriesFromPage(page, selector, timeout) {
    await page.waitForSelector(selector, { timeout });

    const data = await page.$$eval(selector, (e) => {
      return e.map((el) => {
        const data = {
          time: el.childNodes[1].innerText,
        };

        if (el.childNodes[0].childElementCount === 1) {
          // story is image
          data.src = el.childNodes[0].childNodes[0].src;
        } else {
          // story is video
          data.src = el.childNodes[0].childNodes[1].src;
        }

        return data;
      });
    });

    return data;
  }

  async closeBrowser() {
    await this.browser.close();
  }
}

module.exports = InstagramStories;

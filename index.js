// const fastify = require('fastify')({ logger: false });
const puppeteer = require('puppeteer');

const STORIES_SELECTOR = '.col-12.col-md-6.col-lg-4.mb-3';
const profile_username = null || 'uzaqbergenova.gulnaz';

async function findStoriesFromPage(page, selector, timeout) {
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

async function findStories(username, SELECTOR_FUNCTION_CALL_COUNT) {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    width: 1920,
    height: 1080,
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 960,
    height: 1080,
  });

  await page.goto(`https://iganony.com/profile/${username}`, {
    waitUntil: 'domcontentloaded',
  });

  try {
    if (SELECTOR_FUNCTION_CALL_COUNT < 5) {
      const stories = await findStoriesFromPage(
        page,
        STORIES_SELECTOR,
        SELECTOR_FUNCTION_CALL_COUNT * 3000 + 2000
      );

      console.log(stories);
    } else {
      console.log('No stories found');
      return;
    }
  } catch (error) {
    console.log('The user has no stories to show');
    console.log('Trying to call the selector again');
    await findStories(username, ++SELECTOR_FUNCTION_CALL_COUNT);
  }
}

async function run(profile_username) {
  let SELECTOR_FUNCTION_CALL_COUNT = 1;

  await findStories(profile_username, SELECTOR_FUNCTION_CALL_COUNT);
}

run(profile_username);

// fastify.get('/', async (request, reply) => {
//   return { hello: 'world' };
// });

// async function start() {
//   try {
//     await fastify.listen({ port: 3000 });
//     console.log(`Server listening on port ${fastify.server.address().port}`);
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// }
// start();

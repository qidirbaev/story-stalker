const fastify = require('fastify')({ logger: false });

const CacheResponse = require('./shared/cache');
const InstagramStories = require('./shared/stalker');

// Uncomment this to avoid recaptcha
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

// puppeteer.use(StealthPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const cache = new CacheResponse();

fastify.get('/', async (request, reply) => {
  return { main: 'InstagramStoryStalker' };
});

fastify.get('/:username', async (request, reply) => {
  const { username } = request.params;

  console.log(`Request for ${username}`);

  const userStories = new InstagramStories(username, cache);
  const stories = await userStories.getStories();

  return { stories };
});

async function start() {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();

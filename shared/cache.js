class CacheResponse {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key);
  }

  async has(key) {
    return this.cache.has(key);
  }

  async set(key, value) {
    // if cache size is bigger than CACHE_SIZE, delete the oldest item

    if (this.cache.size > CACHE_SIZE) {
      const oldestKey = [...this.cache.keys()].sort(
        (a, b) => a.time - b.time
      )[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), CACHE_TTL);
  }
}

module.exports = CacheResponse;

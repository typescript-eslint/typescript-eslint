class LruCache {
  constructor() {
    this.cache = new Map();
  }
  get(name) {
    return this.cache.get(name);
  }
  set(name, value) {
    this.cache.set(name, value);
    return value;
  }
}

module.exports = LruCache;

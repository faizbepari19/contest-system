// cacheUtils.js
const NodeCache = require('node-cache');

// Create a cache instance with standard TTL of 10 minutes and check period of 1 minute
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

/**
 * Wrapper function to implement caching
 * @param {string} key - Cache key
 * @param {Function} cb - Callback function to execute if cache miss
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<any>} Result from cache or callback
 */
const cacheOrExecute = async (key, cb, ttl = null) => {
  // Check if data exists in cache
  const value = cache.get(key);
  if (value !== undefined) {
    return value;
  }

  // If not in cache, execute the callback
  const result = await cb();
  
  // Store result in cache
  if (ttl) {
    cache.set(key, result, ttl);
  } else {
    cache.set(key, result);
  }
  
  return result;
};

/**
 * Clear a specific cache entry
 * @param {string} key - Cache key to clear
 */
const clearCache = (key) => {
  cache.del(key);
};

/**
 * Clear all cache entries matching a pattern (prefix)
 * @param {string} pattern - Cache key pattern/prefix
 */
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchedKeys = keys.filter(k => k.startsWith(pattern));
  cache.del(matchedKeys);
};

/**
 * Clear all cache entries
 */
const flushCache = () => {
  cache.flushAll();
};

module.exports = {
  cache,
  cacheOrExecute,
  clearCache,
  clearCacheByPattern,
  flushCache
};
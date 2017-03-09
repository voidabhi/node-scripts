var LRU = require("lru-cache")
  , options = { max: 500
              , length: function (n, key) { return n * 2 + key.length }
              , dispose: function (key, n) { n.close() }
              , maxAge: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
cache.get("key") // "value"

// non-string keys ARE fully supported
var someObject = {}
cache.set(someObject, 'a value')
cache.set('[object Object]', 'a different value')
assert.equal(cache.get(someObject), 'a value')

cache.reset()    // empty the cache

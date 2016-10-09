var redis = require("redis")
  , subscriber = redis.createClient()
  , publisher  = redis.createClient();

subscriber.on("message", function(channel, message) {
  console.log("["+channel+"]:" + message)
});

subscriber.subscribe("foo");
subscriber.subscribe("bar");

publisher.publish("foo", "hello");
publisher.publish("bar", "world");

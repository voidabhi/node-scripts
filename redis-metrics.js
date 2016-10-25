// Import libraries
var redis = require("redis"),
    client = redis.createClient();
var express = require('express');
var app = express.createServer();

// Expose an endpoint which reports on the latest has values out of Redis
// ~2ms response time
app.get('/', function(req, res){
    client.hgetall("node_test", function(err, replies) {
        res.send(replies);
    });
});

// Error handling
client.on("error", function (err) {
    console.log("Error " + err);
});

// Simulate incoming data
// Updates are a single hincrby at O(1) complexity
setInterval(function() {
    client.hincrby("node_test", (new Date()).toString().substr(4, 17),  Math.floor(Math.random() * 1000), function() {});
}, 200);

// Start the server
app.listen(3000);

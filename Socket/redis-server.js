var ws = require('ws'),
    nconf = require('nconf'),
    redis = require('redis');

nconf.argv()
    .env();

var server = new ws.Server({
    port: nconf.get('PORT')
});

var sockets = {};

server.on('connection', function (socket) {
    socket.on('message', function (message) {
        var a = message.split('|');
        var playerId = a[0];
        console.log('received message from ' + playerId);
        sockets[playerId] = socket;
    });
});

var db = redis.createClient(nconf.get("REDIS_PORT"), nconf.get("REDIS_HOST"));
if (nconf.get('REDIS_PASSWORD')) {
    db.auth(nconf.get("REDIS_PASSWORD"));
}

db.on('message', function (channel, message) {
    if (channel == 'chanel') {
        var a = message.split('>');
        var socket = sockets[a[0]];
        var m = a[1];
        // les messages sont supposés contenir les ID utilisateurs
        //var socket = sockets[message];
        if (socket != undefined) {
            socket.send(m);
        }
    }
});

db.subscribe('channel');
console.log('listening at ws://localhost:' + nconf.get('PORT'));

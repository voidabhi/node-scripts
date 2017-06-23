var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(data));
    });
};

var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    Consumer = kafka.Consumer,
    client = new kafka.Client("localhost:2181", "topic-test"),

    consumer = new Consumer(
        client, [{
                topic: 'test',
                partition: 0
            }
            //, { topic: 't1', partition: 1 }
        ], {
            autoCommit: false
        }
    );

consumer.on('message', function(message) {
    console.log(message);
    wss.broadcast(message);
});

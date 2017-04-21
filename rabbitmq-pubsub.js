#!/usr/bin/env node

//
// Example of publisher/subscriber pattern in NodeJS, with AMQPLib. This program has been
// demonstrated to work with 500k messages and 4 subscribers.
//
// #WorksOnMyMachine
//
// Usage: ./pubsub
//
// Options:
//
//       --delay <n>         delay, in milliseconds, before publishing messages
//   -m, --messages <n>      number of messages to publish
//   -s, --subscribers <n>   number of subscribers to create
//       --work <n>          amount of time, in milliseconds, to simulate work
//

var amqp = require('amqplib');
var cluster = require('cluster');
var program = require('commander');

// Name of the queue.
var queue = 'pubsub';

// Placeholder for counter. Used by subscribers to count number of
// messages received.
var counter = 0;

// Start (for timers);
var start = Date.now();

function assertQueue(channel) {
    // Ensure that the queue exists.
    //
    // Options:
    //    autoDelete: Delete the queue if there are no consumers.
    //    durable: Should the queue survive server restarts?
    return channel.assertQueue(queue, { autoDelete: false, durable: true });
}

function connect(source) {
    // Placeholder for channel.
    var channel;

    // Connect to AMQP server and return a channel.
    return amqp.connect('amqp://localhost')
        .then(function (connection) {
            console.log(' [x] %s connected', source);
            return connection.createChannel();
        })
        .then(function (result) {
            channel = result;
            return assertQueue(channel);
        })
        .then(function () {
            // Only fetch a single document at a time. Wait for an
            // acknowledgement before sending the next item on the
            // queue.
            return channel.prefetch(1);
        })
        .then(function () {
            return channel;
        });
}

// Used by commander to coerce values into integers.
function int(value) {
    return parseInt(value, 10);
}

function onReceive(subscriberId, channel, msg) {

    // The message content will be a buffer. Use toString to convert
    // the buffer back to a string, then parse the JSON object.
    var content = JSON.parse(msg.content.toString());


    console.log(' [ ] %s received message %s, %s, %s', subscriberId, content.id, content.message, content.timestamp);

    // This simulates a 'slow' process that takes some amount of
    // processing time. Do the work first, before sending the acknowledgement.
    // This is the correct way to throttle delivery with multiple subscribers.
    var workTimeout = Math.random() * program.work;
    setTimeout(function () {
        channel.ack(msg);
        var duration = Date.now() - start;
        console.log(' [x] %s is done with message %s. Ack sent. (Count: %s, time: %s ms)', subscriberId, content.id, ++counter, duration);
    }, workTimeout);
}

function startPublisher() {
    return connect('Publisher')
        .then(function (channel) {

            console.log(' [ ] Number of messages to send: %s', program.messages);

            for (var i = 0; i < program.messages; i++) {
                // Create the message. The message must be a buffer.
                // Stringify an object and create a buffer from that string.
                var message = {
                    id: i + 1,
                    message: 'Hello, World!',
                    timestamp: new Date().toISOString()
                };
                var body = new Buffer(JSON.stringify(message));

                // Send the messages.
                //
                // Options:
                //    persistent: Should the message be saved to disk?
                //    immediate: If this value is true, the message is rejected if it is not
                //       able to be immediately delivered to a consumer.
                channel.sendToQueue(queue, body, { persistent: false, immediate: false });
                console.log(' [x] Sent message %s', message.id);
            }

        });
}

function spinupSubscribers() {
    console.log(' [ ] Number of subscribers: %s', program.subscribers);
    for (var i = 0; i < program.subscribers; i++) {
        cluster.fork();
    }
}

function startSubscriber() {
    var subscriberId = cluster.worker.id;
    console.log(' [x] Started subscriber %d. Work time: %s.', subscriberId, program.work);
    connect('Subscriber ' + subscriberId)
        .then(function (channel) {

            // Subscribe to a queue.
            //
            // Options:
            //    noAck: If this value is true, the queue should not expect an acknowledgement
            //       from the consumer. This defaults to false, so setting the value here is
            //       redundant. Still, many examples show this value being set here.
            channel.consume(queue, function (msg) {
                onReceive(subscriberId, channel, msg);
            }, { noAck: false });
            console.log(' [ ] Subscriber %d is listening for messages', subscriberId);
        })
        .catch(console.error);
}

program
    .option('    --delay <n>', 'delay, in milliseconds, before publishing messages', int, 250)
    .option('-m, --messages <n>', 'number of messages to send', int, 10)
    .option('-s, --subscribers <n>', 'number of subscribers to create', int, 2)
    .option('    --work <n>', 'amount of time, in milliseconds, to simulate work', int, 0)
    .parse(process.argv);


if (cluster.isMaster) {
    spinupSubscribers();

    // Add a delay to allow for subscribers to start before we
    // start throwing messages at the queue.
    setTimeout(function () {
        startPublisher();
    }, program.delay);
} else {
    startSubscriber();
}


var socket = new WebSocket('ws://localhost');
socket.binaryType = 'arraybuffer';
socket.send(new ArrayBuffer);


var fs = require('fs');
var io = require('socket.io')(3000);
io.on('connection', function(socket){
  fs.readFile('image.png', function(err, buf){
    // it's possible to embed binary data
    // within arbitrarily-complex objects
    socket.emit('image', { image: true, buffer: buf });
  });
});
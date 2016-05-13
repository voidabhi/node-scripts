

var socket = new WebSocket('ws://localhost');
var fs = require('fs');
var io = require('socket.io')(3000);

// setting up socket connection
socket.binaryType = 'arraybuffer';
socket.send(new ArrayBuffer);

io.on('connection', function(socket){
  fs.readFile('image.png', function(err, buf){
    // it's possible to embed binary data
    // within arbitrarily-complex objects
    socket.emit('image', { image: true, buffer: buf });
  });
});

// sending image data

self.canvas.toBuffer(function(err, buf){
  if (err) throw err;
  io.emit('frame', buf);
});

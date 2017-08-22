
var http = require('http');
var util = require('util');
var heapdump = require('heapdump');
var memwatch = require('memwatch');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  for (var i=0; i<1000; i++) {
    server.on('request', function leakyfunc() {
      var l = http;
    });
  }

  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
server.setMaxListeners(0);

console.log('Server running at http://127.0.0.1:1337/. Process PID: ', process.pid);

memwatch.on('leak', function(info) {
  console.error(info);
  var file = '/tmp/myapp-' + process.pid + '-' + Date.now() + '.heapsnapshot';
  heapdump.writeSnapshot(file, function(err){
    if (err) console.error(err);
    else console.error('Wrote snapshot: ' + file);
  });
});

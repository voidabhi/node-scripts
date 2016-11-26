// HTTP forward proxy server that can also proxy HTTPS requests

var httpProxy = require('http-proxy'),
	url = require('url'),
	net = require('net'),
	http = require('http');

process.on('uncaughtException', logError);

function truncate(str) {
	var maxLength = 64;
	return (str.length >= maxLength ? str.substring(0,maxLength) + '...' : str);
}

function logRequest(req) {
	console.log(req.method + ' ' + truncate(req.url));
	for (var i in req.headers)
		console.log(' * ' + i + ': ' + truncate(req.headers[i]));
}

function logError(e) {
	console.warn('*** ' + e);
}

// this proxy will handle regular HTTP requests
var regularProxy = new httpProxy.RoutingProxy();

// standard HTTP server that will pass requests 
// to the proxy
var server = http.createServer(function (req, res) {
  logRequest(req);
  uri = url.parse(req.url);
  regularProxy.proxyRequest(req, res, {
  	host: uri.hostname,
  	port: uri.port || 80
  });
});

// when a CONNECT request comes in, the 'upgrade'
// event is emitted
server.on('upgrade', function(req, socket, head) {
	logRequest(req);
	// URL is in the form 'hostname:port'
	var parts = req.url.split(':', 2);
	// open a TCP connection to the remote host
	var conn = net.connect(parts[1], parts[0], function() {
		// respond to the client that the connection was made
		socket.write("HTTP/1.1 200 OK\r\n\r\n");
		// create a tunnel between the two hosts
		socket.pipe(conn);
		conn.pipe(socket);
	});
});

server.listen(3333);

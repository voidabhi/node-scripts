var http = require('http');
var stream = require('stream');

var server = http.createServer(function(request, response) {
  // Handle SSE requests
  if (request.url == "/events") {
    var channel = new stream.PassThrough
    var interval = setInterval(function() {
      channel.write("data: abcdef\n\n");
      console.log("write data...");
    }, 1000);

    response.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'connection': 'keep-alive', 'cache-control': 'no-cache' });
    response.on("close", function() { clearInterval(interval); });

    channel.pipe(response);
  }
  // Provide the "UI"
  else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end("<script>" +
                 "var source = new EventSource('/events');" +
                 "source.onmessage = function(e) { console.log(e.data) };" +
                 "source.onerror = function(e) { console.error(e); };" +
                 "source.onopen = function(e) { console.info(e); };" +
                 "</script> " +
                 "Hello World, Open the debug console to see more...!");
  }
});

// Start server
server.listen(8000);

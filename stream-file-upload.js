var http = require('http');
var router = require('routes')();
var Busboy = require('busboy');
var port = 5000;

// Define our route for uploading files
router.addRoute('/images', function (req, res, params) {
  if (req.method === 'POST') {
    
    // Create an Busyboy instance passing the HTTP Request headers.
    var busboy = new Busboy({ headers: req.headers });

    // Listen for event when Busboy finds a file to stream.
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

      // We are streaming! Handle chunks
      file.on('data', function (data) {
        // Here we can act on the data chunks streamed.
      });

      // Completed streaming the file.
      file.on('end', function () {
        console.log('Finished with ' + fieldname);
      });
    });

    // Listen for event when Busboy finds a non-file field.
    busboy.on('field', function (fieldname, val) {
      // Do something with non-file field.
    });

    // Listen for event when Busboy is finished parsing the form.
    busboy.on('finish', function () {
      res.statusCode = 200;
      res.end();
    });

    // Pipe the HTTP Request into Busboy.
    req.pipe(busboy);
  }
});

var server = http.createServer(function (req, res) {
  
  // Check if the HTTP Request URL matches on of our routes.
  var match = router.match(req.url);

  // We have a match!
  if (match) match.fn(req, res, match.params);
});

server.listen(port, function () {
  console.log('Listening on port ' + port);
});

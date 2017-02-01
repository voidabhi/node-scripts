
var http = require('http');
var router = require('routes')();
var Busboy = require('busboy');
var AWS = require('aws-sdk');
var inspect = require('util').inspect;
var port = 5000;

// Define s3-upload-stream with S3 credentials.
var s3Stream = require('s3-upload-stream')(new AWS.S3({
  accessKeyId: '',
  secretAccessKey: ''
}));

// Handle uploading file to Amazon S3.
// Uses the multipart file upload API.
function uploadS3 (readStream, key, callback) {
  var upload = s3Stream.upload({
    'Bucket': '',
    'Key': key
  });

  // Handle errors.
  upload.on('error', function (err) {
    callback(err);
  });

  // Handle progress.
  upload.on('part', function (details) {
    console.log(inspect(details));
  });

  // Handle upload completion.
  upload.on('uploaded', function (details) {
    callback();
  });

  // Pipe the Readable stream to the s3-upload-stream module.
  readStream.pipe(upload);
}


// Define our route for uploading files
router.addRoute('/images', function (req, res, params) {
  if (req.method === 'POST') {

    // Create an Busyboy instance passing the HTTP Request headers.
    var busboy = new Busboy({ headers: req.headers });

    // Listen for event when Busboy finds a file to stream.
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

      // Handle uploading file to Amazon S3.
      // We are passing 'file' which is a ReadableStream,
      // 'filename' which is the name of the file
      // and a callback function to handle success/error.
      uploadS3(file, filename, function (err) {
        if (err) {
          res.statusCode = 500;
          res.end(err);
        } else {
          res.statusCode = 200;
          res.end('ok');
        }
      });
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

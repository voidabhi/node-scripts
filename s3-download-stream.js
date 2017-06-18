// This Express server is designed to support Efolder-Express Rails server to
// allow streaming data from S3 without first saving a local copy on disk.

const express = require('express')
const app = express()
const AWS = require('aws-sdk');

AWS
  .config
  .update({region: 'us-gov-west-1'});

const s3 = new AWS.S3();

app.use(require('cookie-parser')());
const sessionDecoder = require('rails-session-decoder');

// Use the shared SECRET_KEY_BASE from the env file to setup the Rails session
// decoder.
const decoder = sessionDecoder(process.env.SECRET_KEY_BASE);
const sessionCookieName = '_caseflow_session';

// Setup a middleware to decode the Rails session cookie. Whenever "_caseflow_session"
// is present, it will be decoded.
app.use(function (req, res, next) {
  if (req.cookies && req.cookies[sessionCookieName]) {
    decoder
      .decodeCookie(req.cookies[sessionCookieName], function (err, sessionData) {
        req.cookies[sessionCookieName] = JSON.parse(sessionData);
        next(err);
      });
  } else {
    next();
  }
});

// stream-download re-check user's authority from its session, and pipe
// the request directly to S3 if the user is authorized for this download.
app.get('/stream-download/:filename', function (req, res) {
  const session = req.cookies[sessionCookieName];
  if (!session || !session.user || !session.user.roles || session.user.roles.indexOf('Download efolder') != -1) {
    return res
      .status(403)
      .send('not authorized');
  }

  s3
    .getObject({Bucket: process.env.AWS_BUCKET_NAME, Key: req.params.filename })
    .on('httpHeaders', function (statusCode, headers) {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      this
        .response
        .httpResponse
        .createUnbufferedStream()
        .pipe(res);
    })
    .send();
})

// Nginx is expected to proxy /stream-download to port 3002.
app.listen(3002, function () {
  console.log('listening on 3002')
})

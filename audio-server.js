var express     = require('express');
var app         = express();
var fs          = require('fs');
var gcs = require('@google-cloud/storage')({
  keyFilename: 'path/to/keyfile.json'
});
var bucket = gcs.bucket(BUCKET_NAME);
var contentTypes = {
    '.wav': 'audio/x-wav',
    '.m4a': 'audio/x-m4a',
    '.3gp': 'audio/3gpp',
    '.mp4': 'audio/mp4'
};

// imports for file info api
var pmongo = require('pmongo');
var db = pmongo(MONGODB_URI);
var jobs = db.collection('jobs');
var path = require('path');

function getFileInfo(fileId, cb) {
    return Promise.resolve({
         filename: '2017-06-18' + '/' + 'out000-387593.wav',
         size: 1830000,
         ext: '.wav'
    });
}

app.get('/:file_id/play', function(req, res) {
    var file_id = req.params.file_id;

    getFileInfo(file_id)
    .then(function (info){
        var range = req.headers.range;
        var readStream;

        if (range !== undefined) {
            var parts = range.replace(/bytes=/, "").split("-");

            var partial_start = parts[0];
            var partial_end = parts[1];

            if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
                return res.sendStatus(500);
            }

            var start = parseInt(partial_start, 10);
            var end = partial_end ? parseInt(partial_end, 10) : info.size - 1;
            var content_length = (end - start) + 1;

            res.status(206).header({
                'Content-Type': contentTypes[info.ext],
                'Content-Length': content_length,
                'Content-Range': "bytes " + start + "-" + end + "/" + info.size
            });

            readStream = bucket.file(info.filename).createReadStream({
                start: start,
                end: end
            });
        } else {
            res.header({
                'Content-Type': contentTypes[info.ext],
                'Content-Length': info.size
            });
            readStream = bucket.file(info.filename).createReadStream();
        }
        readStream.pipe(res);
    })
    .catch(function (err) {
        res.status(500);
        res.json({
            error: err
        })
    });
});

app.listen(4000, function() {
    console.log("Running audio server on port 4000");
});




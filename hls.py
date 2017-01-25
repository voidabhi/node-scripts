var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var zlib = require('zlib');

PORT = 8000;

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;

    if (uri == '/player.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>HLS Player fed by node.js' +
            '</title></head><body>');
        res.write('<video src="http://' + req.socket.localAddress +
            ':' + PORT + '/out.M3U8" controls autoplay></body></html>');
        res.end();
        return;
    }

    var filename = path.join("./", uri);
    fs.exists(filename, function (exists) {
        if (!exists) {
            console.log('file not found: ' + filename);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('file not found: %s\n', filename);
            res.end();
        } else {
            console.log('sending file: ' + filename);
            switch (path.extname(uri)) {
            case '.M3U8':
                fs.readFile(filename, function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end();
                    } else if (contents) {
                        res.writeHead(200,
                            {'Content-Type':
                            'application/vnd.apple.mpegurl'});
                        var ae = req.headers['accept-encoding'];
                        if (ae.match(/\bgzip\b/)) {
                            zlib.gzip(contents, function (err, zip) {
                                if (err) throw err;

                                res.writeHead(200,
                                    {'content-encoding': 'gzip'});
                                res.end(zip);
                            });
                        } else {
                            res.end(contents, 'utf-8');
                        }
                    } else {
                        console.log('emptly playlist');
                        res.writeHead(500);
                        res.end();
                    }
                });
                break;
            case '.ts':
                res.writeHead(200, { 'Content-Type':
                    'video/MP2T' });
                var stream = fs.createReadStream(filename,
                    { bufferSize: 64 * 1024 });
                stream.pipe(res);
                break;
            default:
                console.log('unknown file type: ' +
                    path.extname(uri));
                res.writeHead(500);
                res.end();
            }
        }
    });
}).listen(PORT);

#!/usr/bin/env node

var http = require('http'),
    fileSystem = require('fs'),
    path = require('path')
    util = require('util');

http.createServer(function(request, response) {
    var filePath = 'path_to_file.mp3';
    var stat = fileSystem.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    util.pump(readStream, response);
})
.listen(2000);

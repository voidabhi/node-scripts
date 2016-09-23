'use strict';
var cluster = require('cluster');

if (cluster.isMaster) {
    // server
    var cpus = require('os').cpus().length;
    for (var i = 0; i < cpus; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', function clusterOnExit(worker) {
        console.log('Worker %s exited, restarting...', worker.process.pid);
        cluster.fort();
    });
} else {
    // app
    var express = require('express');
    var app = express();

    // app... all your express code?

    var server = app.listen(3000, function expressListner() {
        console.log('Listening on 127.0.0.1:%d', config.PORT);
    });

    /****************************************************************
     *
     *  Terrible method of handling a memory leak.
     *
     *  If process RSS Memory is greater then 600MB, gracefully shut 
     *  down the process. `cluster.master` will automatically 
     *  restart.
     * 
     *  It should be noted that this is one of the worst bits of
     *  code that I have ever written.
     *
     ****************************************************************/
    
    if (process.env.NODE_ENV === 'stage' || process.env.NODE_ENV === 'production') {
        var upperBounds = 600*1000*1000; // 600MB
        setInterval(function memCheckInterval() {
            if (process.memoryUsage().rss > upperBounds) server.close();
        }, 60*1000); // 1 minutes
    
        server.on('close', function serverOnClose() {
            console.log('Gracefully shutting down, to avoid memory bloat. Memory Dump:');
            console.log(process.memoryUsage());
            process.exit();
        });
    }
}

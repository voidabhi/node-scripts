var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename : 'winston.log', timestamp: true, /*maxsize: 2000, maxFiles: 5*/ })
    ]
});

process.on('uncaughtException', function (err) {
    logger.error('uncaughtException', { message : err.message, stack : err.stack }); // logging with MetaData
    process.exit(1); // exit with failure
});

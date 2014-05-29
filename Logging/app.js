
// Importing logging module
var log4js = require('log4js'); 
// Getting logger object
var logger = log4js.getLogger();
 
// Logging the info
logger.info('Application is running'); 
// Logging the warning
logger.warn('Module cannot be loaded'); 
// Logging the error
logger.error('Saved data was error');
// Logging fatal error
logger.fatal('Server could not process'); 
// Logging debug line
logger.debug("Some debug messages");
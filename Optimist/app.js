
// Optimist: Module for parsing command line options

var argv = require('optimist').argv;

// run app.js --rif=55 --xup=9.52

if (argv.rif - 5 * argv.xup > 7.138) {
    console.log('Buy more riffiwobbles');
}
else {
    console.log('Sell the xupptumblers');
}
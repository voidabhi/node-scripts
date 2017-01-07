// Usage: process.emit( 'app:log', module, arg1, arg2, ..., argN );

var Module = require('module');

function logConsole(method, module) {
  var args = [(new Date()).toJSON(), method];
  var index = 1;

  if (module instanceof Module) {
    args.push(module.id);
    index = 2;
  }

  args.push.apply(args, Array.prototype.slice.call(arguments, index));

  console.log.apply(console, args);
}

['debug', 'error', 'info', 'log', 'warn'].forEach( function(consoleMethod) {
  process.on('app:' + consoleMethod, logConsole.bind(null, consoleMethod.toUpperCase()));
} );

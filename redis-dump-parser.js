var rdb = require('rdb-parser');

console.log(rdb.types);

var parser = new rdb.Parser();

parser.on('entity', function(e) {
  console.log(e);
});

parser.on('error', function(err) {
  throw err;
});

parser.on('end', function() {
  console.log('done');
});

process.stdin.pipe(parser);
process.stdin.resume();

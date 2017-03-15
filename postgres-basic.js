
var pg = require('pg');
var connString = 'postgresql://localhost/test';


pg.connect(conString, function(err, client, done) {
  client.query("INSERT INTO todos(text, done) values($1, $2)", [data.text, data.done]);

var query = client.query("SELECT * FROM todos ORDER BY id ASC");

//can stream row results back 1 at a time
query.on('row', function(row) {
      results.push(row);
});

//fired after last row is emitted
query.on('end', function() { 
  client.end();
  return res.json(results); // return all todos in JSON format      
});

if(err)
  console.log(err);
});

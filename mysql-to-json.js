var mysql = require('mysql');
var fs = require('fs');

var client = mysql.createClient({
   user: 'root',
   password: 'mysqlpassword' 
});

client.query('select * from db.table;', function(err, results, fields) {
    if(err) throw err;

    fs.writeFile('table.json', JSON.stringify(results), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

    client.end();   
});

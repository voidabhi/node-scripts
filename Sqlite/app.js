
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function(){

// Creating table
if(!exists){
	db.run("CREATE TABLE STUFF (thing TEXT)");
}


// Statement
var stmt = db.prepare("INSERT INTO STUFF VALUES(?)");
	for(var i=0;i<10;i++)
		stmt.run("Thing #"+i);
stmt.finalize();

// Query
var query = "SELECT rowid as id ,thing from Stuff";
db.each(query,function(err,row){
	console.log(row.id + ":"+ row.thing);
});
});

db.close();
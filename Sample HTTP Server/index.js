

// importing http module
var http = require("http");

// creating server and listen to port
http.createServer(

function (req,res){
	//writing http response
	res.writeHead(200,{"Content-Type":"text/html"});
	res.end("Hello World\n");
}

).listen(3000);

// display message
console.log("Running server at port 3000");


var express = require("express");
var app = express();

// Add cookie parser and session plugins
app.use(express.cookieParser());
app.use(express.session({secret:"123456789qwerty"}));

app.get("/awesome",function(req,res){

	// accessing session object from request
	// checking if the lastPage property of session object exist or not
	if(req.session.lastPage){
		res.write("Last page you visited was");
	}
	
	// adding lastPage property if it doesn't exist
	req.session.lastPage = "/awesome";
	res.send("You are awesome!");
});

app.get("/rational",function(req,res){

	if(req.session.lastPage){
		res.write("Last page you visited was");
	}

	req.session.lastPage = "/rational";
	res.send("You are rational");
});

app.get("/nice",function(req,res){

	if(req.session.lastPage){
		res.write("Last page you visited was");
	}

	req.session.lastPage = "/nice";
	res.send("You are nice!");
});

app.listen(process.env.PORT || 8000);
console.log("Server listening at port "+8000);
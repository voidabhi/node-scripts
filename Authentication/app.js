
var express  = require("express");
var app = express();

app.get("/home",function(req,res){
	res.send("I am home!");
});

app.listen(process.env.PORT || 5000);
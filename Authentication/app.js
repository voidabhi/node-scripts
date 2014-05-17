
var express  = require("express");
var app = express();

// Authenticator Synchronous
//app.use(express.basicAuth('testUser','testPass'));

// Authenticator Async
app.use(express.basicAuth(function(user,pass,callback){
	var result = (user==='testUser'&&pass==='testPass');
	callback(null /*error*/,result);
}));

app.get("/home",function(req,res){
	res.send("I am home!");
});

app.listen(process.env.PORT || 5000);
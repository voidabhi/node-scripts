
var express  = require("express");
var app = express();

// Sync
var syncauth = app.use(express.basicAuth('testUser','testPass'));

// Sync Func
var syncfunc = app.use(express.basicAuth(function(user,pass){
	 return user === 'testUser' && pass === 'testPass';
}));

// Async 
var async = app.use(express.basicAuth(function(){
	var result = (user==='testUser'&&pass==='testPass');
	callback(null /*error*/,result);
}));

app.get("/home",syncauth,function(req,res){
	res.send("I am home!");
});

app.get("/noauth",function(req,res){
	res.send("No auth area!");
});
app.listen(process.env.PORT || 5000);
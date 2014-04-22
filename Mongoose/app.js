// app.js
var express = require("express");
var logfmt = require("logfmt");
var mongoose = require("mongoose");
var app = express();
MONGODB_URL = '' // 'mongodb://<username>:<password>@novus.modulusmongo.net:27017/<identifier>'

mongoose.connect(MONGODB_URL);

var Todo= mongoose.model('Todo',{text:String});

app.use(logfmt.requestLogger());

app.get('/api/todos', function(req, res) {

		Todo.find(function(err,todos){
			if(err)
				res.send(err);
			res.json(todos);
		});
});

app.post('/api/todos',function(req,res){

  	Todo.create({text:req.body.text},function(err,todo){
		if(err)
			res.send(err);
		
		// Sending updated list in response
		Todo.find(function(err,todos){
			if(err)
				res.send(err);
			res.json(todos);
		});
		
	});
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
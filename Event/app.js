

var EventEmitter = require('events').EventEmitter;
 var myEmitter = new EventEmitter;

var connection = function(id){

 // do something
 console.log('client id: ' + id); 
 
 }; 
 
 myEmitter.on('connection', connection); 
 
 myEmitter.on('message', function(msg){

 // do something 
 console.log('message: ' + msg);

 });
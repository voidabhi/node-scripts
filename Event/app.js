

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
 
 // using emitters emit function
 
 myEmitter.emit('connection', 6); 
 myEmitter.emit('connection', 8); 
 myEmitter.emit('message', 'this is the first message'); 
 myEmitter.emit('message', 'this is the second message');
 myEmitter.emit('message', 'welcome to nodejs');
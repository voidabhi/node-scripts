

// Importing networking library
var net = require("net");

// Creating chat server
var chatServer  = net.createServer();

// Client list
var clientList = [];

// Registering chatserver to client's connection event
chatServer.on("connection",function(client){
	client.name = client.remoteAddress+":"+client.remotePort;
	client.write("Hi "+client.name+"!\n");
	// When connected client sends a datapacket
	
	// Pushing new client to the list
	clientList.push(client);
	
	// Sending data sent by any client to all clients
	client.on("data",function(data){
		broadcast(data,client);
	});	
	
	// Removing clients from the list that have ended connection 
	client.on("end",function(client){
		contactList.splice(clientList.indexOf(client),1);
	});
	
	client.on("error",function(e){
		console.log(e);
	});
	//client.end();

});


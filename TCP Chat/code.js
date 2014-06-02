

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

// Broadcast message
function broadcast(message,client)
{	
	var cleanup = [];
	// Sending message to contact list
	for(var i=0;i<clientList.length;i++)
		// Skipping the client which has sent the message
		if(clientList[i]!==client){
			// Checking if the client has left or not
			if(clientList[i].writable)
			clientList[i].write(client.name+" says "+message);
			else
			{
				cleanup.push(clientList[i]);
				clientList[i].destroy();
			}
		}
	// Removing dead nodes
	for(var i=0;i<cleanup.Length;i++)
		clientList.splice(clientList.indexOf(cleanup[i]),1);
}

// Binding server to a port
chatServer.listen(9000);

// Displaying message
console.log("Server listening to port 9000...");


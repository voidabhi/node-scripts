var express  = require('express'),
    request  = require('request'),
    app      = express(),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3123,
    env = process.env.NODE_ENV || 'development',
    key = "YOUR KEY",
    token = "YOUR TOKEN";


// Allows us to easily read the payload from the webhook
app.use( bodyParser.json() );

// Only act when a specific route is called
// This reduces malicious / accidental use
app.all("/priority", function(req, res, next) {

	// What type of actions do we want to respond to?
	// In this case, updateCard or createCard
	if(req.body.action.type === 'updateCard' || 
		req.body.action.type === 'createCard' && 
		req.body.action.data.card.name) {

		// Get the name and id of the card
		oldName = req.body.action.data.card.name;
		id = req.body.action.data.card.id;

		// Let's only update if it's not already marked priority
		if(oldName.indexOf("PRIORITY:") === -1) {
			newName = "PRIORITY:" + oldName;

			// Construct and send the Trello PUT with the new name
			var path = 'https://api.trello.com/1/cards/' + id + '/name?key=' + key + '&token=' + token;
			request(
				{
					method: 'PUT',
					uri: path,
					body: {value: newName},
					json: true 
				},
				function (error, response, body) {
					if(response.statusCode == 200){
						console.log("successfully updated card");
					} else {
						console.log('error: '+ response.statusCode);
						console.log(body);
					}
				});
	    }
	}
	res.send('OK');
});


// Standard NodeJS Listener
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Priority Enforcer listening at http://%s:%s in %s', host, port, env);
});

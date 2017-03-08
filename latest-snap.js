
var snapchat = require('node-snapchat'),
    fs = require('fs'),
    username = "username",
    password = "password";

var client = new snapchat.Client({ username: username, password: password });

client.on('loggedin', function(){
    var timestamp = String(Math.round(new Date().getTime() / 1000));
    client.getSnaps(timestamp, function(result){
        var snap = result[0];
        var stream = fs.createWriteStream('./' + snap.id + '.jpg', { flags: 'w', encoding: null, mode: 0666 });

        client.getBlob(snap.id, stream, function() { } );
    });
});

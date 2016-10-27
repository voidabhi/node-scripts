var apn  = require("apn")

var apnError = function(err){
    console.log("APN Error:", err);
}

var options = {
    "cert": "cert.pem",
    "key":  "key.pem",
    "passphrase": null,
    "gateway": "gateway.sandbox.push.apple.com",
    "port": 2195,
    "enhanced": true,
    "cacheLength": 5
  };
options.errorCallback = apnError;

var feedBackOptions = {
    "batchFeedback": true,
    "interval": 300
};

var apnConnection, feedback;

module.exports = {
    init : function(){
        apnConnection = new apn.Connection(options);

        feedback = new apn.Feedback(feedBackOptions);
        feedback.on("feedback", function(devices) {
            devices.forEach(function(item) {
                //TODO Do something with item.device and item.time;
            });
        });
    },

    send : function (params){
        var myDevice, note;
        
        myDevice = new apn.Device(params.token);
        note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = params.message;
        note.payload = {'messageFrom': params.from};

        if(apnConnection) {
            apnConnection.pushNotification(note, myDevice);
        }
    }
}

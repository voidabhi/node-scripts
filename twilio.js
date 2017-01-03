var twilioNumber = '+919876987698';
var twilioSID = 'Your twilio account SID';
var twilioToken = 'Your twilio auth tokenn'

var client = require('twilio')(twilioSID,twilioToken);

var sendSMS = function(number,message){
  client.sms.messages.post({
      to:twilioNumber,
      from:fromNumber,
      body:message
  }, function(err, text) {
      console.log('Sent: '+ text.body);
      console.log('Status: '+ text.status);
  });
};

sendSMS('+911234123412','Sample message from node.js'):

 'use strict';

 const 
 bodyParser = require('body-parser'),
 config = require('config'),
 crypto = require('crypto'),
 express = require('express'),
 https = require('https'),  
 request = require('request');

 var LEX = require('letsencrypt-express');

 var app = express();

 app.set('port', process.env.PORT || 5000);
 app.use(bodyParser.json({ verify: verifyRequestSignature }));
 app.use(express.static('public'));

/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
process.env.MESSENGER_APP_SECRET :
config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
(process.env.MESSENGER_VALIDATION_TOKEN) :
config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
(process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
config.get('pageAccessToken');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

var lex = LEX.create({
  configDir: '/etc/letsencrypt'
  , letsencrypt: null
  , approveRegistration: function (hostname, cb) {
    cb(null, {
      domains: ['e-nihongo.com']
      , email: 'info@e-nihongo.com'
      , agreeTos: true
    });
  }
});

var server = https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app));
server.listen(8080);

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
 app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
  res.status(200).send(req.query['hub.challenge']);
} else {
  console.error("Failed validation. Make sure the validation tokens match.");
  res.sendStatus(403);          
}  
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/implementation#subscribe_app_pages
 *
 */
 app.post('/webhook', function (req, res) {

  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
 function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
    .update(buf)
    .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference#auth
 *
 */
 function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
 function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;


  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'text':
      sendTextMessage(senderID, "สวัสดี เราคือโฟล์คบอท เราเป็นเพื่อนกับเกษตรกรรุ่นใหม่สายออแกนิก " +
        "ถ้าอยากรู้อะไรเกี่ยวกับการเกษตรของไทย ลองพิมพ์ 'เกษตรกร', 'สินค้า', 'ราคา' ,'folkrice'");
      break;

      case 'เกษตรกร':
      case 'image':
      sendImageMessage(senderID);
      break;

      case 'button':
      case 'สนใจ':
      sendButtonMessage(senderID);
      sendButtonMessage2(senderID);
      break;
      case 'สินค้า':
      case 'generic':
      sendGenericMessage(senderID);
      break;

      case 'เสื้อยืด':
      sendGenericMessageTshirt(senderID);
      break;

      case 'ราคา':
      case 'ใบเสร็จ':
      case 'receipt':
      sendReceiptMessage(senderID);
      break;

      case 'folkrice':
      case 'Folkrice':
      sendAboutMessage(senderID);
      break;
      case 'ดำนา':
      sendTextMessage(senderID, "https://www.facebook.com/events/249158752111313/");
      break;

      case 'คอนโด':
      case 'condo':
      sendGenericMessageAP(senderID);
      break;

      case 'USER_DEFINED_PAYLOAD':
      sendTextMessage(senderID,"ได้รับข้อมูลการลงทะเบียนแล้ว");
      break;

      default:
      sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
 function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 * 
 */
 function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Send a message with an using the Send API.
 *
 */
 function sendAboutMessage(recipientId) {
  var messageData1 = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "https://scontent.fbkk1-1.fna.fbcdn.net/v/t1.0-9/13260012_475739889294836_816851333642389956_n.jpg?oh=a66b5a8072f37cb9fdec9909e5d0ff68&oe=57D7897E"
        }
      }
    }
  };

  callSendAPI(messageData1);
}


/*
 * Send a message with an using the Send API.
 *
 */
 function sendImageMessage(recipientId) {
  var messageData1 = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://folkrice.com/images/farmer.jpg"
        }
      }
    }
  };

  var messageData2 = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://folkrice.com/images/vegetable.jpg"
        }
      }
    }
  };

  callSendAPI(messageData1);
  //callSendAPI(messageData2);
}

/*
 * Send a text message using the Send API.
 *
 */
 function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
 function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "สนใจแบบไหนดีครับ",
          buttons:[{
            type: "web_url",
            url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/",
            title: "คอนโด"
          },{
            type: "web_url",
            url: "http://www.apthai.com/%E0%B8%97%E0%B8%B2%E0%B8%A7%E0%B8%99%E0%B9%8C%E0%B9%82%E0%B8%AE%E0%B8%A1/",
            title: "ทาวน์โฮม"
          },{
            type: "web_url",
            url: "http://www.apthai.com/%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%94%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%A7/",
            title: "บ้านเดี่ยว"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendButtonMessage2(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "หรือว่าจะเป็น",
          buttons:[{
            type: "web_url",
            url: "http://www.apthai.com/%E0%B9%82%E0%B8%AE%E0%B8%A1%E0%B8%AD%E0%B8%AD%E0%B8%9F%E0%B8%9F%E0%B8%B4%E0%B8%A8/",
            title: "โฮมออฟฟิส"
          },{
            type: "web_url",
            url: "http://www.apthai.com/promotion/",
            title: "โปรโมชั่น"
          }, {
            type: "postback",
            title: "Call Postback",
            payload: "USER_DEFINED_PAYLOAD"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}



/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
 function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Black folk rice",
            subtitle: "ข้าวหอมนิล",
            item_url: "https://www.folkrice.com",               
            image_url: "http://api.folkrice.com/img/black_700.png",
            buttons: [{
              type: "web_url",
              url: "https://www.folkrice.com",
              title: "ดูในเว็บ"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "Red folk rice",
            subtitle: "ข้าวหอมมะลิแดง",
            item_url: "https://www.folkrice.com",               
            image_url: "http://api.folkrice.com/img/red_700.png",
            buttons: [{
              type: "web_url",
              url: "https://www.folkrice.com",
              title: "ดูในเว็บ"
            }, {
              type: "postback",
              title: "สั่งซื้อ",
              payload: "สั่งซื้อ และ เลือกวิธีชำระเงิน",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendGenericMessageTshirt(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            "title":"Classic White T-Shirt",
            "image_url":"http://petersapparel.parseapp.com/img/item100-thumb.png",
            "subtitle":"Soft white cotton t-shirt is back in style",
            "buttons":[
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com/view_item?item_id=100",
              "title":"View Item"
            },
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com/buy_item?item_id=100",
              "title":"Buy Item"
            },
            {
              "type":"postback",
              "title":"Bookmark Item",
              "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM100"
            }              
            ]
          },
          {
            "title":"Classic Grey T-Shirt",
            "image_url":"http://petersapparel.parseapp.com/img/item101-thumb.png",
            "subtitle":"Soft gray cotton t-shirt is back in style",
            "buttons":[
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com/view_item?item_id=101",
              "title":"View Item"
            },
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com/buy_item?item_id=101",
              "title":"Buy Item"
            },
            {
              "type":"postback",
              "title":"Bookmark Item",
              "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM101"
            }              
            ]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendGenericMessageAP(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "RHYTHM ASOKE",
            subtitle: "คอนโดใกล้รถไฟฟ้า 5 นาทีจาก MRT และเซ็นทรัล พระราม 9 พร้อมอยู่ปลายปี 59 Studio ราคาเดียว 3.12 ล้าน พร้อมรับฟรีดาวน์ + ฟรีเฟอร์นิเจอร์ ",
            item_url: "http://www.apthai.com/campaign/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/rhythm/rhythm-asoke/",               
            image_url: "http://www.apthai.com/images/brand/c-c04.png",
            buttons: [{
              type: "web_url",
              url: "http://www.apthai.com/campaign/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/rhythm/rhythm-asoke/",
              title: "3.12 ล้าน"
            },{
              type: "web_url",
              url: "http://www.apthai.com/campaign/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/rhythm/rhythm-asoke/",
              title: "ลงทะเบียนเพื่อรับสิทธิพิเศษ*"
            }],
          }, {
            title: "LIFE ASOKE",
            subtitle: "1 Step to MRT Phetchaburi & Airport Link Makkasan",
            item_url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/life/life-asoke/",               
            image_url: "http://www.apthai.com/images/brand/c-c03.png",
            buttons: [{
              type: "web_url",
              url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/life/life-asoke/",
              title: "130,000 บ./ตร.ม."
            },{
              type: "web_url",
              url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/life/life-asoke/",
              title: "ลงทะเบียนเพื่อรับสิทธิพิเศษ"
            }]
          }, {
            title: "ASPIRE SUKHUMVIT 48",
            subtitle: "้ถึงขีดสุดกับไลฟ์สไตล์แบบ ENERGETIC LIVING ที่พร้อมสปาร์คความสุขให้คุณ...แบบเกินความคาดหมาย",
            item_url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/aspire/aspire-sukhumvit-48/",               
            image_url: "http://www.apthai.com/images/brand/c-c02.png",
            buttons: [{
              type: "web_url",
              url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/aspire/aspire-sukhumvit-48/",
              title: "เริ่ม 4.2 ล้าน*"
            },{
              type: "web_url",
              url: "http://www.apthai.com/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94/aspire/aspire-sukhumvit-48/",
              title: "ลงทะเบียนเพื่อรับสิทธิพิเศษ"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
 function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "นาย การค้า น้ำดี",
          order_number: receiptId,
          currency: "THB",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Red folk rice",
            subtitle: "ข้าวหอมมะลิแดง",
            quantity: 1,
            price: 125.00,
            currency: "THB",
            image_url: "http://api.folkrice.com/img/red_700.png"
          }, {
            title: "Black folk rice",
            subtitle: "ข้าวหอมนิล",
            quantity: 2,
            price: 250.00,
            currency: "THB",
            image_url: "http://api.folkrice.com/img/black_700.png"
          }],
          address: {
            street_1: "42/3 Soi Sukumvit 63, Ekkamai 4",
            street_2: "",
            city: "Bangkok",
            postal_code: "10110",
            state: "Wattana",
            country: "Thailand"
          },
          summary: {
            subtotal: 375.00,
            shipping_cost: 50.00,
            total_tax: 0.0,
            total_cost: 425.00
          },
          adjustments: [{
            name: "ส่วนลดสำหรับการสั่งซื้อครั้งแรก",
            amount: -50
          }, {
            name: "ส่วนลดสำหรับ coupon code: #folkrice",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
 function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}



// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

var lex = LEX.create({
  configDir: '/etc/letsencrypt'
  , letsencrypt: null
  , approveRegistration: function (hostname, cb) {
    cb(null, {
      domains: ['e-nihongo.com']
      , email: 'info@e-nihongo.com'
      , agreeTos: true
    });
  }
});

// app.use(function *() {
//   this.body = 'Hello World';
// });

lex.onRequest = app;

lex.listen([], [5001], function () {
  var protocol = ('requestCert' in this) ? 'https': 'http';
  console.log("Listening at " + protocol + '://localhost:' + this.address().port);
});

https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app)).listen(5000);



module.exports = app;

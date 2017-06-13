var https = require('https');


var API_KEY = 'YOUR_API_KEY_HERE';

var d = new Date();
var n = d.getTime();

console.log( "date is : " + d );
console.log( "time is : "  + n );

var ddata = { "series" :
         [{"metric":"test.metric",
          "points":[[d.getTime()/1000, 40]],
          "type":"gauge",
          "host":"test.example.com",
          "tags":["environment:test"]}
        ]
};
var data = JSON.stringify(ddata);

var myheaders = {
    "Content-Length" : Buffer.byteLength(data, "utf-8"),
    "Content-Type" : "application/json"
};
var  options = {
    host : 'app.datadoghq.com',
    port : 443,
    path : '/api/v1/series?api_key=' + API_KEY,
    method : 'POST',
    headers : myheaders
}

function sendToDataDog( JsonMetric ) {
    var req = https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });
    
    
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    
    // write data to request body
    req.setSocketKeepAlive(true);
    req.write(JsonMetric);
    req.end();
}

for( var i = 0; i < 1; i++) {
    sendToDataDog( data );
    console.log("sending Metric to DataDog");
}

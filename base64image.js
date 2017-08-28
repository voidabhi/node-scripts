var URL = require('url'),
    sURL = 'http://nodejs.org/logo.png',
    oURL = URL.parse(sURL),
    http = require('http'),
    client = http.createClient(80, oURL.hostname),
    request = client.request('GET', oURL.pathname, {'host': oURL.hostname})
;

request.end();
request.on('response', function (response)
{
    var type = response.headers["content-type"],
        prefix = "data:" + type + ";base64,",
        body = "";

    response.setEncoding('binary');
    response.on('end', function () {
        var base64 = new Buffer(body, 'binary').toString('base64'),
            data = prefix + base64;
        console.log(data);
    });
    response.on('data', function (chunk) {
        if (response.statusCode == 200) body += chunk;
    });
});

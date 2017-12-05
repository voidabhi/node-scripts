const PORT = 3000;
const SECRET = 'APP_SHARED_SECRET';

var http = require('http'),
    crypto = require('crypto'),
    server;

function verifyShopifyHook(req) {
    var digest = crypto.createHmac('SHA256', SECRET)
            .update(new Buffer(req.body, 'utf8'))
            .digest('base64');
    
    return digest === req.headers['X-Shopify-Hmac-Sha256'];
}

function parseRequestBody(req, res) {
    req.body = '';

    req.on('data', function(chunk) {
        req.body += chunk.toString('utf8');
    });
    req.on('end', function() {
        handleRequest(req, res);
    });
}

function handleRequest(req, res) {
    if (verifyShopifyHook(req)) {
        res.writeHead(200);
        res.end('Verified webhook');
    } else {
        res.writeHead(401);
        res.end('Unverified webhook');
    }
}

server = http.createServer(parseRequestBody);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

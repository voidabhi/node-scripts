
var httpProxy = require('http-proxy'),
    connect   = require('connect'),
    endpoint  = {
      host:   'your-app-domain.com', // or IP address
      port:   80,
      prefix: '/api'
    },
    staticDir = 'public';

var proxy = new httpProxy.RoutingProxy();
var app = connect()
  .use(connect.logger('dev'))
  .use(function(req, res) {
    if (req.url.indexOf(endpoint.prefix) === 0) {
      proxy.proxyRequest(req, res, endpoint);
    }
  })
  .use(connect.static(staticDir))
  .listen(4242);

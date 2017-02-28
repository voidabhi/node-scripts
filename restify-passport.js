var restify = require('restify')

// config vars
var FB_LOGIN_PATH    = '/api/facebook_login'
var FB_CALLBACK_PATH = '/api/facebook_callback'
var FB_APPID = '<<YOUR APPID HERE>>'
var FB_APPSECRET = '<<YOUR APPSECRET HERE>>'
var SERVER_PREFIX = 'http://localhost:3000'

// set up server
var server = restify.createServer()
server.use(restify.queryParser());

// set up passport-facebook
var passport         = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

// initialize passport
server.use(passport.initialize());

// Sessions aren't used in this example.  To enabled sessions, enable the
// `session` option and implement session support with user serialization.
// See here for info: http://passportjs.org/guide/configuration.html

var fb_login_handler    = passport.authenticate('facebook', { session: false })
var fb_callback_handler = passport.authenticate('facebook', { session: false }) 
var fb_callback_handler2 = function(req, res) {
    console.log('we b logged in!')
    console.dir(req.user)
    // be sure to send a response
    res.send('Welcome ' + req.user.displayName);
}

server.get(FB_LOGIN_PATH,    fb_login_handler)
server.get(FB_CALLBACK_PATH, fb_callback_handler, fb_callback_handler2)

passport.use(new FacebookStrategy({
    clientID:     FB_APPID,
    clientSecret: FB_APPSECRET,
    callbackURL:  SERVER_PREFIX + FB_CALLBACK_PATH
  },
  function(accessToken, refreshToken, profile, done) {
      console.log('accessToken='+accessToken+' facebookId='+profile.id)
      return done(null, profile)
  })
)

// Start the app by listening on <port>
var port =  process.env.PORT || 3000
server.listen(port)
console.log('App started on port ' + port)

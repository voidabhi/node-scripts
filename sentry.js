const sentry = require('node-sentry');
 
var client = sentry({
  projectId   : '1',
  endpoint    : 'sentry.lsong.org',
  clientKey   : '272cb95b5b0d4537825ebe60f6e1c43x',
  clientSecret: 'ed2797ad20cf4edbb6bc7de1f20892dx'
});
 
client.captureMessage('test message');
 
try{
  throw new Error('test error');
}catch(e){
  client.captureException(e);
}
 

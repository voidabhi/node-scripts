var Dropbox = require('dropbox-node');

var consumer_key        = '<your_consumer_key>';
var consumer_secret     = '<your_consumer_secret>';
var access_token        = '<your_access_token>';
var access_token_secret = '<your_access_token_secret>';

var dropboxClient = new Dropbox.DropboxClient(consumer_key, consumer_secret, access_token, access_token_secret);

dropboxClient.put(
  JSON.stringify( { "foo": "bar" } ),
  '/Public/folder/filename.txt',
  { overwrite: true },
  function () { console.log( arguments ); }
);

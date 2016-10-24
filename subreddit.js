var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db;
    http = require('http'),

var server = new Server('localhost', 27017, {auto_reconnect: true}),
    db = new Db('redditDb', server),

	options = {
		host: 'www.reddit.com',
		path: '/reddits.json'
	},

    makeRequest = function(options){
    	var callback = function(response) {
            var str = '';

            response.on('data', function (chunk) {
    	       str += chunk;
            });

            response.on('end', function () {
                try {
                    var result = JSON.parse(str),
                        childData  = result && result.data && result.data.children;

                    if(childData) {
                        db.collection('reddits', function(err, collection) {
                            for(var i = 0; i < childData.length; ++i){
                              collection.insert(childData[i].data, {safe:true}, function(err, result) {
                                if (!err) {
                                    console.log('Child inserted')
                                } else {
                                    console.log('Failed to insert child');
                                }
                              });
                            }
                        });
                    }

                    var after = result && result.data && result.data.after;
                    if (after) {
                       options.path = '/reddits.json?after=' + result.data.after;
                       setTimeout(function(){
                            makeRequest(options);
                       }, 2000);
                    } else {
                        console.log('After is not defined');
                    }
                     
                } catch(e) {
                    console.log(e);
                    console.log('Failed to process response')
                }
            });
        };
        
        console.log('Requesting ' + options.path);
        http.request(options, callback).end();
    };

 db.open(function(err, db) {
  if(!err) {
    console.log("We are connected. Collecting data");
    makeRequest(options);
  }
});

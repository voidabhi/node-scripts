var express     = require('express');
var aws         = require('aws-sdk');
var config      = {key:'', secret:'', db:''};

aws.config.update({accessKeyId: config.key, secretAccessKey: config.secret});
aws.config.update({region: 'us-east-1'});

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

function getImages() {
    var db = new aws.DynamoDB();
    db.client.scan({
        TableName : config.db,
        Limit : 50
    }, function(err, data) {
        if (err) { console.log(err); return; }
        console.log(data.id);

        for (var ii in data.Items) {
            ii = data.Items[ii];
            console.log(ii.id);
            console.log(ii.taken);
            console.log(ii.thumb);
            console.log(ii.full);
        }
    });
}

function displayImages(req, res) {
    getImages();
    res.render('index.jade', {
        pageTitle : 'My Site'
    });
};

app.get('/', displayImages);

var port = 8888;
app.listen(port);
console.log('Server running at http://127.0.0.1:' + port);


// RESTFull File upload service

var express = require('express');
var fs = require('fs');
var app = express();
app.configure(function(){
app.use(express.bodyParser({limit: '50mb'}));
  app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname+'/public'));
  
});

/*app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'localhost:8000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});*/

// Uploading Script

function upload(response, postData,upload_dir) {

	// Collecting required data into variables
    var file                 = JSON.parse(postData),
        fileRootName         = file.name.split('.').shift(),
        fileExtension        = file.name.split('.').pop(),
        filePathBase         = upload_dir + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath             = fileRootNameWithBase + '.' + fileExtension,
        fileID               = 2,
        fileBuffer;
    
	// Selecting a valid filepath
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }
    
	// Fetching content and storing it in a buffer
    file.contents = file.contents.split(',').pop();
    fileBuffer = new Buffer(file.contents, "base64");
	
	//  Writing buffer to selected filepath
    fs.writeFileSync(filePath, fileBuffer);
    response.statusCode = 200;
    esponse.end();	
}

app.get('/', function(req, res) {
	res.sendFile('./public/index.html');
});

app.post('/upload',function(req, res) {

	var postData = '';

	req.setEncoding('utf8');

	req.addListener('data', function (postDataChunk) {
			postData += postDataChunk;
			console.log(postDataChunk);
		});

	req.addListener('end', function () {
			//upload(res, postData,'uploads');
			res.json({"message":postData});
			//res.end();
		});
		
	
		
		
});

app.listen(process.env.PORT || 8000);
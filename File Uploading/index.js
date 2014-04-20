
// RESTFull File upload service

var express = require('express');
var fs = require('fs');
var app = express();
app.configure(function(){
  app.use(express.bodyParser());
});

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

app.post('/upload', function(req, res) {

	postData = '';

	request.setEncoding('utf8');

	request.addListener('data', function (postDataChunk) {
			postData += postDataChunk;
		});

	request.addListener('end', function () {
			upload(res, postData,'uploads');
		});
		
	res.end();
});

app.listen(process.env.PORT || 8000);
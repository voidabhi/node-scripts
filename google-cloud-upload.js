var Promise = require('bluebird');
var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

var storage = GoogleCloudStorage({
  projectId: 'PROJECT_ID',
  keyFilename: 'keyfile.json'
})

var BUCKET_NAME = 'my-bucket'
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket
var myBucket = storage.bucket(BUCKET_NAME)

// check if a file exists in bucket
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/file?method=exists
var file = myBucket.file('myImage.png')
file.existsAsync()
  .then(exists => {
    if (exists) {
      // file exists in bucket
    }
  })
  .catch(err => {
     return err
  })
    
    
// upload file to bucket
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket?method=upload
let localFileLocation = './public/images/zebra.gif'
myBucket.uploadAsync(localFileLocation, { public: true })
  .then(file => {
    // file saved
  })
    
// get public url for file
var getPublicThumbnailUrlForItem = file_name => {
  return `https://storage.googleapis.com/${BUCKET_NAME}/${file_name}`
}

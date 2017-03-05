const AWS = require('aws-sdk')  
const fs = require('fs')

AWS.config.update({region: 'us-east-1'})

const lambda = new AWS.Lambda()  
const lambdaFunctionName = 'yourFunctionName'

fs.readFile("./fn.zip", (err, data) => {  
  if (err) throw err

  lambda.updateFunctionCode({
    FunctionName: lambdaFunctionName,
    ZipFile: data,
    Publish: true
  }, err => {
    if (err) {
      console.log('ERROR: ', err)
    } else {
      console.log('uploaded!')
    }
  })
})

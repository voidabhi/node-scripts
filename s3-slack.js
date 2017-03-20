const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const https = require('https');
const url = require('url');

const slackUrl = 'https://hooks.slack.com/services/....'; // Your incoming webhook url
const slackRequestOptions = url.parse(slackUrl);
slackRequestOptions.method = 'POST';
slackRequestOptions.headers = {'Content-Type': 'application/json'};

exports.handler = (event, context) => {

    event.Records.forEach(record => {
    
        let data = {
            bucket: record.s3.bucket.name,
            key: record.s3.object.key,
            size: record.s3.object.size,
            eTag: record.s3.object.eTag,
            eventName: record.eventName,
            time: record.eventTime,
            requestIp: record.requestParameters.sourceIPAddress
        }
        
        if(data.key.startsWith('logs/')) { // If you enabled s3 logging
            console.log("Ignoring, started with 'logs/': " + data.key); 
            return;
        }
    
        let req = https.request(slackRequestOptions, res => {
            if (res.statusCode === 200) {
              context.succeed('posted to slack');
            } else {
              context.fail('status code: ' + res.statusCode);
            }
        }); 
        req.on('error', e => {
            console.log('problem with request: ' + e.message);
            context.fail(e.message);
        });
    
        req.write(JSON.stringify({
            text: JSON.stringify(data, null, '   '),
            username: "s3-notifier",
            icon_emoji: ":ghost:",
            channel: "#s3",
        })); 
    
        req.end();
        
    })
    
};

var AWS = require('aws-sdk');
var mysql = require('mysql');

var kmsEncyptedToken = "CiC*********(KMSで暗号化したMySQL接続用のパスワード文字列)***********UI=";
var mysql_host = "example-rds-mysql-server.carvmoii2uds.ap-northeast-1.rds.amazonaws.com";
var mysql_user = "example_user";
var mysql_dbname = "exampledb";
var mysql_password = "";

var sns_topic_arn = "arn:aws:sns:ap-northeast-1:*******************:example-lambda-mysql-sns";

exports.handler = function(event, context){

    var sql = "SELECT * FROM exampledb.example_table WHERE insert_date <= date_sub(curdate(), interval 2 week)";

    if (kmsEncyptedToken && kmsEncyptedToken !== "<kmsEncryptedToken>") {

        var encryptedBuf = new Buffer(kmsEncyptedToken, 'base64');
        var cipherText = {CiphertextBlob: encryptedBuf};

        var kms = new AWS.KMS({ region: 'ap-northeast-1' });
        var sns = new AWS.SNS({ region: 'ap-northeast-1' });
        
        kms.decrypt(cipherText, function (err, data) {
            if (err) {

                console.log("CipherText Decrypt error: " + err);
                context.fail(err);

            } else {

                mysql_password = data.Plaintext.toString('ascii');

                var connection = mysql.createConnection({
                    host     : mysql_host,
                    user     : mysql_user,
                    password : mysql_password,
                    database : mysql_dbname
                });

                console.log("MySQL Server Name: " + mysql_host);
                console.log("MySQL User Name: " + mysql_user);
                console.log("MySQL Database Name: " + mysql_dbname);
                console.log("MySQL Exec SQL: " + sql);
                
                connection.connect();

                connection.query(sql, function(err, rows, fields) {
                    if (err) {

                        console.log("MySQL Select Error");
                        context.fail(err);
                        sns.publish({
                            Message: 'Lambda Function Error',
                            Subject: 'Lambda Function Error',
                            TopicArn: sns_topic_arn
                        }, function(err, data){
                            if(err) throw err;
                            else context.fail('SNS Publish Error');
                        });

                        throw err;

                    } else {

                    console.log("MySQL Select Success");
                    console.log(rows);
                    console.log(fields);
                    }
                });

                connection.end(function(err) {

                    sns.publish({
                        Message: 'Lambda Function Success',
                        Subject: 'Lambda Function Success',
                        TopicArn: sns_topic_arn
                    }, function(err, data){
                        if(err) throw err;
                        else context.fail('SNS Publish Error');
                    });

                    context.done();
                });
            }
        });

    } else {

        context.fail("kmsEncyptedToken has not been set.");

    }

    console.log('end');

};

'use strict';

var spawn    = require('child_process').spawn;
var s3Upload = require('s3-stream-upload');
var config   = require('../config');
var Promise  = require('bluebird');
var moment   = require('moment');

var mysqlBackup = function() {
	var upload = s3Upload({
		accessKeyId: config.aws.accessKey,
		secretAccessKey: config.aws.secretKey,
		Bucket: config.aws.buckets.backup.name,
		region: config.aws.buckets.backup.region
	});

	var s3 = upload({ Key: 'mysql-backup-' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.sql' });

	var mysqldump = spawn('mysqldump', [
		'-u', config.db.connection.user,
		'-p' + config.db.connection.password,
		config.db.connection.database
	]);

	return new Promise(function(resolve, reject) {
		mysqldump
			.stdout
			.pipe(s3)
			.on('finish', function() {
				resolve();
			})
			.on('error', function(err) {
				reject(err);
			});
	});
};

module.exports = mysqlBackup;

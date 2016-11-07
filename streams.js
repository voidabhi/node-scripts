var request = require('request');
var url = 'http://www.site2mobile.com';

// Set both readable and writable in constructor.
var UpperStream = function () {
  this.readable = true;
  this.writable = true;
};

// Inherit from base stream class.
require('util').inherits(UpperStream, require('stream'));

UpperStream.prototype.write = function (data) {
	data = data ? data.toString() : ""; // convert bytes to string
	this.emit('data', data.toUpperCase());
};

UpperStream.prototype.end = function () {
	this.emit('end');
};

// stream an HTTP request to stdout and uppercase everything
request({uri: url})
	.pipe(new UpperStream())
	.pipe(process.stdout);

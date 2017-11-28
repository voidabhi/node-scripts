

/*
var Cache = require('./internal-cache');

var cache1 = new Cache();
var cache2 = new Cache();
*/

var internals = {};

internals.storage = {};

exports.Cache = internals.Cache = function () {

};

internals.Cache.prototype.get = function (key) {

    return internals.storage[key];
};

internals.Cache.prototype.set = function (key, value) {

    return internals.storage[key] = value;
};

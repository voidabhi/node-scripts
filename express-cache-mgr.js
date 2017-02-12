'use strict';

var express = require('express');
var usersApi = require('../lib/users-api');

var Promise = require('bluebird');
var cacheManager = require('cache-manager');
var cache = cacheManager.caching({store: 'memory', max: 100, ttl: 900});
Promise.promisifyAll(cache);

var router = module.exports = express.Router();
router.get('/:user_id/reviews', getUserReviews);

/**
 * Get a user's latest reviews
 */
function getUserReviews(req, res, next) {
    // Pull previous result from cache (if found)
    var userId = req.params['user_id'];
    var cacheKey = 'userReviews_' + userId;
    cache
        .wrapAsync(cacheKey, function cacheMiss(cacheCb) {
            usersApi
                .getMemberReviews(userId) // returns promise
                .asCallback(cacheCb);
        })
        .then(function(reviews) {
            res.json(reviews);
        })
        .catch(function(err) {
            return next(err);
        });
}

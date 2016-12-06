#!/usr/bin/env node
/**
 * Created by lmarkus on 5/23/15.
 * Adapted from https://gist.github.com/foozmeat/82f177d60d5dfc7fc518
 */
'use strict';
var assert      = require('assert'),
    exec        = require('child_process').execFileSync,
    util        = require('util'),
    curl_json   = function(command) {return JSON.parse(exec(command.shift(), command).toString());},
    filename    = process.argv[2],
    channelName = process.argv[3],
    comment     = process.argv[4],
    //------------------------------------
    token       = ''; //Insert token here.

assert.notStrictEqual(token, '', 'Get an API token at https://api.slack.com/web#basics and enter it above');
assert.strictEqual(process.argv.length, 5, 'Usage: squirt <filename> <channelName> <comment>');

//Get channel list
var getChannels = util.format('curl -s -F token=%s https://slack.com/api/channels.list', token).split(' ');
var channelData = curl_json(getChannels);

//Find channel ID for channel name
var channel = channelData.channels.filter(function (c) { return c.name === channelName });
var channelId = channel && channel.length > 0 && channel[0].id;
assert.ok(channelId, 'Channel Id not found');

var upload = util.format('curl -s -F file=@%s -F channels=%s -F initial_comment=%s -F token=%s https://slack.com/api/files.upload'.replace(/ /g, '\t'), filename, channelId, comment, token).split('\t');
var result = curl_json(upload);
assert.ok(result.ok, 'Upload Failed: ' + result.error);

console.log('Done!');

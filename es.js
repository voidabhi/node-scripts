'use strict';

var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');

var log = console.log.bind(console);

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

function dropIndex() {
  return client.indices.delete({
    index: 'test',
  });
}

function createIndex() {
  return client.indices.create({
    index: 'test',
    mapping: {
      house: {
        name: {
          type: 'string'
        }
      }
    }
  });
}

function addToIndex() {
  return client.index({
    index: 'test',
    type: 'house',
    id: '1',
    body: {
      name: 'huhu'
    }
  });
}

function search() {
  return client.search({
    index: 'test',
    q: 'huhu'
  }).then(log);
}

function closeConnection() {
  client.close();
}

function getFromIndex() {
  return client.get({
    id: 1,
    index: 'test',
    type: 'house',
  }).then(log);

}

function waitForIndexing() {
  log('Wait for indexing ....');
  return new Promise(function(resolve) {
    setTimeout(resolve, 2000);
  });
}

Promise.resolve()
  .then(dropIndex)
  .then(createIndex)
  .then(addToIndex)
  .then(getFromIndex)
  .then(waitForIndexing)
  .then(search)
  .then(closeConnection);

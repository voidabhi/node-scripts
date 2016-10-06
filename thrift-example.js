var thrift = require('thrift');

var JobExchange = require('./gen-nodejs/JobExchange'),
    ttypes = require('./gen-nodejs/scheduler_types');

var server = thrift.createServer(JobExchange, {
  insert_job: function(job, callback) {
    // job is an instance of ttypes.Job
    return 1;
    // or
    process.nextTick(function() {
      // Uses the standard callback(err, data) signature
      callback(null, 1);
    });
  },

  get_job: function(jid, callback) {
    return new ttypes.Job();
  },

  get_all: function(callback) {
    return [new ttypes.Job()];
  }
});

server.listen(9160);

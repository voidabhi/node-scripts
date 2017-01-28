var log = require('logged')(__filename);
var pg = require('pg');

//I like to set my connection parameters
//as environment variables.  node-postgres
//and the psql program use the same variables
pg.connect(function(err, client, done) {
  if(err) {
    //hanlde error.  In the case of a connection error
    //client will be null and no client will be added to the pool
    //so you don't have to call done here. note: you CAN call done, it's a no-op function
    //in the event of a connection error
    return log.error('Could not connect to PostgreSQL server', err);
  }
  
  client.query('BEGIN', function(err) {
    if(err) {
      //if there was an error issuing a BEGIN statement
      //something is seriously wrong.  Kill this client
      //as it could be an indication there are deeper issues
      //such as loss of backend connectivity or weird systems problems
      log.error('Problem starting transaction', err);
      return done(true); //pass non-falsy value to done to kill client & remove from pool
    }
    client.query('INSERT INTO something', ['bla', 'bla'], function(err, result) {
      if(err) {
        //if there is an error doing the insert it could potentially be 
        //data related (unique constraints, etc) so you need to ROLLBACK
        //the transaction
        log.error('unable to insert data, rolling back transaction', err);
        return client.query('ROLLBACK', function(err) {
          if(err) {
            log.error('unable to rollback transaction, killing client', err);
          }
          //if there is an error issuing the ROLLBACK statement
          //something is seriously wrong with the backend
          //so best thing to do is kill this client; otherwise, you'll
          //be leaving the client in an errored-transaction state
          //
          //if the error is null we can consider the transaction rolled back successfully
          done(err);
        });
      } //end if(err)
      client.query('COMMIT', function(err) {
          //same thing here as with the ROLLBACK statement...call `done` either way
          //but if there is an error, kill the client
          if(err) {
            log.error('unable to commit transaction, killing client', err);
          }
          done(err);
      });
    });
  });
});

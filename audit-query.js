var audit = { //configure audit settings
  export: {
    project_id: 'PROJECT ID TO AUDIT QUERIES FROM'
  },
  import: {
    project_id: 'PROJECT ID TO STORE AUDIT DATA IN',
    dataset_id: 'DATASET ID TO STORE AUDIT DATA IN',
    table_id: 'TABLE ID TO STORE AUDIT DATA IN'
  }
};

var key = require('./service_key_prod.json'); //get your api service key from google console
var google = require('googleapis'); //npm install googleapis
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloud-platform.read-only'], null);


var moment = require('moment-timezone'); //npm install moment-timezone
var yesterday_start = moment(moment().tz('America/Los_Angeles').subtract(1, 'days').format('YYYY-MM-DD') + ' 00:00:00').valueOf();
var yesterday_end = moment(moment().tz('America/Los_Angeles').subtract(1, 'days').format('YYYY-MM-DD') + ' 23:59:59').valueOf();

jwtClient.authorize(function(err, tokens) {
        if (err) {
                console.log(err);
                return;
        }

        var cont = false;
        var large_queries = [];
        var bigquery = google.bigquery('v2');
        var check_jobs = function(next, page_token){
                page_token = page_token || null;
                bigquery.jobs.list({projectId: audit.export.project_id, allUsers: true, projection: 'full', pageToken: page_token, auth: jwtClient}, function(err, list){
                        jobs = list.jobs;
                        for(var i=0; i<jobs.length; i++){
                                if( jobs[i].statistics.hasOwnProperty('query') ){i
                                        if( parseInt(jobs[i].statistics.creationTime) >= yesterday_start && parseInt(jobs[i].statistics.creationTime) <= yesterday_end){
                                                var bytes_billed = jobs[i].statistics.query.totalBytesBilled;
                                                var query = {
                                                        job_id: jobs[i].id,
                                                        size_in_gb: parseFloat(bytes_billed / 1073741824),
                                                        estimated_cost: parseFloat((bytes_billed / 1073741824) * 0.005),
                                                        sql: jobs[i].configuration.query.query.replace(/\d{10}/g, '%utc').replace(/"[^"]*"/g, '"%s"').replace(/'[^']*'/g, '"%s"'),
                                                        user: jobs[i].user_email,
                                                        timestamp: moment(parseInt(jobs[i].statistics.creationTime)).unix()
                                                };
                                                large_queries.push(query);
                                        }else if( parseInt(jobs[i].statistics.creationTime) < yesterday_start ){
                                                cont = true;
                                                break;
                                        }
                                }
                        }
                        if( list.hasOwnProperty('nextPageToken') && !cont ){
                                return check_jobs(next, list.nextPageToken);
                        }

                        return next(large_queries);
                });
        };

        var store_queries = function(large_queries){
                var rows = [];
                for(var i=0; i<large_queries.length; i++){
                        var row = {
                                insertId: large_queries[i].job_id,
                                json: large_queries[i]
                        };
                        rows.push(row);
                }
                var params = {
                  projectId: audit.import.project_id,
                  datasetId: audit.import.dataset,
                  tableId: audit.import.table_id,
                  auth: jwtClient,
                  resource: {
                        kind: "bigquery#tableDataInsertAllRequest",
                        rows: rows
                  }
                };

                bigquery.tabledata.insertAll(params, function(err, response){
                        console.log(err, response);
                });
        };

        check_jobs(store_queries);
});

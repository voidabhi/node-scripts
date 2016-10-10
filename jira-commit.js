#!/usr/bin/env node
var exec = require('child_process').exec,
    util = require('util'),
    fs = require('fs'),
    contents = null,
    branch, desc;

// expect .git/COMMIT_EDITMSG
if(/COMMIT_EDITMSG/g.test(process.argv[2])){
    branch = exec("git branch | grep '*'",
      function (err, stdout, stderr) {
        if(err){
            process.exit(0);
        }

        contents = fs.readFileSync(process.argv[2]);

        var name = stdout.replace('* ','').replace('\n','');

        desc = exec('git config branch.'+ name +'.description',
            function(err, stdout, stderr){

                if(stdout){ name = util.format('%s (%s)', name, stdout.replace(/\n/g,'')); }

                if(name !== '(no branch)'){
                    var jiraIssue = /\/[a-zA-Z]+([-][0-9]+)+/;

                    if (jiraIssue.test(name)) {
                        var issueLine = jiraIssue.exec(name)[0].substring(1).toUpperCase().split('-');
                        name = [issueLine[0], issueLine[1]].join('-');

                        for(var i = 2; i < issueLine.length; i++) {
                          name += ',' + [issueLine[0], issueLine[i]].join('-');
                        }
                    }
                    else {
                        process.exit(0);
                    }

                    contents = util.format('[%s] %s', name, contents);

                    fs.writeFileSync(process.argv[2], contents);
                    process.exit(0);

                } else {
                    process.exit(0);
                }
        });
    });
}

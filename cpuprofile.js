
var profiler = require('v8-profiler');
profiler.startProfiling();

// code here

var cpuProfile = profiler.stopProfiling();
require('fs').writeFileSync(__dirname + '/foo.cpuprofile', JSON.stringify(cpuProfile));

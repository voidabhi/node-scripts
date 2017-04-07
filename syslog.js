 var Syslog = require('node-syslog');

 Syslog.init("node-syslog", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
 Syslog.log(Syslog.LOG_INFO, "Node Syslog Module output " + new Date());
 Syslog.close();

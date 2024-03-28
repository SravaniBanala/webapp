const StatsD = require('node-statsd');
const statsd = new StatsD({
    host: '127.0.0.1',
    port: 8125, // Default StatsD port
  });
 
 
module.exports = statsd;
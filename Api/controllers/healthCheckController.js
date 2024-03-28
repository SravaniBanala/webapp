const dbConnection = require('../config/databaseConfig.js');
const logger = require('../../logger/log.js');
const statsd = require('../../metrics/metriclogger.js');

const gethealthCheck = async (req, res) => {
    try {
      statsd.increment('webappendpoint.healthz.http.get');
        //await dbConnection.authenticate();
        const queryParams = req.query;
        const payload = req.headers['content-length'];
    
        //console.log('payload',payload);
        //console.log('payload keys',Object.keys(payload));
        //console.log('payload keys',req.headers['content-length']);
    
        if (payload && payload.length > 0) {
          logger.error(`Bad Request - Request Body should be empty`);
          // If request body is not empty, return HTTP 400 Bad Request
          res.status(400).send();
        }
    
        if (Object.keys(queryParams).length > 0) {
          logger.error(`Bad Request - Query Params not required`);
          // If request body is not empty, return HTTP 400 Bad Request
          res.status(400).send();
        }
     
        await dbConnection.authenticate();
    
        logger.info("This is a healthz checkpoint");
        // If the database connection is successful, return HTTP 200 OK
        res.status(200).send('');
    
      } catch (error) {
        logger.error(`Bad Request - Service Unavailable`);
        // If the database connection is unsuccessful, return HTTP 503 Service Unavailable
        res.status(503).send();
    
      }
    
    }


    //Connecting to Database 
dbConnection
.authenticate()
.then(() => {
  console.log('Database connection has been established successfully.');
  //databaseConnected = true;
})
.catch((err) => {
  console.error('Unable to connect to the database:');
});

    module.exports = { gethealthCheck }
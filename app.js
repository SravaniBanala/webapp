//  import express from 'express';
const express=require("express")

//import cors from 'cors';
const cors=require("cors")

//const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

const logger = require('./logger/log');
const statsd = require('./metrics/metriclogger.js');

//import Sequelize from 'Sequelize';
//const Sequelize = require("sequelize");

const fs = require('fs');
const csv = require('csv-parser');
const routes =require('./Api/routes/routes.js');
//const bcrypt = require('bcrypt');

const sequelize = require('./Api/config/databaseConfig.js');

const base64 = require("base-64")
const bcrypt = require("bcryptjs") 

//import User and Assignment;
const User = require( './Api//models/userModel.js');
const Assignment = require( './Api//models/assignmentModel.js');

// Instantiate app
const app = express();

var corOptions ={
    origin: 'https://localhost:8080'
}

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// load middleware functions to app 
app.use(express.json()); // parse request body as json and store in req.body(Getting all Information in JSOn in request body)
app.use(express.urlencoded());// only parse url encodied req bodies

app.use(routes);


// Middleware to set Cache-Control header
app.use((req, res, next) => {

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();

});

console.log("db sync start!");

// Sync both models with the database
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Models synced successfully!");

    // Call loadCSVData function to load CSV data and create users
    loadCSVData(User);
  })
  .catch((err) => {
    console.error("Error syncing models:", err);
  });


console.log("db sync complete!");


// Load CSV data when the application starts
// Load CSV Data
async function loadCSVData(User) {
    try {
      const users = [];
      fs.createReadStream('./opt/users.csv')
        .pipe(csv())
        .on('data', async (row) => {
          // Process each row of the CSV file
          // Hash the password using BCrypt
        //   if (isFirstRow) {
        //     isFirstRow = false;
        //     return; // Skip the first row
        //   }

          const salt = await bcrypt.genSalt(10);
          let hashedPassword = await bcrypt.hash(row.password, salt);
   
          console.log('hashedPassword.',hashedPassword);
          const user = new User({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            password: hashedPassword,
            account_created: new Date(),
            account_updated: new Date(),
          });

          console.log(' Users:'+user.first_name);
          console.log(' Users email:'+ user.email);
  
          // Save the user to the database if it doesn't already exist
          //const existingUser = await User.findOne({ email: user.email });
          const existingUser = await User.findOne({ where: { email: row.email } });

          if (existingUser != null) {
            console.log(' Users existing email:'+ existingUser.email);
        
          }
         
          if (existingUser == null) {
            user.account_created =new Date();
            user.account_updated =new Date();
            await user.save();
          }
  
          users.push(user);
        })
        .on('end', () => {
          console.log('Loaded Users:');
          console.log(users);
        });
    } catch (error) {
      console.error('Error loading CSV file:', error);
    }
  }


  app.use((req, res, next) => {
    const allowedPaths = ['/healthz', '/demo/assignments','/demo/assignments/:id/submission'];
   console.log("hello");
    // Check if the request path is in the allowed paths or if it starts with '/healthz' or '/v1/assignments'
    if (allowedPaths.includes(req.path) && req.path === '/healthz'){
      if (req.method !== 'GET') {
        statsd.increment('webappendpoint.healthz.http.Otherthanget');
        logger.info("This is a checkout where you 405, since the method isn't found"); 
        // For other endpoints, return a 405 status for non-GET methods
        res.status(405).send();
      } 
      // If the request path is allowed, continue to the next middleware
      next();
    } 
    
    else if (allowedPaths.includes(req.path) && req.path === '/demo/assignments') {
      statsd.increment('webappendpoint.assignments.http.patch');
      // For other endpoints, return a 405 status for non-GET methods
      if (req.method === 'PATCH') {
        // For other endpoints, return a 405 status for non-GET methods
        res.status(405).send();

      // If the request path is allowed, continue to the next middleware
      next();
      } 
      
    } 
     // Check if the request path is in the allowed paths or if it starts with '/healthz' or '/v1/assignments'
     if (allowedPaths.includes(req.path) && req.path === '/demo/assignments/:id/submission'){
      if (req.method !== 'POST') {
        statsd.increment('webappendpoint.healthz.http.Otherthanget');
        logger.info("This is a checkout where you 405, since the method isn't found"); 
        // For other endpoints, return a 405 status for non-GET methods
        res.status(405).send();
      } 
      // If the request path is allowed, continue to the next middleware
      next();
    } 
   
    else {
      // If it's a GET request for other endpoints, continue to the next middleware
      res.status(404).send();
    }
  });


// RestAPI port is setted to 8080
const port = 8087;

// Run the server
app.listen(port,()=>{
    console.log('Server is running on port'+ port);
    console.log('health Restful Api server started on:'+port);

});

module.exports=app

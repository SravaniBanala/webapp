const { Sequelize } = require('sequelize');

require('dotenv').config();

        const sequelize = new Sequelize({

            dialect: process.env.DB_DIALECT, // Use the appropriate database dialect
          
            host: process.env.DB_HOST, // Replace with your database host
          
            username: process.env.DB_USER , // Replace with your database username
          
            password: process.env.DB_PASSWORD, // Replace with your database password
          
            database: process.env.DB_DATABASE  // Replace with your database name
          
          });

module.exports = sequelize;



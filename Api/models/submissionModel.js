const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseConfig.js');
const logger = require('../../logger/log.js');

function isURL(input) {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    if (!urlRegex.test(input))
    {
      logger.info(`Posted URL is not valid rejected by DB`);
      throw new Error ('Submitted URL is not valid');
    }
    logger.info(`given URL is valid`)
    return true;
  }

const submission = sequelize.define("submissions", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        readOnly: true
    },
    assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        readOnly: true
    },
    submission_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {isURL},
        readOnly: true
    },
    submission_date: {
        type: DataTypes.DATE,
        allowNull: false,
        readOnly: true
    },
    submission_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        readOnly: true
    },
    submission_attempt: {
        type: DataTypes.INTEGER,
        defaultValue: 0, 
        allowNull: false
        
    },
    owner_assignment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
        
    }
}, {
    timestamps: false
});

module.exports = submission;

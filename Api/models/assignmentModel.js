const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseConfig.js');

const Assignment = sequelize.define("assignments", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    num_of_attemps: {
        type: DataTypes.INTEGER,
        allowNull:false
    },

    assignment_created: {
        type: DataTypes.DATE,
        allowNull: false
    },
    assignment_updated: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false
    },
    owner_user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
        
    }
    
}, {
    timestamps: false
});

module.exports = Assignment






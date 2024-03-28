const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseConfig.js');

const User = sequelize.define("users", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    account_created: {
        type: DataTypes.DATE,
        allowNull: false
    },
    account_updated: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    timestamps: false
});
module.exports = User






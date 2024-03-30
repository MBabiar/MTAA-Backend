const { Sequelize } = require('sequelize');
const params = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const sequelize = new Sequelize(params.database, params.user, params.password, {
    host: params.host,
    port: params.port,
    dialect: 'postgres',
    logging: false,
});

const User = sequelize.define('User', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-z\s]+$/i,
        },
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: /^[a-z\s]+$/i,
        },
    },
    games_played: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    won: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    lost: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
});

sequelize.sync(); //sync all models

module.exports = {
    User,
};

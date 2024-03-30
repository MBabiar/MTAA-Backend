const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const socket = require('socket.io');
const { Sequelize } = require('sequelize');

const app = express();
const serverPort = 8080;
app.use(express.json());

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

// Connecting to DB with retry upon failure
async function connectToDBWithRetry() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        startServer();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        setTimeout(() => {
            connectToDBWithRetry();
        }, 1000);
    }
}

// Server with RESTFUL API
function startServer() {
    const { User } = require('./models');

    app.listen(serverPort, () => {
        console.log(`Server is listening at http://localhost:${serverPort} `);
    });

    app.post('/register', async (req, res) => {
        const newUser = {
            name: req.query.username,
            email: req.query.email,
            hashedPassword: bcrypt.hashSync(req.query.password, 10),
        };

        try {
            await User.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.hashedPassword,
            });

            res.status(200).send('User registered successfully');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(400).send('Email already exists');
            } else if (error.name === 'SequelizeValidationError') {
                const errors = error.errors.map((err) => err.message);
                res.status(400).send(errors);
            } else {
                console.error(error);
                res.status(500).send('Failed to register user');
            }
        }
    });
}

// Start connecting to DB
setTimeout(() => {
    connectToDBWithRetry();
}, 1500);

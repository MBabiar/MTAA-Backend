const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const socket = require('socket.io');
const { Sequelize } = require('sequelize');
const sharp = require('sharp');

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
// TODO overenie či sa poslali všetky query parametre
function startServer() {
    const { User } = require('./models');
    const fs = require('fs');

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

    app.get('/login', async (req, res) => {
        const { email, password } = req.query;
        try {
            const user = await User.findOne({ where: { email } });
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).send(user.user_id);
            } else {
                res.status(401).send('Invalid email or password');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to login');
        }
    });

    app.get('/leaderboard', async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['name', 'won'],
                order: [
                    ['won', 'DESC'],
                    ['name', 'ASC'],
                ],
                limit: 100,
            });
            res.status(200).send(users);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get leaderboard');
        }
    });

    app.get('/user', async (req, res) => {
        const userID = req.query.user_id;
        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                res.status(200).send(user);
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get user');
        }
    });

    app.put('/user/won', async (req, res) => {
        const userID = req.query.user_id;
        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                user.games_played++;
                user.won++;
                await user.save();
                res.status(200).send('User updated successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to update user');
        }
    });

    app.put('/user/lost', async (req, res) => {
        const userID = req.query.user_id;
        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                user.games_played++;
                user.lost++;
                await user.save();
                res.status(200).send('User updated successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to update user');
        }
    });

    app.put('/picture', async (req, res) => {
        const userID = req.query.user_id;
        const pictureByteArray = req.query.picture;
        try {
            const base64Image = Buffer.from(pictureByteArray).toString('base64');
            const imageBuffer = Buffer.from(base64Image, 'base64');

            const resizedPictureBuffer = await sharp(imageBuffer).resize(200, 200).png().toBuffer();
            const resizedPictureByteArray = Array.from(resizedPictureBuffer);

            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                user.picture = resizedPictureByteArray;
                await user.save();
                res.status(200).send('Picture uploaded successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to upload picture');
        }
    });

    app.get('/picture', async (req, res) => {
        const userID = req.query.user_id;
        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                res.status(200).send('Picture downloaded successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get picture');
        }
    });
}

// Start connecting to DB
setTimeout(() => {
    connectToDBWithRetry();
}, 1500);

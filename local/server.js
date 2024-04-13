import bcrypt from 'bcrypt';
import cors from 'cors';
import express from 'express';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import http from 'http';
import { Sequelize } from 'sequelize';
import sharp from 'sharp';
import { Server } from 'socket.io';
import { params } from './config.js';
import { User, syncAndSeedDatabase } from './models.js';

const appPort = 8080;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer);

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
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        setTimeout(() => {
            connectToDBWithRetry();
        }, 1000);
    }
}

// Server with RESTFUL API
async function startServer() {
    await syncAndSeedDatabase();

    startWebsocketServer();

    const usernameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^([a-zA-Z0-9]+)@([a-zA-Z0]+)\.([a-zA-Z]+)$/;
    const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
    const countryRegex = /^[a-zA-Z\s]+$/;

    httpServer.listen(appPort, '0.0.0.0', () => {
        console.log(
            'Server listening:',
            `http://${httpServer.address().address}:${httpServer.address().port}`
        );
    });

    // API for websocket testing
    app.get('/', (req, res) => {
        res.status(200).send(`<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
            </head>
            <body>
                <script type="module" src="/websocket.js"></script>
            </body>
        </html>`);
    });

    app.post('/register', async (req, res) => {
        const newUser = {
            username: req.query.username,
            email: req.query.email,
            password: req.query.password,
            hashedPassword: bcrypt.hashSync(req.query.password, 10),
        };

        if (!newUser.username || !newUser.email || !newUser.hashedPassword) {
            res.status(400).send('Missing required fields');
            return;
        } else if (!emailRegex.test(newUser.email)) {
            res.status(400).send('Invalid email format');
            return;
        } else if (!usernameRegex.test(newUser.username)) {
            res.status(400).send('Invalid username format');
            return;
        } else if (!passwordRegex.test(newUser.password)) {
            res.status(400).send('Invalid password format');
            return;
        }

        try {
            await User.create({
                username: newUser.username,
                email: newUser.email,
                password: newUser.hashedPassword,
            });

            res.status(200).send('User registered successfully');
        } catch (error) {
            if (error.username === 'SequelizeUniqueConstraintError') {
                res.status(400).send('Email already exists');
            } else if (error.username === 'SequelizeValidationError') {
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

        if (!email || !password) {
            res.status(400).send('Missing required fields');
            return;
        } else if (!emailRegex.test(email)) {
            res.status(400).send('Invalid email format');
            return;
        } else if (!passwordRegex.test(password)) {
            res.status(400).send('Invalid password format');
            return;
        }

        try {
            const user = await User.findOne({ where: { email } });
            if (user && bcrypt.compareSync(password, user.password)) {
                const dataJson = { userID: user.user_id };
                res.status(200).send(dataJson);
            } else {
                res.status(401).send('User does not exist or password is incorrect');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to login');
        }
    });

    app.get('/leaderboard', async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['username', 'won'],
                order: [
                    ['won', 'DESC'],
                    ['username', 'ASC'],
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

        if (!userID) {
            res.status(400).send('Missing UserID');
            return;
        }

        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                const userInfo = {
                    username: user.username,
                    country: user.country,
                    games_played: user.games_played,
                    won: user.won,
                    lost: user.lost,
                };
                res.status(200).send(userInfo);
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get user');
        }
    });

    app.get('/picture', async (req, res) => {
        const userID = req.query.user_id;

        if (!userID) {
            res.status(400).send('Missing UserID');
            return;
        }

        try {
            const user = await User.findOne({ where: { user_id: userID } });

            if (user) {
                if (!user.profile_picture) {
                    res.status(404).send('User has no picture');
                    return;
                }

                const buffer = fs.readFileSync(`.${user.profile_picture}`);

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': buffer.length,
                });
                res.status(200).end(buffer);
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get picture');
        }
    });

    app.put('/user/won', async (req, res) => {
        const userID = req.query.user_id;

        if (!userID) {
            res.status(400).send('Missing UserID');
            return;
        }

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

        if (!userID) {
            res.status(400).send('Missing UserID');
            return;
        }

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
        const pictureByteArray = req.body.picture;

        if (!userID) {
            res.status(400).send('Missing UserID');
            return;
        }
        if (!pictureByteArray) {
            res.status(400).send('Missing picture');
            return;
        }

        try {
            const user = await User.findOne({ where: { user_id: userID } });

            if (user) {
                const imageBuffer = Buffer.from(pictureByteArray, 'hex');
                const type = await fileTypeFromBuffer(imageBuffer);

                if (type.mime !== 'image/png') {
                    res.status(400).send('Invalid image format');
                    return;
                }

                const resizedImageBuffer = await sharp(imageBuffer)
                    .resize({ width: 150, height: 150 })
                    .toBuffer();

                fs.writeFileSync(`./profile_pictures/${userID}.png`, resizedImageBuffer);
                user.profile_picture = '/profile_pictures/' + userID + '.png';
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

    app.put('/user/password', async (req, res) => {
        const userID = req.query.user_id;
        const oldPassword = req.query.old_password;
        const newPassword = req.query.new_password;

        if (!userID || !oldPassword || !newPassword) {
            res.status(400).send('Missing required fields');
            return;
        } else if (!passwordRegex.test(newPassword)) {
            res.status(400).send('Invalid new password format');
            return;
        }

        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                if (!bcrypt.compareSync(oldPassword, user.password)) {
                    res.status(400).send('Invalid old password');
                    return;
                }
                user.password = bcrypt.hashSync(newPassword, 10);
                await user.save();
                res.status(200).send('Password updated successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to update password');
        }
    });

    app.put('/user/country', async (req, res) => {
        const userID = req.query.user_id;
        const newCountry = req.query.country;

        if (!userID || !newCountry) {
            res.status(400).send('Missing required fields');
            return;
        } else if (!countryRegex.test(newCountry)) {
            res.status(400).send('Invalid country format');
            return;
        }

        try {
            const user = await User.findOne({ where: { user_id: userID } });
            if (user) {
                user.country = newCountry;
                await user.save();
                res.status(200).send('Country updated successfully');
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to update country');
        }
    });
}

async function startWebsocketServer() {
    let waitingPlayers = [];

    function generateGameId() {
        return Math.random().toString(36).substring(2, 15);
    }

    function getGameIdBySocketId(socket) {
        if (!socket.rooms) {
            return null;
        }
        for (const room of Object.values(socket.rooms)) {
            if (room !== socket.id) {
                return room;
            }
        }
        return null;
    }

    io.on('connection', (socket) => {
        socket.on('findGame', () => {
            console.log('User looking for game');
            if (waitingPlayers.length > 0) {
                const opponent = waitingPlayers.pop();
                const gameId = generateGameId();

                opponent.join(gameId);
                socket.join(gameId);

                opponent.emit('gameStart', { gameId, color: 'white' });
                socket.emit('gameStart', { gameId, color: 'black' });
            } else {
                console.log('User added to queue');
                waitingPlayers.push(socket);
            }
        });

        socket.on('move', (data) => {
            socket.to(data.gameId).emit('move', data.move);
        });

        socket.on('resign', (gameId) => {
            socket.to(gameId).emit('resign');
        });

        socket.on('disconnect', () => {
            const gameId = getGameIdBySocketId(socket.id);
            if (gameId) {
                socket.to(gameId).emit('resign');
            }
            waitingPlayers = waitingPlayers.filter((player) => player.id !== socket.id);
            console.log('User disconnected');
            console.log(waitingPlayers);
        });
    });
}

// Start connecting to DB
setTimeout(() => {
    connectToDBWithRetry().then(() => {
        startServer();
    });
}, 1500);

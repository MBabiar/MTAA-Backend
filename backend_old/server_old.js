const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const socket = require('socket.io');

const app = express();
const server_port = 8080;
app.use(express.json());

const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Connecting to DB with retry upon failure
function connectToDBWithRetry() {
    try {
        client.connect();
        console.log('Connected to DB');
        startServer();
    } catch (error) {
        console.error('Failed to connect to DB');
        setTimeout(() => {
            connectToDBWithRetry();
        }, 2000);
    }
}

// Server with RESTFUL API
function startServer() {
    app.listen(server_port, () => {
        console.log(`Server is listening at http://localhost:${server_port} `);
    });

    app.post('/register', async (req, res) => {
        const { username, email, password } = req.query;

        console.log('Registering user:', username, email, password);

        bcrypt.hash(password, 10, async (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                res.status(500).send('Error hashing password');
                return;
            }

            const query = `INSERT INTO users (NAME, email, PASSWORD) VALUES ('${username}', '${email}', '${hashedPassword}');`;
            try {
                await client.query(query);
                res.status(200).send('User registered successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Failed to register user');
            }
        });
    });
}

// Start connecting to DB
setTimeout(() => {
    connectToDBWithRetry();
}, 1500);

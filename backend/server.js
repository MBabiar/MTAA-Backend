const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const app = express();
const server_port = 8080;
app.use(express.json());

const client = new Client({
    host: 'postgresql-database-container',
    database: 'postgres',
    user: 'postgres',
    password: 'root',
    port: 5432,
});

// Connecting to DB with retry upon failure
function connectToDBWithRetry() {
    try {
        client.connect();
        console.log('Connected to DB');
    } catch (error) {
        console.error('Failed to connect to DB');
        setTimeout(() => {
            connectToDBWithRetry();
        }, 2000);
    }
}
setTimeout(() => {
    connectToDBWithRetry();
}, 1500);

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
            res.send('User registered successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to register user');
        }
    });
});

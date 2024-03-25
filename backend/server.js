import express from 'express';
const app = express();
const port = 8080;

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

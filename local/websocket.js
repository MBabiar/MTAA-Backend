const socket = io('http://localhost:8080');

const button = document.createElement('button');
button.textContent = 'Find Game';
button.id = 'findGame';
document.body.appendChild(button);

document.getElementById('findGame').addEventListener('click', () => {
    console.log('Finding game');
    socket.emit('findGame');
});

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('gameStart', (data) => {
    console.log('Game started', data);
});

socket.on('move', (move) => {
    console.log('Opponent moved', move);
});

socket.on('resign', () => {
    console.log('Opponent resigned');
});

socket.on('win', () => {
    console.log('You won!');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

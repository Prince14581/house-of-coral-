// /modules/theStage.js
const socketIo = require('socket.io');

module.exports = function(server) {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('User connected to The Stage');
        // Handle WebRTC signaling or streaming events here
        socket.on('signal', (data) => {
            socket.broadcast.emit('signal', data);
        });
    });
};

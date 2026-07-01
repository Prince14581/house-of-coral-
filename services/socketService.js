// services/socketService.js
const socketIo = require('socket.io');

exports.initWebSocket = (server) => {
    const io = socketIo(server, {
        cors: { origin: "*" },
        transports: ['websocket'] // Force WebSockets for lower latency
    });

    io.on('connection', (socket) => {
        console.log(`[ARENA] Player connected: ${socket.id}`);

        // Handle live betting event
        socket.on('place_bet', async (data) => {
            // Verify lock status before allowing action
            const SystemStatus = require('../models/SystemStatus');
            const status = await SystemStatus.findOne({ id: 'global_config' });
            
            if (status.isLocked) {
                socket.emit('error', 'Platform is currently locked for maintenance.');
                return;
            }
            
            // Logic to process bet
            io.emit('bet_confirmed', { status: 'success', betId: data.betId });
        });
    });
};
// services/socketService.js
const socketIo = require('socket.io');

exports.initWebSocket = (server) => {
    const io = socketIo(server, {
        cors: { origin: "*" },
        transports: ['websocket'] // Force WebSockets for lower latency
    });

    io.on('connection', (socket) => {
        console.log(`[ARENA] Player connected: ${socket.id}`);

        // Handle live betting event
        socket.on('place_bet', async (data) => {
            // Verify lock status before allowing action
            const SystemStatus = require('../models/SystemStatus');
            const status = await SystemStatus.findOne({ id: 'global_config' });
            
            if (status.isLocked) {
                socket.emit('error', 'Platform is currently locked for maintenance.');
                return;
            }
            
            // Logic to process bet
            io.emit('bet_confirmed', { status: 'success', betId: data.betId });
        });
    });
};

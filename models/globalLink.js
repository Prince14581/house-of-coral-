// /modules/globalLink.js
const WebSocket = require('ws');

module.exports = function(server) {
    const wss = new WebSocket.Server({ server, path: '/chat' });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            // Broadcast message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        });
    });
};

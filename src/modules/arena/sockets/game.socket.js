module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('GAME_OVER', async (data) => {
            // Settle the money the moment the game ends
            await WagerEngine.settleWager(data.winnerId, data.loserId, data.totalPool);
            
            io.to(data.roomId).emit('MATCH_RESULT', { winner: data.winnerId });
        });
    });
};

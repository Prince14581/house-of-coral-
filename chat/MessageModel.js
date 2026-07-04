const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    senderId: { type: String, required: true },
    ciphertext: { type: String, required: true }, // Encrypted content
    iv: { type: String, required: true },         // Initialization Vector
    reactions: [{ userId: String, type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

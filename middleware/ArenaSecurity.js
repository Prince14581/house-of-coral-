// middleware/ArenaSecurity.js
const crypto = require('crypto');

const validateArenaPacket = (req, res, next) => {
    const signature = req.headers['x-arena-signature'];
    const payload = JSON.stringify(req.body);

    if (!signature) {
        return res.status(401).json({ error: 'Missing security signature' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.ARENA_SECRET)
        .update(payload)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(403).json({ error: 'Tampered packet detected' });
    }

    next();
};

module.exports = validateArenaPacket;

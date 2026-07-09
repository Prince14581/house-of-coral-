const Connection = require('../models/Connection');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

/**
 * Atomic connection request with robust race-condition handling.
 */
exports.sendRequest = async (req, res) => {
    const start = Date.now();
    const { targetUserId } = req.body;
    const senderId = req.user.id;
    const now = new Date();

    if (targetUserId === senderId) return res.status(400).json({ status: "error", message: "Cannot connect with yourself." });
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) return res.status(400).json({ status: "error", message: "Invalid user ID." });

    try {
        const targetExists = await User.exists({ _id: targetUserId, status: 'active', deletedAt: null });
        if (!targetExists) return res.status(404).json({ status: "error", message: "Recipient not found." });

        const connectionKey = [senderId, targetUserId].sort().join(':');
        
        let connection;
        try {
            connection = await Connection.findOneAndUpdate(
                { connectionKey },
                { $setOnInsert: { sender: senderId, receiver: targetUserId, status: 'pending', requestedAt: now } },
                { upsert: true, new: true, rawResult: true }
            );
        } catch (err) {
            if (err.code === 11000) return res.status(409).json({ status: "error", message: "Connection already exists." });
            throw err;
        }

        if (connection.lastErrorObject?.updatedExisting === false) {
            await AuditLog.create({ action: 'CONNECTION_REQUESTED', actorId: senderId, documentId: targetUserId, status: 'success' });
            return res.status(201).json({ status: "success", message: "Request sent.", meta: { executionTimeMs: Date.now() - start } });
        }
        
        return res.status(409).json({ status: "error", message: "Connection already exists or pending." });
    } catch (error) {
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Failed to send request." });
    }
};

/**
 * Transactional request acceptance with unified timestamping.
 */
exports.acceptRequest = async (req, res) => {
    const start = Date.now();
    const { connectionId } = req.params;
    const userId = req.user.id;
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(connectionId)) return res.status(400).json({ status: "error", message: "Invalid ID." });

    const session = await mongoose.startSession();
    try {
        let updatedConnection;
        await session.withTransaction(async () => {
            updatedConnection = await Connection.findOneAndUpdate(
                { _id: connectionId, receiver: userId, status: 'pending' },
                { $set: { status: 'connected', acceptedAt: now } },
                { new: true, session }
            );

            if (updatedConnection) {
                await AuditLog.create([{ action: 'CONNECTION_ACCEPTED', actorId: userId, documentId: connectionId, status: 'success' }], { session });
            }
        });

        if (!updatedConnection) return res.status(404).json({ status: "error", message: "Request not found." });
        res.status(200).json({ status: "success", data: updatedConnection, meta: { executionTimeMs: Date.now() - start } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to accept request." });
    } finally {
        session.endSession();
    }
};

/**
 * Paginated connection retrieval with standard metadata.
 */
exports.getConnections = async (req, res) => {
    const start = Date.now();
    try {
        const userId = req.user.id;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const [connections, total] = await Promise.all([
            Connection.find({ $or: [{ sender: userId }, { receiver: userId }], status: 'connected' })
                .populate('sender', 'username avatar verified')
                .populate('receiver', 'username avatar verified')
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Connection.countDocuments({ $or: [{ sender: userId }, { receiver: userId }], status: 'connected' })
        ]);

        res.status(200).json({ 
            status: "success", 
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, 
            data: connections,
            meta: { executionTimeMs: Date.now() - start }
        });
    } catch (error) {
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Failed to retrieve connections." });
    }
};

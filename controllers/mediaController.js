const Media = require('../models/Media');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const ALLOWED_TYPES = new Set(['image', 'video', 'audio', 'document']);

/**
 * Register media metadata with rigorous validation, deduplication, and full-cycle auditing.
 */
exports.registerMedia = async (req, res) => {
    const start = Date.now();
    const now = new Date();
    const { title, type, url, providerId } = req.body;
    const userId = req.user.id;

    // 1. Rigorous Validation
    if (!title || !type || !url) return res.status(400).json({ status: "error", message: "Required fields missing." });
    const cleanTitle = title.trim();
    if (cleanTitle.length < 1 || cleanTitle.length > 255) return res.status(400).json({ status: "error", message: "Invalid title length." });
    if (!ALLOWED_TYPES.has(type.toLowerCase())) return res.status(400).json({ status: "error", message: "Unsupported media type." });
    if (providerId && !mongoose.Types.ObjectId.isValid(providerId)) return res.status(400).json({ status: "error", message: "Invalid provider ID." });
    
    let normalizedUrl;
    try {
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error();
        // Remove fragments to ensure uniqueness; host/path remains relevant
        parsed.hash = ''; 
        normalizedUrl = parsed.toString();
    } catch { 
        await logAudit(userId, 'MEDIA_REGISTRATION_FAILED', 'error', { url, reason: 'Invalid/Unsupported URL' });
        return res.status(400).json({ status: "error", message: "Invalid or unsupported media URL." }); 
    }

    // 2. Session initialization deferred
    const session = await mongoose.startSession();
    try {
        let media;
        await session.withTransaction(async () => {
            [media] = await Media.create([{
                title: cleanTitle,
                type: type.toLowerCase(),
                url: normalizedUrl,
                owner: userId,
                providerId: providerId || null,
                status: 'published',
                createdAt: now
            }], { session });

            await logAudit(userId, 'MEDIA_REGISTERED', 'success', { 
                mediaId: media._id, 
                type: type.toLowerCase(),
                ip: req.ip,
                userAgent: req.get('user-agent') 
            }, session);
        });

        res.status(201).json({ 
            status: "success", 
            data: media, 
            meta: { executionTimeMs: Date.now() - start, reportDate: now.toISOString() } 
        });
    } catch (error) {
        // Explicitly check for duplicate keys
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", message: "Media already registered." });
        }
        await logAudit(userId, 'MEDIA_REGISTRATION_FAILED', 'error', { error: error.message });
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Media registration failed." });
    } finally {
        await session.endSession();
    }
};

/**
 * Helper to centralize resilient audit logging.
 */
async function logAudit(actorId, action, status, metadata, session = null) {
    try {
        return await AuditLog.create([{ action, actorId, status, metadata, createdAt: new Date() }], { session });
    } catch (err) {
        console.error("Audit log failed:", err);
    }
}

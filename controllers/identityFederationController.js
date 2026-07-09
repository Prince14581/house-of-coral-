const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SUPPORTED_PROVIDERS = new Set(['google']); // Apple support pending OIDC implementation

/**
 * Validates and federates an external identity assertion.
 */
exports.federateIdentity = async (req, res) => {
    const start = Date.now();
    const { provider, token } = req.body;

    if (!provider || !token) return res.status(400).json({ status: "error", message: "Provider and token are required." });
    if (!SUPPORTED_PROVIDERS.has(provider)) return res.status(400).json({ status: "error", message: "Unsupported provider." });

    const session = await mongoose.startSession();
    try {
        const identity = await verifyProviderToken(provider, token);
        if (!identity) return res.status(401).json({ status: "error", message: "Invalid identity token." });

        let user;
        await session.withTransaction(async () => {
            const normalizedEmail = identity.email.toLowerCase().trim();
            user = await User.findOne({
                $or: [
                    { email: normalizedEmail },
                    { federatedIds: { $elemMatch: { provider, id: identity.id } } }
                ]
            }).session(session);

            if (!user) {
                // Ensure unique username by appending random suffix
                const baseUsername = identity.name.toLowerCase().replace(/\s+/g, '_');
                const suffix = crypto.randomBytes(3).toString('hex');
                
                [user] = await User.create([{
                    email: normalizedEmail,
                    username: `${baseUsername}_${suffix}`,
                    status: 'active',
                    federatedIds: [{ provider, id: identity.id }]
                }], { session });
                
                await AuditLog.create([{ action: 'USER_FEDERATED_CREATED', actorId: user._id, status: 'success' }], { session });
            } else {
                if (user.status !== 'active' || user.deletedAt) throw new Error("ACCOUNT_SUSPENDED");

                if (!user.federatedIds.some(f => f.provider === provider && f.id === identity.id)) {
                    user.federatedIds.push({ provider, id: identity.id });
                    await user.save({ session });
                }
            }
        });

        const accessToken = jwt.sign({ sub: user._id, email: user.email, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });

        await AuditLog.create({
            action: 'IDENTITY_FEDERATION_LOGIN',
            actorId: user._id,
            status: 'success',
            metadata: { provider, ip: req.ip, durationMs: Date.now() - start }
        });

        res.status(200).json({ 
            status: "success", 
            data: { accessToken, user: { id: user._id, email: user.email } },
            meta: { executionTimeMs: Date.now() - start, reportDate: new Date().toISOString() } 
        });
    } catch (error) {
        if (error.message === "ACCOUNT_SUSPENDED") return res.status(403).json({ status: "error", message: "Account unavailable." });
        if (error.message === "EMAIL_NOT_VERIFIED") return res.status(403).json({ status: "error", message: "Email not verified." });
        
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Federation failed." });
    } finally {
        session.endSession();
    }
};

/**
 * Identity service for secure OIDC validation.
 */
async function verifyProviderToken(provider, token) {
    try {
        if (provider === 'google') {
            const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
            const payload = ticket.getPayload();
            if (!payload.email_verified) throw new Error("EMAIL_NOT_VERIFIED");
            return { id: payload.sub, email: payload.email, name: payload.name };
        }
        return null;
    } catch (err) {
        if (err.message === "EMAIL_NOT_VERIFIED") throw err;
        return null; // Signals 401 Unauthorized for general token failures
    }
}

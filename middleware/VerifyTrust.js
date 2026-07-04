// middleware/VerifyTrust.js
const Identity = require('../models/Identity');

/**
 * Enforces trust score threshold for specific routes
 * @param {number} minScore - Minimum trust score required
 */
const verifyTrust = (minScore) => {
    return async (req, res, next) => {
        try {
            const identity = await Identity.findOne({ userId: req.user.id });

            if (!identity || identity.trustScore < minScore) {
                return res.status(403).json({ 
                    error: 'Access Denied', 
                    message: `Required Trust Score: ${minScore}. Your current score: ${identity?.trustScore || 0}` 
                });
            }
            
            // Inject identity into request for downstream use
            req.identity = identity;
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal Identity Verification Error' });
        }
    };
};

module.exports = verifyTrust;

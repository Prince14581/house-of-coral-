/**
 * SecurityGuard: Unified Authentication and Access Control Layer
 * This module enforces platform-wide security policies.
 */
const jwt = require('jsonwebtoken');
const IdentityModel = require('../modules/Identity/IdentityModel');

class SecurityGuard {
    /**
     * Middleware: Validates JWT and attaches Identity to request
     */
    static async authenticate(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Authentication required' });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await IdentityModel.findOne({ userId: decoded.userId });

            if (!user) return res.status(401).json({ error: 'User not found' });

            req.user = user;
            next();
        } catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    /**
     * Guard: Role & Trust-based authorization
     * @param {string} permission - The required action key
     */
    static authorize(permission) {
        return async (req, res, next) => {
            const { role, trustScore } = req.user;

            // Define global permission matrix
            const matrix = {
                'LIST_ITEM': { minTrust: 300, roles: ['USER', 'PRO', 'MOD'] },
                'CREATE_TOURNAMENT': { minTrust: 700, roles: ['PRO', 'MOD'] },
                'RESOLVE_DISPUTE': { minTrust: 0, roles: ['MOD', 'ADMIN'] }
            };

            const rule = matrix[permission];
            
            if (!rule) return res.status(500).json({ error: 'Permission not defined' });

            const hasRole = rule.roles.includes(role);
            const hasTrust = trustScore >= rule.minTrust;

            if (hasRole && hasTrust) {
                next();
            } else {
                res.status(403).json({ 
                    error: 'Access Denied', 
                    message: `Requires role: ${rule.roles.join(' or ')} and trust score: ${rule.minTrust}` 
                });
            }
        };
    }
}

module.exports = SecurityGuard;

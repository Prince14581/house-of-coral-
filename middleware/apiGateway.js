const IdentityFederation = require('../controllers/identityFederationController');
const ReconciliationEngine = require('../services/reconciliationEngine');
const BorderControl = require('./BorderControl');

/**
 * The API Gateway: Central entry point for House-of-Coral
 */
const apiGateway = (targetPillar) => {
  return async (req, res, next) => {
    try {
      // 1. Identity Validation
      const authHeader = req.headers.authorization;
      const user = await IdentityFederation.getFederatedSession(authHeader);
      
      if (!user) {
        return res.status(401).json({ error: 'Global Link: Unauthorized access attempt' });
      }

      // 2. Access Guard (Strict permissions check)
      const hasAccess = await BorderControl.authorize(user.userId, targetPillar);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Global Link: Access denied to pillar' });
      }

      // 3. Forensic Logging for Reconciliation
      await ReconciliationEngine.logActivity({
        userId: user.userId,
        pillar: targetPillar,
        action: req.method + ' ' + req.originalUrl,
        timestamp: new Date()
      });

      // 4. Attach context and forward
      req.user = user;
      req.pillarContext = targetPillar;
      
      next();
    } catch (error) {
      console.error(`[Gateway Error] ${targetPillar}:`, error);
      res.status(500).json({ error: 'Gateway processing failed' });
    }
  };
};

module.exports = apiGateway;

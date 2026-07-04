const TreasuryService = require('../services/TreasuryService');

module.exports = async (req, res, next) => {
    // Only intercept routes where a transaction amount is defined
    if (req.body.amount) {
        try {
            const result = await TreasuryService.processTransaction(req.body);
            req.processedTransaction = result; // Attach for the controller
            next();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        next();
    }
};

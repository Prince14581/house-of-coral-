const treasuryService = require('../services/treasuryService');

const handleTransactionFee = async (req, res, next) => {
    const { amount, recipientId } = req.body;
    
    // Check if the user is exempt from fees
    if (req.user.treasuryFeeExempt) {
        return next();
    }

    try {
        const result = await treasuryService.processTransaction(amount, req.user.id, recipientId);
        req.transactionResult = result; // Attach result for the next controller
        next();
    } catch (err) {
        res.status(500).json({ message: "Treasury processing error", error: err.message });
    }
};

module.exports = handleTransactionFee;

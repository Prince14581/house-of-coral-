const Wallet = require('../models/wallet.model');
const LedgerEngine = require('../../ledger/services/ledger.service');

class WalletService {
    static async updateBalance(userId, amount, pillar, metadata) {
        // Atomic update of the wallet
        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { new: true }
        );

        // Record in Ledger immediately
        await LedgerEngine.record(userId, amount, pillar, metadata);
        return wallet;
    }
}
module.exports = WalletService;

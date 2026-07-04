const WalletService = require('../../wallet/services/wallet.service');

class SettlementEngine {
    /**
     * Executes the split: 90% to Seller, 10% to Treasury Node.
     */
    static async settleTransaction(sellerId, buyerId, amount) {
        const PLATFORM_FEE_RATE = 0.10;
        const fee = amount * PLATFORM_FEE_RATE;
        const sellerShare = amount - fee;

        // 1. Debit Buyer (via WalletService)
        await WalletService.updateBalance(buyerId, -amount, 'BAZAAR_PURCHASE', { sellerId });

        // 2. Credit Seller (90%)
        await WalletService.updateBalance(sellerId, sellerShare, 'BAZAAR_SALE', { buyerId });

        // 3. Credit Treasury Node (10%)
        await WalletService.updateBalance(process.env.TREASURY_NODE_ID, fee, 'PLATFORM_FEE', { 
            origin: 'BAZAAR_SALE', 
            sellerId 
        });

        return { sellerShare, fee };
    }
}
module.exports = SettlementEngine;

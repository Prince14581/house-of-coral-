const EscrowEngine = require('../../escrow/services/escrow.service');
const SettlementEngine = require('../../settlement/services/settlement.service');

class WagerEngine {
    static async createWager(playerA, playerB, amount) {
        // 1. Lock funds from both players in Escrow
        await EscrowEngine.holdFunds(playerA.id, amount, 'ARENA_WAGER');
        await EscrowEngine.holdFunds(playerB.id, amount, 'ARENA_WAGER');
        
        return { status: 'WAGER_LOCKED', pool: amount * 2 };
    }

    static async settleWager(winnerId, loserId, totalPool) {
        // 1. Settlement Engine deducts 10% Platform Fee from the winning pot
        // 2. Releases the remainder to the winner
        return await SettlementEngine.settleTransaction(winnerId, loserId, totalPool);
    }
}
module.exports = WagerEngine;

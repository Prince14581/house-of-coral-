// services/arenaService.js (Running in its own cluster)
const { publishEvent } = require('./pubSubService');

exports.processBet = async (betData) => {
    // 1. Logic to calculate outcome
    const outcome = { betId: betData.id, status: 'WON', payout: betData.amount * 2 };
    
    // 2. Publish to 'ledger_updates' channel for the main Treasury to handle
    publishEvent('ledger_updates', outcome);
    return outcome;
};

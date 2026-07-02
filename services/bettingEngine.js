// services/bettingEngine.js
const Ledger = require('../models/Ledger');

exports.placeBet = async (userId, amount, gameId, prediction) => {
    // 1. Validate sufficient funds logic here
    
    // 2. Record the bet as PENDING
    const bet = await Ledger.create({
        userId,
        amount,
        pillar: 'ARENA',
        status: 'PENDING',
        meta: { gameId, prediction }
    });

    return { success: true, betId: bet._id };
};

exports.settleBet = async (betId, outcome) => {
    // Logic to update status based on game result
    await Ledger.updateOne({ _id: betId }, { 
        status: outcome === 'WIN' ? 'WON' : 'LOST' 
    });
};

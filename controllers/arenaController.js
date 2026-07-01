const Bet = require('../models/Bet');
const { processEscrow } = require('../services/transactionDispatcher');

// Place a bet
exports.placeBet = async (req, res) => {
    try {
        const { userId, gameId, amount, odds } = req.body;
        
        // 1. Create the bet record
        const bet = new Bet({ userId, gameId, amount, odds });
        await bet.save();

        // 2. Lock the funds in the Escrow Engine
        await processEscrow({
            senderId: userId,
            receiverId: 'ARENA_POOL',
            amount: parseFloat(amount),
            pillarType: 'ARENA',
            activityId: bet._id
        });

        res.status(201).json({ message: "Bet placed and secured in escrow.", betId: bet._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Settle a bet
exports.settleBet = async (req, res) => {
    try {
        const { betId, status } = req.body; // status: 'won' or 'lost'
        const bet = await Bet.findById(betId);

        if (status === 'won') {
            const winnings = bet.amount * bet.odds;
            // Pay out the user
            await processEscrow({
                senderId: 'ARENA_POOL',
                receiverId: bet.userId,
                amount: winnings,
                pillarType: 'ARENA_PAYOUT',
                activityId: bet._id
            });
        }

        bet.status = status;
        await bet.save();
        res.status(200).json({ message: `Bet settled as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

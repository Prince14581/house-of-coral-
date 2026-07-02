// services/fairPlayService.js
const crypto = require('crypto');

// Generate a random server seed for the round
exports.generateRoundSeed = () => crypto.randomBytes(32).toString('hex');

// Create a commitment hash to prove the result wasn't manipulated
exports.generateCommitment = (seed, outcome) => {
    return crypto
        .createHmac('sha256', seed)
        .update(outcome)
        .digest('hex');
};

// Validate the result
exports.verifyResult = (seed, outcome, commitment) => {
    const check = this.generateCommitment(seed, outcome);
    return check === commitment;
};

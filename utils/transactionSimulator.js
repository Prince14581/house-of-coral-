const { processTransaction } = require('../services/treasuryService');

/**
 * Simulates random platform activity
 * @param {number} userCount - Number of users to simulate
 * @param {number} transactionsPerUser - Transactions per user
 */
const runTransactionSimulator = async (userCount, transactionsPerUser) => {
    console.log(`--- Starting Simulation: ${userCount * transactionsPerUser} Transactions ---`);
    
    const pillars = ['Stage', 'RhythmHub', 'GlobalLink', 'HeartStrings', 'Bazaar', 'TerraHouse', 'Arena', 'Jubilee'];
    let totalGross = 0;
    let totalFees = 0;

    for (let i = 0; i < userCount; i++) {
        for (let j = 0; j < transactionsPerUser; j++) {
            // Randomly select a pillar and a transaction amount (e.g., $10 to $500)
            const randomPillar = pillars[Math.floor(Math.random() * pillars.length)];
            const randomAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
            
            // Dummy IDs for simulation
            const senderId = `user_${i}`;
            const recipientId = `seller_${j}`;

            // Process via your Treasury Service
            const result = await processTransaction(randomAmount, senderId, recipientId, randomPillar);

            if (result.success) {
                totalGross += randomAmount;
                totalFees += result.platformFee;
            }
        }
    }

    console.log(`--- Simulation Complete ---`);
    console.log(`Total GMV Processed: $${totalGross.toFixed(2)}`);
    console.log(`Total Treasury Revenue (10%): $${totalFees.toFixed(2)}`);
    console.log(`---------------------------`);
};

// Example: Run 50 users, 5 transactions each
// runTransactionSimulator(50, 5);

module.exports = { runTransactionSimulator };

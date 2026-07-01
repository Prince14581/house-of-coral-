// services/reconciliationService.js
const Ledger = require('../models/Ledger');
const { getVaultBalance } = require('./vaultGateway'); // New function to fetch current vault status

/**
 * Hourly integrity check.
 * If the sum of ledger transactions does not match the vault,
 * we trigger a global halt.
 */
exports.runIntegrityCheck = async () => {
    try {
        const ledgerTotal = await Ledger.aggregate([
            { $match: { type: 'fee' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const vaultBalance = await getVaultBalance(); // Call your private node

        if (ledgerTotal[0].total !== vaultBalance) {
            console.error("CRITICAL: Reconciliation Failure! Triggering Kill Switch.");
            await triggerGlobalHalt(); // Function to disable API endpoints
        }
    } catch (err) {
        console.error("Reconciliation Service Error:", err.message);
    }
};

async function triggerGlobalHalt() {
    // Logic: Set a flag in Redis or DB that middleware checks
    // If flag is true, all API requests return 503 (Maintenance Mode)
    await GlobalStatus.update({ name: 'platform_active' }, { value: false });
}

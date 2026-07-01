// services/emergencyService.js
const Ledger = require('../models/Ledger');
const { sendAlert } = require('./alertService');

/**
 * Emergency Halt & Snapshot: Freezes the system and logs the state.
 */
exports.emergencyHaltPlatform = async (reason) => {
    try {
        console.error(`[EMERGENCY_HALT] Reason: ${reason}`);

        // 1. Snapshot: Identify the last 50 transactions for investigation
        const recentActivity = await Ledger.find().sort({ timestamp: -1 }).limit(50);
        
        // 2. Lock the Platform: Set the global status
        // Assume you have a SystemStatus model or config table
        await SystemStatus.findOneAndUpdate(
            { id: 'global_config' },
            { 
                $set: { 
                    isLocked: true, 
                    lockReason: reason, 
                    lockedAt: new Date(),
                    lastSnapshot: recentActivity 
                } 
            },
            { upsert: true }
        );

        // 3. Notify Admin with context
        await sendAlert(`🚨 SYSTEM HALTED: ${reason}. Snapshot captured.`, "CRITICAL");
        
        return { success: true };
    } catch (err) {
        console.error("Critical failure during emergency halt:", err);
    }
};

/**
 * Automated/Manual Recovery: Validates the fix before unlocking.
 */
exports.recoverPlatform = async (adminAuthToken) => {
    // 1. Authenticate Admin (Critical)
    if (!verifyAdmin(adminAuthToken)) throw new Error("Unauthorized");

    // 2. Re-run Integrity Check to ensure the fix is applied
    const integrity = await runIntegrityCheck(); 
    
    if (integrity.status === 'PASSED') {
        await SystemStatus.findOneAndUpdate(
            { id: 'global_config' },
            { $set: { isLocked: false, lockReason: null } }
        );
        return { message: "Platform successfully restored." };
    } else {
        throw new Error("Cannot unlock: Drift still detected.");
    }
};

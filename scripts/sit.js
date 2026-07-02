// scripts/sit.js
const axios = require('axios');

async function runSIT() {
    const CONCURRENT_USERS = 100;
    const API_BASE = 'http://localhost:3000/api';
    
    console.log(`[SIT] Initiating burst of ${CONCURRENT_USERS} requests...`);

    // Simulate concurrent purchase requests
    const tasks = Array.from({ length: CONCURRENT_USERS }).map((_, i) => {
        return axios.post(`${API_BASE}/bazaar/buy-recharge`, {
            userId: `user_${i}`,
            phone: '08012345678',
            amount: 1000,
            reference: `ref_${i}_${Date.now()}` // Unique reference for each
        }).catch(err => ({ status: 'FAILED', message: err.response?.data?.error }));
    });

    const results = await Promise.all(tasks);
    
    const successes = results.filter(r => r.status !== 'FAILED').length;
    const failures = results.filter(r => r.status === 'FAILED').length;

    console.log(`[SIT] Completed.`);
    console.log(`[SIT] Successful Transactions: ${successes}`);
    console.log(`[SIT] Rejected Transactions: ${failures}`);
    
    if (failures > 0) {
        console.log(`[SIT] Alert: ${failures} transactions were blocked. Verify security logs.`);
    }
}

runSIT();

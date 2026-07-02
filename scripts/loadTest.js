// scripts/loadTest.js
const axios = require('axios');

async function simulateProductionLoad() {
    const REQUESTS_PER_PILLAR = 250;
    const API_URL = 'http://localhost:3000/api';

    console.log("[LOAD TEST] Starting multi-pillar stress test...");

    const tasks = Array.from({ length: REQUESTS_PER_PILLAR }).map((_, i) => {
        // Simulating simultaneous requests to Jubilee (Ticketing) and Bazaar (Recharge)
        const call1 = axios.post(`${API_URL}/jubilee/buy-ticket`, { eventId: 'EVT_001', userId: i });
        const call2 = axios.post(`${API_URL}/bazaar/buy-recharge`, { userId: i, amount: 100, reference: `ref_${i}` });
        
        return Promise.all([call1, call2]);
    });

    try {
        await Promise.all(tasks);
        console.log("[LOAD TEST] Production simulation finished successfully.");
    } catch (err) {
        console.error("[LOAD TEST] System Alert: PillarGuard may have tripped due to load.");
    }
}

simulateProductionLoad();

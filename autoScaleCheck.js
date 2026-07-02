// scripts/autoScaleCheck.js
const os = require('os');
const logger = require('../services/logger');

const checkHealth = () => {
    const cpuLoad = os.loadavg()[0]; // 1-minute load average
    const freeMemory = os.freemem() / os.totalmem();

    if (cpuLoad > 0.8) { // If CPU usage is over 80%
        logger.error("High load detected: Triggering cluster scale-out.");
        // Logic to notify Kubernetes/AWS to add instances
    }
};

setInterval(checkHealth, 60000); // Check every minute

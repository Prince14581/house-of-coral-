// services/rhythmScheduler.js
const cron = require('node-cron');
const { performTransition } = require('./rhythmTransitionEngine');

// Runs every minute to ensure seamless transitions
cron.schedule('* * * * *', async () => {
    try {
        await performTransition();
    } catch (err) {
        // Log silently to avoid flooding console, or send alert
    }
});

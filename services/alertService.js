// services/alertService.js

/**
 * Alert Service: Securely pushes integrity alerts to Webhooks.
 */
exports.sendAlert = async (message, severity = 'CRITICAL') => {
    // Ensure your environment variable ALERT_WEBHOOK_URL is set in Render
    const webhookUrl = process.env.ALERT_WEBHOOK_URL; 
    
    if (!webhookUrl) {
        console.warn("[ALERT_SYSTEM] No WEBHOOK_URL found. Check your environment variables.");
        return;
    }

    try {
        const payload = {
            content: `**[${severity}] House-of-Coral Integrity Alert**`,
            embeds: [{
                title: "Reconciliation Service Triggered",
                description: message,
                color: severity === 'CRITICAL' ? 16711680 : 16776960, // Red for critical, Yellow for warn
                timestamp: new Date().toISOString(),
                footer: { text: "System Integrity Monitor" }
            }]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Webhook responded with status ${response.status}`);
        
        console.log(`[ALERT_SYSTEM] ${severity} alert dispatched successfully.`);
    } catch (err) {
        console.error("[ALERT_SYSTEM] Failed to dispatch alert:", err.message);
    }
};

// scripts/auditConnections.js
const fs = require('fs');
const path = require('path');

const pillars = ['bazaar', 'arena', 'stage', 'rhythm', 'global-link', 'heartstrings', 'jubilee', 'terrahouse'];

const auditSecurity = () => {
    console.log("--- Starting Security Audit ---");
    
    pillars.forEach(pillar => {
        const routePath = path.join(__dirname, `../routes/${pillar}.js`);
        
        if (fs.existsSync(routePath)) {
            const content = fs.readFileSync(routePath, 'utf8');
            // Check if pillarGuard is implemented
            if (!content.includes('pillarGuard')) {
                console.error(`[SECURITY ALERT] ${pillar.toUpperCase()} lacks pillarGuard protection!`);
            } else {
                console.log(`[PASSED] ${pillar.toUpperCase()} connectivity secured.`);
            }
        }
    });
};

auditSecurity();

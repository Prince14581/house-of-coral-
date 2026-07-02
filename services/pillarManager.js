// services/pillarManager.js
const SystemStatus = require('../models/SystemStatus');

const PILLARS = ['STAGE', 'RHYTHM', 'GLOBAL', 'HEARTSTRINGS', 'BAZAAR', 'TERRAHOUSE', 'ARENA', 'JUBILEE'];

exports.checkPillarHealth = async () => {
    const status = await SystemStatus.findOne({ id: 'global_config' });
    if (status && status.isLocked) {
        return { active: false, reason: 'SYSTEM_LOCKED' };
    }
    return { active: true, pillars: PILLARS };
};

// services/rhythmService.js
const RhythmContent = require('../models/RhythmContent');

exports.scheduleContent = async (data) => {
    return await RhythmContent.create({ ...data, status: 'PENDING' });
};

exports.getLiveContent = async () => {
    // Returns content currently set to 'LIVE'
    return await RhythmContent.find({ status: 'LIVE' });
};

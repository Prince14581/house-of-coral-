const AnalyticsService = require('../services/analyticsService');

exports.getVendorDashboard = async (req, res) => {
  try {
    // Only return data for the authenticated vendor
    const stats = await AnalyticsService.getMarketplaceStats(req.user.userId);
    res.status(200).json({
      vendorId: req.user.userId,
      ...stats,
      generatedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Analytics engine error' });
  }
};

const EscrowEngine = require('../../../core/escrow/services/escrow.service');
const Property = require('../models/property.model');

exports.initiatePurchase = async (req, res) => {
    const { propertyId, buyerId } = req.body;
    const property = await Property.findById(propertyId);

    // 1. Lock the money in Escrow
    await EscrowEngine.holdFunds(buyerId, property.value, propertyId);

    // 2. Update property status to 'escrow'
    property.status = 'escrow';
    await property.save();

    res.json({ success: true, message: "Funds held in escrow. Awaiting deed transfer." });
};

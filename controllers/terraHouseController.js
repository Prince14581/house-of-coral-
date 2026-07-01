const Property = require('../models/Property');
const { processEscrow } = require('../services/transactionDispatcher');

exports.listProperty = async (req, res) => {
    try {
        const property = new Property(req.body);
        await property.save();
        res.status(201).json({ message: "Property listed successfully", property });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.purchaseProperty = async (req, res) => {
    try {
        const { propertyId, buyerId, amount } = req.body;
        const property = await Property.findById(propertyId);

        if (!property || property.status !== 'available') {
            return res.status(404).json({ message: "Property not available" });
        }

        // Trigger Escrow Engine (10% Treasury Fee, 90% to Owner)
        await processEscrow({
            senderId: buyerId,
            receiverId: property.ownerId,
            amount: parseFloat(amount),
            pillarType: 'TERRAHOUSE',
            activityId: propertyId
        });

        property.status = 'sold';
        await property.save();

        res.status(200).json({ message: "Purchase complete. Treasury fee routed." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

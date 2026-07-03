const Property = require('../models/Property');

// 1. List a property
exports.listProperty = async (req, res) => {
    try {
        const newProperty = await Property.create({ ...req.body, ownerId: req.user.id });
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ message: "Failed to list property", error: error.message });
    }
};

// 2. Search nearby properties (requires [longitude, latitude])
exports.searchNearby = async (req, res) => {
    const { lng, lat, maxDistance } = req.query; // maxDistance in meters
    try {
        const properties = await Property.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(maxDistance) || 5000
                }
            }
        });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
};

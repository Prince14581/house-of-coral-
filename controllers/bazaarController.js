const Bazaar = require('../models/Bazaar');

exports.createItem = async (req, res) => {
    const { amount, itemName } = req.body;
    const fee = amount * 0.10; // The Treasury Logic
    // Logic to save item and calculate fee
    res.json({ message: "Item listed", fee: fee });
};

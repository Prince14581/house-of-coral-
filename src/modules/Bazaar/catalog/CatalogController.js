// src/modules/Bazaar/catalog/CatalogController.js
const CatalogModel = require('./CatalogModel');
const InventoryModel = require('../inventory/InventoryModel');

exports.createListing = async (req, res) => {
    try {
        const { name, price, stock, ...details } = req.body;
        
        // 1. Create Catalog Entry
        const product = await CatalogModel.create({ ...details, sellerId: req.user.id });
        
        // 2. Create Initial Inventory Record
        const inventory = await InventoryModel.create({
            productId: product._id,
            price,
            stockCount: stock
        });

        res.status(201).json({ product, inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

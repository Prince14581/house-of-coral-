// src/modules/Bazaar/inventory/InventoryService.js
const InventoryModel = require('./InventoryModel');

class InventoryService {
    static async reduceStock(productId, quantity) {
        // Atomic update prevents race conditions (Atomic decrement)
        const result = await InventoryModel.findOneAndUpdate(
            { productId, stockCount: { $gte: quantity } },
            { $inc: { stockCount: -quantity } },
            { new: true }
        );

        if (!result) throw new Error('Insufficient stock or item not found.');
        return result;
    }
}

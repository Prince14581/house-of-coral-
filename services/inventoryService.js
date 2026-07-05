const Product = require('../models/Product');

class InventoryService {
  async updateStock(productId, change) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    
    // Check if resulting stock is negative
    if (product.stockQuantity + change < 0) throw new Error('Insufficient stock');
    
    product.stockQuantity += change;
    return await product.save();
  }

  async getVendorInventory(sellerId) {
    return await Product.find({ sellerId });
  }
}
module.exports = new InventoryService();

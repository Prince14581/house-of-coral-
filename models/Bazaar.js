const mongoose = require('mongoose');
const BazaarSchema = new mongoose.Schema({
    itemName: String,
    price: Number,
    sellerId: String
});
module.exports = mongoose.model('Bazaar', BazaarSchema);

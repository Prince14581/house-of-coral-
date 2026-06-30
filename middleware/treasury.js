/**
 * Treasury Middleware
 * Intercepts transactions and calculates the 10% platform fee.
 */
exports.calculateTreasuryFee = (req, res, next) => {
    // Only process fees for transactions involving a price
    if (req.method === 'POST' && req.body.price) {
        const price = parseFloat(req.body.price);
        
        if (!isNaN(price) && price > 0) {
            const fee = price * 0.10;
            const netAmount = price - fee;

            // Attach fee data to the request object so it can be 
            // accessed by the route controllers
            req.transactionData = {
                originalPrice: price,
                platformFee: fee,
                netToSeller: netAmount
            };

            console.log(`Treasury Node: 10% fee of ${fee} calculated for transaction.`);
        }
    }
    next();
};

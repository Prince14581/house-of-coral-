const mongoose = require('mongoose');

// Import Schemas
const Product = require('./Product');
const Wallet = require('./Wallet');

// Register Event Listeners only once
if (mongoose.connection.listenerCount('connected') === 0) {
    mongoose.connection.on('connected', () => console.log('MongoDB: Connection Established'));
    mongoose.connection.on('disconnected', () => console.log('MongoDB: Disconnected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB Error:', err));
}

let connectionPromise = null;

/**
 * Robust Database Connection Bootstrap
 * Uses promise caching to handle concurrent startup requests safely.
 */
const connectDB = async (uri) => {
    if (!uri) {
        throw new Error('MongoDB connection URI is required.');
    }

    // Return existing connection if already established
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // Return the ongoing promise if connection is in progress
    if (connectionPromise) {
        return connectionPromise;
    }

    // Initiate new connection
    connectionPromise = mongoose.connect(uri, {
        maxPoolSize: Number(process.env.MONGO_POOL_SIZE) || 20,
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5
    });

    try {
        await connectionPromise;
        return mongoose.connection;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    } finally {
        // Reset promise after resolution/rejection
        connectionPromise = null;
    }
};

module.exports = {
    mongoose,
    connectDB,
    Product,
    Wallet,
    models: {
        Product,
        Wallet
    }
};

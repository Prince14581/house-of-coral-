// scripts/resetShadow.js
require('dotenv').config({ path: '.env.shadow' });
const mongoose = require('mongoose');

async function reset() {
    try {
        await mongoose.connect(process.env.DB_URI);
        await mongoose.connection.dropDatabase();
        console.log("Shadow Database Reset Complete.");
        process.exit();
    } catch (err) {
        console.error("Reset Failed:", err.message);
    }
}
reset();

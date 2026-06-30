require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Database Connection (The robust way) ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log("Successfully connected to MongoDB Atlas");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1); 
  }
};
connectDB();

// --- Import Pillar Routes ---
const bazaarRoutes = require('./routes/bazaar');
// Add other pillar routes here as you build them

// --- Route Registry ---
app.use('/api/bazaar', bazaarRoutes);
// app.use('/api/stage', stageRoutes); 

// --- Global Treasury Middleware ---
app.use((req, res, next) => {
    // This is where you intercept transactions for the 10% fee calculation
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`House-of-Coral Ecosystem running on port ${PORT}`));

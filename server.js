require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Import Pillar Routes ---
const bazaarRoutes = require('./routes/bazaar');
// Add other imports here as you build them (stage, rhythm, etc.)

// --- Route Registry ---
app.use('/api/bazaar', bazaarRoutes);
// app.use('/api/stage', stageRoutes); 

// --- Global Treasury Logic (Middleware) ---
// This ensures every marketplace transaction is intercepted for the 10% fee
app.use((req, res, next) => {
    // You can expand this logic to check for specific transaction endpoints
    next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to House-of-Coral Treasury Database'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`House-of-Coral Ecosystem running on port ${PORT}`));

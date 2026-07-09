require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pillarConn, vaultConn } = require('./config/database'); // DB Connections

// Import Routes
const authRoutes = require('./routes/auth');
const pillarRoutes = require('./routes/pillars');

// Import Background Services
const { runIntegrityCheck } = require('./services/reconciliationService');

const app = express();

// --- 1. Security & Hardening ---
app.use(helmet()); 
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json());

// Rate Limiter: Prevent Brute Force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per window
});
app.use('/api/auth', authLimiter);

// --- 2. Health & Monitoring ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'active',
        dbPillar: pillarConn.readyState === 1 ? 'connected' : 'disconnected',
        dbVault: vaultConn.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// --- 3. Routing ---
app.use('/api/auth', authRoutes);
app.use('/api/pillars', pillarRoutes);

// --- 4. Background Security ---
// The "Kill Switch" runs every hour (3,600,000ms)
setInterval(runIntegrityCheck, 3600000);

// --- 5. Global Error Handler ---
// Sanitizes output to prevent leaking stack traces in production
app.use((err, req, res, next) => {
    console.error(`[INTERNAL_ERROR]: ${err.message}`);
    res.status(500).json({ error: "An unexpected platform error occurred." });
});

// --- 6. Server Initialization ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`[SYSTEM] House-of-Coral initialized on port ${PORT}`);
});

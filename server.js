require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const compression = require('compression');
const jwt = require('jsonwebtoken');

// Pillar Modules
const bazaarRoutes = require('./routes/bazaar');
const orderRoutes = require('./routes/orders'); // Separate order route
const { calculateTreasuryFee } = require('./middleware/treasury');
const { verifyUser } = require('./middleware/auth');

if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGIN) {
    throw new Error('FATAL ERROR: ALLOWED_ORIGIN must be set in production.');
}

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
server.requestTimeout = 30000;

const allowedOrigin = process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*';

const io = new Server(server, { 
    transports: ['websocket'],
    cors: { origin: allowedOrigin, methods: ["GET", "POST"] } 
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => res.status(200).json({ success: true, status: 'OK' }));

// Dedicated Routing (Fixed duplication)
app.use('/api/bazaar/orders', verifyUser, calculateTreasuryFee, orderRoutes);
app.use('/api/bazaar', verifyUser, bazaarRoutes);

// Socket.IO Auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Unauthorized"));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error("Invalid Token"));
        socket.user = decoded;
        next();
    });
});

// Startup & Shutdown
const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
};

async function startServer() {
    await connectDB();
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => console.log(`🚀 House-of-Coral running on ${PORT}`));
}

const shutdown = async () => {
    io.close();
    await mongoose.connection.close();
    server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const DUMMY_HASH = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/zBkqquzaBjYv1x38H45h8pD.j2';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

/**
 * Register: relies on express-validator middleware for sanitization/validation.
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const newUser = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        AuditLog.create({ 
            action: 'REGISTER', actorId: newUser._id, collectionName: 'User', 
            documentId: newUser._id, status: 'success',
            metadata: { ip: req.ip, userAgent: req.get('user-agent') }
        }).catch(err => console.error('AuditLog Register Fail:', err));

        res.status(201).json({ status: 'success', userId: newUser._id });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ status: 'error', message: 'Email already registered.' });
        console.error({ route: req.originalUrl, method: req.method, error: error.message, stack: error.stack });
        res.status(500).json({ status: 'error', message: 'Registration failed.' });
    }
};

/**
 * Login: incorporates JTI, explicit algorithm, and standard claims.
 */
exports.login = async (req, res) => {
    try {
        // Configuration safety check
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured.');

        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        
        const user = await User.findOne({ email: normalizedEmail, deletedAt: null, status: 'active' });
        const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
        
        if (!user || !isMatch) {
            AuditLog.create({ 
                action: 'LOGIN', status: 'failed', 
                metadata: { email: normalizedEmail, ip: req.ip, userAgent: req.get('user-agent') } 
            }).catch(err => console.error('AuditLog Login Fail:', err));
            return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { sub: user._id.toString(), role: user.role }, 
            process.env.JWT_SECRET, 
            { 
                algorithm: 'HS256',
                jwtid: crypto.randomUUID(),
                expiresIn: '15m', 
                issuer: 'House-of-Coral', 
                audience: 'house-of-coral-users' 
            }
        );

        AuditLog.create({ 
            action: 'LOGIN', actorId: user._id, collectionName: 'User', 
            documentId: user._id, status: 'success',
            metadata: { ip: req.ip, userAgent: req.get('user-agent') }
        }).catch(err => console.error('AuditLog Login Success Fail:', err));

        res.status(200).json({ 
            status: 'success', 
            token, 
            user: { id: user._id, username: user.username, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error({ route: req.originalUrl, method: req.method, error: error.message, stack: error.stack });
        res.status(500).json({ status: 'error', message: 'Login failed.' });
    }
};

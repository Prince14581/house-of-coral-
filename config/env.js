require('dotenv').config();

const validateEnv = () => {
    // 1. Required Variables Presence
    const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'BCRYPT_ROUNDS', 'NODE_ENV'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) throw new Error(`FATAL: Missing: ${missing.join(', ')}`);

    // 2. Value Constraints
    if (!['development', 'test', 'production'].includes(process.env.NODE_ENV))
        throw new Error('NODE_ENV must be development, test, or production');

    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error('PORT must be an integer between 1 and 65535');

    // 3. Security Hardening & Weak Secret Detection
    const weakSecrets = ['changeme', 'password', 'secret', 'jwtsecret', '123456', 'admin', 'houseofcoral'];
    const secrets = [process.env.JWT_SECRET, process.env.JWT_REFRESH_SECRET];

    if (secrets.some(s => s.length < 32)) 
        throw new Error('JWT secrets must be at least 32 characters');

    if (process.env.NODE_ENV === 'production' && secrets.some(s => weakSecrets.includes(s.toLowerCase())))
        throw new Error('Insecure production configuration: Weak secret detected.');

    const rounds = Number(process.env.BCRYPT_ROUNDS);
    if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15)
        throw new Error('BCRYPT_ROUNDS must be integer between 10 and 15');

    if (!process.env.MONGODB_URI.startsWith('mongodb'))
        throw new Error('Invalid MongoDB connection string');
};

validateEnv();

module.exports = Object.freeze({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS),
    NODE_ENV: process.env.NODE_ENV,
    PORT: Number(process.env.PORT || 3000)
});

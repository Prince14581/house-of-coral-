// config/database.js
const mongoose = require('mongoose');

// This uses process.env, which changes based on .env or .env.shadow
const pillarConn = mongoose.createConnection(process.env.DB_URI);
const vaultConn = mongoose.createConnection(process.env.VAULT_DB_URI);

pillarConn.on('connected', () => console.log(`Connected to ${process.env.DB_NAME} Pillar DB`));
vaultConn.on('connected', () => console.log(`Connected to ${process.env.DB_NAME} Vault DB`));

module.exports = { pillarConn, vaultConn };

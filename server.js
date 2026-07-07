require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { logger } = require('./logger');

async function bootstrap() {
  try {
    // 1. Initial Validation
    require('./config/validate');

    const app = express();
    const server = http.createServer(app);

    // 2. Setup (Middleware, Routes, Sockets)
    require('./config/http')(app);
    const io = require('./config/socket')(server);

    // 3. Database: Await connection before proceeding
    await require('./config/database')(mongoose, logger);

    // 4. Setup Error Handling BEFORE listening
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') logger.error('Port is already in use');
      else logger.error('Server error', e);
      process.exit(1);
    });

    // 5. Start Server
    const PORT = process.env.PORT || 10000;
    await new Promise((resolve) => server.listen(PORT, resolve));
    logger.info(`House-of-Coral listening on port ${PORT}`);

    // 6. Shutdown Hooks
    require('./config/shutdown')(server, mongoose, io, logger);

    return { app, server, io };
  } catch (err) {
    logger.error('Fatal bootstrap error:', err);
    process.exit(1);
  }
}

// Allow for programmatic usage (testing) or direct execution
if (require.main === module) {
  bootstrap();
}

module.exports = { bootstrap };

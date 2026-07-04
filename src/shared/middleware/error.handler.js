const { error } = require('../helpers/response.helper');

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR]: ${err.message}`);

    // Centralized Error logic
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    error(res, message, statusCode);
};

module.exports = errorHandler;

'use strict';

const logger = require('../../infrastructure/logger/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'error'
                   : res.statusCode >= 400 ? 'warn'
                   : 'info';

    logger[level](`${req.method} ${req.path}`, {
      status:   res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

module.exports = requestLogger;

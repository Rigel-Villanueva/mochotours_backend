'use strict';

const logger = require('../../infrastructure/logger/logger');

const ERROR_MAP = {
  'Credenciales inválidas':    401,
  'Token requerido':           401,
  'Token inválido o expirado': 401,
  'Sin permisos':              403,
  'Elemento no encontrado':    404,
  'No encontrado':             404,
};

function errorMiddleware(err, req, res, next) {
  const status = ERROR_MAP[err.message] || 500;

  if (status === 500) {
    logger.error('Error no controlado', {
      message: err.message,
      stack:   err.stack,
      path:    req.path,
      method:  req.method,
    });
  }

  const isDev = process.env.NODE_ENV !== 'production';

  res.status(status).json({
    success: false,
    error:   status === 500
      ? (isDev ? `[DEV] ${err.message}` : 'Error interno del servidor')
      : err.message,
  });
}

module.exports = errorMiddleware;

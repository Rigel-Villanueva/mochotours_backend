'use strict';

// Carga las variables de entorno ANTES de cualquier otro require.
require('dotenv').config();

const { createApp } = require('./src/app');
const logger        = require('./src/infrastructure/logger/logger');

const PORT = process.env.PORT || 3000;

async function main() {
  const app = createApp();

  app.listen(PORT, () => {
    logger.info(`🚀 Mochotours API corriendo`, {
      port:    PORT,
      env:     process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    });
  });
}

// Captura errores fatales no manejados para evitar caídas silenciosas.
process.on('uncaughtException',  (err) => { logger.error('uncaughtException',  { err }); process.exit(1); });
process.on('unhandledRejection', (err) => { logger.error('unhandledRejection', { err }); process.exit(1); });

main();

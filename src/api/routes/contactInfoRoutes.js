'use strict';

const express = require('express');

/**
 * Registra rutas para contact-info
 * @param {ContactInfoController} controller
 * @param {import('express').RequestHandler} authMiddleware
 */
module.exports = function makeContactInfoRoutes(controller, authMiddleware) {
  const router = express.Router();

  // Público: cualquier visitante puede ver info de contacto
  router.get('/', controller.get);

  // Admin: upsert
  router.post('/', authMiddleware, controller.upsert);

  return router;
};

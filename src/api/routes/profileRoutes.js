'use strict';

const { Router } = require('express');

/**
 * Rutas de perfil del admin.
 * Todas requieren authMiddleware (token válido + rol admin).
 *
 * GET  /api/auth/profile  → obtener datos del perfil
 * PUT  /api/auth/profile  → actualizar nombre del perfil
 */
module.exports = (controller, authMiddleware) => {
  const router = Router();

  router.get('/profile', authMiddleware, controller.get);
  router.put('/profile', authMiddleware, controller.update);

  return router;
};

'use strict';

const { Router } = require('express');

/**
 * Rutas del log de actividad del admin.
 * Todas requieren authMiddleware.
 *
 * GET  /api/admin/activity       → listar actividades recientes
 * POST /api/admin/activity       → registrar nueva actividad
 */
module.exports = (controller, authMiddleware) => {
  const router = Router();

  router.get('/',  authMiddleware, controller.list);
  router.post('/', authMiddleware, controller.create);

  return router;
};

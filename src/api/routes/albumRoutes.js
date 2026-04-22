'use strict';

const { Router } = require('express');

module.exports = (controller, authMiddleware) => {
  const router = Router();

  router.get('/', controller.listar);
  router.get('/slug/:slug', controller.obtenerPorSlug);
  router.get('/:id', authMiddleware, controller.obtenerPorId);
  
  router.post('/', authMiddleware, controller.crear);
  router.put('/:id', authMiddleware, controller.actualizar);
  router.delete('/:id', authMiddleware, controller.eliminar);

  return router;
};

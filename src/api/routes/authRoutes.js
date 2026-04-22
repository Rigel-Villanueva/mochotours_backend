'use strict';

const { Router } = require('express');
const validate        = require('../middlewares/validate');
const { loginSchema } = require('../dtos/galeriaSchemas');

module.exports = (controller) => {
  const router = Router();

  router.post('/login',
    validate(loginSchema),
    controller.login
  );

  // Ruta de refresh — NO lleva authMiddleware porque el access_token
  // ya está expirado cuando el frontend llama aquí.
  router.post('/refresh', controller.refresh);

  return router;
};

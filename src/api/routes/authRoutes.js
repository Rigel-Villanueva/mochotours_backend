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

  return router;
};

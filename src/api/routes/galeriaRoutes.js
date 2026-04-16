'use strict';

const { Router } = require('express');
const multer     = require('multer');

const validate             = require('../middlewares/validate');
const paginate             = require('../middlewares/paginate');
const { subirMediaSchema } = require('../dtos/galeriaSchemas');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 100 * 1024 * 1024 },
});

module.exports = (controller, authMiddleware) => {
  const router = Router();

  router.get('/',    paginate, controller.listar);
  router.post('/',   authMiddleware, upload.single('file'), validate(subirMediaSchema), controller.subir);
  router.delete('/:id', authMiddleware, controller.eliminar);

  return router;
};

'use strict';

const { Router } = require('express');
const multer     = require('multer');

const validate       = require('../middlewares/validate');
const { upsertSiteContentSchema } = require('../dtos/siteContentSchemas');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo para assets del sitio
});

// =====================================================================
// RUTAS: /api/site-content
// ─────────────────────────────────────────────────────────────────────
// POST /api/site-content → Sube/Actualiza un contenido web (admin auth)
// GET  /api/site-content → Obtiene toda la configuración (public)
// =====================================================================

module.exports = (controller, authMiddleware) => {
  const router = Router();

  router.post('/',
    authMiddleware,
    upload.single('file'),
    validate(upsertSiteContentSchema),
    controller.upsert
  );

  router.get('/',
    controller.getAll
  );

  router.delete('/:seccion',
    authMiddleware,
    controller.delete
  );

  return router;
};

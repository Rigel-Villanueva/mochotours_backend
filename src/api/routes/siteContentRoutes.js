'use strict';

const { Router } = require('express');
const multer     = require('multer');

const authMiddleware = require('../middlewares/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo para assets del sitio
});

// =====================================================================
// RUTAS: /api/site-content
// ─────────────────────────────────────────────────────────────────────
// POST   /api/site-content        → Sube un asset del sitio (admin)
// =====================================================================

module.exports = (controller) => {
  const router = Router();

  router.post('/',
    authMiddleware,
    upload.single('file'),
    controller.subirSiteContent
  );

  return router;
};

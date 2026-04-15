'use strict';

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

// ── Infraestructura (adaptadores secundarios) ─────────────────────────
const SupabaseGaleriaRepository = require('./infrastructure/repositories/SupabaseGaleriaRepository');
const SupabaseFileStorage       = require('./infrastructure/services/SupabaseFileStorage');
const SupabaseAuthService       = require('./infrastructure/services/SupabaseAuthService');

// ── Casos de uso ──────────────────────────────────────────────────────
const SubirMediaUseCase    = require('./application/use-cases/galeria/SubirMediaUseCase');
const ListarGaleriaUseCase = require('./application/use-cases/galeria/ListarGaleriaUseCase');
const EliminarMediaUseCase = require('./application/use-cases/galeria/EliminarMediaUseCase');
const LoginUseCase         = require('./application/use-cases/auth/LoginUseCase');

// ── Controllers ───────────────────────────────────────────────────────
const GaleriaController = require('./api/controllers/GaleriaController');
const AuthController    = require('./api/controllers/AuthController');

// ── Rutas ─────────────────────────────────────────────────────────────
const makeGaleriaRoutes = require('./api/routes/galeriaRoutes');
const makeAuthRoutes    = require('./api/routes/authRoutes');

const SiteContentController  = require('./api/controllers/SiteContentController');
const makeSiteContentRoutes  = require('./api/routes/siteContentRoutes');

// ── Middlewares globales ──────────────────────────────────────────────
const requestLogger  = require('./api/middlewares/requestLogger');
const errorMiddleware = require('./api/middlewares/errorMiddleware');

// =====================================================================
// createApp — Punto de composición (Dependency Injection manual)
// ─────────────────────────────────────────────────────────────────────
// ÚNICO lugar donde se instancian y conectan todas las piezas.
// Las capas internas (dominio, aplicación) no saben cómo se conectan.
// =====================================================================

function createApp() {
  const app = express();

  // ── Middlewares globales ───────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());
  app.use(requestLogger);

  // ── Adaptadores secundarios ────────────────────────────────────────
  const galeriaRepo  = new SupabaseGaleriaRepository();
  const fileStorage  = new SupabaseFileStorage();
  const authService  = new SupabaseAuthService();

  // ── Casos de uso ───────────────────────────────────────────────────
  const subirMedia    = new SubirMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage });
  const listarGaleria = new ListarGaleriaUseCase({ galeriaRepository: galeriaRepo });
  const eliminarMedia = new EliminarMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage });
  const login         = new LoginUseCase({ authService });

  // ── Controllers ────────────────────────────────────────────────────
  const galeriaController = new GaleriaController({
    subirMediaUseCase:    subirMedia,
    listarGaleriaUseCase: listarGaleria,
    eliminarMediaUseCase: eliminarMedia,
  });

  const authController = new AuthController({ loginUseCase: login });
  const siteContentController = new SiteContentController({ fileStorage });

  // ── Rutas ──────────────────────────────────────────────────────────
  app.use('/api/galeria', makeGaleriaRoutes(galeriaController));
  app.use('/api/auth',    makeAuthRoutes(authController));
  app.use('/api/site-content', makeSiteContentRoutes(siteContentController));

  // Ruta de salud — útil para monitoreo y Docker healthcheck
  app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'mochotours-api' }));

  // ── Manejador de errores (SIEMPRE AL FINAL) ────────────────────────
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };

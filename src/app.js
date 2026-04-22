'use strict';

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

// ── Infraestructura (adaptadores secundarios) ─────────────────────────
const SupabaseGaleriaRepository = require('./infrastructure/repositories/SupabaseGaleriaRepository');
const SupabaseAlbumRepository   = require('./infrastructure/repositories/SupabaseAlbumRepository');
const SupabaseSiteContentRepository = require('./infrastructure/repositories/SupabaseSiteContentRepository');
const SupabaseContactInfoRepository = require('./infrastructure/repositories/SupabaseContactInfoRepository');
const SupabaseFileStorage       = require('./infrastructure/services/SupabaseFileStorage');
const SupabaseAuthService       = require('./infrastructure/services/SupabaseAuthService');

// ── Casos de uso ──────────────────────────────────────────────────────
const SubirMediaUseCase    = require('./application/use-cases/galeria/SubirMediaUseCase');
const ListarGaleriaUseCase = require('./application/use-cases/galeria/ListarGaleriaUseCase');
const EliminarMediaUseCase = require('./application/use-cases/galeria/EliminarMediaUseCase');
const LoginUseCase         = require('./application/use-cases/auth/LoginUseCase');

const ListarAlbumesUseCase       = require('./application/use-cases/albumes/ListarAlbumesUseCase');
const ObtenerAlbumPorSlugUseCase = require('./application/use-cases/albumes/ObtenerAlbumPorSlugUseCase');
const CrearAlbumUseCase          = require('./application/use-cases/albumes/CrearAlbumUseCase');
const ActualizarAlbumUseCase     = require('./application/use-cases/albumes/ActualizarAlbumUseCase');
const EliminarAlbumUseCase       = require('./application/use-cases/albumes/EliminarAlbumUseCase');

const UpsertSiteContentUseCase = require('./application/use-cases/site-content/UpsertSiteContentUseCase');
const GetSiteContentUseCase    = require('./application/use-cases/site-content/GetSiteContentUseCase');
const DeleteSiteContentUseCase = require('./application/use-cases/site-content/DeleteSiteContentUseCase');

const UpsertContactInfoUseCase = require('./application/use-cases/contact-info/UpsertContactInfoUseCase');
const GetContactInfoUseCase    = require('./application/use-cases/contact-info/GetContactInfoUseCase');

// ── Controllers ───────────────────────────────────────────────────────
const GaleriaController = require('./api/controllers/GaleriaController');
const AlbumController   = require('./api/controllers/AlbumController');
const AuthController    = require('./api/controllers/AuthController');
const ContactInfoController = require('./api/controllers/ContactInfoController');
const ProfileController     = require('./api/controllers/ProfileController');
const ActivityController    = require('./api/controllers/ActivityController');

// ── Rutas ─────────────────────────────────────────────────────────────
const makeGaleriaRoutes = require('./api/routes/galeriaRoutes');
const makeAlbumRoutes   = require('./api/routes/albumRoutes');
const makeAuthRoutes    = require('./api/routes/authRoutes');
const makeProfileRoutes = require('./api/routes/profileRoutes');
const makeActivityRoutes = require('./api/routes/activityRoutes');

const SiteContentController  = require('./api/controllers/SiteContentController');
const makeSiteContentRoutes  = require('./api/routes/siteContentRoutes');

const makeContactInfoRoutes = require('./api/routes/contactInfoRoutes');

// ── Middlewares globales ──────────────────────────────────────────────
const requestLogger   = require('./api/middlewares/requestLogger');
const errorMiddleware = require('./api/middlewares/errorMiddleware');
const makeAuthMiddleware = require('./api/middlewares/authMiddleware');

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
  const galeriaRepo      = new SupabaseGaleriaRepository();
  const albumRepo        = new SupabaseAlbumRepository();
  const siteContentRepo  = new SupabaseSiteContentRepository();
  const contactInfoRepo  = new SupabaseContactInfoRepository();
  const fileStorage      = new SupabaseFileStorage();
  const authService      = new SupabaseAuthService();

  // ── Casos de uso ───────────────────────────────────────────────────
  const subirMedia    = new SubirMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage });
  const listarGaleria = new ListarGaleriaUseCase({ galeriaRepository: galeriaRepo });
  const eliminarMedia = new EliminarMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage });
  
  const listarAlbumes       = new ListarAlbumesUseCase({ albumRepository: albumRepo });
  const obtenerAlbumPorSlug = new ObtenerAlbumPorSlugUseCase({ albumRepository: albumRepo });
  const crearAlbum          = new CrearAlbumUseCase({ albumRepository: albumRepo });
  const actualizarAlbum     = new ActualizarAlbumUseCase({ albumRepository: albumRepo });
  const eliminarAlbum       = new EliminarAlbumUseCase({ albumRepository: albumRepo });

  const login         = new LoginUseCase({ authService });
  
  const upsertSiteContent = new UpsertSiteContentUseCase({ siteContentRepository: siteContentRepo, fileStorage });
  const getSiteContent    = new GetSiteContentUseCase({ siteContentRepository: siteContentRepo });
  const deleteSiteContent = new DeleteSiteContentUseCase({ siteContentRepository: siteContentRepo });

  const upsertContactInfo = new UpsertContactInfoUseCase({ contactInfoRepository: contactInfoRepo });
  const getContactInfo    = new GetContactInfoUseCase({ contactInfoRepository: contactInfoRepo });

  // ── Controllers ────────────────────────────────────────────────────
  const galeriaController = new GaleriaController({
    subirMediaUseCase:    subirMedia,
    listarGaleriaUseCase: listarGaleria,
    eliminarMediaUseCase: eliminarMedia,
  });

  const albumController = new AlbumController({
    listarAlbumesUseCase:       listarAlbumes,
    obtenerAlbumPorSlugUseCase: obtenerAlbumPorSlug,
    crearAlbumUseCase:          crearAlbum,
    actualizarAlbumUseCase:     actualizarAlbum,
    eliminarAlbumUseCase:       eliminarAlbum,
    albumRepository:            albumRepo,
  });

  const authController = new AuthController({ loginUseCase: login, authService });
  
  const siteContentController = new SiteContentController({ 
    upsertSiteContentUseCase: upsertSiteContent,
    getSiteContentUseCase: getSiteContent,
    deleteSiteContentUseCase: deleteSiteContent
  });

  const contactInfoController = new ContactInfoController({
    upsertContactInfoUseCase: upsertContactInfo,
    getContactInfoUseCase: getContactInfo
  });

  const profileController  = new ProfileController();
  const activityController = new ActivityController();

  // ── Middlewares dinámicos (Inyectados) ─────────────────────────────
  const authMiddleware = makeAuthMiddleware(authService);

  // ── Rutas ──────────────────────────────────────────────────────────
  app.use('/api/galeria', makeGaleriaRoutes(galeriaController, authMiddleware));
  app.use('/api/albumes', makeAlbumRoutes(albumController, authMiddleware));
  app.use('/api/auth',    makeAuthRoutes(authController));
  app.use('/api/auth',    makeProfileRoutes(profileController, authMiddleware));
  app.use('/api/site-content', makeSiteContentRoutes(siteContentController, authMiddleware));
  app.use('/api/contact-info', makeContactInfoRoutes(contactInfoController, authMiddleware));
  app.use('/api/admin/activity', makeActivityRoutes(activityController, authMiddleware));

  // Ruta de salud — útil para monitoreo y Docker healthcheck
  app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'mochotours-api' }));

  // ── Manejador de errores (SIEMPRE AL FINAL) ────────────────────────
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };

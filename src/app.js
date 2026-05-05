'use strict';

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const path    = require('path');

// ── Infraestructura (adaptadores secundarios) ─────────────────────────
const PrismaGaleriaRepository     = require('./infrastructure/repositories/PrismaGaleriaRepository');
const PrismaAlbumRepository       = require('./infrastructure/repositories/PrismaAlbumRepository');
const PrismaSiteContentRepository = require('./infrastructure/repositories/PrismaSiteContentRepository');
const PrismaContactInfoRepository = require('./infrastructure/repositories/PrismaContactInfoRepository');
const LocalFileStorage            = require('./infrastructure/services/LocalFileStorage');
const JwtAuthService              = require('./infrastructure/services/JwtAuthService');
const ImageOptimizer              = require('./infrastructure/services/ImageOptimizer');

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
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());
  app.use(requestLogger);

  // ── Servir archivos estáticos (uploads) ────────────────────────────
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

  // ── Adaptadores secundarios ────────────────────────────────────────
  const galeriaRepo      = new PrismaGaleriaRepository();
  const albumRepo        = new PrismaAlbumRepository();
  const siteContentRepo  = new PrismaSiteContentRepository();
  const contactInfoRepo  = new PrismaContactInfoRepository();
  const fileStorage      = new LocalFileStorage();
  const authService      = new JwtAuthService();
  const imageOptimizer   = new ImageOptimizer();

  // ── Casos de uso ───────────────────────────────────────────────────
  const subirMedia    = new SubirMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage, imageOptimizer });
  const listarGaleria = new ListarGaleriaUseCase({ galeriaRepository: galeriaRepo });
  const eliminarMedia = new EliminarMediaUseCase({ galeriaRepository: galeriaRepo, fileStorage });
  
  const listarAlbumes       = new ListarAlbumesUseCase({ albumRepository: albumRepo });
  const obtenerAlbumPorSlug = new ObtenerAlbumPorSlugUseCase({ albumRepository: albumRepo });
  const crearAlbum          = new CrearAlbumUseCase({ albumRepository: albumRepo });
  const actualizarAlbum     = new ActualizarAlbumUseCase({ albumRepository: albumRepo });
  const eliminarAlbum       = new EliminarAlbumUseCase({ albumRepository: albumRepo });

  const login         = new LoginUseCase({ authService });
  
  const upsertSiteContent = new UpsertSiteContentUseCase({ siteContentRepository: siteContentRepo, fileStorage, imageOptimizer });
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

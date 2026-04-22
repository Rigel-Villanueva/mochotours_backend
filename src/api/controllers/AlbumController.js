'use strict';

const { logActivity } = require('../../infrastructure/services/activityLogger');

class AlbumController {
  constructor({
    listarAlbumesUseCase,
    crearAlbumUseCase,
    actualizarAlbumUseCase,
    eliminarAlbumUseCase,
    obtenerAlbumPorSlugUseCase,
    albumRepository
  }) {
    this.listarAlbumesUseCase = listarAlbumesUseCase;
    this.crearAlbumUseCase = crearAlbumUseCase;
    this.actualizarAlbumUseCase = actualizarAlbumUseCase;
    this.eliminarAlbumUseCase = eliminarAlbumUseCase;
    this.obtenerAlbumPorSlugUseCase = obtenerAlbumPorSlugUseCase;
    this.albumRepository = albumRepository;
  }

  listar = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeStats = req.query.includeStats === 'true';
      const includeInactive = req.user?.rol === 'admin'; // Only admins see inactive albums

      const resultado = await this.listarAlbumesUseCase.execute({ page, limit, includeStats, includeInactive });
      res.json({ success: true, data: resultado.data, meta: resultado.meta });
    } catch (error) {
      next(error);
    }
  };

  obtenerPorSlug = async (req, res, next) => {
    try {
      const album = await this.obtenerAlbumPorSlugUseCase.execute(req.params.slug);
      res.json({ success: true, data: album });
    } catch (error) {
      if (error.message === 'Álbum no encontrado') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const album = await this.albumRepository.findById(req.params.id);
      if (!album) {
        return res.status(404).json({ success: false, message: 'Álbum no encontrado' });
      }
      res.json({ success: true, data: album });
    } catch (error) {
      next(error);
    }
  };

  crear = async (req, res, next) => {
    try {
      const albumData = {
        ...req.body,
        createdBy: req.user.id
      };
      const album = await this.crearAlbumUseCase.execute(albumData);

      logActivity({
        userId: req.user.id,
        actionType: 'create_album',
        actionDescription: `Creaste el álbum "${album.titulo || req.body.titulo}"`,
        entityType: 'album',
        entityId: album.id,
      });

      res.status(201).json({ success: true, data: album, message: 'Álbum creado exitosamente' });
    } catch (error) {
      if (error.message.includes('slug')) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const album = await this.actualizarAlbumUseCase.execute(req.params.id, req.body);

      logActivity({
        userId: req.user.id,
        actionType: 'update_album',
        actionDescription: `Actualizaste el álbum "${album.titulo || 'sin título'}"`,
        entityType: 'album',
        entityId: req.params.id,
      });

      res.json({ success: true, data: album, message: 'Álbum actualizado exitosamente' });
    } catch (error) {
      if (error.message === 'Álbum no encontrado') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('slug')) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  };

  eliminar = async (req, res, next) => {
    try {
      await this.eliminarAlbumUseCase.execute(req.params.id);

      logActivity({
        userId: req.user.id,
        actionType: 'delete_album',
        actionDescription: 'Eliminaste un álbum',
        entityType: 'album',
        entityId: req.params.id,
      });

      res.json({ success: true, message: 'Álbum eliminado exitosamente' });
    } catch (error) {
      if (error.message === 'Álbum no encontrado') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  };
}

module.exports = AlbumController;

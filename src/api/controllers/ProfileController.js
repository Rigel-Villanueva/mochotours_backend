'use strict';

const prisma = require('../../infrastructure/config/prisma');
const logger = require('../../infrastructure/logger/logger');

/**
 * ProfileController — GET / PUT /api/auth/profile
 *
 * Permite al admin obtener y actualizar sus datos de perfil
 * almacenados en la tabla `perfiles`.
 */
class ProfileController {
  constructor() {
    this.get    = this.get.bind(this);
    this.update = this.update.bind(this);
  }

  /**
   * GET /api/auth/profile
   * Requiere authMiddleware (req.user disponible).
   * Devuelve nombre, email, rol.
   */
  async get(req, res, next) {
    try {
      const userId = req.user.id;

      const data = await prisma.perfil.findUnique({
        where: { id: userId },
        select: { nombre: true, rol: true },
      });

      if (!data) {
        logger.warn('ProfileController.get — perfil no encontrado', { userId });
        return res.status(404).json({
          success: false,
          error: 'Perfil no encontrado',
        });
      }

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/auth/profile
   * Body: { nombre }
   * Solo permite actualizar campos de nombre del perfil propio.
   */
  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { nombre } = req.body;

      const updateFields = {};
      if (nombre !== undefined) updateFields.nombre = nombre.trim();

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionaron campos para actualizar',
        });
      }

      const data = await prisma.perfil.update({
        where: { id: userId },
        data: updateFields,
        select: { nombre: true, rol: true },
      });

      return res.json({ success: true, data });
    } catch (err) {
      logger.error('ProfileController.update — error al actualizar perfil', { error: err.message });
      next(err);
    }
  }
}

module.exports = ProfileController;

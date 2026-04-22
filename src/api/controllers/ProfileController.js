'use strict';

const { supabaseAdmin } = require('../../infrastructure/config/supabase');
const logger = require('../../infrastructure/logger/logger');

/**
 * ProfileController — GET / PUT /api/auth/profile
 *
 * Permite al admin obtener y actualizar sus datos de perfil
 * almacenados en la tabla `perfiles` de Supabase.
 */
class ProfileController {
  constructor() {
    this.get    = this.get.bind(this);
    this.update = this.update.bind(this);
  }

  /**
   * GET /api/auth/profile
   * Requiere authMiddleware (req.user disponible).
   * Devuelve primer_nombre, apellido_paterno, apellido_materno, nombre, email, rol.
   */
  async get(req, res, next) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('perfiles')
        .select('nombre, rol')
        .eq('id', userId)
        .single();

      if (error) {
        logger.warn('ProfileController.get — error al obtener perfil', { userId, error: error.message });
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

      const { data, error } = await supabaseAdmin
        .from('perfiles')
        .update(updateFields)
        .eq('id', userId)
        .select('nombre, rol')
        .single();

      if (error) {
        logger.error('ProfileController.update — error al actualizar perfil', { userId, error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar perfil',
        });
      }

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProfileController;

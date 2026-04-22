'use strict';

const { supabaseAdmin } = require('../../infrastructure/config/supabase');
const logger = require('../../infrastructure/logger/logger');

/**
 * ActivityController — GET / POST /api/admin/activity
 *
 * Gestiona el log de actividad del admin. Registra acciones
 * y permite consultar las más recientes.
 */
class ActivityController {
  constructor() {
    this.list   = this.list.bind(this);
    this.create = this.create.bind(this);
  }

  /**
   * GET /api/admin/activity?limit=10
   * Devuelve las últimas N actividades del admin autenticado.
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const limit  = Math.min(parseInt(req.query.limit) || 10, 50);

      const { data, error } = await supabaseAdmin
        .from('admin_activity_log')
        .select('id, action_type, action_description, entity_type, entity_id, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.warn('ActivityController.list — error', { error: error.message });
        // Si la tabla no existe aún, devolver array vacío en vez de error
        return res.json({ success: true, data: [] });
      }

      return res.json({ success: true, data: data || [] });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/activity
   * Body: { action_type, action_description, entity_type?, entity_id?, metadata? }
   * Registra una nueva actividad del admin.
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { action_type, action_description, entity_type, entity_id, metadata } = req.body;

      if (!action_type || !action_description) {
        return res.status(400).json({
          success: false,
          error: 'action_type y action_description son requeridos',
        });
      }

      const { data, error } = await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          user_id: userId,
          action_type,
          action_description,
          entity_type: entity_type || null,
          entity_id: entity_id || null,
          metadata: metadata || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('ActivityController.create — error', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Error al registrar actividad',
        });
      }

      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ActivityController;

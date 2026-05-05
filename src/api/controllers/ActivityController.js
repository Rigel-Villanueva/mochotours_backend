'use strict';

const prisma = require('../../infrastructure/config/prisma');
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

      const data = await prisma.adminActivityLog.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          action_type: true,
          action_description: true,
          entity_type: true,
          entity_id: true,
          metadata: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });

      return res.json({ success: true, data: data || [] });
    } catch (err) {
      // Si la tabla no existe aún, devolver array vacío en vez de error
      logger.warn('ActivityController.list — error', { error: err.message });
      return res.json({ success: true, data: [] });
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

      const data = await prisma.adminActivityLog.create({
        data: {
          user_id: userId,
          action_type,
          action_description,
          entity_type: entity_type || null,
          entity_id: entity_id || null,
          metadata: metadata || null,
        },
      });

      return res.status(201).json({ success: true, data });
    } catch (err) {
      logger.error('ActivityController.create — error', { error: err.message });
      return res.status(500).json({
        success: false,
        error: 'Error al registrar actividad',
      });
    }
  }
}

module.exports = ActivityController;

'use strict';

const prisma = require('../config/prisma');
const logger = require('../logger/logger');

/**
 * Registra una actividad del admin en la tabla admin_activity_log.
 *
 * Diseñado para llamarse de forma "fire-and-forget": nunca lanza
 * excepciones y no bloquea la respuesta al usuario.
 *
 * @param {Object} params
 * @param {string} params.userId - UUID del admin
 * @param {string} params.actionType - Tipo de acción (ej: 'upload_photo')
 * @param {string} params.actionDescription - Texto legible (ej: 'Subiste una foto')
 * @param {string} [params.entityType] - Tipo de entidad ('galeria', 'album', etc.)
 * @param {string} [params.entityId] - UUID de la entidad afectada
 * @param {Object} [params.metadata] - Datos extra en JSON
 */
async function logActivity({ userId, actionType, actionDescription, entityType, entityId, metadata }) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        user_id: userId,
        action_type: actionType,
        action_description: actionDescription,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata || null,
      },
    });
  } catch (err) {
    // Fire-and-forget: loggear pero no lanzar
    logger.warn('logActivity — No se pudo registrar actividad', {
      actionType,
      error: err.message,
    });
  }
}

module.exports = { logActivity };

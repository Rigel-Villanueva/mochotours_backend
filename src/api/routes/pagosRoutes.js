'use strict';

const express = require('express');

/**
 * @swagger
 * tags:
 *   name: Superadmin - Pagos
 *   description: Endpoints exclusivos para superadmin para gestión de pagos
 */

module.exports = function makePagosRoutes(controller, authMiddleware) {
  const router = express.Router();

  // Middleware extra para verificar que sea superadmin
  const requireSuperAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'superadmin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol de superadmin' });
    }
  };

  /**
   * @swagger
   * /api/admin/pagos/actual:
   *   get:
   *     summary: Obtener el pago del mes actual (pendiente o recién pagado)
   *     tags: [Admin - Pagos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: El pago actual
   */
  router.get('/actual', authMiddleware, controller.obtenerActual);

  /**
   * @swagger
   * /api/admin/pagos:
   *   get:
   *     summary: Listar todos los pagos (Historial completo)
   *     tags: [Admin - Pagos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pagos
   */
  router.get('/', authMiddleware, controller.listar);

  /**
   * @swagger
   * /api/admin/pagos/{id}/fecha:
   *   put:
   *     summary: Modificar la fecha de un pago
   *     tags: [Superadmin - Pagos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fecha_pago:
   *                 type: string
   *                 format: date
   *                 example: "2026-07-28"
   *     responses:
   *       200:
   *         description: Fecha modificada
   */
  router.put('/:id/fecha', authMiddleware, requireSuperAdmin, controller.modificarFecha);

  /**
   * @swagger
   * /api/admin/pagos/{id}/pagar:
   *   put:
   *     summary: Marcar como pagado y crear el mes siguiente
   *     tags: [Superadmin - Pagos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Pago registrado y siguiente mes generado
   */
  router.put('/:id/pagar', authMiddleware, requireSuperAdmin, controller.marcarPagadoYGenerarSiguiente);

  return router;
};

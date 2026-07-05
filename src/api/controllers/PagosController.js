'use strict';

const prisma = require('../../infrastructure/config/prisma');
const { logActivity } = require('../../infrastructure/services/activityLogger');

class PagosController {
  
  listar = async (req, res, next) => {
    try {
      const pagos = await prisma.pagos.findMany({
        orderBy: { fecha_pago: 'desc' }
      });
      res.json({ success: true, data: pagos });
    } catch (error) {
      next(error);
    }
  };

  obtenerActual = async (req, res, next) => {
    try {
      // El pago actual siempre es el último generado (el más reciente)
      const pagoActual = await prisma.pagos.findFirst({
        orderBy: { fecha_pago: 'desc' }
      });
      res.json({ success: true, data: pagoActual });
    } catch (error) {
      next(error);
    }
  };
  
  modificarFecha = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fecha_pago } = req.body;

      if (!fecha_pago) {
        return res.status(400).json({ success: false, message: 'La fecha de pago es requerida' });
      }

      const pago = await prisma.pagos.update({
        where: { id: parseInt(id) },
        data: { fecha_pago: new Date(fecha_pago) }
      });

      logActivity({
        userId: req.user.id,
        actionType: 'update_pago_fecha',
        actionDescription: `Modificaste la fecha del pago ID ${id}`,
        entityType: 'pagos',
        entityId: id,
      });

      res.json({ success: true, data: pago, message: 'Fecha de pago modificada exitosamente' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Pago no encontrado' });
      }
      next(error);
    }
  };

  marcarPagadoYGenerarSiguiente = async (req, res, next) => {
    try {
      const { id } = req.params;

      // 1. Obtener el pago actual
      const pagoActual = await prisma.pagos.findUnique({
        where: { id: parseInt(id) }
      });

      if (!pagoActual) {
        return res.status(404).json({ success: false, message: 'Pago no encontrado' });
      }

      if (pagoActual.pagado) {
        return res.status(400).json({ success: false, message: 'Este pago ya estaba marcado como pagado' });
      }

      // 2. Calcular la fecha del próximo mes
      const nextDate = new Date(pagoActual.fecha_pago);
      nextDate.setMonth(nextDate.getMonth() + 1);

      // 3. Ejecutar actualización y creación en una transacción
      const [pagoActualizado, nuevoPago] = await prisma.$transaction([
        prisma.pagos.update({
          where: { id: parseInt(id) },
          data: { pagado: true }
        }),
        prisma.pagos.create({
          data: {
            fecha_pago: nextDate,
            pagado: false
          }
        })
      ]);

      logActivity({
        userId: req.user.id,
        actionType: 'pay_and_generate',
        actionDescription: `Marcaste como pagado el ID ${id} y se generó el mes siguiente`,
        entityType: 'pagos',
        entityId: id,
      });

      res.json({ 
        success: true, 
        data: {
          pagoActualizado,
          nuevoPagoGenerado: nuevoPago
        }, 
        message: 'Pago registrado y siguiente mes generado exitosamente' 
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PagosController;

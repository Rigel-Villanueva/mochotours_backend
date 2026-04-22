'use strict';

const { logActivity } = require('../../infrastructure/services/activityLogger');

class SiteContentController {
  constructor({ upsertSiteContentUseCase, getSiteContentUseCase, deleteSiteContentUseCase }) {
    this.upsertSiteContentUseCase = upsertSiteContentUseCase;
    this.getSiteContentUseCase = getSiteContentUseCase;
    this.deleteSiteContentUseCase = deleteSiteContentUseCase;

    this.upsert = this.upsert.bind(this);
    this.getAll = this.getAll.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * POST /api/site-content
   * Body (form-data):
   *   seccion     (requerido)
   *   titulo      (opcional)
   *   descripcion (opcional)
   *   file        (opcional, imagen a subir)
   */
  async upsert(req, res, next) {
    try {
      const { seccion, titulo, descripcion } = req.body;
      const file = req.file;

      const result = await this.upsertSiteContentUseCase.execute({
        seccion,
        titulo,
        descripcion,
        file
      });

      // Registrar actividad
      logActivity({
        userId: req.user.id,
        actionType: 'update_content',
        actionDescription: `Actualizaste la sección "${seccion}" del sitio web`,
        entityType: 'contenido',
        entityId: result.id || null,
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/site-content
   */
  async getAll(req, res, next) {
    try {
      const data = await this.getSiteContentUseCase.execute();
      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/site-content/:seccion
   */
  async delete(req, res, next) {
    try {
      const { seccion } = req.params;
      await this.deleteSiteContentUseCase.execute(seccion);

      // Registrar actividad
      logActivity({
        userId: req.user.id,
        actionType: 'delete_content',
        actionDescription: `Eliminaste el contenido de la sección "${seccion}"`,
        entityType: 'contenido',
      });

      return res.status(200).json({
        success: true,
        message: 'Contenido eliminado correctamente'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SiteContentController;

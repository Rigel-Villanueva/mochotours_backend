'use strict';

const { logActivity } = require('../../infrastructure/services/activityLogger');

class ContactInfoController {
  constructor({ getContactInfoUseCase, upsertContactInfoUseCase }) {
    this.getContactInfoUseCase = getContactInfoUseCase;
    this.upsertContactInfoUseCase = upsertContactInfoUseCase;

    this.get = this.get.bind(this);
    this.upsert = this.upsert.bind(this);
  }

  /**
   * GET /api/contact-info
   */
  async get(req, res, next) {
    try {
      const data = await this.getContactInfoUseCase.execute();
      return res.status(200).json({
        success: true,
        data: data || {}
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/contact-info
   * Body (json):
   *   phonePrimary, phoneSecondary, email, googleMapsUrl, instagramUrl, facebookUrl, tiktokUrl
   */
  async upsert(req, res, next) {
    try {
      const result = await this.upsertContactInfoUseCase.execute(req.body);

      // Registrar actividad
      logActivity({
        userId: req.user.id,
        actionType: 'update_contact',
        actionDescription: 'Actualizaste la información de contacto y redes sociales',
        entityType: 'contacto',
        entityId: result?.id || null,
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactInfoController;

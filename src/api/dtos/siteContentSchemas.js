'use strict';

const Joi = require('joi');

const upsertSiteContentSchema = Joi.object({
  seccion: Joi.string().required().max(100),
  titulo: Joi.string().optional().allow('', null).max(255),
  descripcion: Joi.string().optional().allow('', null),
});

module.exports = {
  upsertSiteContentSchema,
};

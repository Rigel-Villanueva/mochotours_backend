'use strict';

const { z } = require('zod');

const upsertSiteContentSchema = z.object({
  seccion: z.string().max(100),
  titulo: z.string().max(255).optional().or(z.literal('')),
  descripcion: z.string().optional().or(z.literal('')),
});

module.exports = {
  upsertSiteContentSchema,
};

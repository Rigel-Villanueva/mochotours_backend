'use strict';

const { z } = require('zod');

const subirMediaSchema = z.object({
  tipo:        z.enum(['imagen', 'video']),
  titulo:      z.string().max(120).optional(),
  descripcion: z.string().max(500).optional(),
  width:       z.number().int().positive().optional(),
  height:      z.number().int().positive().optional(),
  durationSeg: z.number().positive().optional(),
});

const loginSchema = z.object({
  email:    z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});

module.exports = { subirMediaSchema, loginSchema };

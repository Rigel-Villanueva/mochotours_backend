'use strict';

const { supabase } = require('../../infrastructure/config/supabase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }

    req.user  = { id: user.id, email: user.email };
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;

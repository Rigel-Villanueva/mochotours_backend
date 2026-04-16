'use strict';

/**
 * Fábrica de middleware que inyecta AuthService
 * @param {Object} authService 
 */
function makeAuthMiddleware(authService) {
  return async function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Token requerido' });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const user = await authService.verifyTokenAndRole(token);
        
        if (user.rol !== 'admin') {
          return res.status(403).json({ success: false, error: 'Acceso denegado: Permisos de Administrador requeridos' });
        }

        req.user  = user;
        req.token = token;
        next();
      } catch (validationError) {
        return res.status(401).json({ success: false, error: validationError.message });
      }

    } catch (err) {
      next(err);
    }
  };
}

module.exports = makeAuthMiddleware;

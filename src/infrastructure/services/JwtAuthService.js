'use strict';

const prisma  = require('../config/prisma');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const logger  = require('../logger/logger');

const JWT_SECRET      = process.env.JWT_SECRET || 'mochotours-secret-key-change-in-production';
const JWT_EXPIRES_IN  = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET || 'mochotours-refresh-secret-change-in-production';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

class JwtAuthService {

  /**
   * Inicia sesión con email y contraseña.
   * Devuelve accessToken, refreshToken y datos del usuario.
   */
  async signIn({ email, password }) {
    // 1. Buscar usuario por email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn('signIn — usuario no encontrado', { email });
      throw new Error('Credenciales inválidas');
    }

    // 2. Comparar contraseña
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      logger.warn('signIn — contraseña incorrecta', { email });
      throw new Error('Credenciales inválidas');
    }

    // 3. Generar tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  /**
   * Renueva la sesión usando un refresh_token válido.
   * Genera un nuevo access_token y un nuevo refresh_token.
   */
  async refreshSession(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET);

      // Verificar que el usuario aún existe
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: { id: user.id, email: user.email },
      };
    } catch (err) {
      logger.warn('refreshSession — token inválido o expirado');
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
  }

  /**
   * Verifica un access_token JWT y obtiene el rol del usuario.
   * Usado por el authMiddleware.
   */
  async verifyTokenAndRole(token) {
    try {
      // 1. Decodificar y verificar el JWT
      const payload = jwt.verify(token, JWT_SECRET);

      // 2. Obtener el rol desde la tabla perfiles
      const perfil = await prisma.perfil.findUnique({
        where: { id: payload.id },
        select: { rol: true },
      });

      if (!perfil) {
        throw new Error('Perfil de usuario no encontrado');
      }

      return {
        id: payload.id,
        email: payload.email,
        rol: perfil.rol,
      };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Utilidad: hashea una contraseña para almacenarla en la BD.
   * Útil para crear el primer usuario admin.
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
}

module.exports = JwtAuthService;

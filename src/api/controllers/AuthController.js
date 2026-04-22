'use strict';

class AuthController {
  constructor({ loginUseCase, authService }) {
    this._login = loginUseCase;
    this._authService = authService;
    this.login   = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  async login(req, res, next) {
    try {
      const result = await this._login.execute(req.body);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/refresh
   * Body: { refreshToken: string }
   * Devuelve nuevos accessToken + refreshToken
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'refreshToken es requerido',
        });
      }

      const result = await this._authService.refreshSession(refreshToken);
      return res.json({ success: true, data: result });
    } catch (err) {
      // Si el refresh falla, devolver 401 para forzar re-login
      return res.status(401).json({
        success: false,
        error: err.message || 'Sesión expirada. Inicia sesión nuevamente.',
      });
    }
  }
}

module.exports = AuthController;


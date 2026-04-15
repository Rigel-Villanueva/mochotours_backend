'use strict';

class LoginUseCase {
  constructor({ authService }) {
    this.authService = authService;
  }

  async execute({ email, password }) {
    if (!email || !password) throw new Error('Email y contraseña son requeridos');
    return await this.authService.signIn({ email, password });
  }
}

module.exports = LoginUseCase;

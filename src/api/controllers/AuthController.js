'use strict';

class AuthController {
  constructor({ loginUseCase }) {
    this._login = loginUseCase;
    this.login  = this.login.bind(this);
  }

  async login(req, res, next) {
    try {
      const result = await this._login.execute(req.body);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;

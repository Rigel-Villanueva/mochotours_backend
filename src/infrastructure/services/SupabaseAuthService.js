'use strict';

const { supabase } = require('../config/supabase');
const logger       = require('../logger/logger');

class SupabaseAuthService {
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logger.warn('signIn — credenciales inválidas', { email });
      throw new Error('Credenciales inválidas');
    }

    return {
      accessToken: data.session.access_token,
      user: { id: data.user.id, email: data.user.email },
    };
  }
}

module.exports = SupabaseAuthService;

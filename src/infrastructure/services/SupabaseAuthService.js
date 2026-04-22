'use strict';

const { supabase, supabaseAdmin } = require('../config/supabase');
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
      refreshToken: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    };
  }

  /**
   * Renueva la sesión usando un refresh_token válido.
   * Supabase genera un nuevo access_token y un nuevo refresh_token.
   */
  async refreshSession(refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      logger.warn('refreshSession — refresh_token inválido o expirado');
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    };
  }

  async verifyTokenAndRole(token) {
    // 1. Validar el token y obtener el usuario auth (usamos supabaseAdmin
    //    porque es stateless — no depende de sesiones internas del cliente)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new Error('Token inválido o expirado');
    }

    // 2. Obtener su rol en perfiles (admin client bypasses RLS)
    const { data: perfilData, error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfilData) {
      throw new Error('Perfil de usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      rol: perfilData.rol
    };
  }
}

module.exports = SupabaseAuthService;


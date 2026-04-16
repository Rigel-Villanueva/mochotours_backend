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

  async verifyTokenAndRole(token) {
    // 1. Validar el token y obtener el usuario auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Token inválido o expirado');
    }

    // 2. Obtener su rol en perfiles
    const { data: perfilData, error: perfilError } = await supabase
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

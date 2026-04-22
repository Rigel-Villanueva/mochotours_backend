'use strict';

const FileStorage       = require('../../domain/ports/FileStorage');
const { supabaseAdmin } = require('../config/supabase');
const logger            = require('../logger/logger');

class SupabaseFileStorage extends FileStorage {

  async upload({ bucket, path, buffer, mimeType }) {
    const { error } = await supabaseAdmin.storage
      .from(bucket).upload(path, buffer, { contentType: mimeType, upsert: true });

    if (error) { logger.error('upload', { error: error.message }); throw new Error(`Error al subir archivo: ${error.message}`); }
    return { path, publicUrl: this.getPublicUrl(bucket, path) };
  }

  async remove(bucket, path) {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) { logger.error('remove', { error: error.message }); throw new Error(`Error al eliminar archivo: ${error.message}`); }
  }

  getPublicUrl(bucket, path) {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

module.exports = SupabaseFileStorage;

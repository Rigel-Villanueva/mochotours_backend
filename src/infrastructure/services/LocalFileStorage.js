'use strict';

const FileStorage = require('../../domain/ports/FileStorage');
const logger      = require('../logger/logger');
const path        = require('path');
const fs          = require('fs');

// Directorio base donde se guardarán los archivos
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'public', 'uploads');

class LocalFileStorage extends FileStorage {

  constructor() {
    super();
    // Asegurar que el directorio de uploads exista
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async upload({ bucket, path: filePath, buffer, mimeType }) {
    try {
      // Crear subdirectorio del bucket si no existe
      const bucketDir = path.join(UPLOADS_DIR, bucket);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
      }

      const fullPath = path.join(bucketDir, filePath);

      // Crear subdirectorios intermedios si el filePath tiene carpetas
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, buffer);

      const publicUrl = this.getPublicUrl(bucket, filePath);
      return { path: filePath, publicUrl };
    } catch (err) {
      logger.error('LocalFileStorage.upload', { error: err.message });
      throw new Error(`Error al subir archivo: ${err.message}`);
    }
  }

  async remove(bucket, filePath) {
    try {
      const fullPath = path.join(UPLOADS_DIR, bucket, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      logger.error('LocalFileStorage.remove', { error: err.message });
      throw new Error(`Error al eliminar archivo: ${err.message}`);
    }
  }

  getPublicUrl(bucket, filePath) {
    const baseUrl = process.env.UPLOADS_BASE_URL || '';
    return `${baseUrl}/uploads/${bucket}/${filePath}`;
  }
}

module.exports = LocalFileStorage;

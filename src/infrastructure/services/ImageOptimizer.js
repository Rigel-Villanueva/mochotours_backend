'use strict';

const sharp  = require('sharp');
const logger = require('../logger/logger');

/**
 * Servicio de optimización de imágenes.
 * Convierte automáticamente a WebP manteniendo alta calidad
 * pero reduciendo el peso hasta un 70% vs JPG/PNG.
 */
class ImageOptimizer {

  /**
   * Convierte un buffer de imagen a WebP optimizado.
   * Si el archivo NO es imagen (ej: video), lo devuelve tal cual.
   *
   * @param {Buffer}  buffer   - Buffer original del archivo
   * @param {string}  mimeType - Ej: 'image/png', 'image/jpeg', 'video/mp4'
   * @param {Object}  [opts]
   * @param {number}  [opts.quality=82]   - Calidad WebP (1-100). 82 es el sweet-spot calidad/peso.
   * @param {number}  [opts.maxWidth=2400] - Ancho máximo en px (para no guardar fotos de 6000px).
   * @returns {Promise<{ buffer: Buffer, mimeType: string, extension: string }>}
   */
  async optimize(buffer, mimeType, opts = {}) {
    const { quality = 82, maxWidth = 2400 } = opts;

    // Solo optimizamos imágenes reales (no videos, no PDFs, etc.)
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp', 'image/gif'];
    if (!imageTypes.includes(mimeType)) {
      // No es imagen → devolver sin tocar
      const ext = mimeType.split('/')[1] || 'bin';
      return { buffer, mimeType, extension: ext };
    }

    try {
      let pipeline = sharp(buffer);

      // Obtener metadata para saber dimensiones originales
      const metadata = await pipeline.metadata();

      // Redimensionar solo si excede el ancho máximo (mantiene proporción)
      if (metadata.width && metadata.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
      }

      // Convertir a WebP con calidad alta
      const optimizedBuffer = await pipeline
        .webp({ quality, effort: 4 }) // effort 4 = buen balance velocidad/compresión
        .toBuffer();

      const savedPercent = Math.round((1 - optimizedBuffer.length / buffer.length) * 100);
      logger.info('Imagen optimizada a WebP', {
        originalSize: `${(buffer.length / 1024).toFixed(0)}KB`,
        optimizedSize: `${(optimizedBuffer.length / 1024).toFixed(0)}KB`,
        saved: `${savedPercent}%`,
        dimensions: metadata.width ? `${metadata.width}x${metadata.height}` : 'unknown',
      });

      return {
        buffer: optimizedBuffer,
        mimeType: 'image/webp',
        extension: 'webp',
      };
    } catch (err) {
      // Si falla la conversión (archivo corrupto, etc.), subimos el original
      logger.warn('No se pudo optimizar la imagen, subiendo original', { error: err.message });
      const ext = mimeType.split('/')[1] || 'bin';
      return { buffer, mimeType, extension: ext };
    }
  }
}

module.exports = ImageOptimizer;

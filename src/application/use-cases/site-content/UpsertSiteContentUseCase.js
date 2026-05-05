'use strict';

const SiteContent = require('../../../domain/entities/SiteContent');

class UpsertSiteContentUseCase {
  constructor({ siteContentRepository, fileStorage, imageOptimizer }) {
    this.siteContentRepository = siteContentRepository;
    this.fileStorage = fileStorage;
    this.imageOptimizer = imageOptimizer;
  }

  /**
   * @param {Object} input
   * @param {string} input.seccion
   * @param {string} [input.titulo]
   * @param {string} [input.descripcion]
   * @param {Object} [input.file] - { buffer, mimetype, originName }
   * @returns {Promise<SiteContent>}
   */
  async execute({ seccion, titulo, descripcion, file }) {
    let imagenUrl = undefined;

    // 1. Si hay archivo, lo subimos
    if (file) {
      let finalBuffer = file.buffer;
      let finalMime = file.mimetype;
      let finalExt = file.mimetype.split('/')[1] || 'img';

      // Pasamos por el optimizador de imágenes
      if (this.imageOptimizer && finalMime.startsWith('image/')) {
        const optimized = await this.imageOptimizer.optimize(file.buffer, file.mimetype);
        finalBuffer = optimized.buffer;
        finalMime = optimized.mimeType;
        finalExt = optimized.extension;
      }

      const filename  = `${Date.now()}-${Math.floor(Math.random()*1000)}.${finalExt}`;
      const bucket    = 'site-content';
      
      // Clasificar por carpetas segun seccion para ser limpios
      const path = `${seccion}/${filename}`;

      await this.fileStorage.upload({
        bucket: bucket,
        path: path,
        buffer: finalBuffer,
        mimeType: finalMime,
      });

      // Usar la URL base local en lugar de Supabase
      const baseUrl = process.env.UPLOADS_BASE_URL || 'http://localhost:4000';
      imagenUrl = `${baseUrl}/uploads/${bucket}/${path}`;
    }

    // 2. Armamos la entidad con lo que mandaron
    const siteContentInput = new SiteContent({
      seccion,
      titulo,
      descripcion,
      imagenUrl
    });

    // 3. Guardar/Actualizar en el repositorio
    const savedContent = await this.siteContentRepository.upsert(siteContentInput);

    return savedContent;
  }
}

module.exports = UpsertSiteContentUseCase;

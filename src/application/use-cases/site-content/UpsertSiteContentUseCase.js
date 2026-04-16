'use strict';

const SiteContent = require('../../../domain/entities/SiteContent');

class UpsertSiteContentUseCase {
  constructor({ siteContentRepository, fileStorage }) {
    this.siteContentRepository = siteContentRepository;
    this.fileStorage = fileStorage; // Para subir imagen a un bucket
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
      const extension = file.mimetype.split('/')[1] || 'img';
      const filename  = `${Date.now()}-${Math.floor(Math.random()*1000)}.${extension}`;
      const bucket    = 'site-content';
      
      // Clasificar por carpetas segun seccion para ser limpios
      const path = `${seccion}/${filename}`;

      await this.fileStorage.upload({
        bucket: bucket,
        path: path,
        buffer: file.buffer,
        mimeType: file.mimetype,
      });

      imagenUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
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

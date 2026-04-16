'use strict';

/**
 * @interface SiteContentRepository
 * Define los métodos que cualquier adaptador de SiteContent debe implementar.
 */
class SiteContentRepository {
  /**
   * Guarda o actualiza el contenido de una sección.
   * @param {SiteContent} siteContent
   * @returns {Promise<SiteContent>}
   */
  async upsert(siteContent) {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene todos los contenidos de la web.
   * @returns {Promise<SiteContent[]>}
   */
  async getAll() {
    throw new Error('Method not implemented.');
  }

  /**
   * Elimina un contenido de la web por su seccion.
   * @param {string} seccion
   */
  async delete(seccion) {
    throw new Error('Method not implemented.');
  }
}

module.exports = SiteContentRepository;

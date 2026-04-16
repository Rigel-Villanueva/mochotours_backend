'use strict';

class DeleteSiteContentUseCase {
  constructor({ siteContentRepository }) {
    this.siteContentRepository = siteContentRepository;
  }

  async execute(seccion) {
    if (!seccion) {
      throw new Error('La sección es requerida para eliminar el contenido.');
    }
    
    // Solo elimina de base de datos.
    // (Opcional: Si se desea, también puede borrar el archivo del bucket de Supabase usando fileStorage)
    await this.siteContentRepository.delete(seccion);
    
    return true;
  }
}

module.exports = DeleteSiteContentUseCase;

'use strict';

class GetSiteContentUseCase {
  constructor({ siteContentRepository }) {
    this.siteContentRepository = siteContentRepository;
  }

  async execute() {
    const allContent = await this.siteContentRepository.getAll();
    
    // Opcional: Transformar de Array a Objeto para facil consumo en el FrontEnd
    // Ej: { 'hero': { titulo, descripcion... }, 'contacto': { ... } }
    const mapped = {};
    for (const item of allContent) {
      mapped[item.seccion] = {
        titulo: item.titulo,
        descripcion: item.descripcion,
        imagenUrl: item.imagenUrl,
        updatedAt: item.updatedAt
      };
    }

    return mapped;
  }
}

module.exports = GetSiteContentUseCase;

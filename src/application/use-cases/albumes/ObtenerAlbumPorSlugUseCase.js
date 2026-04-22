'use strict';

class ObtenerAlbumPorSlugUseCase {
  constructor({ albumRepository }) {
    this.albumRepository = albumRepository;
  }

  async execute(slug) {
    const album = await this.albumRepository.findBySlug(slug);
    if (!album) {
      throw new Error('Álbum no encontrado');
    }
    return album;
  }
}

module.exports = ObtenerAlbumPorSlugUseCase;

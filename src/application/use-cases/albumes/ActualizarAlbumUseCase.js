'use strict';

const Album = require('../../../domain/entities/Album');

class ActualizarAlbumUseCase {
  constructor({ albumRepository }) {
    this.albumRepository = albumRepository;
  }

  async execute(id, albumData) {
    const existing = await this.albumRepository.findById(id);
    if (!existing) {
      throw new Error('Álbum no encontrado');
    }

    if (albumData.slug && albumData.slug !== existing.slug) {
      const isSlugTaken = await this.albumRepository.checkSlugExists(albumData.slug, id);
      if (isSlugTaken) {
        throw new Error('El slug proporcionado ya está en uso');
      }
    }

    const updatedAlbum = new Album({
      ...existing,
      ...albumData,
      id: existing.id // keep original ID
    });

    return await this.albumRepository.update(updatedAlbum);
  }
}

module.exports = ActualizarAlbumUseCase;

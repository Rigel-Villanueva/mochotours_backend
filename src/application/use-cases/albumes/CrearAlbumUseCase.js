'use strict';

const Album = require('../../../domain/entities/Album');

class CrearAlbumUseCase {
  constructor({ albumRepository }) {
    this.albumRepository = albumRepository;
  }

  async execute(albumData) {
    // Validar unicidad del slug
    let slug = albumData.slug || this._generateSlug(albumData.titulo);
    let isSlugTaken = await this.albumRepository.checkSlugExists(slug);
    
    if (isSlugTaken) {
      if (albumData.slug) {
        throw new Error('El slug proporcionado ya está en uso');
      }
      // Generar uno nuevo agregando un sufijo si se auto-generó
      let suffix = 2;
      while (isSlugTaken) {
        const newSlug = `${slug}-${suffix}`;
        isSlugTaken = await this.albumRepository.checkSlugExists(newSlug);
        if (!isSlugTaken) {
          slug = newSlug;
          break;
        }
        suffix++;
      }
    }

    const album = new Album({
      ...albumData,
      slug
    });

    return await this.albumRepository.save(album);
  }

  _generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with dash
      .replace(/(^-|-$)+/g, '');       // remove leading/trailing dashes
  }
}

module.exports = CrearAlbumUseCase;

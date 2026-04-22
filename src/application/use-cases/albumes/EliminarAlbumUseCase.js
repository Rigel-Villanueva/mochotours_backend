'use strict';

class EliminarAlbumUseCase {
  constructor({ albumRepository }) {
    this.albumRepository = albumRepository;
  }

  async execute(id) {
    const existing = await this.albumRepository.findById(id);
    if (!existing) {
      throw new Error('Álbum no encontrado');
    }
    
    // El soft delete marcará el álbum como eliminado.
    // OJO: Como las fotos tienen ON DELETE CASCADE en base de datos, 
    // un hard delete borraría las fotos. Para un soft delete, las fotos
    // seguirán existiendo pero no serán visibles a través del álbum.
    await this.albumRepository.softDelete(id);
  }
}

module.exports = EliminarAlbumUseCase;

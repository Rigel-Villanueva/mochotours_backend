'use strict';

class ListarAlbumesUseCase {
  constructor({ albumRepository }) {
    this.albumRepository = albumRepository;
  }

  async execute({ page = 1, limit = 10, includeStats = false, includeInactive = false }) {
    return await this.albumRepository.findAll({ page, limit, includeStats, includeInactive });
  }
}

module.exports = ListarAlbumesUseCase;

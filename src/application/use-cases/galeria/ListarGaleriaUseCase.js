'use strict';

class ListarGaleriaUseCase {
  constructor({ galeriaRepository }) {
    this.galeriaRepo = galeriaRepository;
  }

  async execute({ page = 1, limit = 12, albumId = null }) {
    return await this.galeriaRepo.findAll({ page, limit, albumId });
  }
}

module.exports = ListarGaleriaUseCase;

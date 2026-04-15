'use strict';

class ListarGaleriaUseCase {
  constructor({ galeriaRepository }) {
    this.galeriaRepo = galeriaRepository;
  }

  async execute({ page = 1, limit = 12 }) {
    return await this.galeriaRepo.findAll({ page, limit });
  }
}

module.exports = ListarGaleriaUseCase;

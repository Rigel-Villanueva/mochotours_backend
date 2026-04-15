'use strict';

class GaleriaRepository {
  async findAll({ page, limit }) { throw new Error('Not implemented'); }
  async findById(id)             { throw new Error('Not implemented'); }
  async save(galeriaItem)        { throw new Error('Not implemented'); }
  async softDelete(id)           { throw new Error('Not implemented'); }
  async hardDelete(id)           { throw new Error('Not implemented'); }
}

module.exports = GaleriaRepository;

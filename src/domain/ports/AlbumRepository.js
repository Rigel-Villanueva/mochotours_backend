'use strict';

class AlbumRepository {
  async findAll({ page = 1, limit = 10, includeStats = false, includeInactive = false } = {}) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findBySlug(slug) { throw new Error('Not implemented'); }
  async save(album) { throw new Error('Not implemented'); }
  async update(album) { throw new Error('Not implemented'); }
  async softDelete(id) { throw new Error('Not implemented'); }
  async checkSlugExists(slug, excludeId = null) { throw new Error('Not implemented'); }
}

module.exports = AlbumRepository;

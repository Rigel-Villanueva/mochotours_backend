'use strict';

class EliminarMediaUseCase {
  constructor({ galeriaRepository, fileStorage }) {
    this.galeriaRepo = galeriaRepository;
    this.fileStorage = fileStorage;
  }

  async execute(id) {
    // 1. Verificar que el elemento existe
    const item = await this.galeriaRepo.findById(id);
    if (!item) throw new Error('Elemento no encontrado');

    // 2. Eliminar archivo físico del Storage
    await this.fileStorage.remove(item.bucket, item.storagePath);

    // 3. Eliminar registro de la BD (hard delete — borra la fila completamente)
    await this.galeriaRepo.hardDelete(id);

    return { message: 'Elemento eliminado correctamente' };
  }
}

module.exports = EliminarMediaUseCase;

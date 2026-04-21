'use strict';

class UpdateMediaUseCase {
  constructor({ galeriaRepository, fileStorage }) {
    this.galeriaRepo = galeriaRepository;
    this.fileStorage = fileStorage;
  }

  async execute(id, { buffer, mimeType, sizeBytes, tipo, titulo, descripcion }) {
    const itemActual = await this.galeriaRepo.findById(id);
    if (!itemActual) throw new Error('Contenido multimedia no encontrado');

    const dataToUpdate = {};
    if (titulo !== undefined) dataToUpdate.titulo = titulo;
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion;

    // Si viene archivo, lo sustituimos
    if (buffer) {
      if (!tipo) throw new Error('El tipo es requerido al reemplazar archivo');

      // 1. Borrar archivo antiguo para ahorrar espacio (opcional recomendado)
      if (itemActual.storagePath) {
        try {
          await this.fileStorage.remove({ bucket: itemActual.bucket, path: itemActual.storagePath });
        } catch (e) {
          // Ignoramos si el anterior no existía fisicamente
          console.error("Error borrando media antiguo:", e.message);
        }
      }

      // 2. Construir la ruta nueva
      const now       = new Date();
      const anio      = now.getFullYear();
      const mes       = String(now.getMonth() + 1).padStart(2, '0');
      const carpeta   = tipo === 'imagen' ? 'images' : 'videos';
      const extension = mimeType.split('/')[1] || 'bin';
      const filename  = `${Date.now()}.${extension}`;
      const newPath   = `${carpeta}/${anio}/${mes}/${filename}`;

      // 3. Subir nuevo archivo
      await this.fileStorage.upload({ bucket: 'media-gallery', path: newPath, buffer, mimeType });

      dataToUpdate.storagePath = newPath;
      dataToUpdate.mimeType = mimeType;
      dataToUpdate.sizeBytes = sizeBytes;
      dataToUpdate.tipo = tipo;
    }

    return await this.galeriaRepo.update(id, dataToUpdate);
  }
}

module.exports = UpdateMediaUseCase;

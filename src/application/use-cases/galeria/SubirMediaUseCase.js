'use strict';

const GaleriaItem = require('../../../domain/entities/GaleriaItem');

class SubirMediaUseCase {
  constructor({ galeriaRepository, fileStorage }) {
    this.galeriaRepo = galeriaRepository;
    this.fileStorage = fileStorage;
  }

  async execute({ buffer, mimeType, sizeBytes, tipo, uploadedBy, titulo, descripcion, width, height, durationSeg, albumId, altText, destacada }) {
    // 1. Construir ruta organizada por año/mes
    const now       = new Date();
    const anio      = now.getFullYear();
    const mes       = String(now.getMonth() + 1).padStart(2, '0');
    const carpeta   = tipo === 'imagen' ? 'images' : 'videos';
    const extension = mimeType.split('/')[1];
    const filename  = `${Date.now()}.${extension}`;
    const path      = `${carpeta}/${anio}/${mes}/${filename}`;

    // 2. Subir archivo al Storage
    await this.fileStorage.upload({ bucket: 'media-gallery', path, buffer, mimeType });

    // 3. Crear entidad (aplica reglas del dominio)
    const item = new GaleriaItem({
      storagePath: path, mimeType, sizeBytes, tipo,
      uploadedBy, titulo, descripcion, width, height, durationSeg,
      albumId, altText, destacada
    });

    // 4. Persistir metadata en BD
    return await this.galeriaRepo.save(item);
  }
}

module.exports = SubirMediaUseCase;

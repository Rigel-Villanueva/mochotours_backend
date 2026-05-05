'use strict';

const GaleriaItem = require('../../../domain/entities/GaleriaItem');

class SubirMediaUseCase {
  constructor({ galeriaRepository, fileStorage, imageOptimizer }) {
    this.galeriaRepo = galeriaRepository;
    this.fileStorage = fileStorage;
    this.imageOptimizer = imageOptimizer;
  }

  async execute({ buffer, mimeType, sizeBytes, tipo, uploadedBy, titulo, descripcion, width, height, durationSeg, albumId, altText, destacada }) {
    let finalBuffer = buffer;
    let finalMime = mimeType;
    let finalExt = mimeType.split('/')[1];
    let finalSizeBytes = sizeBytes;

    // Si es imagen, la pasamos por el optimizador a WebP
    if (tipo === 'imagen' && this.imageOptimizer) {
      const optimized = await this.imageOptimizer.optimize(buffer, mimeType);
      finalBuffer = optimized.buffer;
      finalMime = optimized.mimeType;
      finalExt = optimized.extension;
      finalSizeBytes = optimized.buffer.length;
    }

    // 1. Construir ruta organizada por año/mes
    const now       = new Date();
    const anio      = now.getFullYear();
    const mes       = String(now.getMonth() + 1).padStart(2, '0');
    const carpeta   = tipo === 'imagen' ? 'images' : 'videos';
    const filename  = `${Date.now()}.${finalExt}`;
    const path      = `${carpeta}/${anio}/${mes}/${filename}`;

    // 2. Subir archivo al Storage
    await this.fileStorage.upload({ bucket: 'media-gallery', path, buffer: finalBuffer, mimeType: finalMime });

    // 3. Crear entidad (aplica reglas del dominio)
    const item = new GaleriaItem({
      storagePath: path, mimeType: finalMime, sizeBytes: finalSizeBytes, tipo,
      uploadedBy, titulo, descripcion, width, height, durationSeg,
      albumId, altText, destacada
    });

    // 4. Persistir metadata en BD
    return await this.galeriaRepo.save(item);
  }
}

module.exports = SubirMediaUseCase;

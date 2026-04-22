'use strict';

class GaleriaItem {
  static TIPOS_VALIDOS = ['imagen', 'video'];
  static MAX_TITLE_LEN = 120;
  static MAX_DESC_LEN  = 500;

  constructor({
    id, storagePath, bucket = 'media-gallery', mimeType, sizeBytes,
    tipo, width = null, height = null, durationSeg = null,
    titulo = null, descripcion = null, isActive = true,
    uploadedBy, createdAt = null, updatedAt = null, deletedAt = null,
    urlMedia = null,
    albumId = null, altText = null, destacada = false, orden = 0,
  }) {
    if (!storagePath)          throw new Error('storagePath es requerido');
    if (!mimeType)             throw new Error('mimeType es requerido');
    if (!uploadedBy)           throw new Error('uploadedBy es requerido');
    if (!sizeBytes || sizeBytes <= 0) throw new Error('sizeBytes debe ser mayor a 0');

    if (!GaleriaItem.TIPOS_VALIDOS.includes(tipo))
      throw new Error(`tipo inválido. Debe ser: ${GaleriaItem.TIPOS_VALIDOS.join(' | ')}`);

    if (titulo && titulo.length > GaleriaItem.MAX_TITLE_LEN)
      throw new Error(`titulo no puede superar ${GaleriaItem.MAX_TITLE_LEN} caracteres`);

    if (descripcion && descripcion.length > GaleriaItem.MAX_DESC_LEN)
      throw new Error(`descripcion no puede superar ${GaleriaItem.MAX_DESC_LEN} caracteres`);

    this.id          = id;
    this.storagePath = storagePath;
    this.bucket      = bucket;
    this.mimeType    = mimeType;
    this.sizeBytes   = sizeBytes;
    this.tipo        = tipo;
    this.width       = width;
    this.height      = height;
    this.durationSeg = durationSeg;
    this.titulo      = titulo      || null;
    this.descripcion = descripcion || null;
    this.isActive    = isActive;
    this.uploadedBy  = uploadedBy;
    this.createdAt   = createdAt;
    this.updatedAt   = updatedAt;
    this.deletedAt   = deletedAt;
    this.urlMedia    = urlMedia;
    this.albumId     = albumId;
    this.altText     = altText;
    this.destacada   = destacada;
    this.orden       = orden;
  }

  desactivar() {
    if (!this.isActive) throw new Error('El elemento ya está desactivado');
    this.isActive = false;
  }

  eliminar() {
    if (this.deletedAt) throw new Error('El elemento ya fue eliminado');
    this.deletedAt = new Date().toISOString();
    this.isActive  = false;
  }

  get esVisible() {
    return this.isActive && !this.deletedAt;
  }
}

module.exports = GaleriaItem;

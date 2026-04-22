'use strict';

class Album {
  static MAX_TITLE_LEN = 120;
  static MAX_DESC_LEN  = 500;

  constructor({
    id, titulo, slug, descripcion = null, 
    coverStoragePath = null, coverBucket = 'media-gallery',
    isActive = true, destacado = false, orden = 0,
    metaTitle = null, metaDescription = null,
    createdBy, createdAt = null, updatedAt = null, deletedAt = null,
    // Transient properties for frontend UI
    coverUrl = null, totalItems = 0, photosCount = 0, videosCount = 0
  }) {
    if (!titulo) throw new Error('El título es requerido');
    if (!slug) throw new Error('El slug es requerido');
    if (!createdBy) throw new Error('El autor (createdBy) es requerido');

    if (titulo.length > Album.MAX_TITLE_LEN)
      throw new Error(`El título no puede superar ${Album.MAX_TITLE_LEN} caracteres`);

    if (descripcion && descripcion.length > Album.MAX_DESC_LEN)
      throw new Error(`La descripción no puede superar ${Album.MAX_DESC_LEN} caracteres`);

    this.id = id;
    this.titulo = titulo;
    this.slug = slug;
    this.descripcion = descripcion;
    this.coverStoragePath = coverStoragePath;
    this.coverBucket = coverBucket;
    this.isActive = isActive;
    this.destacado = destacado;
    this.orden = orden;
    this.metaTitle = metaTitle;
    this.metaDescription = metaDescription;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    
    this.coverUrl = coverUrl;
    this.totalItems = totalItems;
    this.photosCount = photosCount;
    this.videosCount = videosCount;
  }

  desactivar() {
    this.isActive = false;
  }

  eliminar() {
    this.deletedAt = new Date().toISOString();
    this.isActive = false;
  }

  get esVisible() {
    return this.isActive && !this.deletedAt;
  }
}

module.exports = Album;

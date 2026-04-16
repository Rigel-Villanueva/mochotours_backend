'use strict';

class SiteContent {
  constructor({ id, seccion, titulo, descripcion, imagenUrl, createdAt, updatedAt }) {
    this.id = id;
    this.seccion = seccion;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.imagenUrl = imagenUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = SiteContent;

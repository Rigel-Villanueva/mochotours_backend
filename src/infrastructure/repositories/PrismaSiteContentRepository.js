'use strict';

const prisma = require('../config/prisma');
const SiteContent = require('../../domain/entities/SiteContent');
const SiteContentRepository = require('../../domain/ports/SiteContentRepository');

class PrismaSiteContentRepository extends SiteContentRepository {
  /**
   * Mapea un registro de db a entidad de dominio.
   */
  _mapToEntity(row) {
    if (!row) return null;
    return new SiteContent({
      id: row.id,
      seccion: row.seccion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      imagenUrl: row.imagen_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async upsert(siteContent) {
    const dataToSave = {
      seccion: siteContent.seccion,
      titulo: siteContent.titulo || null,
      descripcion: siteContent.descripcion || null,
      updated_at: new Date().toISOString(),
    };

    // Si pasamos imagen, se actualiza, si no se mantiene la que está.
    if (siteContent.imagenUrl !== undefined) {
      dataToSave.imagen_url = siteContent.imagenUrl;
    }

    // Se hace upsert buscando por `seccion` en la base de datos (seccion es UNIQUE)
    try {
      const data = await prisma.contenidoWeb.upsert({
        where: { seccion: siteContent.seccion },
        update: dataToSave,
        create: dataToSave,
      });

      return this._mapToEntity(data);
    } catch (error) {
      throw new Error(`Error en Prisma upsert: ${error.message}`);
    }
  }

  async getAll() {
    try {
      const data = await prisma.contenidoWeb.findMany({
        orderBy: { seccion: 'asc' },
      });
      return data.map(this._mapToEntity.bind(this));
    } catch (error) {
      throw new Error(`Error al listar contenido web: ${error.message}`);
    }
  }

  async delete(seccion) {
    try {
      await prisma.contenidoWeb.delete({
        where: { seccion },
      });
    } catch (error) {
      throw new Error(`Error al eliminar contenido web: ${error.message}`);
    }
  }
}

module.exports = PrismaSiteContentRepository;

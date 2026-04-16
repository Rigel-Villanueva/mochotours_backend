'use strict';

const supabase = require('../config/supabase');
const SiteContent = require('../../domain/entities/SiteContent');
const SiteContentRepository = require('../../domain/ports/SiteContentRepository');

class SupabaseSiteContentRepository extends SiteContentRepository {
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
    const { data, error } = await supabase
      .from('contenido_web')
      .upsert(dataToSave, { onConflict: 'seccion' })
      .select()
      .single();

    if (error) {
      throw new Error(`Error en Supabase upsert: ${error.message}`);
    }

    return this._mapToEntity(data);
  }

  async getAll() {
    const { data, error } = await supabase
      .from('contenido_web')
      .select('*')
      .order('seccion', { ascending: true });

    if (error) {
      throw new Error(`Error al listar contenido web: ${error.message}`);
    }

    return data.map(this._mapToEntity);
  }

  async delete(seccion) {
    const { error } = await supabase
      .from('contenido_web')
      .delete()
      .eq('seccion', seccion);

    if (error) {
      throw new Error(`Error al eliminar contenido web: ${error.message}`);
    }
  }
}

module.exports = SupabaseSiteContentRepository;

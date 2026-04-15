'use strict';

const GaleriaRepository = require('../../domain/ports/GaleriaRepository');
const GaleriaItem       = require('../../domain/entities/GaleriaItem');
const { supabaseAdmin } = require('../config/supabase');
const logger            = require('../logger/logger');

class SupabaseGaleriaRepository extends GaleriaRepository {

  async findAll({ page = 1, limit = 12 }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const { data, error, count } = await supabaseAdmin
      .from('galeria')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) { logger.error('findAll', { error: error.message }); throw new Error(error.message); }

    const totalPages = Math.ceil(count / limit);
    return {
      data: data.map(r => this._toEntity(r)),
      meta: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('galeria').select('*').eq('id', id).single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async save(item) {
    const { data, error } = await supabaseAdmin
      .from('galeria')
      .insert({
        storage_path: item.storagePath,
        bucket:       item.bucket,
        mime_type:    item.mimeType,
        size_bytes:   item.sizeBytes,
        tipo:         item.tipo,
        width:        item.width,
        height:       item.height,
        duration_seg: item.durationSeg,
        titulo:       item.titulo,
        descripcion:  item.descripcion,
        is_active:    item.isActive,
        uploaded_by:  item.uploadedBy,
      })
      .select().single();

    if (error) { logger.error('save', { error: error.message }); throw new Error(error.message); }
    return this._toEntity(data);
  }

  async softDelete(id) {
    const { error } = await supabaseAdmin
      .from('galeria')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async hardDelete(id) {
    const { error } = await supabaseAdmin.from('galeria').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  _toEntity(row) {
    // Construye la URL pública completa para que el frontend pueda mostrar la imagen directamente
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${row.bucket}/${row.storage_path}`;

    return new GaleriaItem({
      id:          row.id,
      storagePath: row.storage_path,
      bucket:      row.bucket,
      mimeType:    row.mime_type,
      sizeBytes:   row.size_bytes,
      tipo:        row.tipo,
      width:       row.width,
      height:      row.height,
      durationSeg: row.duration_seg,
      titulo:      row.titulo,
      descripcion: row.descripcion,
      isActive:    row.is_active,
      uploadedBy:  row.uploaded_by,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
      deletedAt:   row.deleted_at,
      urlMedia:    publicUrl,   // ← URL completa lista para el frontend
    });
  }
}

module.exports = SupabaseGaleriaRepository;

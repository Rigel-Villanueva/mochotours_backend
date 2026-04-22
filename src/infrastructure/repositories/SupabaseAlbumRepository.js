'use strict';

const AlbumRepository = require('../../domain/ports/AlbumRepository');
const Album = require('../../domain/entities/Album');
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../logger/logger');

class SupabaseAlbumRepository extends AlbumRepository {
  async findAll({ page = 1, limit = 10, includeStats = false, includeInactive = false } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('albumes')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('destacado', { ascending: false })
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: albums, error, count } = await query.range(from, to);

    if (error) {
      logger.error('SupabaseAlbumRepository.findAll', { error: error.message });
      throw new Error(error.message);
    }

    let results = albums.map(r => this._toEntity(r));

    if (includeStats && results.length > 0) {
      const albumIds = results.map(a => a.id);
      // Fetch items from galeria for counts + fallback covers
      const { data: galeriaData, error: galeriaError } = await supabaseAdmin
        .from('galeria')
        .select('album_id, tipo, storage_path, bucket')
        .in('album_id', albumIds)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!galeriaError && galeriaData) {
        results = results.map(album => {
          const items = galeriaData.filter(g => g.album_id === album.id);
          const photosCount = items.filter(g => g.tipo === 'imagen').length;
          const videosCount = items.filter(g => g.tipo === 'video').length;
          
          // Fallback cover: use first image if no cover set
          let coverUrl = album.coverUrl;
          if (!coverUrl) {
            const firstImage = items.find(g => g.tipo === 'imagen');
            if (firstImage) {
              coverUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${firstImage.bucket}/${firstImage.storage_path}`;
            }
          }

          return new Album({
            ...album,
            coverUrl,
            totalItems: items.length,
            photosCount,
            videosCount
          });
        });
      }
    }

    const totalPages = Math.ceil(count / limit);
    return {
      data: results,
      meta: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
    };
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('albumes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async findBySlug(slug) {
    const { data, error } = await supabaseAdmin
      .from('albumes')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async checkSlugExists(slug, excludeId = null) {
    let query = supabaseAdmin
      .from('albumes')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null);
      
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1);
    if (error) throw new Error(error.message);
    return data && data.length > 0;
  }

  async save(album) {
    const { data, error } = await supabaseAdmin
      .from('albumes')
      .insert({
        titulo: album.titulo,
        slug: album.slug,
        descripcion: album.descripcion,
        cover_storage_path: album.coverStoragePath,
        cover_bucket: album.coverBucket,
        is_active: album.isActive,
        destacado: album.destacado,
        orden: album.orden,
        meta_title: album.metaTitle,
        meta_description: album.metaDescription,
        created_by: album.createdBy,
      })
      .select()
      .single();

    if (error) {
      logger.error('SupabaseAlbumRepository.save', { error: error.message });
      throw new Error(error.message);
    }
    return this._toEntity(data);
  }

  async update(album) {
    const { data, error } = await supabaseAdmin
      .from('albumes')
      .update({
        titulo: album.titulo,
        slug: album.slug,
        descripcion: album.descripcion,
        cover_storage_path: album.coverStoragePath,
        cover_bucket: album.coverBucket,
        is_active: album.isActive,
        destacado: album.destacado,
        orden: album.orden,
        meta_title: album.metaTitle,
        meta_description: album.metaDescription,
      })
      .eq('id', album.id)
      .select()
      .single();

    if (error) {
      logger.error('SupabaseAlbumRepository.update', { error: error.message });
      throw new Error(error.message);
    }
    return this._toEntity(data);
  }

  async softDelete(id) {
    const { error } = await supabaseAdmin
      .from('albumes')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }

  _toEntity(row) {
    let coverUrl = null;
    if (row.cover_storage_path) {
      coverUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${row.cover_bucket}/${row.cover_storage_path}`;
    }

    return new Album({
      id: row.id,
      titulo: row.titulo,
      slug: row.slug,
      descripcion: row.descripcion,
      coverStoragePath: row.cover_storage_path,
      coverBucket: row.cover_bucket,
      isActive: row.is_active,
      destacado: row.destacado,
      orden: row.orden,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      coverUrl
    });
  }
}

module.exports = SupabaseAlbumRepository;

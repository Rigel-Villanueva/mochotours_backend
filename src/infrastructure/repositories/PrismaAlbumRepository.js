'use strict';

const AlbumRepository = require('../../domain/ports/AlbumRepository');
const Album = require('../../domain/entities/Album');
const prisma = require('../config/prisma');
const logger = require('../logger/logger');

class PrismaAlbumRepository extends AlbumRepository {
  async findAll({ page = 1, limit = 10, includeStats = false, includeInactive = false } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      deleted_at: null,
      ...(includeInactive ? {} : { is_active: true }),
    };

    const [albums, count] = await Promise.all([
      prisma.album.findMany({
        where,
        orderBy: [
          { destacado: 'desc' },
          { orden: 'asc' },
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.album.count({ where }),
    ]);

    let results = albums.map(r => this._toEntity(r));

    if (includeStats && results.length > 0) {
      const albumIds = results.map(a => a.id);

      const galeriaData = await prisma.galeria.findMany({
        where: {
          album_id: { in: albumIds },
          is_active: true,
          deleted_at: null,
        },
        select: {
          album_id: true,
          tipo: true,
          storage_path: true,
          bucket: true,
        },
        orderBy: { created_at: 'desc' },
      });

      results = results.map(album => {
        const items = galeriaData.filter(g => g.album_id === album.id);
        const photosCount = items.filter(g => g.tipo === 'imagen').length;
        const videosCount = items.filter(g => g.tipo === 'video').length;

        // Fallback cover: use first image if no cover set
        let coverUrl = album.coverUrl;
        if (!coverUrl) {
          const firstImage = items.find(g => g.tipo === 'imagen');
          if (firstImage) {
            coverUrl = `${process.env.UPLOADS_BASE_URL || ''}/uploads/${firstImage.bucket}/${firstImage.storage_path}`;
          }
        }

        return new Album({
          ...album,
          coverUrl,
          totalItems: items.length,
          photosCount,
          videosCount,
        });
      });
    }

    const totalPages = Math.ceil(count / limit);
    return {
      data: results,
      meta: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findById(id) {
    try {
      const data = await prisma.album.findFirst({
        where: { id, deleted_at: null },
      });
      if (!data) return null;
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaAlbumRepository.findById', { error: error.message });
      throw new Error(error.message);
    }
  }

  async findBySlug(slug) {
    try {
      const data = await prisma.album.findFirst({
        where: { slug, deleted_at: null },
      });
      if (!data) return null;
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaAlbumRepository.findBySlug', { error: error.message });
      throw new Error(error.message);
    }
  }

  async checkSlugExists(slug, excludeId = null) {
    const where = {
      slug,
      deleted_at: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    const result = await prisma.album.findFirst({ where, select: { id: true } });
    return !!result;
  }

  async save(album) {
    try {
      const data = await prisma.album.create({
        data: {
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
        },
      });
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaAlbumRepository.save', { error: error.message });
      throw new Error(error.message);
    }
  }

  async update(album) {
    try {
      const data = await prisma.album.update({
        where: { id: album.id },
        data: {
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
        },
      });
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaAlbumRepository.update', { error: error.message });
      throw new Error(error.message);
    }
  }

  async softDelete(id) {
    await prisma.album.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  _toEntity(row) {
    let coverUrl = null;
    if (row.cover_storage_path) {
      coverUrl = `${process.env.UPLOADS_BASE_URL || ''}/uploads/${row.cover_bucket}/${row.cover_storage_path}`;
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
      coverUrl,
    });
  }
}

module.exports = PrismaAlbumRepository;

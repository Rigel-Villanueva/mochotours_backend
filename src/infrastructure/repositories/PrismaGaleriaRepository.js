'use strict';

const GaleriaRepository = require('../../domain/ports/GaleriaRepository');
const GaleriaItem       = require('../../domain/entities/GaleriaItem');
const prisma            = require('../config/prisma');
const logger            = require('../logger/logger');

class PrismaGaleriaRepository extends GaleriaRepository {

  async findAll({ page = 1, limit = 12, albumId = null } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      is_active: true,
      deleted_at: null,
      ...(albumId ? { album_id: albumId } : {}),
    };

    const [data, count] = await Promise.all([
      prisma.galeria.findMany({
        where,
        orderBy: [
          { orden: 'asc' },
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.galeria.count({ where }),
    ]);

    const totalPages = Math.ceil(count / limit);
    return {
      data: data.map(r => this._toEntity(r)),
      meta: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findById(id) {
    try {
      const data = await prisma.galeria.findUnique({ where: { id } });
      if (!data) return null;
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaGaleriaRepository.findById', { error: error.message });
      throw new Error(error.message);
    }
  }

  async save(item) {
    try {
      const data = await prisma.galeria.create({
        data: {
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
          album_id:     item.albumId,
          alt_text:     item.altText,
          destacada:    item.destacada,
          orden:        item.orden,
        },
      });
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaGaleriaRepository.save', { error: error.message });
      throw new Error(error.message);
    }
  }

  async update(item) {
    try {
      const data = await prisma.galeria.update({
        where: { id: item.id },
        data: {
          titulo:      item.titulo,
          descripcion: item.descripcion,
          is_active:   item.isActive,
          album_id:    item.albumId,
          alt_text:    item.altText,
          destacada:   item.destacada,
          orden:       item.orden,
        },
      });
      return this._toEntity(data);
    } catch (error) {
      logger.error('PrismaGaleriaRepository.update', { error: error.message });
      throw new Error(error.message);
    }
  }

  async softDelete(id) {
    await prisma.galeria.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  async hardDelete(id) {
    await prisma.galeria.delete({ where: { id } });
  }

  _toEntity(row) {
    // Construye la URL pública usando la ruta local de uploads, incluyendo el bucket
    const publicUrl = `${process.env.UPLOADS_BASE_URL || ''}/uploads/${row.bucket}/${row.storage_path}`;

    return new GaleriaItem({
      id:          row.id,
      storagePath: row.storage_path,
      bucket:      row.bucket,
      mimeType:    row.mime_type,
      sizeBytes:   Number(row.size_bytes), // BigInt -> Number
      tipo:        row.tipo,
      width:       row.width,
      height:      row.height,
      durationSeg: row.duration_seg ? Number(row.duration_seg) : null,
      titulo:      row.titulo,
      descripcion: row.descripcion,
      isActive:    row.is_active,
      uploadedBy:  row.uploaded_by,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
      deletedAt:   row.deleted_at,
      urlMedia:    publicUrl,
      albumId:     row.album_id,
      altText:     row.alt_text,
      destacada:   row.destacada,
      orden:       row.orden,
    });
  }
}

module.exports = PrismaGaleriaRepository;

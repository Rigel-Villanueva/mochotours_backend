'use strict';

class SiteContentController {
  constructor({ fileStorage }) {
    this.fileStorage = fileStorage;
    this.subirSiteContent = this.subirSiteContent.bind(this);
  }

  /**
   * POST /api/site-content
   * Body (form-data):
   *   file    → archivo (imagen)
   *   carpeta → 'hero' | 'logos' | 'footer'  (opcional, default: 'general')
   */
  async subirSiteContent(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Archivo requerido' });
      }

      const carpeta   = req.body.carpeta || 'general';
      const extension = req.file.mimetype.split('/')[1];
      const filename  = `${Date.now()}.${extension}`;
      const path      = `${carpeta}/${filename}`;

      await this.fileStorage.upload({
        bucket:   'site-content',
        path,
        buffer:   req.file.buffer,
        mimeType: req.file.mimetype,
      });

      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;

      return res.status(201).json({
        success: true,
        data: {
          path,
          urlMedia: publicUrl,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SiteContentController;

'use strict';

class GaleriaController {
  constructor({ subirMediaUseCase, listarGaleriaUseCase, eliminarMediaUseCase }) {
    this._subir    = subirMediaUseCase;
    this._listar   = listarGaleriaUseCase;
    this._eliminar = eliminarMediaUseCase;

    this.subir    = this.subir.bind(this);
    this.listar   = this.listar.bind(this);
    this.eliminar = this.eliminar.bind(this);
  }

  async subir(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'Archivo requerido' });

      const item = await this._subir.execute({
        buffer:      req.file.buffer,
        mimeType:    req.file.mimetype,
        sizeBytes:   req.file.size,
        tipo:        req.body.tipo,
        uploadedBy:  req.user.id,
        titulo:      req.body.titulo,
        descripcion: req.body.descripcion,
        width:       req.body.width       ? Number(req.body.width)       : undefined,
        height:      req.body.height      ? Number(req.body.height)      : undefined,
        durationSeg: req.body.durationSeg ? Number(req.body.durationSeg) : undefined,
      });

      return res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const result = await this._listar.execute(req.pagination);
      return res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async eliminar(req, res, next) {
    try {
      const result = await this._eliminar.execute(req.params.id);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}

module.exports = GaleriaController;

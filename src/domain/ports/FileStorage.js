'use strict';

class FileStorage {
  async upload({ bucket, path, buffer, mimeType }) { throw new Error('Not implemented'); }
  async remove(bucket, path)                        { throw new Error('Not implemented'); }
  getPublicUrl(bucket, path)                        { throw new Error('Not implemented'); }
}

module.exports = FileStorage;

'use strict';

/**
 * @interface ContactInfoRepository
 * Define los métodos que cualquier adaptador de ContactInfo debe implementar.
 */
class ContactInfoRepository {
  /**
   * Obtiene la información de contacto actual.
   * @returns {Promise<ContactInfo | null>}
   */
  async get() {
    throw new Error('Method not implemented.');
  }

  /**
   * Guarda o actualiza la información de contacto.
   * @param {ContactInfo} contactInfo
   * @returns {Promise<ContactInfo>}
   */
  async upsert(contactInfo) {
    throw new Error('Method not implemented.');
  }
}

module.exports = ContactInfoRepository;

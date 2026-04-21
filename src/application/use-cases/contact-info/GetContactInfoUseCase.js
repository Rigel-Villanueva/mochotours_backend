'use strict';

class GetContactInfoUseCase {
  constructor({ contactInfoRepository }) {
    this.contactInfoRepository = contactInfoRepository;
  }

  async execute() {
    // Retornar null si no existe, o la entidad
    const contactInfo = await this.contactInfoRepository.get();
    return contactInfo;
  }
}

module.exports = GetContactInfoUseCase;

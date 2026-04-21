'use strict';

const ContactInfo = require('../../../domain/entities/ContactInfo');

class UpsertContactInfoUseCase {
  constructor({ contactInfoRepository }) {
    this.contactInfoRepository = contactInfoRepository;
  }

  async execute(inputData) {
    const contactInfoInput = new ContactInfo({
      phonePrimary: inputData.phonePrimary,
      phoneSecondary: inputData.phoneSecondary,
      email: inputData.email,
      googleMapsUrl: inputData.googleMapsUrl,
      instagramUrl: inputData.instagramUrl,
      facebookUrl: inputData.facebookUrl,
      tiktokUrl: inputData.tiktokUrl,
    });

    return await this.contactInfoRepository.upsert(contactInfoInput);
  }
}

module.exports = UpsertContactInfoUseCase;

'use strict';

class ContactInfo {
  constructor({ id, phonePrimary, phoneSecondary, email, googleMapsUrl, instagramUrl, facebookUrl, tiktokUrl, createdAt, updatedAt }) {
    this.id = id;
    this.phonePrimary = phonePrimary;
    this.phoneSecondary = phoneSecondary;
    this.email = email;
    this.googleMapsUrl = googleMapsUrl;
    this.instagramUrl = instagramUrl;
    this.facebookUrl = facebookUrl;
    this.tiktokUrl = tiktokUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = ContactInfo;

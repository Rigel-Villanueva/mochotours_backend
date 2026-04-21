'use strict';

const { supabaseAdmin } = require('../config/supabase');
const ContactInfo = require('../../domain/entities/ContactInfo');
const ContactInfoRepository = require('../../domain/ports/ContactInfoRepository');

class SupabaseContactInfoRepository extends ContactInfoRepository {
  /**
   * Mapea un registro de bd a entidad de dominio.
   */
  _mapToEntity(row) {
    if (!row) return null;
    return new ContactInfo({
      id: row.id,
      phonePrimary: row.phone_primary,
      phoneSecondary: row.phone_secondary,
      email: row.email,
      googleMapsUrl: row.google_maps_url,
      instagramUrl: row.instagram_url,
      facebookUrl: row.facebook_url,
      tiktokUrl: row.tiktok_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async get() {
    // Tomamos el primero que exista usando .limit(1) y .single()
    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .select('*')
      .limit(1)
      .maybeSingle(); // maybeSingle para no lanzar error si tabla está vacía

    if (error) {
      throw new Error(`Error al obtener información de contacto: ${error.message}`);
    }

    return this._mapToEntity(data);
  }

  async upsert(contactInfo) {
    const dataToSave = {
      phone_primary: contactInfo.phonePrimary || null,
      phone_secondary: contactInfo.phoneSecondary || null,
      email: contactInfo.email || null,
      google_maps_url: contactInfo.googleMapsUrl || null,
      instagram_url: contactInfo.instagramUrl || null,
      facebook_url: contactInfo.facebookUrl || null,
      tiktok_url: contactInfo.tiktokUrl || null,
      updated_at: new Date().toISOString(),
    };

    // Obtenemos el registro actual a ver si existe, para forzar update sobre la misma ID
    const current = await this.get();
    
    if (current && current.id) {
       dataToSave.id = current.id;
    }

    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .upsert(dataToSave)
      .select()
      .single();

    if (error) {
      throw new Error(`Error en upsert Contact Info: ${error.message}`);
    }

    return this._mapToEntity(data);
  }
}

module.exports = SupabaseContactInfoRepository;

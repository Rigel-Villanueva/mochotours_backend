const fs = require('fs');
const path = require('path');
const https = require('http'); // Usando http para localhost

/**
 * Updater de JSON de Fallback
 * Este script se debe configurar en un Cronjob en el servidor
 * para ejecutarse a las 3:00 AM (ej: 0 3 * * * node /ruta/al/script/actualizar-fallback.js)
 */

async function updateFallback() {
  console.log('🔄 Iniciando actualización del JSON de Fallback de Contacto...');
  
  try {
    const backendUrl = process.env.API_URL || 'http://localhost:4000/api';
    const jsonPath = path.resolve(__dirname, '../../../frontend/src/data/contact-info.json');

    const res = await fetch(`${backendUrl}/contact-info`);
    
    if (!res.ok) {
      throw new Error(`Fallback HTTP Error: ${res.status}`);
    }

    const { success, data } = await res.json();

    if (success && data && Object.keys(data).length > 0) {
      // Filtrar valores vacíos para que no reemplacen la estructura del fallback
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v != null && v !== '')
      );

      // Leemos el actual para mezclar
      let currentData = {};
      try {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        currentData = JSON.parse(fileContent);
      } catch (err) {
        console.log('⚠️ No se pudo leer el JSON previo, se creará uno nuevo.');
      }

      const mergedData = { ...currentData, ...cleanData };

      fs.writeFileSync(jsonPath, JSON.stringify(mergedData, null, 2));
      console.log('✅ Fallback JSON actualizado correctamente: ', jsonPath);
    } else {
      console.log('ℹ️ La base de datos no tiene datos válidos aún. Acción cancelada para preservar el JSON original.');
    }

  } catch (error) {
    console.error('❌ Error al actualizar el fallback:', error.message);
    process.exit(1);
  }
}

updateFallback();

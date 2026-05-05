require('dotenv').config();
const prisma = require('../src/infrastructure/config/prisma');

async function updateContactInfo() {
  console.log('🔄 Actualizando información de contacto...');

  // Limpiamos la tabla primero para que quede exactamente como quieres
  await prisma.contactInfo.deleteMany({});

  // Insertamos tu registro
  await prisma.contactInfo.create({
    data: {
      id: '8975e4c6-b252-447e-9385-4f66be2e0bcb',
      phone_primary: '9991200205',
      phone_secondary: '9994166437',
      email: 'mochotours.homun@gmail.com',
      google_maps_url: 'https://maps.app.goo.gl/epEZ3vdkxuceZmgp7',
      instagram_url: 'https://www.instagram.com/mochotours?igsh=cXByOTNmOWprcXlv',
      facebook_url: 'https://www.facebook.com/share/18C6QNCUUg/',
      tiktok_url: 'https://www.tiktok.com/@homun.yuc.mochoto?_r=1&_t=ZS-95i6sSsnp1l',
    },
  });

  console.log('✅ ¡Contactos actualizados correctamente en la base de datos!');
  await prisma.$disconnect();
}

updateContactInfo().catch((err) => {
  console.error('❌ Error al actualizar:', err.message);
  process.exit(1);
});

/**
 * Seed script: Crea el primer usuario admin en la base de datos MySQL.
 *
 * Uso: node scripts/seed-admin.js
 *
 * Credenciales por defecto (cámbialas después):
 *   Email:    mochotours.homun@gmail.com
 *   Password: adminpedro22042026
 */

require('dotenv').config();
const prisma = require('../src/infrastructure/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const email    = 'mochotours.homun@gmail.com';
  const password = 'adminpedro22042026';
  const nombre   = 'Pedro Poot Chan';

  console.log('🔧 Creando usuario admin...');

  // Hash de la contraseña
  const password_hash = await bcrypt.hash(password, 12);

  // Crear o actualizar usuario
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash },
    create: { email, password_hash },
  });

  console.log(`✅ Usuario creado: ${user.email} (ID: ${user.id})`);

  // Crear o actualizar perfil
  await prisma.perfil.upsert({
    where: { id: user.id },
    update: { nombre, rol: 'admin' },
    create: { id: user.id, nombre, rol: 'admin' },
  });

  console.log(`✅ Perfil creado: ${nombre} (rol: admin)`);

  // Crear datos de contacto iniciales si no existen
  const contactExists = await prisma.contactInfo.findFirst();
  if (!contactExists) {
    await prisma.contactInfo.create({
      data: {
        phone_primary: '9991234567',
        email: 'mochotours.homun@gmail.com',
        google_maps_url: 'https://maps.google.com/?q=20.7397,-89.2828',
        instagram_url: 'https://www.instagram.com/mochotours/',
        facebook_url: 'https://www.facebook.com/mochotours/',
        tiktok_url: 'https://www.tiktok.com/@mochotours',
      },
    });
    console.log('✅ Datos de contacto iniciales creados.');
  }

  console.log('\n🎉 ¡Seed completado! Ya puedes iniciar sesión con:');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});

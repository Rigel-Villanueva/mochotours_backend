require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const prisma = require('../src/infrastructure/config/prisma');

// Reemplaza esto con tu URL de Supabase (solo el dominio)
// Ej: "https://xyz.supabase.co"
const SUPABASE_BASE_URL = "https://nsbjrbpfclxyvgvzqpdt.supabase.co"; 

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    // Asegurarse de que el directorio padre existe
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Si ya existe y no queremos sobreescribir, podemos saltarlo (opcional)
    if (fs.existsSync(destPath)) {
      console.log(`⏩ Saltando (ya existe): ${destPath}`);
      return resolve();
    }

    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {}); // Borrar el archivo fallido
        reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {}); // Borrar el archivo fallido
      reject(err);
    });
  });
}

async function startMigration() {
  console.log('🚀 Iniciando descarga masiva de imágenes desde Supabase a Local...');

  // 1. Descargar Galería
  console.log('\n📸 Procesando Galería...');
  const galerias = await prisma.galeria.findMany({
    where: { is_active: true, deleted_at: null }
  });

  for (const item of galerias) {
    if (!item.storage_path || !item.bucket) continue;
    const remoteUrl = `${SUPABASE_BASE_URL}/storage/v1/object/public/${item.bucket}/${item.storage_path}`;
    const localPath = path.join(UPLOADS_DIR, item.bucket, item.storage_path);
    
    try {
      console.log(`Descargando: ${item.storage_path}`);
      await downloadFile(remoteUrl, localPath);
    } catch (err) {
      console.log(`❌ Error al descargar ${item.storage_path}:`, err.message);
    }
  }

  // 2. Descargar Portadas de Álbumes
  console.log('\n📂 Procesando Portadas de Álbumes...');
  const albumes = await prisma.album.findMany({
    where: { is_active: true, deleted_at: null }
  });

  for (const item of albumes) {
    if (!item.cover_storage_path || !item.cover_bucket) continue;
    const remoteUrl = `${SUPABASE_BASE_URL}/storage/v1/object/public/${item.cover_bucket}/${item.cover_storage_path}`;
    const localPath = path.join(UPLOADS_DIR, item.cover_bucket, item.cover_storage_path);
    
    try {
      console.log(`Descargando Portada: ${item.cover_storage_path}`);
      await downloadFile(remoteUrl, localPath);
    } catch (err) {
      console.log(`❌ Error al descargar portada ${item.cover_storage_path}:`, err.message);
    }
  }

  // 3. Descargar Contenido Web (Secciones)
  console.log('\n🌐 Procesando Imágenes de Contenido Web...');
  const contenidos = await prisma.contenidoWeb.findMany();

  for (const item of contenidos) {
    if (!item.imagen_url) continue;
    
    // Contenido web a veces tiene la URL completa de supabase guardada en BD
    // Extraemos el bucket y el path de la URL.
    // Ej: https://xyz.supabase.co/storage/v1/object/public/site-content/inicio/foto.jpg
    const match = item.imagen_url.match(/\/public\/(site-content)\/(.+)$/);
    
    if (match) {
      const bucket = match[1];
      const storagePath = match[2];
      const localPath = path.join(UPLOADS_DIR, bucket, storagePath);
      
      try {
        console.log(`Descargando Web: ${storagePath}`);
        await downloadFile(item.imagen_url, localPath);
      } catch (err) {
        console.log(`❌ Error al descargar web ${storagePath}:`, err.message);
      }
    } else {
       console.log(`⚠️ No se pudo extraer la ruta de: ${item.imagen_url}`);
    }
  }

  console.log('\n✅ ¡MIGRACIÓN DE ARCHIVOS COMPLETADA!');
  await prisma.$disconnect();
}

startMigration().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

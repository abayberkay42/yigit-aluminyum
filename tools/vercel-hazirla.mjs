// Vercel derlemesi: durağan dosyaları public/ klasörüne koyar; Vercel bunları sunucu işlevine uğramadan CDN'den sunar.
//   theme/assets    → public/assets  (tema JS, CSS, yazı tipi, logo, oda görselleri)
//   dev/mock/files  → public/files   (Shopify "Dosyalar" taklidi: üretim fotoğrafları, oda görselleri, 944 film karesi)
// 944 kare işlev üzerinden sunulsaydı her kare ayrı bir işlev çağrısı olurdu.
// Kullanım: npm run vercel-build (Vercel bunu kendisi çalıştırır)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');

fs.rmSync(PUB, { recursive: true, force: true });
const kopyala = (kaynak, hedef) => {
  fs.cpSync(path.join(ROOT, kaynak), path.join(PUB, hedef), { recursive: true });
  const dosyalar = fs.readdirSync(path.join(PUB, hedef), { recursive: true, withFileTypes: true }).filter((d) => d.isFile());
  const bayt = dosyalar.reduce((t, d) => t + fs.statSync(path.join(d.parentPath, d.name)).size, 0);
  console.log(`${kaynak} → public/${hedef}: ${dosyalar.length} dosya, ${(bayt / 1024 / 1024).toFixed(1)} MB`);
};
kopyala('theme/assets', 'assets');
kopyala('dev/mock/files', 'files');

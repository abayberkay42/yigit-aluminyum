// Vercel derlemesi: durağan dosyaları public/ klasörüne koyar; Vercel bunları sunucu işlevine uğramadan CDN'den sunar.
//   theme/assets    → public/assets  (tema JS, CSS, yazı tipi, logo, oda görselleri)
//   dev/mock/files  → public/files   (Shopify "Dosyalar" taklidi: üretim ve oda görselleri, film kareleri)
// Film kareleri işlev üzerinden sunulsaydı her kare ayrı bir işlev çağrısı olurdu.
//
// Kullanım: npm run onizleme-build (vercel.json buildCommand).
// DİKKAT: betik adı "vercel-build" OLMAMALI. Vercel o adı kendiliğinden de çalıştırır; buildCommand ile birlikte
// derleme iki kez ve eşzamanlı koştu, biri public/'i silerken öteki okuyordu (ENOENT, dağıtım 7e0b45a).
// Aynı sebeple kopyalama önce geçici klasöre yapılır ve bitince tek adımda yerine konur: public/ hiçbir an yarım kalmaz.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const GECICI = path.join(ROOT, `.public-${process.pid}`);

fs.rmSync(GECICI, { recursive: true, force: true });
const kopyala = (kaynak, hedef) => {
  fs.cpSync(path.join(ROOT, kaynak), path.join(GECICI, hedef), { recursive: true });
  const dosyalar = fs.readdirSync(path.join(GECICI, hedef), { recursive: true, withFileTypes: true }).filter((d) => d.isFile());
  const bayt = dosyalar.reduce((t, d) => t + fs.statSync(path.join(d.parentPath, d.name)).size, 0);
  console.log(`${kaynak} → public/${hedef}: ${dosyalar.length} dosya, ${(bayt / 1024 / 1024).toFixed(1)} MB`);
};
kopyala('theme/assets', 'assets');
kopyala('dev/mock/files', 'files');

fs.rmSync(PUB, { recursive: true, force: true });
fs.renameSync(GECICI, PUB);
console.log('public/ hazır');

// dev/mock/files içindeki görsellerin ölçülerini dev/mock/files.json'a yazar (yerelde Shopify "Dosyalar" taklidi).
// Şablonlarda shopify://shop_images/<ad> olarak anılır; Shopify'a aktarırken aynı adla Dosyalar'a yüklenir.
// Kullanım: node tools/files-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = path.resolve(import.meta.dirname, '../dev/mock/files');
fs.mkdirSync(dir, { recursive: true });
const out = {};
for (const f of fs.readdirSync(dir).filter((n) => /\.(webp|jpe?g|png|avif)$/i.test(n)).sort()) {
  const [width, height] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(dir, f)])
    .toString().trim().split(',').map(Number);
  out[f] = { width, height };
}
fs.writeFileSync(path.join(dir, '..', 'files.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`${Object.keys(out).length} dosya: ${Object.keys(out).join(', ')}`);

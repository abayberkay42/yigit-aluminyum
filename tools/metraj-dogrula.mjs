// Metraj formülünü firmanın Excel'indeki "Metraj Detayı" sayfasıyla karşılaştırır: hem JS (src/js/store/metraj.js,
// ürün sayfası) hem Liquid (theme/snippets/metraj-fiyat.liquid, sepet) sürümü.
// Excel depoya girmez; satırlar önce python ile çıkarılır:
//   node tools/metraj-dogrula.mjs <metraj.json> <fiyatlar.json>
// metraj.json: { "Y6131": [[m, fiyat_tl, tutar_tl], ...] }, fiyatlar.json: { "Y6131": {liste, dip, esik} }
// İndirimsiz metraj sınırı 100 (firma 2026-09-21 tablosunda 50'den yükseltti).
import fs from 'node:fs';
import { Liquid } from 'liquidjs';
import { metreFiyati } from '../src/js/store/metraj.js';

const [detay, fiyat] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const liquid = new Liquid();
const sablon = liquid.parse(fs.readFileSync(new URL('../theme/snippets/metraj-fiyat.liquid', import.meta.url), 'utf8'));

let satir = 0;
const hatalar = [];
for (const [kod, rows] of Object.entries(detay)) {
  const f = fiyat[kod];
  if (!f) continue;
  for (const [m, excelFiyat, excelTutar] of rows) {
    satir++;
    const liste = Math.round(f.liste * 100);
    const js = metreFiyati(liste, f.dip, f.esik, m);
    const lq = Number((await liquid.render(sablon, { liste, dip: f.dip, esik: f.esik, metre: m, settings: { metraj_baslangic_m: 100 } })).trim());
    const beklenen = Math.round(excelFiyat * 100);
    if (js !== beklenen || lq !== beklenen || js * m !== Math.round(excelTutar * 100)) hatalar.push({ kod, m, js, lq, excelFiyat, excelTutar });
  }
}
console.log(`${satir} satır karşılaştırıldı (JS + Liquid), ${hatalar.length} fark`);
if (hatalar.length) console.log(hatalar.slice(0, 20));
process.exit(hatalar.length ? 1 : 0);

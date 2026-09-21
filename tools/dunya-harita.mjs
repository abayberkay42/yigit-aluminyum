// Ana sayfadaki ihracat bölümünün dünya haritasını üretir.
// Kaynak: Natural Earth (world-atlas, kamu malı) 110m ülke sınırları.
// Çıktı:
//   theme/assets/yigit-dunya.svg  → noktalı dünya (her nokta 1 ızgara hücresi; karadaysa çizilir)
//   theme/snippets/dunya-koordinat.liquid → ülke kodu → harita üzerindeki yüzde konum tablosu (oklar için)
// Harita eşdikdörtgen (equirectangular) izdüşümdür; viewBox 0 0 1000 480, kırpma: boylam -168…190, enlem 78…-56.
import fs from 'node:fs';
import { geoContains, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const dunya = feature(topo, topo.objects.countries);

const LON = [-168, 190];
const LAT = [78, -56];
const W = 1000;
const H = 480;
const ADIM = 1.15; // derece cinsinden nokta aralığı

const x = (lon) => {
  let l = lon;
  if (l < LON[0]) l += 360;
  return ((l - LON[0]) / (LON[1] - LON[0])) * W;
};
const y = (lat) => ((LAT[0] - lat) / (LAT[0] - LAT[1])) * H;

// Nokta ızgarası: karadaki her hücreye bir nokta
const noktalar = [];
for (let lat = LAT[0]; lat >= LAT[1]; lat -= ADIM) {
  // Enlem yükseldikçe boylamlar sıkışır; nokta yoğunluğu dengeli görünsün diye aralık açılır
  const sik = ADIM / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  for (let lon = LON[0]; lon <= LON[1]; lon += sik) {
    const l = lon > 180 ? lon - 360 : lon;
    const ulke = dunya.features.find((f) => f.properties.name !== 'Antarctica' && geoContains(f, [l, lat]));
    if (ulke) noktalar.push([Math.round(x(lon)), Math.round(y(lat))]);
  }
}

// Noktalar tek bir yol olarak yazılır (her nokta sıfır uzunlukta bir çizgi, yuvarlak uç): dosya küçük kalır
const d = noktalar.map(([px, py]) => `M${px} ${py}h0`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-hidden="true">
<path d="${d}" fill="none" stroke="#b9b3a6" stroke-width="2.7" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync('theme/assets/yigit-dunya.svg', svg + '\n');

// Ülke kodu → harita üzerindeki yüzde konum (ok uçları için). Natural Earth'te ISO A2 yok, ad ve id var;
// id = ISO 3166-1 sayısal kod. Kod tablosu snippet olarak yazılır, tema kodu bunu okur.
const konum = {};
for (const f of dunya.features) {
  if (f.properties.name === 'Antarctica') continue;
  const [lon, lat] = geoCentroid(f);
  if (lat > LAT[0] || lat < LAT[1]) continue;
  konum[f.id] = {
    ad: f.properties.name,
    x: +((x(lon) / W) * 100).toFixed(2),
    y: +((y(lat) / H) * 100).toFixed(2),
  };
}
fs.writeFileSync(
  'theme/snippets/dunya-koordinat.liquid',
  `{%- comment -%}\n  Ülke kodu (ISO 3166-1 sayısal) → dünya haritasındaki yüzde konum. tools/dunya-harita.mjs üretir, elle değiştirmeyin.\n  Kaynak: Natural Earth 110m (kamu malı).\n{%- endcomment -%}\n${JSON.stringify(konum)}\n`,
);

console.log(`nokta: ${noktalar.length}, ülke: ${Object.keys(konum).length}, svg: ${(svg.length / 1024).toFixed(0)} KB`);

// Ana sayfadaki ihracat bölümünün dünya haritasını üretir.
// Kaynak: Natural Earth (world-atlas, kamu malı) 110m ülke sınırları.
// Çıktı:
//   theme/assets/yigit-dunya.svg  → noktalı dünya (her nokta 1 ızgara hücresi; karadaysa çizilir)
//   theme/snippets/dunya-koordinat.liquid → ülke kodu → harita üzerindeki yüzde konum tablosu (oklar için)
// Harita eşdikdörtgen (equirectangular) izdüşümdür. İhracat yapılan ülkelerin tamamı kuzey yarımkürede
// olduğu için kırpma kuzey kuşağıdır (Kanada'dan Uzak Doğu'ya): boş okyanus yerine ülkeler büyük görünür.
import fs from 'node:fs';
import { geoContains, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const dunya = feature(topo, topo.objects.countries);

const LON = [-128, 62];
const LAT = [72, 4];
const W = 1000;
const H = 358;
const ADIM = 0.62; // derece cinsinden nokta aralığı

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
<path d="${d}" fill="none" stroke="#a39c8d" stroke-width="2.3" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync('theme/assets/yigit-dunya.svg', svg + '\n');

// Ülke kodu → harita üzerindeki yüzde konum (ok uçları için). Natural Earth'te ISO A2 yok, ad ve id var;
// id = ISO 3166-1 sayısal kod. Kod tablosu snippet olarak yazılır, tema kodu bunu okur.
// Coğrafi merkezin yanıltıcı olduğu ülkelerde ok ucu elle verilir (Rusya: Moskova, Fransa: anakara vb.)
const ELLE = {
  643: [37.6, 55.8], // Rusya
  250: [2.4, 46.6], // Fransa (deniz aşırı topraklar merkezi kaydırıyor)
  124: [-101, 57], // Kanada
  840: [-98, 39], // Amerika Birleşik Devletleri
  528: [5.4, 52.2], // Hollanda
};

const konum = {};
for (const f of dunya.features) {
  if (f.properties.name === 'Antarctica') continue;
  // Kosova'nın ISO sayısal kodu yok; kullanıcı tarafından atanan XK koduyla girer
  const anahtar = /^\d+$/.test(String(f.id ?? '')) ? String(f.id) : (f.properties.name === 'Kosovo' ? 'XK' : null);
  if (!anahtar) continue;
  const [lon, lat] = ELLE[Number(f.id)] || geoCentroid(f);
  if (lat > LAT[0] || lat < LAT[1]) continue;
  konum[anahtar] = {
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

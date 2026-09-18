// Müşteriye gidecek belgeleri (migration/*.md) basılabilir PDF'e çevirir.
// Kullanım: node tools/docs-pdf.mjs   → dist/musteri-belgeleri/*.pdf
// Bağımlılık yok; Markdown'ın bu belgelerde kullanılan alt kümesi elle ayrıştırılır.
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const KOK = path.resolve(process.cwd());
const CIKTI = path.join(KOK, 'dist', 'musteri-belgeleri');

const BELGELER = [
  { dosya: 'GORSEL-STANDARDI.md', pdf: 'Yigit-Aluminyum-Gorsel-ve-Video-Standardi.pdf', ust: 'Çekim yönergesi' },
  { dosya: 'ICERIK-EKSIKLERI.md', pdf: 'Yigit-Aluminyum-Urun-Icerigi-Eksikler.pdf', ust: 'Durum raporu' },
  { dosya: 'KULLANIM-KILAVUZU.md', pdf: 'Yigit-Aluminyum-Siteyi-Yonetme-Kilavuzu.pdf', ust: 'Kılavuz' },
  { dosya: 'FIYAT-VE-SATIS-KURALLARI.md', pdf: 'Yigit-Aluminyum-Fiyat-ve-Satis-Kurallari.pdf', ust: 'Fiyat ve satış' },
];

// Belge içindeki dosya adı atıfları PDF'te belge adına çevrilir.
const ATIFLAR = [[/`?GORSEL-STANDARDI\.md`?(\s+dosyasında)?/g, '“Görsel ve video standardı” belgesinde']];

const kacis = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Satır içi: **kalın**, `kod`
function satirIci(s) {
  return kacis(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function hucreler(satir) {
  return satir.replace(/^\||\|$/g, '').split('|').map((h) => h.trim());
}

function markdownuCevir(md) {
  for (const [ara, yaz] of ATIFLAR) md = md.replace(ara, yaz);
  const satirlar = md.split(/\r?\n/);
  const cikti = [];
  let i = 0;

  while (i < satirlar.length) {
    const s = satirlar[i];

    if (!s.trim()) { i++; continue; }

    const baslik = s.match(/^(#{1,3})\s+(.*)$/);
    if (baslik) {
      const n = baslik[1].length;
      cikti.push(`<h${n}>${satirIci(baslik[2])}</h${n}>`);
      i++;
      continue;
    }

    // Tablo: başlık satırı + ayraç satırı + gövde
    if (s.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(satirlar[i + 1] || '')) {
      const bas = hucreler(s);
      i += 2;
      const govde = [];
      while (i < satirlar.length && satirlar[i].trim().startsWith('|')) {
        govde.push(hucreler(satirlar[i]));
        i++;
      }
      cikti.push(
        `<table><thead><tr>${bas.map((h) => `<th>${satirIci(h)}</th>`).join('')}</tr></thead>` +
          `<tbody>${govde.map((r) => `<tr>${r.map((h) => `<td>${satirIci(h)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      );
      continue;
    }

    // Listeler
    if (/^\s*[-*]\s+/.test(s)) {
      const oge = [];
      while (i < satirlar.length && /^\s*[-*]\s+/.test(satirlar[i])) {
        oge.push(`<li>${satirIci(satirlar[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i++;
      }
      cikti.push(`<ul>${oge.join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(s)) {
      const oge = [];
      while (i < satirlar.length && /^\s*\d+\.\s+/.test(satirlar[i])) {
        oge.push(`<li>${satirIci(satirlar[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      cikti.push(`<ol>${oge.join('')}</ol>`);
      continue;
    }

    // Paragraf: boş satıra kadar
    const par = [];
    while (i < satirlar.length && satirlar[i].trim() && !/^\s*([-*]|\d+\.)\s+/.test(satirlar[i]) && !satirlar[i].trim().startsWith('|') && !/^#{1,3}\s/.test(satirlar[i])) {
      par.push(satirlar[i].trim());
      i++;
    }
    if (par.length) cikti.push(`<p>${satirIci(par.join(' '))}</p>`);
  }
  return cikti.join('\n');
}

const fontUrl = (ad) => pathToFileURL(path.join(KOK, 'theme', 'assets', ad)).href;

function sayfa({ baslik, ust, govde, tarih }) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${kacis(baslik)}</title>
<style>
  @font-face { font-family: 'Archivo'; src: url('${fontUrl('archivo-latin.woff2')}') format('woff2');
    font-weight: 100 900; font-display: block; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2074, U+20AC, U+2122, U+2212; }
  @font-face { font-family: 'Archivo'; src: url('${fontUrl('archivo-latin-ext.woff2')}') format('woff2');
    font-weight: 100 900; font-display: block; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+2C60-2C7F, U+A720-A7FF; }

  :root { --ink: #2b2925; --soft: #5f5a52; --rule: #d8d3c9; --light: #e8a33d; }
  * { box-sizing: border-box; }
  html { font-family: 'Archivo', system-ui, sans-serif; color: var(--ink); font-size: 10.5pt; }
  body { margin: 0; line-height: 1.55; }

  .kapak { border-block-end: 2px solid var(--ink); padding-block-end: 10mm; margin-block-end: 9mm; }
  .marka { font-size: 8pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--soft); display: flex; justify-content: space-between; }
  .marka .cizgi { inline-size: 18mm; block-size: 2px; background: var(--light); align-self: center; }
  h1 { font-size: 21pt; font-weight: 680; letter-spacing: -0.015em; margin: 7mm 0 2mm; line-height: 1.15; }
  .ust { font-size: 9.5pt; color: var(--soft); }

  h2 { font-size: 13pt; font-weight: 640; margin: 8mm 0 2.5mm; padding-block-start: 3mm; border-block-start: 1px solid var(--rule); break-after: avoid; }
  h2::before { content: ''; display: block; inline-size: 8mm; block-size: 2px; background: var(--light); margin-block-end: 2.5mm; }
  h3 { font-size: 11pt; font-weight: 640; margin: 5mm 0 1.5mm; break-after: avoid; }
  p { margin: 0 0 3mm; }
  strong { font-weight: 640; }
  code { font-family: 'Consolas', 'Courier New', monospace; font-size: 9pt; background: #efece5; padding: 0.4mm 1.2mm; border-radius: 1mm; }

  ul, ol { margin: 0 0 3mm; padding-inline-start: 5mm; }
  li { margin-block-end: 1.2mm; }
  li::marker { color: var(--soft); }

  table { inline-size: 100%; border-collapse: collapse; margin: 0 0 4mm; font-size: 9.5pt; break-inside: avoid; }
  th { text-align: start; font-weight: 640; font-size: 8pt; letter-spacing: 0.06em; text-transform: uppercase; color: var(--soft);
       border-block-end: 1px solid var(--ink); padding: 0 2mm 1.5mm 0; }
  td { padding: 1.8mm 2mm 1.8mm 0; border-block-end: 1px solid var(--rule); vertical-align: top; }
  tr:last-child td { border-block-end: 0; }

  h2, h3, table, ul, ol { break-inside: avoid; }
</style></head><body>
  <div class="kapak">
    <div class="marka"><span>Yiğit Alüminyum Profil</span><span class="cizgi"></span><span>${kacis(tarih)}</span></div>
    <h1>${kacis(baslik)}</h1>
    <div class="ust">${kacis(ust)}</div>
  </div>
  ${govde}
</body></html>`;
}

const TARIH = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

const tarayici = await chromium.launch();
const ctx = await tarayici.newContext();
fs.mkdirSync(CIKTI, { recursive: true });

for (const b of BELGELER) {
  const md = fs.readFileSync(path.join(KOK, 'migration', b.dosya), 'utf8');
  const baslik = (md.match(/^#\s+(.*)$/m) || [, b.dosya])[1];
  const govde = markdownuCevir(md.replace(/^#\s+.*$/m, ''));
  const html = sayfa({ baslik, ust: b.ust, govde, tarih: TARIH });

  const sekme = await ctx.newPage();
  await sekme.setContent(html, { waitUntil: 'load' });
  await sekme.evaluate(() => document.fonts.ready);
  const hedef = path.join(CIKTI, b.pdf);
  await sekme.pdf({
    path: hedef,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '20mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      `<div style="width:100%;font-family:sans-serif;font-size:7pt;color:#8a857c;padding:0 20mm;display:flex;justify-content:space-between;">` +
      `<span>${baslik.replace(/[<>&]/g, '')}</span><span class="pageNumber"></span></div>`,
  });
  await sekme.close();
  console.log(`${b.pdf}  ${(fs.statSync(hedef).size / 1024).toFixed(0)} KB`);
}

await tarayici.close();

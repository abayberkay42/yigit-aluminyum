// Müşteri düzeltmeleri (2026-09-19) sonrası ürün sayfası: bilgi sütunu (fiyat, metraj paneli, WhatsApp düğmesi,
// en altta taksit) ve görselli şerit karşılaştırması; masaüstü + telefon. Hesaplayıcı ve metraj tablosu olmamalı.
// Kullanım: node tools/shot-pdp-revize.mjs [tutamak] [çıktı öneki=.impeccable/review/pdp-revize]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [handle = '1-5cm-trimless-alcipan-led-profili', prefix = '.impeccable/review/pdp-revize'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const sonuc = {};
for (const [ad, vp] of [['masaustu', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844 }]]) {
  const p = await (await browser.newContext({ viewport: vp, reducedMotion: 'reduce' })).newPage();
  await p.goto(`${B}/products/${handle}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => { document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')); });
  await p.waitForTimeout(800);
  await p.locator('.pdp__info').screenshot({ path: `${prefix}-${ad}-bilgi.png` });
  const cmp = p.locator('.cmp', { hasText: '240' });
  await cmp.scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  await cmp.screenshot({ path: `${prefix}-${ad}-serit.png` });
  sonuc[ad] = await p.evaluate(() => {
    const info = document.querySelector('.pdp__info');
    const son = info.lastElementChild;
    const fiyat = document.querySelector('.pdp__price [data-price]');
    return {
      hesaplayici: !!document.querySelector('[data-calc]'),
      metrajTablo: !!document.querySelector('.metraj__tablo'),
      taksitEnAltta: son?.classList.contains('pdp__taksit'),
      waDugme: !!document.querySelector('.pdp__project-wa svg'),
      fiyatSinif: fiyat?.className,
      seritGorsel: [...document.querySelectorAll('.cmp__gorsel img')].map((i) => i.currentSrc.split('/').pop()),
      tasma: (() => { const W = document.documentElement.clientWidth; const k = (x) => { for (let n = x.parentElement; n && n !== document.documentElement; n = n.parentElement) if (getComputedStyle(n).overflowX !== 'visible') return true; return false; }; return [...document.querySelectorAll('body *')].some((x) => x.getBoundingClientRect().right > W + 1 && getComputedStyle(x).position !== 'fixed' && !k(x)); })(),
    };
  });
}
await browser.close();
console.log(JSON.stringify(sonuc, null, 1));

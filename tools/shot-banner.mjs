// Sayfa başı bannerlarını denetler (masaüstü + telefon): ekran görüntüsü, sayfada tek H1, banner görseli inmiş mi,
// menü çubuğunun açık logosu görünüyor mu, yatay taşma, CLS.
// Kullanım: node tools/shot-banner.mjs [çıktı öneki=.impeccable/review/banner]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/banner'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const SAYFALAR = [
  ['koleksiyon-led', '/collections/led-profilleri'],
  ['koleksiyon-trimless', '/collections/tri̇mless-alcipan-led-profi̇lleri̇'],
  ['koleksiyon-supurgelik', '/collections/supurgelik-profilleri-1'],
  ['urunler', '/collections'],
  ['kurumsal', '/pages/kurumsal'],
  ['uretim', '/pages/uretim'],
  ['kullanim', '/pages/kullanim-alanlari'],
  ['iletisim', '/pages/iletisim'],
  ['sss', '/pages/s-s-s'],
  ['kataloglar', '/pages/kataloglar'],
  ['arama', '/search?q=trimless'],
  ['sepet', '/cart'],
  ['404', '/pages/yok-boyle-sayfa'],
];
const browser = await chromium.launch();
const sonuc = [];
const hatalar = [];
for (const [ad, vp] of [['masaustu', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  for (const [isim, yol] of SAYFALAR) {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => hatalar.push(`${isim}: ${e.message}`));
    const r = await p.goto(B + yol, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${prefix}-${isim}-${ad}.png` });
    const olcum = await p.evaluate(() => {
      const img = document.querySelector('.sbanner__img');
      const acik = document.querySelector('.rail__logo-img--acik');
      return {
        banner: !!document.querySelector('.sbanner'),
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
        gorsel: img ? img.complete && img.naturalWidth > 0 : null,
        gorselAdi: img?.currentSrc?.split('/').pop(),
        acikLogo: acik ? getComputedStyle(acik).display !== 'none' : null,
        tasma: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        cls: +window.__cls.toFixed(3),
      };
    });
    sonuc.push({ sayfa: isim, gorunum: ad, durum: r.status(), ...olcum });
    await p.close();
  }
  await ctx.close();
}
await browser.close();
for (const s of sonuc) console.log(JSON.stringify(s));
console.log('hatalar', hatalar);

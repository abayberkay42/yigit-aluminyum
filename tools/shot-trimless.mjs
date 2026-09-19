// Trimless ürün şablonunun rehber bölümlerini çeker (masaüstü + telefon): karşılaştırma, uygulama adımları,
// doğru/yanlış, kapak montajı, 45° kesim ve bölüm altlarındaki özet görseller. Kırık görsel ve yatay taşma denetimi.
// Kullanım: node tools/shot-trimless.mjs [ürün tutamacı] [çıktı öneki=.impeccable/review/trimless]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [handle = '2-2cm-trimless-alcipan-led-profili', prefix = '.impeccable/review/trimless'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const hatalar = [];
const sonuc = {};
for (const [ad, vp] of [['masaustu', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  p.on('pageerror', (e) => hatalar.push(e.message));
  await p.goto(`${B}/products/${handle}`, { waitUntil: 'networkidle' });
  const bolumler = await p.$$eval('.psec', (els) => els.map((e) => e.className + ' | ' + (e.querySelector('.psec__title')?.textContent || '').trim()));
  sonuc[`${ad}-bolumler`] = bolumler;
  for (const [i, sel] of ['.cmp', '.guide', '.dy', '.guide >> nth=1', '.guide >> nth=2'].entries()) {
    const el = p.locator(sel).first();
    if (!(await el.count())) continue;
    await el.scrollIntoViewIfNeeded();
    await p.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    await el.evaluate((n) => n.querySelectorAll('img').forEach((img) => (img.loading = 'eager')));
    await p.waitForTimeout(600);
    await el.screenshot({ path: `${prefix}-${ad}-${i + 1}.png` });
  }
  sonuc[`${ad}-kirik`] = await p.$$eval('.psec img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  sonuc[`${ad}-gorsel`] = await p.$$eval('.psec img', (imgs) => imgs.length);
  sonuc[`${ad}-tasma`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  sonuc[`${ad}-rehber`] = await p.$$eval('.rehber-gorsel img', (a) => a.map((x) => x.currentSrc.split('/').pop().split('?')[0]));
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify({ sonuc, hatalar }, null, 1));

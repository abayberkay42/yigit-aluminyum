// Temanın genel görünümünü çeker: ana sayfa bölümleri, koleksiyon, ürün, kurumsal sayfalar, telefon.
// Renk/tema değişikliklerinden önce ve sonra karşılaştırmak için.
// Kullanım: node tools/shot-tema.mjs [çıktı öneki=.impeccable/review/tema]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const [prefix = '.impeccable/review/tema'] = process.argv.slice(2);
fs.mkdirSync(path.dirname(prefix), { recursive: true });
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const errors = [];
const watch = (p) => {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
};
const shot = (p, name, full = false) => p.screenshot({ path: `${prefix}-${name}.png`, fullPage: full, timeout: 60000 });
// Yerel sunucu dosya değişince sayfayı yeniler (/__reload); gezinti yarıda kesilirse bir kez daha dene
const settle = async (p) => {
  const gez = () => p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  try { await gez(); } catch { await p.waitForLoadState('networkidle'); await gez(); }
};
const to = async (p, sel, pad = 0) => {
  await p.evaluate(([s, d]) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - d); }, [sel, pad]);
  await p.waitForTimeout(1100);
};

// Hareket azaltılmış: film tek ekran, 3B anlatı düz liste; bölümleri kararlı çekmek için
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const d = await ctx.newPage();
watch(d);
await d.goto(`${B}/`, { waitUntil: 'networkidle' });
await settle(d);
await to(d, '.xhero'); await shot(d, '01-hero');
await to(d, '.hprod', 80); await shot(d, '02-uretim');
await to(d, '.groups', 80); await shot(d, '03-gruplar');
await to(d, '.doors', 80); await shot(d, '04-yollar');
await to(d, '.site-footer', 200); await shot(d, '05-altalan');

await d.goto(`${B}/collections/all`, { waitUntil: 'networkidle' });
await settle(d);
await shot(d, '06-koleksiyon');
const urun = await d.locator('.card__title a').first().getAttribute('href');
await d.goto(`${B}${urun}`, { waitUntil: 'networkidle' });
await settle(d);
await shot(d, '07-urun');

for (const [ad, yol] of [['08-kullanim', '/pages/kullanim-alanlari'], ['09-uretim-sayfa', '/pages/uretim'], ['10-iletisim', '/pages/iletisim'], ['11-404', '/sayfa-yok']]) {
  await d.goto(`${B}${yol}`, { waitUntil: 'networkidle' });
  await settle(d);
  await shot(d, ad);
}

// Hareketli ana ekran (3B sahne): film bölümünü geçip sahneye in
const h = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(h);
await h.goto(`${B}/?film=yok`, { waitUntil: 'networkidle' });
await h.evaluate(() => { const x = document.querySelector('.xhero'); window.scrollTo(0, x.getBoundingClientRect().top + scrollY); });
await h.waitForTimeout(2500);
await shot(h, '12-hero-canli');

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
watch(m);
await m.goto(`${B}/`, { waitUntil: 'networkidle' });
await settle(m);
await to(m, '.xhero'); await shot(m, '13-mobil-hero');
await to(m, '.groups', 60); await shot(m, '14-mobil-gruplar');

console.log('hata:', errors.length ? [...new Set(errors)].join(' / ') : 'yok');
await browser.close();

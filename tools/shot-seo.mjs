// Faz 8 sayfalarını çeker: kataloglar, üretim adımları (gerçek fotoğraflar), blog yazısı, arama sonuçları, 404, telefonda üst çubuk.
// Kullanım: node tools/shot-seo.mjs [çıktı öneki=.impeccable/review/seo]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/seo'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const ART = '/blogs/tri%CC%87mless-led-profi%CC%87lleri%CC%87/nedir-nasil-uygulanir-ne-ise-yarar-nerelerde-kullanilir';
const browser = await chromium.launch();
const errors = [];
const checks = {};
const watch = (p) => {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
};
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
const go = async (path, name, scrollSel) => {
  await page.goto(B + path, { waitUntil: 'networkidle' });
  if (scrollSel) {
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 110); }, scrollSel);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: `${prefix}-${name}.png`, timeout: 60000 });
};

await go('/pages/kataloglar', '1-kataloglar');
await go('/pages/uretim', '2-uretim-adimlar', '.steps');
await go(ART, '3-blog-yazisi');
await go('/search?q=trimless', '4-arama');
await go('/olmayan-sayfa', '5-404');
await go('/pages/s-s-s', '6-sss');

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
watch(m);
await m.goto(B + '/', { waitUntil: 'domcontentloaded' });
await m.waitForTimeout(1200);
await m.screenshot({ path: `${prefix}-7-mobil-ust.png`, clip: { x: 0, y: 0, width: 390, height: 120 } });
checks.mobilTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await m.goto(B + '/pages/kataloglar', { waitUntil: 'networkidle' });
await m.screenshot({ path: `${prefix}-8-mobil-katalog.png`, fullPage: true, timeout: 60000 });
checks.mobilKatalogTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);

console.log(JSON.stringify(checks), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

// Geri bildirim sonrası: küçülen yazı ölçeği, yeni alt alan, ortalanan başlıklar ve zaman çizelgeli üretim adımları.
// Kullanım: node tools/shot-revize.mjs [çıktı öneki=.impeccable/review/rev]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/rev'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const checks = {};

const shot = async (page, path, name, sel, offset = 100) => {
  await page.goto(B + path, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
  });
  if (sel) {
    await page.evaluate(([s, o]) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o); }, [sel, offset]);
  } else {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${prefix}-${name}.png`, timeout: 90000 });
};

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));

await shot(page, '/pages/uretim', '1-uretim-ust', '.phero');
await shot(page, '/pages/uretim', '2-uretim-adimlar', '.steps', 40);
await shot(page, '/pages/kurumsal', '3-kurumsal', '.phero');
await shot(page, '/', '4-anasayfa-alt', '.doors', 60);
await shot(page, '/collections', '5-gruplar', '.lcoll');
await shot(page, '/pages/kurumsal', '6-altalan', null);
checks.altAlan = await page.evaluate(() => {
  const f = document.querySelector('.site-footer');
  const mark = document.querySelector('.site-footer__mark');
  return {
    yukseklik: Math.round(f.getBoundingClientRect().height),
    markaPunto: getComputedStyle(mark).fontSize,
    sosyal: document.querySelectorAll('.site-footer__social a').length,
    sutun: getComputedStyle(document.querySelector('.site-footer__top')).gridTemplateColumns.split(' ').length,
  };
});
checks.baslikPunto = await page.evaluate(() => {
  const g = (s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).fontSize : null; };
  return { sayfaBasligi: g('.phero__title'), bolumBasligi: g('.psec__title, .groups__title') };
});
checks.uretimZaman = await (async () => {
  await page.goto(B + '/pages/uretim', { waitUntil: 'networkidle' });
  return page.evaluate(() => {
    const steps = [...document.querySelectorAll('.step')].slice(0, 4);
    return steps.map((s) => {
      const b = s.querySelector('.step__body').getBoundingClientRect();
      const m = s.querySelector('.step__media')?.getBoundingClientRect();
      return m ? (b.left < m.left ? 'metin-sol' : 'metin-sağ') : 'görselsiz';
    });
  });
})();

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('pageerror', (e) => errors.push(e.message));
await shot(m, '/pages/kurumsal', '7-mobil-altalan', null);
await shot(m, '/pages/uretim', '8-mobil-uretim', '.steps', 40);
checks.mobilTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);

console.log(JSON.stringify(checks), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

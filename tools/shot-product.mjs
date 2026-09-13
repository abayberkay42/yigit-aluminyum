// Ürün sayfasının alt bölümlerini tek tek çeker: adımlar, karşılaştırma, kullanım alanları, SSS (bir soru açık), üretim bandı ve diğer ürünler.
// Kullanım: node tools/shot-product.mjs [ürün tutamacı=22x13-led-profili] [çıktı öneki=.impeccable/review/pdp]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [handle = '22x13-led-profili', prefix = '.impeccable/review/pdp'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const errors = [];
const checks = {};
const watch = (p) => {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
};
const shotAt = async (p, sel, name, offset = 110) => {
  const found = await p.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    if (!el) return false;
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o);
    return true;
  }, [sel, offset]);
  if (!found) return (checks[name] = 'yok');
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${prefix}-${name}.png`, timeout: 60000 });
};

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
await page.goto(`${B}/products/${handle}`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${prefix}-0-ust.png` });
await shotAt(page, '.guide', '1-adimlar');
await shotAt(page, '.cmp', '2-karsilastirma');
await shotAt(page, '.papps', '3-kullanim');
await page.locator('.faq__q').first().click().catch(() => {});
checks.sssAcildi = await page.evaluate(() => document.querySelector('.faq__item')?.open ?? null);
await shotAt(page, '.faq', '4-sss');
await shotAt(page, '.pprod', '5-uretim-diger', 60);

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
watch(m);
await m.goto(`${B}/products/${handle}`, { waitUntil: 'networkidle' });
await m.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
  window.scrollTo(0, 0);
});
await m.screenshot({ path: `${prefix}-6-mobil.png`, fullPage: true, timeout: 60000 });
checks.mobilTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);

console.log(JSON.stringify(checks), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

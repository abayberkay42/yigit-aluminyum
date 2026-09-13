// Mağaza sayfalarını çeker ve davranışı denetler: koleksiyon (kart üzerine gelinmiş), ürün (seçenek + sepete ekle),
// sepet çekmecesi (açılış, odak, Escape), sepet sayfası, telefonda ürün sayfası.
// Kullanım: node tools/shot-store.mjs [çıktı öneki=.impeccable/review/store]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/store'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const errors = [];
const checks = {};
const watch = (page) => {
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
};
const shot = (page, name, full = false) => page.screenshot({ path: `${prefix}-${name}.png`, fullPage: full, timeout: 60000 });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);

await page.goto(`${B}/collections/siva-ustu-led-profilleri`, { waitUntil: 'networkidle' });
await shot(page, '1-koleksiyon');
await page.locator('.card').nth(1).hover();
await page.waitForTimeout(700);
await page.evaluate(() => window.scrollTo(0, 420));
await page.waitForTimeout(500);
await page.locator('.card').nth(5).hover();
await page.waitForTimeout(700);
await shot(page, '2-koleksiyon-kart');

await page.goto(`${B}/products/alcipan-z-profili`, { waitUntil: 'networkidle' });
await shot(page, '3-urun');
await page.locator('.opt__item', { hasText: '15MM' }).click();
await page.waitForTimeout(300);
checks.fiyat = await page.locator('[data-price]').textContent();
checks.adres = new URL(page.url()).search;
await page.locator('[data-qty-step="1"]').click();
await page.locator('[data-add]').click();
await page.waitForSelector('[data-cart-drawer][open]', { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(700);
checks.cekmeceAcik = await page.evaluate(() => document.querySelector('[data-cart-drawer]').open);
checks.odakCekmecede = await page.evaluate(() => document.querySelector('[data-cart-drawer]').contains(document.activeElement));
checks.sayac = await page.locator('[data-cart-count]').first().textContent();
await shot(page, '4-cekmece');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
checks.escapeKapatti = await page.evaluate(() => !document.querySelector('[data-cart-drawer]').open);

await page.goto(`${B}/cart`, { waitUntil: 'networkidle' });
await shot(page, '5-sepet');

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
watch(m);
await m.goto(`${B}/products/alcipan-z-profili`, { waitUntil: 'networkidle' });
await shot(m, '6-mobil-urun', true);
checks.mobilTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await m.goto(`${B}/collections/siva-ustu-led-profilleri`, { waitUntil: 'networkidle' });
await shot(m, '7-mobil-koleksiyon');
checks.mobilKoleksiyonTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);

console.log(JSON.stringify(checks), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

// Kurumsal sayfaları çeker: kullanım alanları (ilk oda + oda listesi), üretim, hakkımızda, iletişim (+ gönderildi hali), telefonda kullanım alanları.
// Kullanım: node tools/shot-pages.mjs [çıktı öneki=.impeccable/review/page]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/page'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const errors = [];
const checks = {};
const watch = (p) => {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
};
const shot = (p, name, full = false) => p.screenshot({ path: `${prefix}-${name}.png`, fullPage: full, timeout: 60000 });
const settle = (p) => p.evaluate(async () => {
  // Tembel yüklenen görselleri tetiklemek için sayfayı baştan sona gez, sonra başa dön
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);

await page.goto(`${B}/pages/kullanim-alanlari`, { waitUntil: 'networkidle' });
await shot(page, '1-kullanim');
await page.evaluate(() => window.scrollTo(0, document.querySelector('.room').getBoundingClientRect().top + scrollY - 140));
await page.waitForTimeout(900);
await shot(page, '2-kullanim-oda');
await page.evaluate(() => document.querySelectorAll('.room')[2]?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1200);
checks.etkinOda = await page.locator('[data-room-link][aria-current]').textContent().catch(() => null);
await shot(page, '3-kullanim-ucuncu');

await page.goto(`${B}/pages/uretim`, { waitUntil: 'networkidle' });
await shot(page, '4-uretim');
await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(700);
await shot(page, '5-uretim-adimlar');

await page.goto(`${B}/pages/hakkimizda`, { waitUntil: 'networkidle' });
await shot(page, '6-hakkimizda');

await page.goto(`${B}/pages/iletisim`, { waitUntil: 'networkidle' });
await shot(page, '7-iletisim');
await page.fill('#ContactName', 'Deneme Kişi');
await page.fill('#ContactEmail', 'deneme@example.com');
await page.fill('#ContactBody', 'Proje için teklif rica ediyorum.');
await Promise.all([page.waitForNavigation(), page.click('.contact__submit')]);
await page.waitForTimeout(500);
checks.formGonderildi = await page.locator('[data-contact-ok]').isVisible();
checks.odakOnayda = await page.evaluate(() => document.activeElement?.hasAttribute('data-contact-ok'));
await shot(page, '8-iletisim-gonderildi');

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
watch(m);
await m.goto(`${B}/pages/kullanim-alanlari`, { waitUntil: 'networkidle' });
await settle(m);
await shot(m, '9-mobil-kullanim', true);
checks.mobilTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await m.goto(`${B}/pages/iletisim`, { waitUntil: 'networkidle' });
await shot(m, '10-mobil-iletisim', true);
checks.mobilIletisimTasma = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);

console.log(JSON.stringify(checks), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

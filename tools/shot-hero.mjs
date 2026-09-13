// Ana sayfa ilk ekranının ekran görüntüsünü alır (Playwright, azaltılmış hareket).
// Kullanım: node tools/shot-hero.mjs <çıktı.png> [genişlik=2752] [yükseklik=1536] [--plates-only] [--full]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [out, w = '2752', h = '1536', ...flags] = process.argv.slice(2);
const platesOnly = flags.includes('--plates-only');
const full = flags.includes('--full');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, reducedMotion: 'reduce' });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(process.env.URL || 'http://localhost:3019/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (platesOnly) {
  await page.addStyleTag({
    content: '.shopify-section-group-header-group, .hero__copy, .blade__label, .blade__edge, .stations__row, .hero__factory-link, .stations__media::before { visibility: hidden !important; }',
  });
}
await page.screenshot({ path: out, fullPage: full });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
console.log(`yazıldı: ${out} (${w}x${h}) | yatay taşma: ${overflow} | konsol hatası: ${errors.length ? errors.join(' / ') : 'yok'}`);
await browser.close();

// Ana sayfanın anlatıdan sonraki bölümlerini çeker: ürün grupları (satır üzerine gelinmiş), iki yol, alt alan.
// Kullanım: node tools/shot-sections.mjs [genişlik=1440] [yükseklik=900] [çıktı öneki=.impeccable/review/sec]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [w = '1440', h = '900', prefix = '.impeccable/review/sec'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(process.env.URL || 'http://localhost:3019/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const jump = async (sel, offset = 0) => {
  await page.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + o);
  }, [sel, offset]);
  await page.waitForTimeout(1800);
};

await jump('.groups');
await page.screenshot({ timeout: 120000, path: `${prefix}-1-gruplar.png` });
const row = page.locator('.group-row').nth(2);
if (await row.isVisible()) {
  await row.hover();
  await page.waitForTimeout(900);
  await page.screenshot({ timeout: 120000, path: `${prefix}-2-gruplar-secili.png` });
}
await jump('.doors', -80);
await page.screenshot({ timeout: 120000, path: `${prefix}-3-iki-yol.png` });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
await page.screenshot({ timeout: 120000, path: `${prefix}-4-alt-alan.png` });

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(`çekildi (${w}x${h}) | yatay taşma: ${overflow}px | hata: ${errors.length ? errors.join(' / ') : 'yok'}`);
await browser.close();

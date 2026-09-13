// Ana ekranın canlı hallerini çeker: açılış sonrası, menüde ışık, kalıp değişimi. (Hareket açık.)
// Kullanım: node tools/shot-live.mjs [genişlik=1440] [yükseklik=900] [çıktı öneki=.impeccable/review/live]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [w = '1440', h = '900', prefix = '.impeccable/review/live'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(process.env.URL || 'http://localhost:3019/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3200);
await page.screenshot({ path: `${prefix}-1-acilis.png` });

const link = page.locator('.rail__link').nth(2);
if (await link.count()) {
  const b = await link.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${prefix}-2-menu-isik.png`, clip: { x: 0, y: 0, width: +w, height: Math.min(+h, 320) } });
}

const die = page.locator('.die').nth(1);
if (await die.count()) {
  await die.click();
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${prefix}-3-kalip-degisti.png` });
}
const live = await page.evaluate(() => document.querySelector('.xhero')?.classList.contains('is-live'));
console.log(`çekildi (${w}x${h}) | sahne çalışıyor: ${live} | hata: ${errors.length ? errors.join(' / ') : 'yok'}`);
await browser.close();

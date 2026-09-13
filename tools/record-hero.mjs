// Ana ekranın kısa kaydı: açılış, menü ışığı, kalıp değişimleri. Çıktı: .impeccable/review/hero-kayit.webm
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const dir = '.impeccable/review/video';
fs.rmSync(dir, { recursive: true, force: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
await page.goto('http://localhost:3019/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3600);
const links = page.locator('.rail__link');
for (let i = 0; i < await links.count(); i++) {
  const b = await links.nth(i).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 });
  await page.waitForTimeout(260);
}
await page.mouse.move(720, 600, { steps: 10 });
for (const i of [1, 3, 4]) {
  await page.locator('.die').nth(i).click();
  await page.waitForTimeout(2500);
}
await page.locator('[data-kelvin="6500"]').click();
await page.waitForTimeout(400);
const b = await links.nth(1).boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
await page.waitForTimeout(900);
await ctx.close();
await browser.close();
const f = fs.readdirSync(dir).find((n) => n.endsWith('.webm'));
fs.renameSync(`${dir}/${f}`, '.impeccable/review/hero-kayit.webm');
console.log('kayıt: .impeccable/review/hero-kayit.webm');

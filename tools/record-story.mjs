// Ana sayfanın kaydırma anlatısı kaydı: açılış, kalıp seçimi, dört durak, 4000K ışık. Çıktı: .impeccable/review/anlati-kayit.mp4
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const dir = '.impeccable/review/video';
fs.rmSync(dir, { recursive: true, force: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
await page.goto('http://localhost:3019/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3400);
await page.mouse.move(900, 600, { steps: 8 });
await page.locator('.die').nth(2).click();
await page.waitForTimeout(2400);

// Durakların ortalarında kısa bekleyerek aşağı in
const total = await page.evaluate(() => document.querySelector('.xhero').offsetHeight - innerHeight);
const holds = [0.2, 0.52, 0.8, 1];
let y = 0;
for (const h of holds) {
  const target = total * h;
  while (y < target) { await page.mouse.wheel(0, 120); y += 120; await page.waitForTimeout(45); }
  await page.waitForTimeout(1400);
  if (h === 0.8) {
    await page.locator('[data-kelvin="4000"]').click();
    await page.waitForTimeout(900);
    await page.locator('[data-kelvin="3000"]').click();
    await page.waitForTimeout(700);
  }
}
await page.waitForTimeout(2600);
await ctx.close();
await browser.close();

const f = fs.readdirSync(dir).find((n) => n.endsWith('.webm'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/${f}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '.impeccable/review/anlati-kayit.mp4']);
fs.rmSync(dir, { recursive: true, force: true });
console.log('kayıt: .impeccable/review/anlati-kayit.mp4');

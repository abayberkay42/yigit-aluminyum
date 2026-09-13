// Kaydırma anlatısının duraklarını çeker (?story=p ile sabit ilerleme) + gerçek kaydırmayla bir denetim karesi.
// Kullanım: node tools/shot-story.mjs [genişlik=1440] [yükseklik=900] [çıktı öneki=.impeccable/review/story] [p listesi=0.2,0.35,0.55,0.8,0.95]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [w = '1440', h = '900', prefix = '.impeccable/review/story', list = '0.2,0.35,0.55,0.8,0.95'] = process.argv.slice(2);
const base = process.env.URL || 'http://localhost:3019/';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));

for (const p of list.split(',')) {
  await page.goto(`${base}?story=${p}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);
  await page.screenshot({ path: `${prefix}-${p}.png` });
}

// Gerçek kaydırma: bölümün ortasına in, ScrollTrigger'ın anlatıyı sürdüğünü doğrula
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const total = await page.evaluate(() => document.querySelector('.xhero').offsetHeight - innerHeight);
for (let y = 0; y < total * 0.55; y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
await page.waitForTimeout(2500);
const state = await page.evaluate(() => ({
  active: document.querySelector('.stage.is-active .stage__title')?.textContent,
  intro: getComputedStyle(document.querySelector('.xhero')).getPropertyValue('--intro'),
  scrollY: Math.round(scrollY),
}));
await page.screenshot({ path: `${prefix}-kaydirma.png` });
console.log(`çekildi | kaydırma sonrası: ${JSON.stringify(state)} | hata: ${errors.length ? errors.join(' / ') : 'yok'}`);
await browser.close();

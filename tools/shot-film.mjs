// Üretim sayfasındaki tanıtım filmini denetler (masaüstü + telefon): kapak ve oynat düğmesi görünüyor mu,
// düğmeye basınca film gerçekten oynuyor mu, sayfa açılışında video inmiyor mu (preload none).
// Kullanım: node tools/shot-film.mjs [çıktı öneki=.impeccable/review/film]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/film'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
// Chromium'un Playwright sürümü H.264 çözmez; yüklü Chrome kullanılır
const browser = await chromium.launch({ channel: 'chrome' });
const hatalar = [];
const sonuc = {};
for (const [ad, vp] of [['masaustu', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const mp4 = [];
  p.on('request', (r) => r.url().includes('.mp4') && mp4.push(r.url()));
  p.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  p.on('pageerror', (e) => hatalar.push(e.message));
  await p.goto(`${B}/pages/uretim`, { waitUntil: 'networkidle' });
  const film = p.locator('[data-tanitim]');
  await film.scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  sonuc[`${ad}-acilista-mp4`] = mp4.length;
  sonuc[`${ad}-dugme`] = await p.locator('[data-tanitim-oynat]').isVisible();
  sonuc[`${ad}-kapak`] = await p.$eval('[data-tanitim] video', (v) => v.getAttribute('poster')?.split('/').pop());
  await film.screenshot({ path: `${prefix}-${ad}-kapak.png` });
  await p.waitForTimeout(1200); // Lenis kaydırması otursun, tıklama kayan hedefe gitmesin
  await p.locator('[data-tanitim-oynat]').click();
  await p.waitForTimeout(3000);
  sonuc[`${ad}-oynuyor`] = await p.$eval('[data-tanitim] video', (v) => ({ sure: Math.round(v.duration), an: +v.currentTime.toFixed(1), duraklatildi: v.paused, sessiz: v.muted }));
  sonuc[`${ad}-dugmeGizli`] = !(await p.locator('[data-tanitim-oynat]').isVisible());
  await film.screenshot({ path: `${prefix}-${ad}-oynarken.png` });
  sonuc[`${ad}-tasma`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify({ sonuc, hatalar }, null, 1));

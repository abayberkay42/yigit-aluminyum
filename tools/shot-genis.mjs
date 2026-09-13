// Geniş ekranda ortalanmış düzeni ve yeni alt alanı denetler (varsayılan 1830×950, kullanıcının ekranına yakın).
// Kullanım: node tools/shot-genis.mjs [genişlik=1830] [çıktı öneki=.impeccable/review/gen]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [w = '1830', prefix = '.impeccable/review/gen'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: 950 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));

const go = async (path, name, sel, offset = 90) => {
  await page.goto(B + path, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
  });
  if (sel === 'alt') await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  else if (sel) await page.evaluate(([s, o]) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o); }, [sel, offset]);
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${prefix}-${name}.png`, timeout: 90000 });
};

await go('/', '1-anasayfa-ust', null);
await go('/', '2-anasayfa-gruplar', '.groups');
await go('/collections', '3-gruplar', null);
await go('/products/22x13-led-profili', '4-urun', null);
await go('/pages/kurumsal', '5-altalan', 'alt');

// Ortalanma ölçüsü: içerik kutusunun sol ve sağ boşluğu eşit mi
const olcu = await page.evaluate(() => {
  const r = (s) => { const el = document.querySelector(s); if (!el) return null; const b = el.getBoundingClientRect(); return { sol: Math.round(b.left), sag: Math.round(innerWidth - b.right), genislik: Math.round(b.width) }; };
  return { menu: r('.rail__bar'), altAlan: r('.site-footer'), icerik: r('main'), ekran: innerWidth };
});
console.log(JSON.stringify(olcu), '| hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

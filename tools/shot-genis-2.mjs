// Ortalanmış düzenin kalan sayfalarda denetimi (geniş ekran): kullanım alanları, iletişim, arama, blog yazısı, sepet, üretim.
// Her sayfada içerik kutusunun sol/sağ boşluğu ölçülür; eşitse düzen ortalanmış demektir.
// Kullanım: node tools/shot-genis-2.mjs [genişlik=1830] [çıktı öneki=.impeccable/review/gen2]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [w = '1830', prefix = '.impeccable/review/gen2'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const ART = '/blogs/tri%CC%87mless-led-profi%CC%87lleri%CC%87/nedir-nasil-uygulanir-ne-ise-yarar-nerelerde-kullanilir';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +w, height: 950 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));

const sayfalar = [
  ['/pages/kullanim-alanlari', '1-kullanim', '.room'],
  ['/pages/iletisim', '2-iletisim', null],
  ['/search?q=trimless', '3-arama', null],
  [ART, '4-blog', null],
  ['/cart', '5-sepet', null],
  ['/pages/uretim', '6-uretim', '.steps'],
];
const olcum = [];
for (const [path, name, sel] of sayfalar) {
  await page.goto(B + path, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
  if (sel) await page.evaluate((s) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 90); }, sel);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-${name}.png`, timeout: 90000 });
  olcum.push(await page.evaluate((p) => {
    const b = document.querySelector('main').getBoundingClientRect();
    return { sayfa: p, sol: Math.round(b.left), sag: Math.round(innerWidth - b.right), tasma: document.documentElement.scrollWidth - innerWidth };
  }, path));
}
console.log(JSON.stringify(olcum));
console.log('hata:', errors.length ? errors.join(' / ') : 'yok');
await browser.close();

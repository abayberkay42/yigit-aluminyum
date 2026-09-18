// Satış koşulu ve metraj fiyatı ekranlarını çeker: ürün sayfası (masaüstü + telefon, 120 m), ürün kartı,
// sepet (metraj indirimi satırı ve koşula uymayan satır uyarısı).
// Kullanım: node tools/shot-satis.mjs [çıktı öneki=.impeccable/review/satis]
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const [prefix = '.impeccable/review/satis'] = process.argv.slice(2);
const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch();
const hatalar = [];
const sonuc = {};
const izle = (p) => {
  p.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  p.on('pageerror', (e) => hatalar.push(e.message));
};
const miktar = async (p, n) => {
  await p.fill('.qty__input', String(n));
  await p.locator('.qty__input').dispatchEvent('change');
  await p.waitForTimeout(450);
};

for (const [ad, vp] of [['masaustu', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', deviceScaleFactor: ad === 'telefon' ? 2 : 1 });
  const p = await ctx.newPage();
  izle(p);
  await p.goto(`${B}/products/2-2cm-trimless-alcipan-led-profili`, { waitUntil: 'networkidle' });
  await miktar(p, 120);
  await p.evaluate(() => document.querySelector('.metraj__tablo').setAttribute('open', ''));
  await p.evaluate(() => {
    const el = document.querySelector('.pdp__head');
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 90);
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${prefix}-pdp-${ad}.png`, fullPage: false });
  await p.evaluate(() => {
    const el = document.querySelector('.kural');
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 200);
  });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${prefix}-pdp-${ad}-2.png` });
  sonuc[`tasma-${ad}`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await ctx.close();
}

// Ürün kartı (koleksiyon) ve sepet
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p = await ctx.newPage();
izle(p);
await p.goto(`${B}/collections/tri̇mless-alcipan-led-profi̇lleri̇`, { waitUntil: 'networkidle' });
const kart = p.locator('.card').first();
await kart.scrollIntoViewIfNeeded();
await kart.hover();
await p.waitForTimeout(500);
await kart.screenshot({ path: `${prefix}-kart.png` });
sonuc.kartMiktar = await kart.locator('[data-quick-add]').getAttribute('data-qty');
await kart.locator('[data-quick-add]').click();
await p.waitForTimeout(1200);
sonuc.cekmece = await p.locator('.drawer__inner').innerText();
// Aynı ürünün ikinci satırı yok; metraj indirimini göstermek için miktarı artır ve kurala uymayan bir ürün ekle
await p.evaluate(async () => {
  await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line: 1, quantity: 120 }) });
});
const kanal = 42387143491672; // 14x8-led-profili (7X13 Kanal) ilk varyantı, dev/mock/products.json
await p.evaluate(async (id) => {
  await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id, quantity: 10 }] }) });
}, kanal);
await p.goto(`${B}/cart`, { waitUntil: 'networkidle' });
await p.screenshot({ path: `${prefix}-sepet.png`, fullPage: true });
sonuc.sepet = await p.locator('.cartpage').innerText();
sonuc.odemeKapali = await p.locator('.cartpage .drawer__checkout').isDisabled();
await p.locator('.cartpage .line__duzelt').click();
await p.waitForTimeout(1500);
sonuc.duzeltSonrasi = await p.locator('.cartpage').innerText();
sonuc.odemeKapaliSonra = await p.locator('.cartpage .drawer__checkout').isDisabled();
await browser.close();
console.log(JSON.stringify({ sonuc, hatalar }, null, 1));

// Kalite denetimi: erişilebilirlik (axe-core, WCAG 2.2 AA), taşma, konsol hatası, kırık görsel, LCP/CLS, aktarım boyutu,
// klavye odağı ve hareket azaltma. Rapor: .impeccable/review/qa-report.json
// Kullanım: node tools/qa.mjs
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const AXE = 'D:/Claude Projeler/Claude skil/.qa-tools/node_modules/axe-core/axe.min.js';
const B = process.env.URL || 'http://localhost:3019';
const ART = '/blogs/tri%CC%87mless-led-profi%CC%87lleri%CC%87/nedir-nasil-uygulanir-ne-ise-yarar-nerelerde-kullanilir';
const PAGES = [
  '/', '/collections', '/collections/siva-ustu-led-profilleri', '/products/22x13-led-profili', '/products/alcipan-z-profili',
  '/cart', '/pages/kullanim-alanlari', '/pages/uretim', '/pages/kurumsal', '/pages/iletisim', '/pages/kataloglar',
  '/pages/s-s-s', '/search?q=trimless', ART, '/olmayan-sayfa', '/en',
];
const VIEWPORTS = { masaustu: { width: 1440, height: 900 }, telefon: { width: 390, height: 844, isMobile: true, hasTouch: true } };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const report = { tarih: new Date().toISOString(), sayfalar: [], klavye: null, hareketAzaltma: null };

async function audit(ctxOpts, path, label) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  const bytes = { js: 0, css: 0, img: 0, font: 0 };
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', async (r) => {
    const t = r.request().resourceType();
    const len = Number(r.headers()['content-length'] || 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
    if (t === 'script') bytes.js += len;
    else if (t === 'stylesheet') bytes.css += len;
    else if (t === 'image') bytes.img += len;
    else if (t === 'font') bytes.font += len;
  });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__vitals.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const res = await page.goto(B + path, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1200);
  const vitals = await page.evaluate(() => window.__vitals);
  // Tembel görselleri yükle, sonra kırık görsel ve taşma denetle.
  // Sayfa ilk ölçüm sırasında yerleşmeye devam edebiliyor; bağlam kaybolursa bir kez daha denenir.
  const gez = async () => page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
  try {
    await gez();
  } catch {
    await page.waitForLoadState('networkidle').catch(() => {});
    await gez();
  }
  await page.waitForTimeout(800);
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.getAttribute('src').slice(0, 90)));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.addScriptTag({ path: AXE });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, adet: v.nodes.length, ornek: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' → ' + (n.failureSummary || '').split('\n').slice(1, 2).join('').trim()) }));
  });
  await ctx.close();
  return { sayfa: path, gorunum: label, durum: res?.status(), lcp: Math.round(vitals.lcp), cls: +vitals.cls.toFixed(3), kb: Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, Math.round(v / 1024)])), tasma: overflow, kirikGorsel: broken, hata: errors.filter((e) => !/status of 404/.test(e) || path !== '/olmayan-sayfa'), axe };
}

// Sepet sayfası dolu olsun
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
  await p.evaluate(async () => {
    const r = await fetch('/products/alcipan-z-profili').then((x) => x.text());
    const id = r.match(/name="id" value="(\d+)"/)?.[1];
    if (id) await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }] }) });
  });
  await ctx.close();
}

for (const path of PAGES) {
  for (const [label, vp] of Object.entries(VIEWPORTS)) {
    const { width, height, ...rest } = vp;
    // Uzun koşuda ortam kaynaklı tek seferlik takılmalar görülüyor (goto networkidle zaman aşımı,
    // bağlam kaybı). Aynı sayfalar tek tek denendiğinde geçiyor, yani sayfanın kusuru değil.
    // Bu yüzden "başarısız" yazmadan önce bir kez daha denenir; iki deneme de düşerse kaydedilir.
    let sonHata = null;
    for (let deneme = 1; deneme <= 2; deneme++) {
      try {
        const sonuc = await audit({ viewport: { width, height }, ...rest }, path, label);
        if (deneme > 1) sonuc.yenidenDenendi = true;
        report.sayfalar.push(sonuc);
        sonHata = null;
        break;
      } catch (e) {
        sonHata = e;
        if (deneme < 2) await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (sonHata) report.sayfalar.push({ sayfa: path, gorunum: label, basarisiz: sonHata.message.slice(0, 200) });
    process.stdout.write('.');
  }
}

// Klavye: ana sayfada Tab ile ilk 14 odak ve görünür odak halkası
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  // Film yükleme sayacı açıkken sayfanın geri kalanı "inert": Tab hiçbir öğeye ulaşmaz. Sayaç kapanınca ölç.
  await p.waitForFunction(() => {
    const y = document.querySelector('.film-yukleme:not([hidden])');
    return !y || y.classList.contains('is-bitti') || getComputedStyle(y).display === 'none';
  }, null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(600);
  const steps = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press('Tab');
    steps.push(await p.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      return { el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''), metin: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), halka: ring };
    }));
  }
  report.klavye = steps;
  await ctx.close();
}

// Hareket azaltma: ana sayfa açılış metni ve anlatı durakları görünür mü
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  report.hareketAzaltma = await p.evaluate(() => {
    const vis = (s) => [...document.querySelectorAll(s)].map((el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && el.getBoundingClientRect().height > 0; });
    return { baslik: vis('.xhero__title'), duraklar: vis('.stage'), bolumYuksekligi: Math.round(document.querySelector('.xhero')?.getBoundingClientRect().height || 0) };
  });
  await p.screenshot({ path: '.impeccable/review/qa-hareket-azaltma.png', fullPage: false });
  await ctx.close();
}

fs.writeFileSync('.impeccable/review/qa-report.json', JSON.stringify(report, null, 2));
console.log('\nrapor yazıldı: .impeccable/review/qa-report.json');
await browser.close();

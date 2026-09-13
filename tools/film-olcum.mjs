// Ana sayfa filmi ölçümü.
// A) Kare çözme süresi: aynı 40 kare, 2560 ve 4K kaynaktan, üç ekran boyutuna (createImageBitmap).
// B) Gerçek fare tekerleğiyle film boyunca kaydırma: ekran kare aralıkları, uzun görevler,
//    çizilen karenin hedefin kaç kare gerisinde kaldığı. Soğuk (açılır açılmaz) ve ılık (8 sn sonra).
// Kullanım: node tools/film-olcum.mjs  (sunucu açık; 4K karşılaştırma için dev/mock/files/olcum4k-0001..0040.webp)
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';

const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const yuzde = (a, q) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return +s[Math.min(s.length - 1, Math.floor(q * s.length))].toFixed(1);
};

// ---------- A) Çözme ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  // Yerel sunucu derleme sonrası açık sekmeleri yeniler; ölçümün ortasında sayfa değişmesin
  await ctx.route('**/__reload', (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(B + '/pages/kurumsal', { waitUntil: 'load' });
  const r = await p.evaluate(async () => {
    const no = (i) => String(i).padStart(4, '0');
    const set = (onek) => Promise.all(Array.from({ length: 40 }, (_, i) => fetch(`/files/${onek}${no(i + 1)}.webp`).then((x) => x.blob())));
    const kaynak = { 2560: await set('yigit-film-'), 3840: await set('olcum4k-') };
    let uzun = [];
    const po = new PerformanceObserver((l) => { for (const e of l.getEntries()) uzun.push(e.duration); });
    po.observe({ type: 'longtask' });
    const bekle = () => new Promise((r) => setTimeout(r, 60)); // gözlemcinin görevleri teslim etmesi için
    const out = [];
    for (const [ks, bloblar] of Object.entries(kaynak)) {
      const kg = Number(ks);
      for (const [g, y] of [[kg, kg * 9 / 16], [1920, 1080], [2560, 1440]]) {
        if (g > kg || (g === kg && y !== kg * 9 / 16)) continue;
        if (g === kg && out.some((o) => o.ad === `${ks} kaynak -> dogal`)) continue;
        await bekle(); uzun = [];
        const s = [];
        for (const b of bloblar) {
          const t = performance.now();
          const bm = await createImageBitmap(b, g < kg ? { resizeWidth: g, resizeHeight: y, resizeQuality: 'high' } : {});
          s.push(performance.now() - t);
          bm.close();
        }
        await bekle();
        out.push({ ad: g === kg ? `${ks} kaynak -> dogal` : `${ks} kaynak -> ${g}x${y}`, s, uzun: [...uzun] });
      }
    }
    po.disconnect();
    return { out, uzun: [] };
  });
  console.log('=== A) Kare çözme (createImageBitmap, 40 kare, ana iş parçacığı dışında) ===');
  for (const o of r.out) {
    const u = o.uzun.length ? `${o.uzun.length} (en uzun ${Math.round(Math.max(...o.uzun))} ms)` : '0';
    console.log(`  ${o.ad.padEnd(26)} medyan ${String(yuzde(o.s, 0.5)).padStart(6)} ms   p95 ${String(yuzde(o.s, 0.95)).padStart(6)} ms   ana iş parçacığı 50ms+ görev: ${u}`);
  }
  await ctx.close();
}

// ---------- B) Kaydırma ----------
console.log('\n=== B) Fare tekerleğiyle film boyunca kaydırma (1920x1080, ~4 sn) ===');
for (const [ad, bekle] of [['soğuk: ilk kare gelir gelmez', 0], ['ılık : 8 sn yükleme sonrası', 8000]]) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  // Yerel sunucu derleme sonrası açık sekmeleri yeniler; ölçümün ortasında sayfa değişmesin
  await ctx.route('**/__reload', (r) => r.abort());
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelector('[data-film]')?.classList.contains('is-live'), null, { timeout: 60000 });
  const ilkKare = Date.now() - t0;
  if (bekle) await p.waitForTimeout(bekle);
  const once = await p.evaluate(() => document.querySelector('[data-film]')._film.durum());

  await p.evaluate(() => {
    const el = document.querySelector('[data-film]');
    window.__o = { aralik: [], uzun: [], sapma: [], dur: false };
    let son = performance.now();
    const dongu = (t) => {
      window.__o.aralik.push(t - son);
      son = t;
      const d = el._film.durum();
      window.__o.sapma.push(Math.abs(d.hedef - d.cizilen));
      if (!window.__o.dur) requestAnimationFrame(dongu);
    };
    requestAnimationFrame(dongu);
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__o.uzun.push(e.duration); }).observe({ type: 'longtask' });
  });

  await p.mouse.move(960, 540);
  const yol = await p.evaluate(() => document.querySelector('[data-film]').offsetHeight - innerHeight);
  const ADIM = 60;
  for (let i = 0; i < ADIM; i++) { await p.mouse.wheel(0, yol / ADIM); await p.waitForTimeout(66); }
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { window.__o.dur = true; return { ...window.__o, son: document.querySelector('[data-film]')._film.durum() }; });

  const a = r.aralik.slice(2);
  const fps = a.length ? (1000 / yuzde(a, 0.5)).toFixed(0) : '-';
  console.log(`  ${ad}`);
  console.log(`    ilk kare ekranda: ${ilkKare} ms   kaydırma öncesi inen kare: ${once.inen}/${once.sayi}`);
  console.log(`    ekran kare hızı medyan: ${fps} fps   33ms+ aralık: ${a.filter((x) => x > 33.4).length}/${a.length}   50ms+: ${a.filter((x) => x > 50).length}`);
  console.log(`    ana iş parçacığı 50ms+ görev: ${r.uzun.length}${r.uzun.length ? ` (en uzun ${Math.round(Math.max(...r.uzun))} ms)` : ''}`);
  console.log(`    çizilen kare hedefin gerisinde: medyan ${yuzde(r.sapma, 0.5)}  p95 ${yuzde(r.sapma, 0.95)}  en ${Math.max(...r.sapma)} kare`);
  console.log(`    kaydırma sonu: hedef ${r.son.hedef}, çizilen ${r.son.cizilen}, inen ${r.son.inen}/${r.son.sayi}`);
  await ctx.close();
}
await browser.close();

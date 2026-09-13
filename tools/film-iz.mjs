// Film kaydırması sırasındaki uzun görevlerin kaynağını bulur: Chrome izi alır, 50 ms+ görevlerin
// içindeki en pahalı alt olayları (betik dosyası, çizim, görsel çözme, GPU) listeler.
// Kullanım: node tools/film-iz.mjs   (sunucu açık)
import { chromium } from 'file:///D:/Claude%20Projeler/Claude%20skil/.qa-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const B = process.env.URL || 'http://localhost:3019';
const browser = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await ctx.route('**/__reload', (r) => r.abort());
const p = await ctx.newPage();
await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => document.querySelector('[data-film]')?.classList.contains('is-live'), null, { timeout: 60000 });
await p.waitForTimeout(8000); // bütün kareler insin, 3B sahne kurulsun

const izDosyasi = path.join(os.tmpdir(), `film-iz-${Date.now()}.json`);
await browser.startTracing(p, { path: izDosyasi, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'toplevel', 'gpu', 'blink'] });
await p.mouse.move(960, 540);
const yol = await p.evaluate(() => document.querySelector('[data-film]').offsetHeight - innerHeight);
for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, yol / 60); await p.waitForTimeout(66); }
await p.waitForTimeout(800);
await browser.stopTracing();
await browser.close();

const iz = JSON.parse(fs.readFileSync(izDosyasi, 'utf8'));
const olaylar = (iz.traceEvents || iz).filter((e) => e.ts && e.dur !== undefined);
// Ana iş parçacığı: en çok RunTask süresi olan iş parçacığı
const toplam = new Map();
for (const e of olaylar) if (e.name === 'RunTask') toplam.set(`${e.pid}:${e.tid}`, (toplam.get(`${e.pid}:${e.tid}`) || 0) + e.dur);
const ana = [...toplam.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
const uzunlar = olaylar.filter((e) => e.name === 'RunTask' && `${e.pid}:${e.tid}` === ana && e.dur > 50000);
console.log(`ana iş parçacığında 50 ms+ görev: ${uzunlar.length}`);
for (const u of uzunlar) {
  const icindekiler = olaylar
    .filter((e) => `${e.pid}:${e.tid}` === ana && e.ts >= u.ts && e.ts + e.dur <= u.ts + u.dur && e !== u && e.dur > 3000)
    .sort((a, b) => b.dur - a.dur)
    .slice(0, 6)
    .map((e) => {
      const d = e.args?.data || {};
      const ek = d.url ? ` ${String(d.url).split('/').pop()}` : d.functionName ? ` ${d.functionName}` : d.type ? ` ${d.type}` : '';
      return `${e.name}${ek} ${(e.dur / 1000).toFixed(0)}ms`;
    });
  console.log(`  ${(u.dur / 1000).toFixed(0)} ms  ->  ${icindekiler.join(' | ') || '(alt olay yok)'}`);
}
fs.rmSync(izDosyasi, { force: true });

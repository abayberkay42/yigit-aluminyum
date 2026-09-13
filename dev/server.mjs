// Yerel geliştirme sunucusu. Sayfaları dev/app.mjs işler (Vercel önizlemesiyle ortak işleyici).
// Burada yalnız yerele özgü işler var: src/ değişince Vite ile theme/assets yeniden derlenir,
// theme/ ya da dev/mock değişince açık sekmeler kendiliğinden yenilenir.
// Bu klasör (dev/) Shopify'a aktarılmaz.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { createApp } from './app.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const THEME = path.join(ROOT, 'theme');
const MOCK = path.join(ROOT, 'dev', 'mock');
const PORT = Number(process.env.PORT || 3019);

const app = createApp({ yenile: true });

// ---------- Canlı yenileme ----------
const clients = new Set();
let timer;
function notify() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    for (const c of clients) c.write('data: reload\n\n');
  }, 150);
}
fs.mkdirSync(MOCK, { recursive: true });
fs.mkdirSync(path.join(THEME, 'assets'), { recursive: true });
fs.watch(THEME, { recursive: true }, notify);
fs.watch(MOCK, { recursive: true }, notify);

http
  .createServer((req, res) => {
    // Tarayıcılar arası film ölçümü (yalnız yerel, Vercel'de yok): sayfa tools/film-olcum-tarayici.html,
    // sonucu .impeccable/review/film-olcum-<tarayici>.json dosyasına yazılır
    if (req.url === '/__film-olcum') {
      if (req.method === 'POST') {
        let govde = '';
        req.on('data', (c) => { govde += c; });
        req.on('end', () => {
          const d = JSON.parse(govde);
          const ad = /Firefox/.test(d.ua) ? 'firefox' : /Chrome/.test(d.ua) ? 'chrome' : 'diger';
          const klasor = path.join(ROOT, '.impeccable', 'review');
          fs.mkdirSync(klasor, { recursive: true });
          fs.writeFileSync(path.join(klasor, `film-olcum-${ad}${d.tur ? `-${d.tur}` : ''}.json`), JSON.stringify(d, null, 2));
          res.writeHead(204);
          res.end();
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(path.join(ROOT, 'tools', 'film-olcum-tarayici.html')).pipe(res);
    }
    if (req.url === '/__film-kaydirma') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(path.join(ROOT, 'tools', 'film-kaydirma.html')).pipe(res);
    }
    if (req.url === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(':ok\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    return app(req, res);
  })
  .listen(PORT, () => console.log(`Yiğit Alüminyum yerel tema → http://localhost:${PORT}`));

if (!process.argv.includes('--no-build')) {
  await build({ configFile: path.join(ROOT, 'vite.config.mjs'), logLevel: 'warn', build: { watch: {} } });
}

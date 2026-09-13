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

// Gemini görsel modeliyle görsel üretir (nanobanana'nın TLS hatasına karşı yedek yol).
// Kullanım: node tools/gen-image.mjs <istem.txt> <çıktı.png> [en-boy=16:9] [boyut=2K] [ref1.png ref2.png ...]
// Anahtar ~/.claude.json içindeki nanobanana ayarından okunur ve hiçbir yere yazdırılmaz.
// Her görselin yanına istemi içeren bir .json kaydı yazılır (kaynak bilgisi).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [promptFile, outFile, aspect = '16:9', size = '2K', ...refs] = process.argv.slice(2);
if (!promptFile || !outFile) {
  console.error('Kullanım: node tools/gen-image.mjs <istem.txt> <çıktı.png> [en-boy] [boyut] [referanslar...]');
  process.exit(1);
}

const key = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8')).mcpServers.nanobanana.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
const prompt = fs.readFileSync(promptFile, 'utf8').trim();

const parts = [{ text: prompt }];
for (const r of refs) {
  const ext = path.extname(r).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  parts.push({ inlineData: { mimeType, data: fs.readFileSync(r).toString('base64') } });
}
const body = JSON.stringify({
  contents: [{ parts }],
  generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect, imageSize: size } },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let json;
for (let attempt = 1; attempt <= 10; attempt++) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
    });
    json = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status} ${json.error?.status || ''} ${json.error?.message || ''}`);
    break;
  } catch (err) {
    const msg = String(err.cause?.code || err.message).split(key).join('<gizlendi>');
    const retriable = /SSL|ECONNRESET|ETIMEDOUT|fetch failed|HTTP 5\d\d|HTTP 429/.test(msg + (err.cause?.message || ''));
    console.error(`deneme ${attempt}: ${msg}`);
    if (!retriable || attempt === 10) process.exit(2);
    await sleep(1500 * attempt);
  }
}

const img = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
if (!img) {
  console.error('Görsel dönmedi:', JSON.stringify(json).slice(0, 400));
  process.exit(3);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const data = Buffer.from(img.inlineData.data, 'base64');
const wantExt = path.extname(outFile).toLowerCase().replace('jpeg', 'jpg');
const gotExt = img.inlineData.mimeType === 'image/png' ? '.png' : img.inlineData.mimeType === 'image/webp' ? '.webp' : '.jpg';
if (wantExt === gotExt) {
  fs.writeFileSync(outFile, data);
} else {
  // Model istenenden farklı biçim döndürdü (çoğunlukla JPEG): ffmpeg ile gerçek hedef biçime çevir.
  const tmp = `${outFile}.tmp${gotExt}`;
  fs.writeFileSync(tmp, data);
  const { execFileSync } = await import('node:child_process');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, outFile]);
  fs.unlinkSync(tmp);
}
fs.writeFileSync(
  outFile.replace(/\.\w+$/, '.json'),
  JSON.stringify({ model: MODEL, aspect, size, prompt, references: refs, synthetic: true, created: new Date().toISOString() }, null, 2),
);
console.log(`yazıldı: ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(0)} KB)`);

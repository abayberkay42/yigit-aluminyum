// Archivo @font-face kurallarını üretir. (3B sahne kaldırıldığı için kesit simgesi üretimi de kalktı, 2026-09-23.)
import fs from 'node:fs';

const css = fs.readFileSync('.impeccable/build/fonts/archivo.css', 'utf8');
const faces = [['latin-ext', 'archivo-latin-ext'], ['latin', 'archivo-latin']].map(([name, file]) => {
  const block = css.split(`/* ${name} */`)[1].split('}')[0];
  const range = block.match(/unicode-range:([^;]+);/)[1].trim();
  return `/* Archivo, ${name} */\n@font-face {\n  font-family: "Archivo";\n  font-style: normal;\n  font-weight: 100 900;\n  font-stretch: 62% 125%;\n  font-display: swap;\n  src: url("../fonts/${file}.woff2") format("woff2");\n  unicode-range: ${range};\n}`;
});
fs.writeFileSync('src/css/fonts.css', `/* Archivo (Google Fonts, OFL); genişlik (62-125) ve kalınlık (100-900) eksenli. Tema assets klasöründen yüklenir. */\n${faces.join('\n\n')}\n`);

console.log('fonts.css üretildi');

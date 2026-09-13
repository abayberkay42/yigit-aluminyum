// Archivo @font-face kurallarını ve kesit simgesi snippet'ini üretir (tek kaynak: src/js/hero/profiles.js).
import fs from 'node:fs';
import { PROFILES, toSvgPath } from '../src/js/hero/profiles.js';

const css = fs.readFileSync('.impeccable/build/fonts/archivo.css', 'utf8');
const faces = [['latin-ext', 'archivo-latin-ext'], ['latin', 'archivo-latin']].map(([name, file]) => {
  const block = css.split(`/* ${name} */`)[1].split('}')[0];
  const range = block.match(/unicode-range:([^;]+);/)[1].trim();
  return `/* Archivo, ${name} */\n@font-face {\n  font-family: "Archivo";\n  font-style: normal;\n  font-weight: 100 900;\n  font-stretch: 62% 125%;\n  font-display: swap;\n  src: url("../fonts/${file}.woff2") format("woff2");\n  unicode-range: ${range};\n}`;
});
fs.writeFileSync('src/css/fonts.css', `/* Archivo (Google Fonts, OFL); genişlik (62-125) ve kalınlık (100-900) eksenli. Tema assets klasöründen yüklenir. */\n${faces.join('\n\n')}\n`);

const cases = Object.entries(PROFILES).map(([key, p]) =>
  `  {%- when '${key}' -%}\n    <svg class="kesit-icon" viewBox="-2 -2 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${toSvgPath(p.outline, 20)}"/></svg>`,
).join('\n');
fs.writeFileSync('theme/snippets/kesit-icon.liquid',
`{%- comment -%}
  Ürün grubunun kalıp kesiti simgesi. Parametre: shape (${Object.keys(PROFILES).join(', ')}).
  Bu dosya tools/build-fonts-icons.mjs ile src/js/hero/profiles.js'ten üretilir; elle düzenlemeyin.
{%- endcomment -%}
{%- case shape -%}
${cases}
{%- endcase -%}
`);
console.log('fonts.css ve kesit-icon.liquid üretildi');

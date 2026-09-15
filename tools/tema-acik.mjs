// Koyu temadan beyaz-altın temaya tek seferlik dönüşüm (2026-09-15, müşteri isteği).
// Her değişim birebir metin eşleşmesiyle yapılır; eşleşmeyen olursa betik hiçbir şey yazmadan durur.
import fs from 'node:fs';

const DOSYA = 'src/css/main.css';
let css = fs.readFileSync(DOSYA, 'utf8');

const D = [
  // ---------- Belirteçler ----------
  [`  /* Koyu tema: gece showroom'u. Zemin sıcak grafit; yüzeyler ondan birer kademe açık, kenarlar ince ışık çizgisi.
     Vurgu rengi logodaki altın; LED ışığı (--light) koyu yüzeyde gerçekten parlar.
     Kontrast (zemin 0.155 üzerinde): --c-ink ≈ 15:1, --c-ink-soft ≈ 7:1, --c-gold ≈ 8:1. */`,
   `  /* Beyaz ve altın tema (2026-09-15). Zemin düz beyaz; kartlar ve paneller çok hafif sıcak kırık beyaz, ince kenarlı.
     Altın iki tonda: --c-gold-bright düğme ve ışık yüzeylerinde (logodaki parlak altın), --c-gold beyaz üstünde
     okunması gereken etiket, çizgi ve odak halkasında (koyu altın). Kontrast (beyaz üzerinde): --c-ink ≈ 15:1,
     --c-ink-soft ≈ 6,5:1, --c-gold ≈ 4,7:1. Altın zeminli düğmede yazı --c-on-gold (koyu). */`],
  [`    color-scheme: dark;
    --c-ground: oklch(0.155 0.004 70);
    --c-ground-deep: oklch(0.135 0.004 70);
    --c-surface: oklch(0.195 0.005 70);
    --c-surface-2: oklch(0.235 0.006 70);`,
   `    color-scheme: light;
    --c-ground: oklch(1 0 0);
    --c-ground-deep: oklch(0.965 0.004 80);
    --c-surface: oklch(0.978 0.004 80);
    --c-surface-2: oklch(0.95 0.006 80);`],
  [`    --c-ink: oklch(0.955 0.004 85);
    --c-ink-soft: oklch(0.75 0.008 80);
    --c-rule: oklch(1 0 0 / 0.1);
    --c-rule-strong: oklch(1 0 0 / 0.18);`,
   `    --c-ink: oklch(0.2 0.008 70);
    --c-ink-soft: oklch(0.46 0.01 70);
    --c-rule: oklch(0.25 0.01 70 / 0.11);
    --c-rule-strong: oklch(0.25 0.01 70 / 0.2);`],
  [`    --c-on-ink: oklch(0.17 0.004 70);
    --c-gold: oklch(0.8 0.095 78);
    --c-gold-deep: oklch(0.66 0.1 70);`,
   `    --c-on-ink: oklch(0.99 0.002 85);
    --c-on-gold: oklch(0.2 0.02 65);
    --c-gold: oklch(0.56 0.1 70);
    --c-gold-bright: oklch(0.8 0.1 78);
    --c-gold-deep: oklch(0.48 0.09 68);`],
  [`    --edge: inset 0 1px 0 oklch(1 0 0 / 0.07);`, `    --edge: inset 0 1px 0 oklch(1 0 0 / 0.9);`],
  [`    /* Mağaza görselleri beyaz zeminli: koyu temada içeriden aydınlatılmış vitrin nişi olarak sunulur */`,
   `    /* Mağaza görselleri beyaz zeminli: sıcak ışıkla aydınlatılmış vitrin nişi olarak sunulur */`],
  [`    /* Zemin dokusu: fırçalanmış alüminyum (açık gri görsel) koyu renkli yarı saydam örtünün altından çok az görünür.
       Gövde, film sonu geçişi ve yükleme ekranı aynı dokuyu kullanır: aralarındaki geçiş dikişsiz olur. */
    --ground-tex:
      linear-gradient(oklch(0.155 0.004 70 / 0.955), oklch(0.155 0.004 70 / 0.955)),
      url('../img/ground.webp');
    --ground-tex-size: auto, 22rem auto;`,
   `    /* Zemin düz beyaz (müşteri isteği). Gövde, film sonu geçişi ve yükleme ekranı aynı değeri kullanır. */
    --ground-tex: none;
    --ground-tex-size: auto;`],

  // ---------- Temel ----------
  [`  html { scrollbar-gutter: stable; background-color: #0d0c0a; color-scheme: dark; }`,
   `  html { scrollbar-gutter: stable; background-color: #fff; color-scheme: light; }`],
  [`    color: #f1f0ed;
    color: var(--c-ink);
    background-color: #0d0c0a;
    background-color: var(--c-ground);
    background-image: var(--ground-tex) /* doku kaynağı: assets/plates/ground.png */;
    background-size: var(--ground-tex-size);`,
   `    color: var(--c-ink);
    background-color: var(--c-ground);`],
  [`  ::selection { background: var(--c-gold); color: var(--c-on-ink); }`, `  ::selection { background: var(--c-gold-bright); color: var(--c-on-gold); }`],

  // ---------- Düğmeler ----------
  [`    color: var(--c-on-ink);
    background: linear-gradient(180deg, oklch(0.86 0.09 82), var(--c-gold) 55%, oklch(0.74 0.1 74));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.45), inset 0 -1px 0 oklch(0.4 0.08 60 / 0.35), 0 0.6rem 1.6rem -0.9rem oklch(0.75 0.12 70 / 0.7);`,
   `    color: var(--c-on-gold);
    background: linear-gradient(180deg, oklch(0.87 0.09 84), var(--c-gold-bright) 55%, oklch(0.72 0.105 72));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -1px 0 oklch(0.45 0.08 60 / 0.3), 0 0.7rem 1.6rem -0.8rem oklch(0.62 0.12 68 / 0.55);`],
  [`      oklch(0.2 0.006 70);
    transition: translate var(--dur-ui) var(--ease-out), scale var(--dur-ui) var(--ease-out);`,
   `      oklch(0.22 0.012 65);
    transition: translate var(--dur-ui) var(--ease-out), scale var(--dur-ui) var(--ease-out);`],
  [`  .button--primary:disabled::after { background-color: oklch(0.2 0.006 70 / 0.5); }`, `  .button--primary:disabled::after { background-color: oklch(0.22 0.012 65 / 0.45); }`],
  [`    .button--primary:hover { box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.5), inset 0 -1px 0 oklch(0.4 0.08 60 / 0.35), 0 0.9rem 2.2rem -0.9rem oklch(0.78 0.13 72 / 0.85); }`,
   `    .button--primary:hover { box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.6), inset 0 -1px 0 oklch(0.45 0.08 60 / 0.3), 0 1rem 2.2rem -0.9rem oklch(0.62 0.13 68 / 0.7); }`],
  [`  .button--ghost { box-shadow: inset 0 0 0 1px var(--c-rule-strong); background: oklch(1 0 0 / 0.03); }`,
   `  .button--ghost { box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 45%, transparent); background: oklch(1 0 0); }`],
  [`    .button--ghost:hover { background: oklch(1 0 0 / 0.08); box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.28); }`,
   `    .button--ghost:hover { background: color-mix(in oklch, var(--c-gold-bright) 14%, white); box-shadow: inset 0 0 0 1px var(--c-gold); }`],

  // ---------- Menü çubuğu ----------
  [`    /* Siyah eloksal gövde: yarı saydam, arkasındaki sayfa bulanık görünür; üst kenarda ince parlama, altta derin gölge */
    background-color: oklch(0.17 0.005 70 / 0.72);
    background-image: linear-gradient(180deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0) 55%);`,
   `    /* Beyaz cam gövde: yarı saydam, arkasındaki sayfa bulanık görünür; ince altın kenar, yumuşak gölge */
    background-color: oklch(1 0 0 / 0.78);
    background-image: linear-gradient(180deg, oklch(1 0 0 / 0.7), oklch(1 0 0 / 0) 60%);`],
  [`      inset 0 1px 0 oklch(1 0 0 / 0.1),
      inset 0 0 0 1px oklch(1 0 0 / 0.06),
      0 1.2rem 2.8rem -1.2rem oklch(0 0 0 / 0.7);`,
   `      inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 22%, transparent),
      0 1px 2px oklch(0.3 0.02 70 / 0.06),
      0 1.2rem 2.8rem -1.4rem oklch(0.35 0.03 70 / 0.28);`],
  [`    .rail__link:hover { color: var(--c-ink); background: oklch(1 0 0 / 0.05); }`, `    .rail__link:hover { color: var(--c-ink); background: color-mix(in oklch, var(--c-gold-bright) 16%, transparent); }`],
  [`    background: oklch(0.19 0.005 70 / 0.97);
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 1.6rem 3rem -1rem oklch(0 0 0 / 0.75);
    transform-origin: 1.5rem 0;`,
   `    background: oklch(1 0 0 / 0.98);
    box-shadow: inset 0 0 0 1px var(--c-rule), 0 1.6rem 3rem -1.2rem oklch(0.35 0.03 70 / 0.3);
    transform-origin: 1.5rem 0;`],
  [`    .rail__sublink:hover { background: oklch(1 0 0 / 0.06); color: var(--c-ink); }`, `    .rail__sublink:hover { background: color-mix(in oklch, var(--c-gold-bright) 16%, transparent); color: var(--c-ink); }`],
  [`    background: oklch(0 0 0 / 0.35);
    box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.5), 0 1px 0 oklch(1 0 0 / 0.05);`,
   `    background: var(--c-surface-2);
    box-shadow: inset 0 1px 2px oklch(0.3 0.02 70 / 0.12);`],
  [`  .rail__kelvin button[aria-checked='true'] { background: oklch(1 0 0 / 0.1); color: var(--c-ink); box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.1); }`,
   `  .rail__kelvin button[aria-checked='true'] { background: oklch(1 0 0); color: var(--c-ink); box-shadow: 0 1px 3px oklch(0.3 0.02 70 / 0.16), inset 0 0 0 1px var(--c-rule); }`],
  [`  @media (hover: hover) and (pointer: fine) { .rail__search:hover { background: oklch(1 0 0 / 0.06); } }`, `  @media (hover: hover) and (pointer: fine) { .rail__search:hover { background: color-mix(in oklch, var(--c-gold-bright) 16%, transparent); } }`],
  [`  .rail__count { min-inline-size: 1.4em; padding-inline: 0.35em; border-radius: 1em; background: var(--c-gold); color: var(--c-on-ink);`,
   `  .rail__count { min-inline-size: 1.4em; padding-inline: 0.35em; border-radius: 1em; background: var(--c-gold-bright); color: var(--c-on-gold);`],
  [`border-radius: 999px; background: oklch(1 0 0 / 0.08); color: var(--c-ink); box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.1); }`,
   `border-radius: 999px; background: var(--c-surface-2); color: var(--c-ink); box-shadow: inset 0 0 0 1px var(--c-rule); }`],
  [`    background: oklch(0.3 0.006 70);
    box-shadow: 0 0 0 1px oklch(0 0 0 / 0.4);`,
   `    background: oklch(0.93 0.008 80);
    box-shadow: inset 0 1px 1px oklch(0.3 0.02 70 / 0.12);`],
  [`      background: oklch(0.19 0.005 70 / 0.97);
      box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 1.6rem 3rem -1rem oklch(0 0 0 / 0.75);`,
   `      background: oklch(1 0 0 / 0.98);
      box-shadow: inset 0 0 0 1px var(--c-rule), 0 1.6rem 3rem -1.2rem oklch(0.35 0.03 70 / 0.3);`],

  // ---------- Hızlı iletişim ----------
  [`    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.28), inset 0 -1px 0 oklch(0 0 0 / 0.25), 0 0.9rem 1.8rem -0.8rem oklch(0 0 0 / 0.8), 0 0 0 1px oklch(1 0 0 / 0.08);`,
   `    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.4), inset 0 -1px 0 oklch(0 0 0 / 0.12), 0 0.9rem 1.8rem -0.8rem oklch(0.35 0.04 70 / 0.45);`],
  [`  .dock__btn--tel .dock__disc { color: var(--c-on-ink); background: linear-gradient(180deg, oklch(0.86 0.09 82), var(--c-gold) 55%, oklch(0.72 0.1 74)); }`,
   `  .dock__btn--tel .dock__disc { color: var(--c-on-gold); background: linear-gradient(180deg, oklch(0.87 0.09 84), var(--c-gold-bright) 55%, oklch(0.72 0.105 72)); }`],
  [`    background: var(--c-surface-2); box-shadow: inset 0 0 0 1px var(--c-rule), 0 0.8rem 1.6rem -0.8rem oklch(0 0 0 / 0.8);`,
   `    background: oklch(1 0 0); box-shadow: inset 0 0 0 1px var(--c-rule), 0 0.8rem 1.6rem -0.8rem oklch(0.35 0.03 70 / 0.35);`],
  [`  .dock__btn--tel .dock__disc { --isik: var(--c-gold); }`, `  .dock__btn--tel .dock__disc { --isik: var(--c-gold-bright); }`],
  [`    color: oklch(0.17 0.01 150); background: oklch(0.96 0.02 150);
    box-shadow: 0 1rem 2rem -0.8rem oklch(0 0 0 / 0.8);`,
   `    color: oklch(0.99 0 0); background: oklch(0.52 0.12 152);
    box-shadow: 0 1rem 2rem -0.8rem oklch(0.3 0.05 150 / 0.5);`],

  // ---------- Film ----------
  [`    background-image: var(--ground-tex);
    background-size: var(--ground-tex-size);
  }`, `  }`],
  [`    background-image: radial-gradient(40rem 26rem at 50% 50%, oklch(0.8 0.1 75 / 0.07), transparent 70%), var(--ground-tex);
    background-size: auto, var(--ground-tex-size);`,
   `    background-image: radial-gradient(40rem 26rem at 50% 50%, oklch(0.85 0.09 80 / 0.18), transparent 70%);`],

  // ---------- 3B sahne ----------
  [`    background-color: #0d0c0a;
    background-color: var(--c-ground);
  }`, `    background-color: var(--c-ground);
  }`],
  [`      radial-gradient(46% 52% at 74% 56%, oklch(0.34 0.02 70 / 0.75), oklch(0.24 0.012 70 / 0.35) 55%, transparent 80%),
      radial-gradient(30% 20% at 72% 88%, color-mix(in oklch, var(--light) 14%, transparent), transparent 75%);`,
   `      radial-gradient(48% 55% at 74% 56%, oklch(0.93 0.012 80 / 0.9), oklch(0.965 0.008 80 / 0.5) 55%, transparent 82%),
      radial-gradient(30% 20% at 72% 88%, color-mix(in oklch, var(--light) 18%, transparent), transparent 75%);`],
  [`    background: radial-gradient(120% 90% at 70% 40%, oklch(0.1 0.01 70 / 0.2), oklch(0.07 0.008 60));
    opacity: calc(var(--dusk, 0) * 0.7);`,
   `    background: radial-gradient(120% 90% at 70% 40%, oklch(0.62 0.02 70), oklch(0.5 0.018 60));
    opacity: calc(var(--dusk, 0) * 0.42);`],
  [`    background: oklch(0.2 0.005 70 / 0.7);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: inset 0 0 0 1px var(--c-rule), inset 0 1px 0 oklch(1 0 0 / 0.06);`,
   `    background: oklch(1 0 0 / 0.8);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: inset 0 0 0 1px var(--c-rule), 0 0.4rem 1rem -0.6rem oklch(0.35 0.03 70 / 0.25);`],
  [`    background: oklch(0.27 0.012 72 / 0.85); color: var(--c-ink);`, `    background: color-mix(in oklch, var(--c-gold-bright) 22%, white); color: var(--c-ink);`],
  [`inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 70%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.1), 0 0.9rem 2rem -1rem`,
   `inset 0 0 0 1.5px var(--c-gold), 0 0.9rem 2rem -1rem`],
  [`    .die:not([aria-pressed='true']):hover { background: oklch(0.25 0.006 70 / 0.8); color: var(--c-ink); }`,
   `    .die:not([aria-pressed='true']):hover { background: oklch(1 0 0 / 0.95); color: var(--c-ink); }`],

  // ---------- Üretim fotoğrafları ----------
  [`    box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.08);
    background: linear-gradient(to top, oklch(0.1 0.005 70 / 0.55), transparent 40%);`,
   `    box-shadow: inset 0 0 0 1px oklch(0 0 0 / 0.06);
    background: linear-gradient(to top, oklch(0.15 0.01 70 / 0.35), transparent 40%);`],
  [`    background: oklch(0.15 0.004 70 / 0.6); color: var(--c-ink);
    box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.12);`,
   `    background: oklch(1 0 0 / 0.9); color: var(--c-ink);
    box-shadow: 0 0.4rem 1rem -0.5rem oklch(0.2 0.02 70 / 0.35);`],

  // ---------- Vitrin ----------
  [`    background: linear-gradient(180deg, oklch(0.25 0.006 70), oklch(0.18 0.005 70));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.09), inset 0 0 0 1px oklch(1 0 0 / 0.06), 0 1.8rem 3.2rem -2.2rem oklch(0 0 0 / 0.8);`,
   `    background: linear-gradient(180deg, oklch(0.975 0.006 80), oklch(0.94 0.01 78));
    box-shadow: inset 0 1px 0 oklch(1 0 0), inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 16%, transparent), 0 1.6rem 3rem -2.2rem oklch(0.35 0.04 70 / 0.35);`],
  [`    box-shadow: inset 0 -1.5rem 2.5rem -2rem oklch(0.3 0.02 70 / 0.35);`, `    box-shadow: inset 0 -1.5rem 2.5rem -2rem oklch(0.5 0.03 70 / 0.18), inset 0 0 0 1px oklch(0.3 0.02 70 / 0.05);`],

  // ---------- İki yol kartları ----------
  [`    background: linear-gradient(180deg, oklch(0.21 0.005 70), oklch(0.17 0.004 70));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px var(--c-rule), 0 2rem 4rem -2.5rem oklch(0 0 0 / 0.8);`,
   `    background: linear-gradient(180deg, oklch(1 0 0), var(--c-surface));
    box-shadow: inset 0 0 0 1px var(--c-rule), 0 2rem 4rem -2.8rem oklch(0.35 0.03 70 / 0.3);`],
  [`      linear-gradient(180deg, oklch(0.23 0.012 72), oklch(0.16 0.006 70));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.1), inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 28%, transparent), 0 2.4rem 4.5rem -2.5rem oklch(0 0 0 / 0.85);`,
   `      linear-gradient(180deg, oklch(0.975 0.022 84), oklch(0.995 0.004 85));
    box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 40%, transparent), 0 2.4rem 4.5rem -2.6rem oklch(0.55 0.1 70 / 0.35);`],

  // ---------- Ürün sayfası, üretim bandı ----------
  [`      linear-gradient(180deg, oklch(0.22 0.008 72), oklch(0.16 0.005 70));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.09), inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 22%, transparent);`,
   `      linear-gradient(180deg, oklch(0.975 0.022 84), oklch(0.99 0.006 85));
    box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--c-gold) 35%, transparent);`],

  // ---------- Kurumsal sayfalar ----------
  [`    background: oklch(0.19 0.005 70 / 0.75);`, `    background: oklch(1 0 0 / 0.82);`],
  [`  @media (hover: hover) and (pointer: fine) { .rooms__nav a:not([aria-current]):hover { background: oklch(1 0 0 / 0.07); color: var(--c-ink); } }`,
   `  @media (hover: hover) and (pointer: fine) { .rooms__nav a:not([aria-current]):hover { background: color-mix(in oklch, var(--c-gold-bright) 16%, transparent); color: var(--c-ink); } }`],
  [`    background: oklch(0.17 0.005 70 / 0.82); color: var(--c-ink);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border: 1px solid oklch(1 0 0 / 0.14);`,
   `    background: oklch(1 0 0 / 0.93); color: var(--c-ink);`],
  [`  @media (hover: hover) and (pointer: fine) { .spot:hover .spot__label { background: var(--c-gold); color: var(--c-on-ink); border-color: transparent; } }`,
   `  @media (hover: hover) and (pointer: fine) { .spot:hover .spot__label { background: var(--c-gold-bright); color: var(--c-on-gold); } }`],

  // ---------- Formlar ----------
  [`    background: var(--c-surface); box-shadow: inset 0 0 0 1px var(--c-rule), inset 0 1px 2px oklch(0 0 0 / 0.35);`,
   `    background: oklch(1 0 0); box-shadow: inset 0 0 0 1px var(--c-rule-strong), inset 0 1px 2px oklch(0.3 0.02 70 / 0.06);`],
  [`background: var(--c-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23c9c5bd'`,
   `background: oklch(1 0 0) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23555'`],
  [`stroke='%23c9c5bd' stroke-width='1.4'/%3E%3C/svg%3E") no-repeat calc(100% - 0.8rem) 50% / 0.7rem;`,
   `stroke='%23555' stroke-width='1.4'/%3E%3C/svg%3E") no-repeat calc(100% - 0.8rem) 50% / 0.7rem;`],
  [`  .field ::placeholder { color: oklch(0.6 0.006 80); }`, `  .field ::placeholder { color: oklch(0.6 0.008 70); }`],
  [`  .calc__fields input { min-block-size: 2.75rem; background: var(--c-ground); }`, `  .calc__fields input { min-block-size: 2.75rem; background: oklch(1 0 0); }`],

  // ---------- Kart hızlı ekleme ----------
  [`    color: var(--c-on-ink);
    background: linear-gradient(180deg, oklch(0.86 0.09 82), var(--c-gold) 55%, oklch(0.74 0.1 74));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.45), 0 0.5rem 1.2rem -0.6rem oklch(0.75 0.12 70 / 0.7);`,
   `    color: var(--c-on-gold);
    background: linear-gradient(180deg, oklch(0.87 0.09 84), var(--c-gold-bright) 55%, oklch(0.72 0.105 72));
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.55), 0 0.5rem 1.2rem -0.6rem oklch(0.62 0.12 68 / 0.5);`],
  [`      background: oklch(0.16 0.005 70 / 0.92);
      box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.1), 0 1rem 2rem -1rem oklch(0 0 0 / 0.8);`,
   `      background: oklch(1 0 0 / 0.94);
      box-shadow: inset 0 0 0 1px var(--c-rule), 0 1rem 2rem -1rem oklch(0.35 0.03 70 / 0.4);`],
  [`  .opt__item:has(input:checked) { background: oklch(0.26 0.012 72); box-shadow: inset 0 0 0 1.5px var(--c-gold); }`,
   `  .opt__item:has(input:checked) { background: color-mix(in oklch, var(--c-gold-bright) 16%, white); box-shadow: inset 0 0 0 1.5px var(--c-gold); }`],

  // ---------- Renk noktaları ----------
  [`    /* Koyu zeminde siyah renk noktası kaybolmasın: açık ince halka */
    box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.28);`,
   `    /* Beyaz zeminde beyaz renk noktası kaybolmasın: koyu ince halka */
    box-shadow: inset 0 0 0 1px oklch(0 0 0 / 0.2);`],
  [`    box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.28);
    transition: scale var(--dur-ui) var(--ease-out), box-shadow var(--dur-ui) ease;`,
   `    box-shadow: inset 0 0 0 1px oklch(0 0 0 / 0.2);
    transition: scale var(--dur-ui) var(--ease-out), box-shadow var(--dur-ui) ease;`],
  [`inset 0 0 0 1px oklch(1 0 0 / 0.28), 0 0 0 2px var(--c-ground), 0 0 0 3.5px var(--c-gold); }`, `inset 0 0 0 1px oklch(0 0 0 / 0.2), 0 0 0 2px var(--c-ground), 0 0 0 3.5px var(--c-gold); }`],

  // ---------- Çekmece ----------
  [`    box-shadow: inset 1px 0 0 var(--c-rule), -2rem 0 4rem -1rem oklch(0 0 0 / 0.7);`, `    box-shadow: inset 1px 0 0 var(--c-rule), -2rem 0 4rem -1.5rem oklch(0.35 0.03 70 / 0.3);`],
  [`  .drawer::backdrop { background: oklch(0.05 0.005 70 / 0.6);`, `  .drawer::backdrop { background: oklch(0.2 0.02 70 / 0.35);`],

  // ---------- Ana başlığın altın satırı: beyaz üzerinde açık uç okunmaz ----------
  [`    background-image: linear-gradient(100deg, var(--c-ink) 10%, var(--c-gold) 55%, oklch(0.9 0.07 85) 80%);`,
   `    background-image: linear-gradient(100deg, var(--c-ink) 8%, var(--c-gold) 50%, oklch(0.68 0.11 76) 85%);`],
];

const hatalar = [];
for (const [eski, yeni] of D) {
  const n = css.split(eski).length - 1;
  if (n !== 1) hatalar.push(`${n} eşleşme: ${eski.slice(0, 90).replace(/\n/g, '⏎')}`);
  else css = css.replace(eski, yeni);
}
if (hatalar.length) { console.error(hatalar.join('\n')); process.exit(1); }
fs.writeFileSync(DOSYA, css);
console.log(`${D.length} değişim uygulandı`);

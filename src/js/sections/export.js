// İhracat haritası: Türkiye'den ülkelere doğru yaylar çizer ve kaydırınca sırayla çizdirir.
// Konum tablosu tools/dunya-harita.mjs tarafından üretilir (ülke kodu → harita üzerinde yüzde konum).
// Hareket azaltma açıksa yaylar animasyonsuz, doğrudan çizili gelir.
const NS = 'http://www.w3.org/2000/svg';
const TURKIYE = 792; // ISO 3166-1 sayısal

export function initExport(root = document) {
  root.querySelectorAll('[data-export]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const svg = el.querySelector('[data-export-arcs]');
    const konum = oku(el, '[data-export-konum]');
    const ulkeler = oku(el, '[data-export-ulke]') || [];
    if (!svg || !konum) return;

    const [W, H] = [1000, 480];
    const yer = (anahtar) => {
      if (!anahtar) return null;
      const k = String(anahtar).trim();
      if (konum[k]) return konum[k];
      // Tablodaki kodlar üç haneli: "8" → "008"
      if (/^\d+$/.test(k) && konum[k.padStart(3, '0')]) return konum[k.padStart(3, '0')];
      const kucuk = k.toLocaleLowerCase('en');
      const bulunan = Object.values(konum).find((v) => v.ad.toLowerCase() === kucuk);
      return bulunan || null;
    };

    const merkez = yer(TURKIYE);
    if (!merkez) return;
    const m = { x: (merkez.x / 100) * W, y: (merkez.y / 100) * H };

    // Ülke listesi henüz girilmediyse harita yalnız Türkiye işaretiyle görünür
    const hedefler = ulkeler.map((u) => yer(u.kod)).filter(Boolean);

    const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const yaylar = [];
    for (const h of hedefler) {
      const p = { x: (h.x / 100) * W, y: (h.y / 100) * H };
      const d = yay(m, p);
      const yol = document.createElementNS(NS, 'path');
      yol.setAttribute('d', d);
      yol.setAttribute('class', 'export__arc');
      const nokta = document.createElementNS(NS, 'circle');
      nokta.setAttribute('cx', p.x.toFixed(1));
      nokta.setAttribute('cy', p.y.toFixed(1));
      nokta.setAttribute('r', '4');
      nokta.setAttribute('class', 'export__dot');
      svg.append(yol, nokta);
      yaylar.push([yol, nokta]);
    }
    // Türkiye işareti
    const kaynak = document.createElementNS(NS, 'circle');
    kaynak.setAttribute('cx', m.x.toFixed(1));
    kaynak.setAttribute('cy', m.y.toFixed(1));
    kaynak.setAttribute('r', '6');
    kaynak.setAttribute('class', 'export__home');
    svg.append(kaynak);

    if (azalt) {
      el.classList.add('is-cizili');
      return;
    }
    // Yaylar ekrana girince sırayla çizilir
    yaylar.forEach(([yol, nokta], i) => {
      const uzunluk = yol.getTotalLength();
      yol.style.setProperty('--uzunluk', uzunluk.toFixed(1));
      yol.style.setProperty('--gecikme', `${(i * 0.14).toFixed(2)}s`);
      nokta.style.setProperty('--gecikme', `${(i * 0.14 + 0.9).toFixed(2)}s`);
    });
    const izle = new IntersectionObserver((girdiler) => {
      for (const g of girdiler) {
        if (!g.isIntersecting) continue;
        el.classList.add('is-cizili');
        izle.disconnect();
      }
    }, { threshold: 0.25 });
    izle.observe(el);
  });
}

// Türkiye'den hedefe hafif yay: iki nokta arasındaki dikeyde yukarı doğru bükülür
function yay(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const uzak = Math.hypot(dx, dy);
  const k = uzak * 0.22;
  // Dikey birim vektör (yukarı tarafa doğru)
  const nx = -dy / (uzak || 1);
  const ny = dx / (uzak || 1);
  const yon = ny > 0 ? -1 : 1;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${(mx + nx * k * yon).toFixed(1)} ${(my + ny * k * yon).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function oku(el, secici) {
  try {
    return JSON.parse(el.querySelector(secici)?.textContent || 'null');
  } catch {
    return null;
  }
}

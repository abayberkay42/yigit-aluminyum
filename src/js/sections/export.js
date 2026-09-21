// İhracat haritası: Türkiye'den ülkelere yaylar çizer, kaydırınca sırayla çizdirir ve
// listedeki ülke adıyla haritadaki oku birbirine bağlar (üzerine gelince / odaklanınca ok öne çıkar, adı yazar).
// Konum tablosu tools/dunya-harita.mjs tarafından üretilir (ülke kodu → harita üzerinde yüzde konum).
// Hareket azaltma açıksa yaylar animasyonsuz, doğrudan çizili gelir.
const NS = 'http://www.w3.org/2000/svg';
const TURKIYE = 792; // ISO 3166-1 sayısal
const W = 1000;
const H = 358;

export function initExport(root = document) {
  root.querySelectorAll('[data-export]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const svg = el.querySelector('[data-export-arcs]');
    const konum = oku(el, '[data-export-konum]');
    const ulkeler = oku(el, '[data-export-ulke]') || [];
    if (!svg || !konum) return;

    const yer = (anahtar) => {
      if (!anahtar) return null;
      const k = String(anahtar).trim();
      if (konum[k]) return konum[k];
      // Tablodaki kodlar üç haneli: "8" → "008"
      if (/^\d+$/.test(k) && konum[k.padStart(3, '0')]) return konum[k.padStart(3, '0')];
      const kucuk = k.toLocaleLowerCase('en');
      return Object.values(konum).find((v) => v.ad.toLowerCase() === kucuk) || null;
    };

    const merkez = yer(TURKIYE);
    if (!merkez) return;
    const m = { x: (merkez.x / 100) * W, y: (merkez.y / 100) * H };

    const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const kayit = [];

    ulkeler.forEach((u, i) => {
      const h = yer(u.kod);
      if (!h) return;
      const p = { x: (h.x / 100) * W, y: (h.y / 100) * H };
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'export__hedef');
      g.dataset.exportHedef = String(i);

      const yol = document.createElementNS(NS, 'path');
      yol.setAttribute('d', yay(m, p));
      yol.setAttribute('class', 'export__arc');

      const nokta = document.createElementNS(NS, 'circle');
      nokta.setAttribute('cx', p.x.toFixed(1));
      nokta.setAttribute('cy', p.y.toFixed(1));
      nokta.setAttribute('r', '4');
      nokta.setAttribute('class', 'export__dot');

      // Ad etiketi yalnız o ülke öne çıkınca görünür; sağ kenardakiler taşmasın diye sola yazılır
      const sag = p.x > W * 0.72;
      const zemin = document.createElementNS(NS, 'rect');
      zemin.setAttribute('class', 'export__ad-zemin');
      const etiket = document.createElementNS(NS, 'text');
      etiket.setAttribute('x', (p.x + (sag ? -10 : 10)).toFixed(1));
      etiket.setAttribute('y', (p.y - 9).toFixed(1));
      etiket.setAttribute('class', 'export__ad');
      if (sag) etiket.setAttribute('text-anchor', 'end');
      etiket.textContent = u.ad;

      g.append(yol, nokta, zemin, etiket);
      svg.append(g);
      kayit.push({ g, yol, nokta, etiket, zemin, p, uzaklik: Math.hypot(p.x - m.x, p.y - m.y) });
    });

    // Türkiye işareti en üstte
    const kaynak = document.createElementNS(NS, 'circle');
    kaynak.setAttribute('cx', m.x.toFixed(1));
    kaynak.setAttribute('cy', m.y.toFixed(1));
    kaynak.setAttribute('r', '5');
    kaynak.setAttribute('class', 'export__home');
    svg.append(kaynak);

    // SVG'de yazının arkasına kutu gelmediği için zemin yazının ölçüsüne göre konur
    const zeminleriYerlestir = () => {
      for (const k of kayit) {
        let kutu;
        try {
          kutu = k.etiket.getBBox();
        } catch {
          return;
        }
        k.zemin.setAttribute('x', (kutu.x - 5).toFixed(1));
        k.zemin.setAttribute('y', (kutu.y - 3).toFixed(1));
        k.zemin.setAttribute('width', (kutu.width + 10).toFixed(1));
        k.zemin.setAttribute('height', (kutu.height + 6).toFixed(1));
        k.zemin.setAttribute('rx', '4');
      }
    };
    // Yeri müsait olan ülkenin adı haritada kalıcı yazar. Sıkışık Balkan kümesinde adlar üst üste
    // bineceği için orada yalnız listeden seçilince görünür. Çakışma, yazının gerçek kutusuyla ölçülür.
    const daimiEtiketler = () => {
      const kutular = [{ x: m.x - 9, y: m.y - 9, w: 18, h: 18 }];
      const carpisma = (a2, b2) => a2.x < b2.x + b2.w && a2.x + a2.w > b2.x && a2.y < b2.y + b2.h && a2.y + a2.h > b2.y;
      for (const k of [...kayit].sort((a2, b2) => b2.uzaklik - a2.uzaklik)) {
        k.g.classList.remove('is-daimi');
        // Türkiye'nin çevresindeki yoğun Balkan kümesinde kalıcı ad yazılmaz; orada oklar iç içe
        if (k.uzaklik < 80) continue;
        let kutu;
        try {
          kutu = k.etiket.getBBox();
        } catch {
          return;
        }
        const aday = { x: kutu.x - 3, y: kutu.y - 3, w: kutu.width + 6, h: kutu.height + 6 };
        const nokta = { x: k.p.x - 6, y: k.p.y - 6, w: 12, h: 12 };
        if (kutular.some((v) => carpisma(aday, v) || carpisma(nokta, v))) continue;
        k.g.classList.add('is-daimi');
        kutular.push(aday, nokta);
      }
    };

    const olcumler = () => { zeminleriYerlestir(); daimiEtiketler(); };
    olcumler();
    document.fonts?.ready?.then(olcumler);

    // Liste ↔ harita bağı
    const dugmeler = [...el.querySelectorAll('[data-export-ulke-btn]')];
    const sec = (i) => {
      el.classList.toggle('is-secili', i != null);
      kayit.forEach((k, n) => k.g.classList.toggle('is-vurgu', n === i));
      dugmeler.forEach((b, n) => {
        b.classList.toggle('is-vurgu', n === i);
        b.setAttribute('aria-pressed', String(n === i));
      });
    };
    dugmeler.forEach((b, i) => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('pointerenter', () => sec(i));
      b.addEventListener('pointerleave', () => sec(null));
      b.addEventListener('focus', () => sec(i));
      b.addEventListener('blur', () => sec(null));
      b.addEventListener('click', () => sec(b.classList.contains('is-vurgu') ? null : i));
    });

    if (azalt) {
      el.classList.add('is-cizili');
      return;
    }
    kayit.forEach(({ yol, nokta }, i) => {
      const uzunluk = yol.getTotalLength();
      yol.style.setProperty('--uzunluk', uzunluk.toFixed(1));
      yol.style.setProperty('--gecikme', `${(i * 0.1).toFixed(2)}s`);
      nokta.style.setProperty('--gecikme', `${(i * 0.1 + 0.8).toFixed(2)}s`);
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

// Menü çubuğu bir LED profildir: alttaki opal şerit imlecin olduğu yerde yanar, ışık sayfaya düşer.
// Işık sıcaklığı (3000K / 4000K / 6500K) bütün sitenin ışık rengini belirler ve hatırlanır. Seçim düğmeleri menüde değil,
// 3B sahnenin "Uygulama" durağında ([data-kelvin-sec]); düğme olmayan sayfada da kayıtlı seçim uygulanır.
const KEY = 'yigit:kelvin';

export function initRail() {
  const rail = document.querySelector('[data-rail]');
  if (!rail) return;
  const bar = rail.querySelector('.rail__bar');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const k = reduce ? 1 : 0.16;

  // Sayfanın en üstünde gövde şeffaf; kaydırınca buzlu cam olur (CSS .rail.is-kaydi)
  let kaydiBekliyor = false;
  const kaydiDenetle = () => { kaydiBekliyor = false; rail.classList.toggle('is-kaydi', window.scrollY > 8); };
  kaydiDenetle();
  addEventListener('scroll', () => { if (!kaydiBekliyor) { kaydiBekliyor = true; requestAnimationFrame(kaydiDenetle); } }, { passive: true });

  // Işık havuzu: yay benzeri yumuşak takip
  let x = -500, tx = -500, o = 0, to = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * k;
    o += (to - o) * (reduce ? 1 : 0.12);
    bar.style.setProperty('--lx', `${x.toFixed(1)}px`);
    bar.style.setProperty('--lo', o.toFixed(3));
    raf = Math.abs(tx - x) > 0.3 || Math.abs(to - o) > 0.004 ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const aim = (clientX) => {
    const r = bar.getBoundingClientRect();
    tx = clientX - r.left;
    if (o < 0.02) x = tx; // ışık ilk yandığı yerde başlar, uzaktan kaymaz
  };
  bar.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { aim(e.clientX); to = 1; kick(); } });
  bar.addEventListener('pointerleave', () => { to = 0; kick(); });
  bar.addEventListener('focusin', (e) => {
    const t = e.target.getBoundingClientRect();
    aim(t.left + t.width / 2);
    to = 1;
    kick();
  });
  bar.addEventListener('focusout', () => { to = 0; kick(); });

  // Işık sıcaklığı
  const radios = [...document.querySelectorAll('[data-kelvin-sec] [data-kelvin]')];
  const apply = (value, focus = false) => {
    document.documentElement.dataset.kelvin = value;
    radios.forEach((b) => {
      const on = b.dataset.kelvin === value;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    try { localStorage.setItem(KEY, value); } catch { /* depolama kapalı olabilir */ }
    document.dispatchEvent(new CustomEvent('yigit:kelvin', { detail: { kelvin: Number(value) } }));
  };
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* yok say */ }
  apply(['3000', '4000', '6500'].includes(saved) ? saved : '3000');
  radios.forEach((b, i) => {
    b.addEventListener('click', () => apply(b.dataset.kelvin));
    b.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const dir = document.documentElement.dir === 'rtl' && e.key.startsWith('Arrow') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ? -step : step;
      apply(radios[(i + dir + radios.length) % radios.length].dataset.kelvin, true);
    });
  });

  // Açılır menü: menüde alt bağlantısı olan başlıklar (fare, dokunma ve klavye ile aynı şekilde açılır)
  const discs = [...rail.querySelectorAll('[data-rail-disc]')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  const setDisc = (b, open) => {
    b.setAttribute('aria-expanded', String(open));
    const p = panel(b);
    if (p) p.hidden = !open;
  };
  const closeDiscs = (except = null) => discs.forEach((b) => { if (b !== except) setDisc(b, false); });
  const isOpen = (b) => b.getAttribute('aria-expanded') === 'true';
  const ustunde = matchMedia('(hover: hover) and (pointer: fine)');
  let kapatmaZaman = 0;

  discs.forEach((b) => {
    const item = b.closest('.rail__item');
    b.addEventListener('click', () => { const n = !isOpen(b); closeDiscs(b); setDisc(b, n); });
    if (!item) return;
    // Geniş ekranda imleçle açılır; ayrılırken kısa gecikme, menüye giderken kapanmasın
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !ustunde.matches) return;
      clearTimeout(kapatmaZaman);
      closeDiscs(b);
      setDisc(b, true);
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse' || !ustunde.matches) return;
      kapatmaZaman = setTimeout(() => setDisc(b, false), 180);
    });
    // Klavye: odak menüden tamamen çıkınca kapanır
    item.addEventListener('focusout', () => {
      setTimeout(() => { if (!item.contains(document.activeElement)) setDisc(b, false); }, 0);
    });
  });

  if (discs.length) {
    document.addEventListener('pointerdown', (e) => { if (!rail.contains(e.target)) closeDiscs(); });
    rail.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const acik = discs.find(isOpen);
      if (!acik) return;
      e.stopPropagation(); // dar ekran menüsü açıksa önce açılır menü kapanır
      setDisc(acik, false);
      acik.focus();
    });
  }

  // Dar ekran menüsü
  const toggle = rail.querySelector('[data-rail-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      rail.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && rail.classList.contains('is-open')) { toggle.click(); toggle.focus(); }
    });
  }
}

// Hızlı iletişim düğmeleri (snippets/iletisim-dock.liquid).
// - Giriş: sayfa yerleşince sırayla belirir. Film yükleme sayacı açıksa, sayaç kapanınca belirir.
// - Kenara çekilme: altbilgi, 3B sahnenin kalıp düğmeleri gibi sağ altta duran bir öğenin üstüne gelirse gizlenir.
//   Yalnız ekranda görünen engeller (IntersectionObserver) ölçülür; kaydırmada karede en fazla bir ölçüm.
// - Dikkat: oturumda bir kez, sayfada 7 sn geçirince halka yayılır.

const ENGELLER = '.site-footer__base, .site-footer__social, .xhero.is-live .die, .xhero__readout, .cartpage__summary, .drawer__foot';
const DIKKAT_ANAHTARI = 'yigit-dock-dikkat';

export function initDock() {
  const dock = document.querySelector('[data-dock]');
  if (!dock) return;

  const goster = () => requestAnimationFrame(() => dock.classList.add('is-hazir'));
  const yuklemeAcik = () => document.querySelector('.film-yukleme:not([hidden]):not(.is-bitti)');
  // Film sayacı 250 ms sonra açılır: kısa bir süre bekle, açıldıysa kapanmasını bekle
  setTimeout(() => {
    if (yuklemeAcik()) document.addEventListener('yigit:unlock', () => setTimeout(goster, 350), { once: true });
    else goster();
  }, 700);

  // Kenara çekilme
  const gorunur = new Set();
  let bekliyor = false;
  const olc = () => {
    bekliyor = false;
    const d = dock.getBoundingClientRect();
    const pay = 12;
    let carpisma = false;
    for (const el of gorunur) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.left < d.right + pay && r.right > d.left - pay && r.top < d.bottom + pay && r.bottom > d.top - pay) { carpisma = true; break; }
    }
    dock.classList.toggle('is-kacik', carpisma);
  };
  const planla = () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(olc); } };

  const io = new IntersectionObserver((kayitlar) => {
    for (const k of kayitlar) k.isIntersecting ? gorunur.add(k.target) : gorunur.delete(k.target);
    planla();
  });
  const izle = () => document.querySelectorAll(ENGELLER).forEach((el) => io.observe(el));
  izle();
  // 3B sahne sonradan canlanır (.is-live): kalıp düğmelerini o zaman da izle
  new MutationObserver(izle).observe(document.querySelector('.xhero') || document.createElement('i'), { attributes: true, attributeFilter: ['class'] });
  addEventListener('scroll', planla, { passive: true });
  addEventListener('resize', planla, { passive: true });

  // Dikkat halkası: oturumda bir kez
  let dikkatGosterildi = false;
  try { dikkatGosterildi = sessionStorage.getItem(DIKKAT_ANAHTARI) === '1'; } catch {}
  if (!dikkatGosterildi) {
    // Hazır olduktan 4 sn sonra balon 6 sn görünür; o an düğmeler kenara çekilmişse bir sonraki uygun anı bekler
    const dene = () => {
      if (!dock.classList.contains('is-hazir') || dock.classList.contains('is-kacik')) return setTimeout(dene, 1500);
      dock.classList.add('is-dikkat');
      try { sessionStorage.setItem(DIKKAT_ANAHTARI, '1'); } catch {}
      setTimeout(() => dock.classList.remove('is-dikkat'), 6000);
    };
    setTimeout(dene, 4700);
  }
  // Kullanıcı bir düğmeye dokunduysa artık dikkat çekmeye gerek yok
  dock.addEventListener('pointerdown', () => { try { sessionStorage.setItem(DIKKAT_ANAHTARI, '1'); } catch {} }, { once: true });
}

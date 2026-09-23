import 'lenis/dist/lenis.css';
import '../css/main.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initRail } from './nav/led-bar.js';
import { initGroups } from './sections/groups.js';
import { initProduct } from './store/product.js';
import { initCalculator } from './store/calculator.js';
import { initRooms } from './sections/rooms.js';
import { initReveal } from './sections/reveal.js';
import { initFilm, destroyFilm } from './sections/film.js';
import { initCart } from './store/cart.js';
import { initDock } from './sections/dock.js';
import { initQuickAdd } from './store/quick-add.js';
import { initOzellikler } from './store/ozellikler.js';
import { initNumune } from './store/numune.js';
import { initExport } from './sections/export.js';
import { initHarita } from './sections/harita.js';
import { initTanitim } from './sections/film-tanitim.js';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ağırlıklı kaydırma (Lenis), GSAP'ın tek zamanlayıcısından sürülür.
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

initRail();
initFilm();
initGroups();
initProduct();
initCalculator();
initCart();
initRooms();
initReveal();
initDock();
initTanitim();
initQuickAdd();
initOzellikler();
initNumune();
initExport();
initHarita();
// İletişim formu gönderildiyse onay mesajına odaklan (ekran okuyucu duyurur)
// (tarayıcının #contact_form'a atlaması bittikten sonra; aksi halde odak geri alınır)
requestAnimationFrame(() => document.querySelector('[data-contact-ok]')?.focus({ preventScroll: true }));
document.addEventListener('shopify:section:unload', (e) => destroyFilm(e.target));
document.addEventListener('shopify:section:load', (e) => {
  initFilm(e.target);
  initGroups(e.target);
  initProduct(e.target);
  initCalculator(e.target);
  initRooms(e.target);
  initReveal(e.target);
  initExport(e.target);
  initHarita(e.target);
});
// Çekmece açıkken sayfa kaydırması durur
// Bölümlerden gelen kaydırma isteği (ör. filmdeki "Animasyonu geç"): Lenis varsa onunla yumuşak kaydırılır
document.addEventListener('yigit:scroll-to', (e) => {
  const y = Number(e.detail?.y);
  if (!Number.isFinite(y)) return;
  if (lenis) lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
});

document.addEventListener('yigit:lock', () => {
  lenis?.stop();
  document.documentElement.classList.add('is-locked');
});
document.addEventListener('yigit:unlock', () => {
  lenis?.start();
  document.documentElement.classList.remove('is-locked');
});
// Sıralama gibi tek alanlı formlar seçim yapılınca gönderilir
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-autosubmit]')) e.target.form.requestSubmit();
});



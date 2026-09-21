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
});
// Çekmece açıkken sayfa kaydırması durur
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

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Ana sayfa sahnesi: kalıp seçimi + kaydırma anlatısı. three.js yalnız burada ve ayrı parçada yüklenir.
const hero = document.querySelector('[data-extrusion]');
if (hero) {
  const chips = [...hero.querySelectorAll('[data-shape]')].filter((el) => el.classList.contains('die'));
  const product = hero.querySelector('[data-readout-product]');
  const group = hero.querySelector('[data-readout-group]');
  const groupTitle = hero.querySelector('[data-readout-title]');
  const intro = hero.querySelector('.xhero__intro');
  const stages = [...hero.querySelectorAll('.stage')];
  const swatches = [...hero.querySelectorAll('[data-finish]')];
  // Durakların görünür olduğu kaydırma aralıkları (extrusion.js'teki STORY ile uyumlu)
  const RANGES = [[0.07, 0.34], [0.36, 0.64], [0.64, 0.86], [0.86, 1.01]];
  let scene = null;
  let autoLed = false;
  let lastP = 0;

  const select = (chip) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    if (product && chip.dataset.productUrl) {
      product.href = chip.dataset.productUrl;
      product.textContent = chip.dataset.productTitle;
    }
    if (group && chip.dataset.collectionUrl) group.href = chip.dataset.collectionUrl;
    if (groupTitle) groupTitle.textContent = chip.dataset.title;
    hero.dataset.shape = chip.dataset.shape;
    scene?.setShape(chip.dataset.shape);
  };
  chips.forEach((c) => c.addEventListener('click', () => select(c)));

  const onStory = (p) => {
    lastP = p;
    hero.style.setProperty('--intro', (1 - smooth(0, 0.07, p)).toFixed(3));
    hero.style.setProperty('--room', smooth(0.86, 0.93, p).toFixed(3)); // son %7'de oda tam görünür kalır
    hero.style.setProperty('--dusk', smooth(0.78, 0.86, p).toFixed(3));
    hero.classList.toggle('is-story', p > 0.05);
    // Açılış metni görünmez olunca klavye odağı da oraya düşmesin
    if (intro) intro.inert = p > 0.06;
    stages.forEach((el, i) => el.classList.toggle('is-active', !!RANGES[i] && p >= RANGES[i][0] && p < RANGES[i][1]));
    // extrusion.js ile aynı kural: bir rengin ardından gelene geçişi aralığın son çeyreğinde tamamlanır
    const f = clamp01((p - 0.44) / 0.2) * (swatches.length - 1);
    const fi = Math.min(Math.floor(f), swatches.length - 2) + (f - Math.min(Math.floor(f), swatches.length - 2) > 0.775 ? 1 : 0);
    swatches.forEach((s, i) => s.toggleAttribute('data-active', i === fi));
    // LED ve kapak durağı kanallı kesit ister: anlatı başlarken LED kanal kalıbına geçilir.
    if (p > 0.03 && !autoLed) {
      autoLed = true;
      const led = chips.find((c) => c.dataset.shape === 'led');
      if (led && hero.dataset.shape !== 'led') select(led);
    }
    scene?.setStory(p);
  };

  const debugStory = new URLSearchParams(location.search).get('story');
  if (!reduce && debugStory === null) {
    ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', onUpdate: (self) => onStory(self.progress) });
  }

  const supportsWebGL = (() => {
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
  })();
  if (supportsWebGL) {
    import('./hero/extrusion.js').then(({ mountExtrusion }) => {
      scene = mountExtrusion(hero, {
        shape: hero.dataset.shape || chips[0]?.dataset.shape,
        kelvin: Number(document.documentElement.dataset.kelvin) || 3000,
      });
      hero.classList.add('is-live');
      if (debugStory !== null) onStory(Number(debugStory)); // yalnız ekran görüntüsü denetimi için: ?story=0.5
      else if (lastP) scene.setStory(lastP);
    });
  }

  document.addEventListener('yigit:kelvin', (e) => scene?.setKelvin(e.detail.kelvin));
  document.addEventListener('shopify:section:unload', (e) => { if (e.target.contains(hero)) scene?.destroy(); });
}

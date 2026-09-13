// Film Worker'ı: motor OffscreenCanvas üzerinde çalışır; ana iş parçacığıyla yalnız mesajlaşır.
// Vite bunu ana pakete gömer (film.js → ?worker&inline) ve tarayıcıda blob: adresinden başlatır:
// tema JS'i Shopify'da cdn.shopify.com'dan gelir, Worker ise sayfayla aynı kökenden başlatılmak zorundadır.
import { filmMotoru, adresUretici } from './film-motor.js';

let motor = null;
const raf = typeof self.requestAnimationFrame === 'function' ? (cb) => self.requestAnimationFrame(cb) : (cb) => setTimeout(cb, 16);
const iptal = typeof self.cancelAnimationFrame === 'function' ? (id) => self.cancelAnimationFrame(id) : (id) => clearTimeout(id);

self.onmessage = (e) => {
  const m = e.data;
  if (m.tip === 'baslat') {
    motor = filmMotoru({
      tuval: m.tuval,
      sayi: m.sayi,
      adres: adresUretici(m.adres),
      kaynakG: m.kaynakG,
      kaynakY: m.kaynakY,
      bellekteKare: m.bellekteKare,
      raf,
      iptal,
      bildir: (olay) => self.postMessage(olay),
    });
    motor.boyutla(m.g, m.h);
  } else if (m.tip === 'hedef') {
    motor?.hedefle(m.i, m.yon, m.hizli);
  } else if (m.tip === 'boyut') {
    motor?.boyutla(m.g, m.h);
  } else if (m.tip === 'dur') {
    motor?.destroy();
    self.close();
  }
};

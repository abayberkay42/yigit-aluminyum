// Ana sayfa filmi, ana iş parçacığı tarafı. Videonun kareleri kaydırdıkça oynar. Yalnız masaüstü; telefonda hiçbir
// kare indirilmez. Kareler Shopify Dosyalar'da "önek + sıra numarası" adıyla durur (yigit-film-0001.webp …).
//
// İş bölümü:
//   - Kare indirme, çözme ve çizim film-motor.js'te. Mümkünse Worker + OffscreenCanvas içinde çalışır (film-isci.js):
//     ana iş parçacığına bitmap hiç gelmez, sayfa kaydırması filmden bağımsız akar. Firefox'ta bir kareyi çözmek
//     ~30 ms (gerçek Firefox ölçümü); bu iş ana iş parçacığında kalınca kaydırma takılıyordu.
//     OffscreenCanvas yoksa motor burada çalışır (yedek yol). ?film=ana yedek yolu zorlar (karşılaştırma ölçümü).
//   - Burada: kaydırma → kare numarası, film sonu geçişi, yükleme sayacı, tuval boyutu.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FilmIscisi from './film-isci.js?worker&inline';
import { filmMotoru, adresUretici } from './film-motor.js';

const MASAUSTU = '(min-width: 64em) and (hover: hover) and (pointer: fine)';
const HIZLI_KAYDIRMA = 3; // bir güncellemede bu kadar kareden fazla atlanıyorsa ileriye çözme yapılmaz
// Kaydırmanın son %12'si: film son karede durur ve sayfa zeminine erir; alttaki 3B sahneye kenarsız geçilir
const FILM_SONU = 0.88;
const YUKLEME_GOSTER_MS = 250; // kareler önbellekten hızlı gelirse sayaç hiç görünmez
const GEC_DUGMESI_MS = 10000; // yavaş bağlantıda ziyaretçi sayaçta sıkışıp kalmasın

export function initFilm(root = document) {
  root.querySelectorAll('[data-film]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    // Her örnek kendi medya sorgusunda çalışır (masaüstü yatay / mobil dikey); öteki cihazda hiç başlamaz
    if (!matchMedia(el.dataset.media || MASAUSTU).matches) return;
    // Yalnız mobil örnek: "Veri tasarrufu" açıksa kareler indirilmez, ilk kare durağan gösterilir
    if (el.dataset.veri === 'koru' && navigator.connection?.saveData) { el.classList.add('is-durgun'); return; }
    // Kareler Dosyalar'a henüz yüklenmediyse ekranlarca boş koyu alan bırakılmaz: bölüm gizlenir, sayfa
    // 3B sahneyle açılır. Ek istek yok; masaüstünde zaten yüklenen ilk kare görselinin sonucuna bakılır.
    const afis = el.querySelector('.film__poster img');
    const bos = () => {
      el.classList.add('is-bos');
      el._film?.destroy();
      delete el._film;
      ScrollTrigger.refresh(); // yükseklik değişti: alttaki sahnelerin kaydırma noktaları yeniden hesaplanır
    };
    if (afis) {
      if (afis.complete && afis.naturalWidth === 0) { bos(); return; }
      afis.addEventListener('error', bos, { once: true });
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // son kare durağan gösterilir (CSS)
    el._film = oynatici(el);
  });
}

export function destroyFilm(root = document) {
  root.querySelectorAll('[data-film]').forEach((el) => {
    el._film?.destroy();
    delete el._film;
    delete el.dataset.ready;
  });
}

function oynatici(el) {
  const sayi = Number(el.dataset.count) || 0;
  const hane = Number(el.dataset.digits) || 4;
  const kaynakG = Number(el.dataset.width) || 2560;
  const kaynakY = Number(el.dataset.height) || 1440;
  const bellekteKare = Number(el.dataset.bellek) || 16; // telefonda düşük: iOS Safari bellek sınırı
  // file_url ilk karenin adresini verir; taban adres ondan türetilir (sorgu dizesi atılır).
  // Adres TAM adrese çevrilir: Worker blob:/data: adresinden başladığı için göreli ("/files/…") ya da Shopify'ın
  // protokolsüz ("//cdn.shopify.com/…") adresini kendi başına çözemez; çevrilmezse hiçbir kare inmez.
  const ilk = new URL(el.dataset.first, location.href).href.split('?')[0];
  const ilkAd = `${el.dataset.prefix}${String(1).padStart(hane, '0')}.${el.dataset.ext}`;
  const adresBilgisi = { taban: ilk.slice(0, ilk.length - ilkAd.length), onek: el.dataset.prefix, hane, uzanti: el.dataset.ext };

  const sticky = el.querySelector('.film__sticky');
  const tuval = el.querySelector('.film__canvas');
  const durum = { hedef: 0, cizilen: -1, inen: 0, cozulmus: 0, sayi, yol: 'isci' };
  const yukleme = yuklemeEkrani(el);

  const olay = (o) => {
    if (o.tip === 'canli') el.classList.add('is-live');
    else if (o.tip === 'ilerleme') { durum.inen = o.inen; yukleme?.ilerle(o.hazirInen, o.hazirSayi); }
    else if (o.tip === 'durum') Object.assign(durum, o);
  };

  const ekranBoyutu = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return [Math.round(sticky.clientWidth * dpr), Math.round(sticky.clientHeight * dpr)];
  };
  const [g, h] = ekranBoyutu();

  // Yöntem tarayıcı motoruna göre seçilir: bu bir özellik desteği değil, ölçülmüş performans farkıdır
  // (gerçek tarayıcı ölçümü, tools/film-olcum-tarayici.html; ekran ~200 Hz):
  //   Firefox: <img>+decode 192,8 sayfa fps / OffscreenCanvas 80,9 / ana createImageBitmap 28,8
  //   Chrome : OffscreenCanvas 200 sayfa fps, 35,9 film fps / <img>+decode 143,3 ve 23,3
  // ?film=img | isci | ana yöntemi elle seçer (karşılaştırma ölçümü için).
  const gecko = typeof CSS !== 'undefined' && CSS.supports('-moz-appearance', 'none');
  const elle = new URLSearchParams(location.search).get('film');
  const yontem = ['img', 'isci', 'ana'].includes(elle) ? elle : gecko ? 'img' : 'isci';

  let gonder;
  let bitir;
  const isciIste = yontem === 'isci' && typeof Worker !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype;
  if (isciIste) {
    try {
      // Önce Worker, sonra tuval aktarımı: Worker başlatılamazsa tuval ana iş parçacığında kullanılabilir kalır
      const isci = new FilmIscisi();
      const off = tuval.transferControlToOffscreen();
      isci.onmessage = (e) => olay(e.data);
      isci.postMessage({ tip: 'baslat', tuval: off, sayi, adres: adresBilgisi, kaynakG, kaynakY, bellekteKare, g, h }, [off]);
      gonder = (m) => isci.postMessage(m);
      bitir = () => { isci.postMessage({ tip: 'dur' }); setTimeout(() => isci.terminate(), 200); };
    } catch {
      gonder = null;
    }
  }
  if (!gonder) {
    durum.yol = yontem === 'img' ? 'img' : 'ana';
    const motor = filmMotoru({
      tuval, sayi, adres: adresUretici(adresBilgisi), kaynakG, kaynakY,
      raf: (cb) => requestAnimationFrame(cb),
      iptal: (id) => cancelAnimationFrame(id),
      bildir: olay,
      bellekteKare,
      cozucu: yontem === 'img' ? 'img' : 'bitmap',
    });
    motor.boyutla(g, h);
    gonder = (m) => {
      if (m.tip === 'hedef') motor.hedefle(m.i, m.yon, m.hizli);
      else if (m.tip === 'boyut') motor.boyutla(m.g, m.h);
    };
    bitir = () => motor.destroy();
  }

  // ---------- Kaydırma ----------
  let hedef = 0;
  const tetik = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (s) => {
      const p = s.progress;
      el.style.setProperty('--film-son', Math.min(1, Math.max(0, (p - FILM_SONU) / (1 - FILM_SONU))).toFixed(3));
      const yeni = Math.min(sayi - 1, Math.max(0, Math.round(Math.min(1, p / FILM_SONU) * (sayi - 1))));
      if (yeni === hedef) return;
      const yon = yeni > hedef ? 1 : -1;
      const hizli = Math.abs(yeni - hedef) > HIZLI_KAYDIRMA;
      hedef = yeni;
      durum.hedef = yeni;
      gonder({ tip: 'hedef', i: yeni, yon, hizli });
    },
  });

  const gozlem = new ResizeObserver(() => {
    const [yg, yh] = ekranBoyutu();
    gonder({ tip: 'boyut', g: yg, h: yh });
  });
  gozlem.observe(sticky);

  return {
    // Yalnız okuma: ölçüm araçları (tools/) çizilen karenin hedefe yetişip yetişmediğini buradan izler
    durum: () => ({ ...durum }),
    destroy() {
      tetik.kill();
      gozlem.disconnect();
      bitir();
      yukleme?.kapat();
    },
  };
}

// Yükleme sayacı: kaba geçişin kareleri (her 4. kare, film-motor.js KABA_ADIM) inene kadar sayfa kilitli. Ekran sayfa içeriğinin dışına (body sonuna) taşınır ki
// geri kalan her şey inert yapılabilsin; açıkken klavye odağı arkadaki bağlantılara kaçmaz.
function yuklemeEkrani(el) {
  const kap = el.querySelector('[data-film-yukleme]');
  if (!kap) return null;
  document.body.append(kap);
  const sayac = kap.querySelector('[data-film-sayac]');
  const cubuk = kap.querySelector('[data-film-cubuk]');
  const gec = kap.querySelector('[data-film-gec]');
  let acik = false;
  let bitti = false;
  let sonYuzde = -1;
  const kardesler = () => [...document.body.children].filter((n) => n !== kap && n.tagName !== 'SCRIPT');

  const ac = () => {
    if (acik || bitti) return;
    acik = true;
    kap.hidden = false;
    kardesler().forEach((n) => { n.inert = true; });
    document.dispatchEvent(new CustomEvent('yigit:lock'));
  };
  const gosterZaman = setTimeout(ac, YUKLEME_GOSTER_MS);
  const gecZaman = setTimeout(() => { if (gec) gec.hidden = false; }, GEC_DUGMESI_MS);

  const kapat = () => {
    if (bitti) return;
    bitti = true;
    clearTimeout(gosterZaman);
    clearTimeout(gecZaman);
    if (!acik) { kap.remove(); return; }
    kardesler().forEach((n) => { n.inert = false; });
    document.dispatchEvent(new CustomEvent('yigit:unlock'));
    kap.classList.add('is-bitti');
    setTimeout(() => kap.remove(), 450);
    ScrollTrigger.refresh();
  };
  gec?.addEventListener('click', kapat);

  return {
    ilerle(inen, sayi) {
      const yuzde = Math.min(100, Math.floor((inen / sayi) * 100));
      if (yuzde !== sonYuzde) {
        sonYuzde = yuzde;
        // Dile göre biçim: Türkçe "%42", İngilizce "42%" (locales: home.film.percent)
        sayac.textContent = (sayac.dataset.bicim || '#%').replace('#', String(yuzde));
        cubuk.style.transform = `scaleX(${(inen / sayi).toFixed(3)})`;
      }
      if (inen >= sayi) setTimeout(kapat, 250);
    },
    kapat,
  };
}

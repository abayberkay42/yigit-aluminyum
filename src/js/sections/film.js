// Ana sayfa filmi: videonun kareleri kaydırdıkça oynar. Yalnız masaüstü; telefonda hiçbir kare indirilmez.
// Kareler Shopify Dosyalar'da "önek + sıra numarası" adıyla durur (yigit-film-0001.webp …).
//
// Akıcılık kuralları (donma = ana iş parçacığının kilitlenmesi):
// 1. Sıkıştırılmış kareler kabadan inceye iner (her 32., 16., 8. … kare): kaydırılan her noktanın yakınında
//    gösterilecek bir kare hep hazırdır. Kullanıcının durduğu bölgenin eksik kareleri öne alınır.
// 2. Çözme createImageBitmap ile, kaynağın DOĞAL boyutunda yapılır; ölçekleme drawImage'e bırakılır.
//    Ölçüm (tools/film-olcum.mjs): 2560 kareyi 1920'ye küçülterek çözmek 48 ms, doğal boyutta 28 ms.
// 3. Hızlı kaydırmada ileriye dönük çözme durur; kapasite yalnız hedef kareye gider (her kareyi çözmek
//    mümkün değildir: 4 sn'de 944 kare = saniyede 236 kare).
// 4. Çözülmüş kareler yalnız son kullanılan birkaç tanesi tutulur; 944 kare birden çözülse gigabaytlar eder.
// 5. Tuval yalnız gösterilen kare değişince çizilir.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const MASAUSTU = '(min-width: 64em) and (hover: hover) and (pointer: fine)';
const INDIRME_ESZAMANLI = 8;
const COZME_ESZAMANLI = 3;
const BELLEKTE_KARE = 16;
const ONDEN_COZ = 4;
const HIZLI_KAYDIRMA = 3; // bir güncellemede bu kadar kareden fazla atlanıyorsa ileriye çözme yapılmaz

export function initFilm(root = document) {
  root.querySelectorAll('[data-film]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    if (!matchMedia(MASAUSTU).matches) return;
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
  // file_url ilk karenin adresini verir; taban adres ondan türetilir (sorgu dizesi atılır)
  const ilk = el.dataset.first.split('?')[0];
  const ilkAd = `${el.dataset.prefix}${String(1).padStart(hane, '0')}.${el.dataset.ext}`;
  const taban = ilk.slice(0, ilk.length - ilkAd.length);
  const adres = (i) => `${taban}${el.dataset.prefix}${String(i + 1).padStart(hane, '0')}.${el.dataset.ext}`;

  const tuval = el.querySelector('.film__canvas');
  const ctx = tuval.getContext('2d', { alpha: false });
  const bloblar = new Array(sayi).fill(null);
  const bitmapler = new Map(); // kare -> ImageBitmap (son kullanılan sırayla)
  const cozuluyor = new Set();
  const iniyor = new Set();
  let hedef = 0;
  let cizilen = -1;
  let yon = 1;
  let hizli = false;
  let olcek = null; // { g, y, x, yy } tuvaldeki çizim kutusu
  let kare = 0;
  let bitti = false;

  // ---------- Boyut: tuval ekran pikselinde, kaynaktan büyük değil ----------
  const boyutla = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const g = el.querySelector('.film__sticky').clientWidth;
    const y = el.querySelector('.film__sticky').clientHeight;
    tuval.width = Math.round(g * dpr);
    tuval.height = Math.round(y * dpr);
    // object-fit: cover
    const s = Math.max(tuval.width / kaynakG, tuval.height / kaynakY);
    const cg = Math.round(kaynakG * s);
    const cy = Math.round(kaynakY * s);
    olcek = { g: cg, y: cy, x: Math.round((tuval.width - cg) / 2), yy: Math.round((tuval.height - cy) / 2) };
    // Kareler doğal boyutta çözüldüğü için boyut değişince yeniden çözmek gerekmez; yalnız yeniden çizilir
    cizilen = -1;
    iste();
  };

  // ---------- İndirme sırası: kabadan inceye ----------
  const sira = [];
  {
    const goruldu = new Uint8Array(sayi);
    for (let adim = 32; adim >= 1; adim = adim / 2) {
      for (let i = 0; i < sayi; i += adim) if (!goruldu[i]) { goruldu[i] = 1; sira.push(i); }
    }
    if (!goruldu[sayi - 1]) sira.push(sayi - 1);
  }
  let siraKonum = 0;

  const sonrakiIndirilecek = () => {
    // Önce hedefin çevresindeki eksik kareler
    for (let d = 0; d <= 12; d++) {
      for (const i of [hedef + d * yon, hedef - d * yon]) {
        if (i >= 0 && i < sayi && !bloblar[i] && !iniyor.has(i)) return i;
      }
    }
    while (siraKonum < sira.length) {
      const i = sira[siraKonum++];
      if (!bloblar[i] && !iniyor.has(i)) return i;
    }
    return -1;
  };

  const indir = () => {
    while (!bitti && iniyor.size < INDIRME_ESZAMANLI) {
      const i = sonrakiIndirilecek();
      if (i < 0) return;
      iniyor.add(i);
      fetch(adres(i))
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
        .then((b) => { if (!bitti) { bloblar[i] = b; iste(); } })
        .catch(() => {}) // eksik kare: en yakın karelerle idare edilir
        .finally(() => { iniyor.delete(i); indir(); });
    }
  };

  // ---------- Çözme: ana iş parçacığı dışında, tuval boyutunda ----------
  const coz = (i) => {
    if (bitti || !bloblar[i] || bitmapler.has(i) || cozuluyor.has(i) || cozuluyor.size >= COZME_ESZAMANLI || !olcek) return;
    cozuluyor.add(i);
    createImageBitmap(bloblar[i])
      .then((bm) => {
        if (bitti) { bm.close(); return; }
        bitmapler.set(i, bm);
        // En eski kullanılanları bırak
        while (bitmapler.size > BELLEKTE_KARE) {
          const [eski] = bitmapler.keys();
          if (Math.abs(eski - hedef) <= ONDEN_COZ) break;
          bitmapler.get(eski).close();
          bitmapler.delete(eski);
        }
        iste();
      })
      .catch(() => {})
      .finally(() => { cozuluyor.delete(i); iste(); });
  };

  // ---------- Çizim ----------
  const enYakinCozulmus = () => {
    if (bitmapler.has(hedef)) return hedef;
    let en = -1;
    for (const i of bitmapler.keys()) if (en < 0 || Math.abs(i - hedef) < Math.abs(en - hedef)) en = i;
    return en;
  };

  const ciz = () => {
    kare = 0;
    if (bitti) return;
    coz(hedef);
    if (!hizli) for (let d = 1; d <= ONDEN_COZ; d++) coz(hedef + d * yon);
    const i = enYakinCozulmus();
    if (i >= 0 && i !== cizilen) {
      const bm = bitmapler.get(i);
      // Kullanıldı: sıranın sonuna al
      bitmapler.delete(i);
      bitmapler.set(i, bm);
      ctx.drawImage(bm, olcek.x, olcek.yy, olcek.g, olcek.y);
      cizilen = i;
      if (!el.classList.contains('is-live')) el.classList.add('is-live');
    }
    if (cizilen !== hedef) iste(); // hedef kare henüz hazır değilse bir sonraki karede tekrar dene
  };

  const iste = () => { if (!kare && !bitti) kare = requestAnimationFrame(ciz); };

  // ---------- Kaydırma ----------
  const tetik = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (s) => {
      const yeni = Math.min(sayi - 1, Math.max(0, Math.round(s.progress * (sayi - 1))));
      if (yeni === hedef) return;
      yon = yeni > hedef ? 1 : -1;
      hizli = Math.abs(yeni - hedef) > HIZLI_KAYDIRMA;
      hedef = yeni;
      iste();
      indir();
    },
  });

  const gozlem = new ResizeObserver(() => boyutla());
  gozlem.observe(el.querySelector('.film__sticky'));
  boyutla();
  indir();

  return {
    // Yalnız okuma: ölçüm araçları (tools/) çizilen karenin hedefe yetişip yetişmediğini buradan izler
    durum: () => ({ hedef, cizilen, inen: bloblar.filter(Boolean).length, cozulmus: bitmapler.size, sayi }),
    destroy() {
      bitti = true;
      tetik.kill();
      gozlem.disconnect();
      if (kare) cancelAnimationFrame(kare);
      for (const b of bitmapler.values()) b.close();
      bitmapler.clear();
      bloblar.fill(null);
    },
  };
}

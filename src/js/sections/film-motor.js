// Film motoru: karelerin indirilmesi, çözülmesi ve tuvale çizilmesi. Ortama bağımsızdır; DOM'a dokunmaz.
// Aynı kod iki yerde çalışır:
//   - Worker içinde OffscreenCanvas ile (film-isci.js): ana iş parçacığına hiç bitmap gelmez, sayfa kaydırması
//     filmden bağımsız akar. Firefox'ta bir kareyi çözmek ~30 ms; ana iş parçacığında olsaydı kaydırma takılırdı.
//   - OffscreenCanvas desteklemeyen tarayıcıda ana iş parçacığında (film.js yedek yolu).
//
// Kurallar (ölçümler: tools/film-olcum.mjs, tools/film-olcum-tarayici.html):
// 1. Kareler kabadan inceye iner (her 32., 16., 8. … kare); hedefin çevresindeki eksikler öne alınır.
// 2. Çözme doğal boyutta yapılır, ölçekleme çizime bırakılır (Chrome: küçülterek çözme 48 ms, doğal 29 ms).
// 3. Hızlı kaydırmada ileriye dönük çözme durur; kapasite hedef kareye gider.
// 4. Bellekte yalnız son kullanılan birkaç çözülmüş kare tutulur.
// 5. Tuval yalnız gösterilen kare değişince çizilir.
const INDIRME_ESZAMANLI = 8;
const COZME_ESZAMANLI = 3;
const ONDEN_COZ = 4;

export const adresUretici = ({ taban, onek, hane, uzanti }) => (i) => `${taban}${onek}${String(i + 1).padStart(hane, '0')}.${uzanti}`;

// tuval: HTMLCanvasElement ya da OffscreenCanvas. raf/iptal: ortamın kare zamanlayıcısı.
// cozucu: 'bitmap' → createImageBitmap (Worker'da da çalışır)
//         'img'    → <img> + decode(); yalnız ana iş parçacığında. Firefox <img> görsellerini ayrı çözme iş
//                    parçacıklarında çözer, createImageBitmap'i ana iş parçacığında. Gerçek Firefox ölçümü
//                    (tools/film-olcum-tarayici.html): createImageBitmap 28,8 sayfa fps ve 301 ekran karesinin
//                    240'ı 25 ms üstü; <img>+decode 192,8 fps ve 0. Chrome'da ise <img> yolu daha zayıf.
// bildir(olay): { tip: 'canli' } ilk kare çizilince, { tip: 'ilerleme', inen, sayi }, { tip: 'durum', … }
// bellekteKare: bellekte tutulacak çözülmüş kare sayısı (masaüstü 16; telefonda 8, iOS Safari bellek sınırı)
export function filmMotoru({ tuval, sayi, adres, kaynakG, kaynakY, raf, iptal, bildir, cozucu = 'bitmap', bellekteKare = 16 }) {
  const BELLEKTE_KARE = Math.max(4, bellekteKare);
  const ctx = tuval.getContext('2d', { alpha: false });
  const bloblar = new Array(sayi).fill(null);
  // Başarısız istekler: her kare en fazla bir kez yeniden denenir; ikinci başarısızlıkta vazgeçilir ve
  // sayaç takılı kalmasın diye BİR kez "tamamlandı" sayılır (yeniden deneme sayacı şişirmez)
  const hataSayisi = new Uint8Array(sayi);
  const vazgecildi = new Uint8Array(sayi);
  let inenSayisi = 0;
  const blobAdresleri = cozucu === 'img' ? new Array(sayi).fill(null) : null; // <img> için blob: adresleri
  const bitmapler = new Map(); // kare -> çözülmüş kare (ImageBitmap ya da çözülmüş <img>), son kullanılan sırayla
  const birak = (kare) => { if (kare && typeof kare.close === 'function') kare.close(); };
  const cozuluyor = new Set();
  const iniyor = new Set();
  let hedef = 0;
  let cizilen = -1;
  let yon = 1;
  let hizli = false;
  let olcek = null; // tuvaldeki çizim kutusu (object-fit: cover)
  let kare = 0;
  let bitti = false;
  let canli = false;
  let sonIlerleme = -1;

  // ---------- İndirme sırası: kabadan inceye ----------
  const sira = [];
  {
    const goruldu = new Uint8Array(sayi);
    for (let adim = 32; adim >= 1; adim = adim / 2) {
      for (let i = 0; i < sayi; i += adim) if (!goruldu[i]) { goruldu[i] = 1; sira.push(i); }
    }
    if (sayi && !goruldu[sayi - 1]) sira.push(sayi - 1);
  }
  let siraKonum = 0;

  const ilerlemeBildir = () => {
    // Her karede değil: yüzde değiştikçe ya da bitince
    const yuzde = Math.floor((inenSayisi / sayi) * 100);
    if (yuzde === sonIlerleme && inenSayisi < sayi) return;
    sonIlerleme = yuzde;
    bildir({ tip: 'ilerleme', inen: inenSayisi, sayi });
  };

  const sonrakiIndirilecek = () => {
    const aday = (i) => i >= 0 && i < sayi && !bloblar[i] && !vazgecildi[i] && !iniyor.has(i);
    for (let d = 0; d <= 12; d++) {
      for (const i of [hedef + d * yon, hedef - d * yon]) if (aday(i)) return i;
    }
    while (siraKonum < sira.length) {
      const i = sira[siraKonum++];
      if (aday(i)) return i;
    }
    // Sıra bitti: bir kez başarısız olmuş kareler için tek yeniden deneme
    for (let i = 0; i < sayi; i++) if (aday(i) && hataSayisi[i] === 1) return i;
    return -1;
  };

  const indir = () => {
    while (!bitti && iniyor.size < INDIRME_ESZAMANLI) {
      const i = sonrakiIndirilecek();
      if (i < 0) return;
      iniyor.add(i);
      fetch(adres(i))
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((b) => {
          if (bitti) return;
          if (!bloblar[i]) inenSayisi++;
          bloblar[i] = b;
          ilerlemeBildir();
          iste();
        })
        .catch(() => {
          if (bitti || bloblar[i] || vazgecildi[i]) return;
          hataSayisi[i]++;
          if (hataSayisi[i] >= 2) {
            // İki kez inmedi: vazgeç; film bu kareyi en yakın karelerle idare eder, sayaç bir kez ilerler
            vazgecildi[i] = 1;
            inenSayisi++;
            ilerlemeBildir();
          }
        })
        .finally(() => { iniyor.delete(i); indir(); });
    }
  };

  // ---------- Çözme ----------
  const coz = (i) => {
    if (bitti || i < 0 || i >= sayi || !bloblar[i] || bitmapler.has(i) || cozuluyor.has(i) || cozuluyor.size >= COZME_ESZAMANLI) return;
    cozuluyor.add(i);
    let is;
    if (cozucu === 'img') {
      const im = new Image();
      im.decoding = 'async';
      blobAdresleri[i] ??= URL.createObjectURL(bloblar[i]);
      im.src = blobAdresleri[i];
      is = im.decode().then(() => im);
    } else {
      is = createImageBitmap(bloblar[i]);
    }
    is
      .then((cozulmus) => {
        if (bitti) { birak(cozulmus); return; }
        bitmapler.set(i, cozulmus);
        while (bitmapler.size > BELLEKTE_KARE) {
          const [eski] = bitmapler.keys();
          if (Math.abs(eski - hedef) <= ONDEN_COZ) break;
          birak(bitmapler.get(eski));
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
    if (bitti || !olcek) return;
    coz(hedef);
    if (!hizli) for (let d = 1; d <= ONDEN_COZ; d++) coz(hedef + d * yon);
    const i = enYakinCozulmus();
    if (i >= 0 && i !== cizilen) {
      const bm = bitmapler.get(i);
      bitmapler.delete(i);
      bitmapler.set(i, bm);
      ctx.drawImage(bm, olcek.x, olcek.y, olcek.g, olcek.h);
      cizilen = i;
      if (!canli) { canli = true; bildir({ tip: 'canli' }); }
      bildir({ tip: 'durum', hedef, cizilen, inen: inenSayisi, cozulmus: bitmapler.size, sayi });
    }
    if (cizilen !== hedef) iste();
  };

  const iste = () => { if (!kare && !bitti) kare = raf(ciz); };

  indir();

  return {
    // Kare numarası, kaydırma yönü ve hızlı kaydırma bilgisi
    hedefle(i, yeniYon, yeniHizli) {
      if (i === hedef) return;
      yon = yeniYon;
      hizli = yeniHizli;
      hedef = Math.min(sayi - 1, Math.max(0, i));
      iste();
      indir();
    },
    // Tuvalin ekran pikseli boyutu (CSS boyutu × cihaz piksel oranı)
    boyutla(g, h) {
      if (!g || !h) return;
      tuval.width = g;
      tuval.height = h;
      const s = Math.max(g / kaynakG, h / kaynakY);
      const cg = Math.round(kaynakG * s);
      const ch = Math.round(kaynakY * s);
      olcek = { g: cg, h: ch, x: Math.round((g - cg) / 2), y: Math.round((h - ch) / 2) };
      cizilen = -1; // boyut değişince tuval temizlenir; kareler doğal boyutta olduğu için yeniden çözmek gerekmez
      iste();
    },
    durum: () => ({ hedef, cizilen, inen: inenSayisi, cozulmus: bitmapler.size, sayi }),
    destroy() {
      bitti = true;
      if (kare) iptal(kare);
      for (const b of bitmapler.values()) birak(b);
      bitmapler.clear();
      if (blobAdresleri) for (const a of blobAdresleri) if (a) URL.revokeObjectURL(a);
      bloblar.fill(null);
    },
  };
}

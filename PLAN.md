# Yiğit Alüminyum — Geliştirme Planı (iç belge)

Müşteriye giden plan: `Downloads/Yigit-Aluminyum-Proje-Plani.pdf`. Bu belge ekip içi çalışma planıdır.

## Çalışma yöntemi

| Klasör | İçerik | Shopify'a gider mi |
|---|---|---|---|
| `theme/` | Shopify OS 2.0 teması, birebir klasör yapısıyla (layout, sections, snippets, templates, locales, config, assets) | Evet, aktarımda yalnızca bu klasör |
| `src/` | JS ve CSS kaynakları; Vite `theme/assets/` içine derler | Hayır (derlenmiş hali gider) |
| `dev/` | Shopify'ı yerelde taklit eden sunucu (LiquidJS), örnek veri | Hayır |

Çalıştırma: `npm run dev` → http://localhost:3019 (TR), http://localhost:3019/en (EN). Örnek veriyi yenilemek: `npm run mock`.

Örnek veri, canlı mağazanın herkese açık JSON'undan gelir (55 ürün, 9 koleksiyon). Ürün görselleri yalnızca yer tutucudur; yeni çekimler geldiğinde değişecek.

## Shopify uyumluluk kuralları

1. Yalnızca Shopify'da var olan Liquid filtre ve etiketleri kullanılır. `dev/lib/shopify.mjs` içinde karşılığı olmayan filtre hata verir; yeni filtre eklemeden önce Shopify'da aynı adla ve aynı davranışla var olduğu doğrulanır.
2. Kodda sabit metin yoktur. Arayüz metni `locales/*.json` üzerinden (`| t`), içerik metni bölüm ayarlarından gelir. Çeviri bize ait olduğu için bütün metin bu iki yerde toplanır.
3. Müşterinin değiştireceği her şey tema düzenleyicide ayar olarak bulunur: başlık, metin, görsel, video, bağlantı, ürün/koleksiyon seçimi.
4. Ürüne özgü teknik veri (kesit çizimi, ölçüler, boy uzunluğu, kapak tipi, uygun LED şerit genişliği) ürün meta alanlarında durur; yerel örnek veride aynı ad alanıyla (`custom.*`) tutulur.
5. CSS'te fiziksel yön yok (`left/right`, `margin-left`); mantıksal özellikler kullanılır. Arapça eklendiğinde düzen kendiliğinden döner.
6. Her bölümün JS'i kendi modülünde başlar ve temizlenir; tema düzenleyicideki `shopify:section:load` / `unload` olaylarına bağlanır.
7. Tek WebGL sahnesi vardır (ana sayfa LED bölümü). Görünür olunca yüklenir; telefonda ve azaltılmış harekette video/görsel karşılığı gösterilir.
8. Satış mantığı Shopify'ın kendi özellikleriyle kurulur: varyant (Renk × Kapak), otomatik indirim (300 m kademesi), Translate & Adapt. Tema bunları yalnızca gösterir.

## Fazlar ve kullanılacak skill'ler

| Faz | İş | Skill'ler | Durum |
|---|---|---|---|
| 0 | Yerel altyapı: Shopify taklit sunucusu, tema iskeleti, örnek veri, PRODUCT.md | frontend-architecture, impeccable (init) | ✓ bitti |
| 1 | Sanat yönü ve tasarım sistemi: renk, yazı, boşluk, hareket belirteçleri; kesit çizim sistemi; stil sayfası. Çekim yönergesi (müşteriye) | impeccable (brand, palette), ui-ux-pro-max, emil-design-eng, design-taste-frontend, high-end-visual-design, typography-system, brandkit, frontend-design, gpt-taste ve stitch-design-taste (şablon kokusu denetimi), imagegen-frontend-web + image-to-code (nanobanana bağlanınca), storytelling-ux, copywriting | ✓ bitti (yön değişti: LED menü çubuğu + canlı ekstrüzyon) |
| 2 | Ana sayfa yapısı: 8 bölüm, gerçek HTML, düzen ve duyarlı davranış, hareketsiz hali | ui-ux-pro-max, emil-design-eng, storytelling-ux, cinematic-web, responsive-design, site-architecture, page-cro | ✓ bitti (anlatı, üretim, ürün grupları, iki yol) |
| 3 | Hareket katmanı: Lenis, tek ana zaman çizelgesi, sabitlenen sahneler, kesit dönüşümü, azaltılmış hareket yolu | emil-design-eng, ui-ux-pro-max, gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins (SplitText, MorphSVG, DrawSVG, Flip), gsap-utils, gsap-performance, lenis-smooth-scroll, animate, apple-design, animation-vocabulary, find-animation-opportunities, improve-animations, review-animations | ✓ bitti (Lenis + ScrollTrigger, açılma efektleri, azaltılmış hareket yolu) |
| 4 | LED sahnesi (tek WebGL): kesitten üretilen 3B profil, 3000K/4000K/6500K ışık seçimi, telefon karşılığı | threejs-fundamentals, threejs-geometry, threejs-materials, threejs-lighting, threejs-shaders, threejs-postprocessing, threejs-textures, threejs-interaction, webgl-performance | ✓ bitti — gerçek kesit çizimleri gelince yeniden ele alınacak |
| 5 | Görüntü hattı: video kodlama, kaydırmalı kare dizisi, poster kareleri, görsel boyutları | web-video-encoding, seo-images | kısmen — oda görselleri üretildi; müşteri videoları ve gerçek ürün çekimleri bekleniyor |
| 6 | Mağaza sayfaları: koleksiyon, ürün (varyant, metraj hesaplayıcı, kademe), sepet çekmecesi, arama | ui-ux-pro-max, emil-design-eng, page-cro, seo-ecommerce, seo-schema, wcag-audit | ✓ bitti — metraj hesaplayıcı satış birimi kararına bağlı |
| 7 | Kurumsal sayfalar: üretim, kullanım alanları, hakkımızda, toptan/bayilik, iletişim, katalog, VR | ui-ux-pro-max, emil-design-eng, copywriting, site-architecture, web-maps (statik harita + yol tarifi) | ✓ bitti — film, sayılar, belgeler ve VR içeriği bekleniyor |
| 8 | Dil ve SEO: TR/EN, Arapça hazırlığı, yapılandırılmış veri, eski adreslerin 301 haritası, geçiş öncesi temel çizgi | rtl-arabic, seo-hreflang, seo-technical, seo-schema, seo-sitemap, seo-drift | ✓ bitti — sayfa içeriklerinin İngilizcesi aktarımda girilecek |
| 9 | Kalite: erişilebilirlik, performans, Playwright görsel testleri, azaltılmış hareket ve telefon kontrolleri | ui-ux-pro-max, emil-design-eng, wcag-audit, web-perf, webapp-testing, verification-before-completion, review-animations | ✓ bitti (axe 0 ihlal, tema denetimi 0 bulgu) |
| 10 | Çevrim içi önizleme ve müşteri onayı | — | bekliyor — temanın mağazaya yüklenmesi gerekiyor (Shopify erişimi) |
| 11 | Shopify aktarımı: tema yükleme (yayımlanmamış), meta alanlar, indirimler, çeviriler, 301'ler, yayına alma | writing-skills (Shopify tema skill'i bu fazda yazılır), seo-drift, seo-technical | hazır — paket ve aktarım notları yazıldı, `shopify-liquid-themes` skill'i yazılıp test edildi; yayın müşteri onayına bağlı |

Kullanılmayanlar ve nedeni: react-three-fiber ve react-view-transitions (Liquid'de React yok, vanilla Three.js), headless-cms (yönetim Shopify'da), web-audio-ambient (ses kapsam dışı), minimalist-ui ve industrial-brutalist-ui (bu sanat yönüne uymuyor; "endüstriyel = brutalist" tam kaçınılan kalıp), redesign-existing-projects (sıfırdan tasarım).

## Fikirler

1. **Kesitten 3B profil.** Ürünün kalıp kesit çizimi (DXF/SVG) Three.js `ExtrudeGeometry` ile doğrudan 3B profile çevrilir; ayrıca model çizdirmeye gerek kalmaz. LED sahnesinde bu profil duvara yerleşir, ziyaretçi 3000K / 4000K / 6500K seçer, ışık değişir. Aynı çizim katalogda, ürün sayfasında ve teknik föyde tekrar kullanılır.
2. **Kesit çizimi sitenin görsel imzası.** Ürün kartında fotoğrafın yanında gerçek kesit ve ölçüleri; ürün grupları bölümünde tek bir kesit, kaydırdıkça bir gruptan diğerine dönüşür (MorphSVG). Ölçü çizgileri yalnızca gerçek ölçüleri gösterir.
3. **Üretim hattı kaydırmayla ilerler.** Fabrika çekimi kare dizisine çevrilir, kaydırmayla ileri-geri oynatılır (canvas; video `currentTime` Safari ve Android'de takılır). Her aşamada tek satır gerçek teknik değer: pres tonajı, kalıp sayısı, boy uzunluğu, günlük kapasite.
4. **Metraj hesaplayıcı** (ürün sayfası). Toplam metre ya da oda ölçüsü girilir; kaç boy gerektiği, fire payı ve 300 m kademesine ne kadar kaldığı gösterilir; sonuç adet olarak sepete gider.
5. **Gerçek numuneyle renk ve kapak seçimi.** Renk kutusu yerine her eloksal/boya renginin makro çekimi; kapak (opal/şeffaf) seçildiğinde ışığın görünümü değişir.
6. **Oda üzerinde ürün noktaları** (kullanım alanları). 8 odanın profesyonel çekimi üzerinde profilin kullanıldığı noktalar; nokta ürüne götürür. Aynı bilgi liste olarak da vardır.
7. **İki kapı.** Toptan/proje (teknik föy, numune talebi, bayilik formu, WhatsApp) ve uygulamacı/son kullanıcı (mağaza, hesaplayıcı, montaj videosu). Ana sayfa kapanışında ve menüde.
8. **Otomatik teknik föy.** Her ürün sayfası meta alanlardan yazdırılabilir bir teknik föy üretir (kesit, ölçüler, renkler, boy). Ayrı PDF hazırlamaya gerek kalmaz.
9. **Numune talebi.** Mevcut "numuneler" koleksiyonu proje müşterisi için düşük eşikli ilk adıma dönüşür.
10. **Açılış yükleme ekranıdır.** Açılışta kesit çizimi çizilir, arkada fabrika videosu yüklenir; iki saniyenin altında, tekrar ziyarette atlanır.

## Bu fikirler için müşteriden gerekenler

- Her ürünün kalıp kesit çizimi (DXF, DWG ya da ölçülü PDF).
- ~~Logonun vektör dosyası~~ ✓ geldi (2026-09-12, `YİĞİT ALÜMİNYUM PROFİL LOGO TASARIM.pdf`); menü çubuğu, sayfa altı ve sekme simgesi bundan üretildi. Kalan: **tek renk (beyaz, siyah) sürüm** — koyu zeminli bölüm ya da tek renk baskı gerekirse lazım, bugünkü tasarımda kullanılan yer yok.
- Üretim aşamalarının gerçek teknik değerleri (pres tonajı, kalıp sayısı, boy uzunluğu, kapasite, alan).
- Renk ve kapak numunelerinin makro çekimi (çekim yönergesinde yer alacak).
- 8 kullanım alanının ürünler monte edilmiş çekimi.
- Açık kararlar: satış birimi (metre/boy) ve boy uzunluğu, alan adı senaryosu, ödeme/taksit sağlayıcısı, VR içeriğinin biçimi, Arapça kapsamı.

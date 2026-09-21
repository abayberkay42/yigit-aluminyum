# Shopify'a aktarım notları

Mağaza aynı kaldığı için ürün, koleksiyon, sayfa ve blog adresleri değişmez. Eski sitenin site haritasındaki 92 adres (2026-09-11) tek tek karşılaştırıldı; değişen tek adres iletişim sayfasıdır.

## Yönlendirmeler

`redirects.csv` Shopify > Online Mağaza > Gezinme > URL yönlendirmeleri > İçe aktar ile yüklenir.

| Eski | Yeni | Neden |
|---|---|---|
| `/pages/i̇leti̇şi̇m` | `/pages/iletisim` | Eski tutamakta bozuk Türkçe karakter var (i + birleşik nokta). Sayfanın tutamağı `iletisim` yapılır; Shopify tutamak değişince "yönlendirme oluştur" seçeneğini de sunar, CSV yedektir. |

Ürün adreslerindeki bozuk karakterli 8 tutamağa dokunulmaz (çalışıyor ve sıralamada).

## Sayfa şablonu atamaları

Shopify > Sayfalar > sayfa > Tema şablonu:

| Sayfa (tutamak) | Şablon | Not |
|---|---|---|
| `kurumsal` | `page.kurumsal` | Mevcut sayfa ve metni kalır |
| `uretim` | `page.uretim` | Süreç adımları şablonda (firmanın mevcut üretim metninden) |
| `kullanim-alanlari` | `page.kullanim-alanlari` | **Yeni sayfa oluşturulur** |
| `iletisim` | `page.iletisim` | Tutamak değişir, bkz. yönlendirme |
| `s-s-s` | `page.sss` | Mevcut sayfa ve içeriği kalır |
| `kataloglar` | `page.kataloglar` | PDF'ler şablondaki bloklarda |
| `html-sitemap*` | varsayılan `page` | SEOAnt uygulamasının sayfaları; uygulama kalırsa dokunulmaz |

## Ürün şablonu atamaları

Ürünler > toplu düzenleyici > Tema şablonu. Varsayılan `product` LED profilleri içindir.

| Ürün türü | Şablon |
|---|---|
| Trimless LED profilleri (trimless, ters trimless, esnek trimless, trimless iç/dış köşe, tek kanatlı ters trimless, indirekt trimless) | `product.trimless` |
| Duvar paneli profilleri, duvar kaplamaları | `product.panel` |
| Fuga profilleri, alçıpan Z profili | `product.fuga` |
| Alüminyum süpürgelik, süpürgelik aparatları | `product.supurgelik` |
| LED'li süpürgelik dahil diğer bütün LED ürünleri | `product` (varsayılan) |

## Dosyalar

Şablonlar görselleri `shopify://shop_images/<ad>` ile anar. Aktarımda Shopify > İçerik > Dosyalar'a aynı adla yüklenir:
`room-salon.webp, room-koridor.webp, room-mutfak.webp, room-yatak.webp, room-banyo.webp, room-ofis.webp, room-galeri.webp, room-dis.webp` (bizim ürettiğimiz oda görselleri). Katalog kapakları ve üretim görselleri mağazanın Dosyalar'ında zaten var.

**Trimless rehber görselleri (23 dosya, 1 MB):** `dist/shopify-dosyalar/trimless/` klasöründeki `trimless-*.webp` dosyaları aynı adla yüklenir. Firmanın "TRİMLESS LED PROFİLLERİ" klasöründen (2026-09-18) WebP'ye çevrildi, büyütülmedi (`tools/trimless-gorseller.py`). `product.trimless` şablonu bunları kullanır: spot / trimless karşılaştırması, 8 adımlı uygulama, "montajda kapağı çıkarmayın" (doğru / yanlış), 4 adımlı difüzör kapak montajı, 45° köşe kesimi. Bütün bölümler kart düzeninde görünür: rehber görsellerinin içindeki tekil görseller (adım görselleri, yanlış/doğru fotoğrafları, oda görselleri) kartlarda kullanılır. Tek görsellik rehberler (`trimless-*-rehber.webp`) "Özet görsel" alanında durur; bölümün "Görünüm" ayarı "… ve özet görsel" ya da "Yalnız özet görsel" seçilirse sayfaya basılır. Bölüm metinleri görsellerdeki metinlerin aynısıdır.

## Ana sayfa tanıtım filmi (masaüstü 944 kare, mobil 361 kare)

Ana sayfanın en başındaki kaydırmalı film, videonun kareleri olarak Dosyalar'da durur. İki ayrı video vardır, her cihaz yalnız kendi karelerini indirir:

| | Kaynak video | Kareler | Klasör |
|---|---|---|---|
| Masaüstü | `0913(1).mp4` (4K, 60 kare/sn) | 944 × 2560 genişlik WebP %90, 138 MB | `dist/shopify-dosyalar/film/` → `yigit-film-0001.webp` … `0944` |
| Mobil (64em altı) | `hf_20260913_185616_….mp4` (1080×1920, 24 kare/sn) | 361 × 1080×1920 WebP %90, küçültülmeden, 39 MB | `dist/shopify-dosyalar/film-mobil/` → `yigit-film-mobil-0001.webp` … `0361` |

- Telefonda "Veri tasarrufu" açıksa kareler indirilmez, ilk kare durağan gösterilir.
- Shopify > İçerik > Dosyalar > Dosya yükle; **adlar değiştirilmeden** yüklenir. Tema adresleri ilk kareden türetir, 944 adres ayrıca girilmez.
- **Video olarak yüklenmez.** Shopify videoyu yeniden kodlar ve kaydırmada akıcılık bozulur. Kareler görsel olarak yüklenir.
- Tema içine konmaz: tema toplamı en fazla 50 MB.
- Tema düzenleyici > Ana sayfa > Tanıtım filmi: masaüstü ve mobil için ayrı önek, kare sayısı, ölçü ve kaydırma uzunluğu. Kareler başka adla ya da sayıyla yüklenirse yalnız bu ayarlar değişir. Mobil kare sayısı 0 yazılırsa telefonda film gösterilmez.
- Kontrol: yükleme sonrası ana sayfa önizlemesinde ilk kare görünmeli; kaydırınca film oynamalı. Görünmüyorsa önek ve kare sayısı Dosyalar'daki adlarla aynı mı bakılır.

## Sayfa başı bannerları

Ana sayfa ve ürün sayfaları dışındaki bütün sayfaların başında tam genişlik, sinematik bir banner var: koyu görsel, üzerinde ortalı altın üst etiket, sayfanın başlığı (H1), gerekirse alt etiket ve giriş metni. Menü çubuğu banner üzerindeyken açık renge döner (logonun açık sürümü `assets/yigit-logo-acik.png`, temayla gelir).

**Görseller yapay zekâyla üretildi** (Gemini, 2026-09-19): mekân ve ışık atmosferi gösteren temsili görsellerdir, firmanın gerçek ürün ya da tesis fotoğrafı değildir; içlerinde yazı ve logo yoktur. Gerçek fotoğraf geldiğinde aynı alandan değiştirilir.

`dist/shopify-dosyalar/banner/` klasöründeki 17 dosya (3840 piksel, toplam 4 MB) Shopify > İçerik > Dosyalar'a adları değiştirilmeden yüklenir; şablonlar adıyla anar.

| Sayfa | Dosya | Nereden değişir |
|---|---|---|
| LED Profilleri | `banner-led-profilleri.webp` | Koleksiyon şablonu > Koleksiyon bölümü > "Grup bannerı" blokları (grup başına bir blok) |
| Trimless / Tavan Köşe / Kanal / Kanatlı / Süpürgelik | `banner-trimless`, `-tavan-kose`, `-kanal`, `-kanatli`, `-supurgelik` | Aynı bloklar; alt etiket "LED Profilleri" |
| Duvar Panel / Alçıpan / Numuneler | `banner-duvar-panel`, `-alcipan`, `-numune` | Aynı bloklar |
| Bloğu olmayan diğer gruplar, Ürün grupları sayfası | `banner-urunler.webp` | Koleksiyon bölümü > "Varsayılan banner"; Ürün grupları bölümü > "Banner görseli" |
| Kurumsal, Üretim, Kullanım alanları, İletişim, SSS, Kataloglar | `banner-kurumsal`, `-uretim`, `-kullanim-alanlari`, `-iletisim`, `-sss`, `-kataloglar` | İlgili sayfa şablonu > Sayfa başlığı > "Banner görseli" |
| Varsayılan sayfa, Arama, Sepet, Blog, 404 | `banner-genel.webp` | İlgili bölüm > "Banner görseli" |

**LED şerit karşılaştırması (bütün LED ürünleri):** firmanın "Tüm LED profilleri için ürün sayfası içerikleri" klasöründen (2026-09-19). `dist/shopify-dosyalar/led-serit/` klasöründeki 4 dosya (`led-serit-rehber`, `led-serit-60`, `-120`, `-240`, WebP, toplam 250 KB) aynı adla yüklenir. `product` ve `product.trimless` şablonlarındaki "LED şerit karşılaştırması" bölümü (sections/product-serit.liquid) önceki yapay zekâ görselli "Normal / 240 çipli şerit" tablosunun yerine geçti. Ekranda 60/120/240 satırları şerit görselleriyle ve "Önerilen seçim" etiketiyle görünür; firmanın tek görsellik karşılaştırması "Özet görsel" alanında durur ("Görünüm" ayarıyla basılabilir).

- **SEO:** başlık görselin içinde değil, sayfanın tek H1'i olarak gerçek metin; görsel süs olarak işaretli (boş alt metin). Koleksiyonda başlık grubun adı, giriş metni grup açıklamasının başı; açıklamanın tamamı ızgaranın altında kalır. Sayfa metnine (mağazada) H1 yazılmışsa H2'ye çevrilir: her sayfada tek H1.
- **Hız:** görsel ilk ekranda olduğu için öncelikli iner, ekran genişliğine göre boyutlanır (telefon 750 piksellik sürümü indirir); yükseklik sabit olduğu için sayfa kaymaz.
- Banner görseli boş bırakılan sayfa eski sade başlığıyla görünür.
- Ürün sayfalarına banner konmadı: ürünün görseli ve "Sepete ekle" ilk ekranda kalmalı. Ana sayfanın kendi tanıtım filmi var.
- Kendi logonuzu yüklerseniz koyu zemin için yazısı açık renkli sürümü Tema ayarları > Firma bilgileri > "Açık logo" alanına yükleyin.

## Üretim sayfası: polikarbon kapak üretimi

Firmanın verdiği metin, görseller ve hat videosuyla ikinci bir üretim bölümü eklendi (2026-09-21): 8 adım, 5 ürün/makine görseli ve 44 saniyelik üretim hattı videosu. Shopify > İçerik > Dosyalar'a yüklenecek dosyalar `dist/shopify-dosyalar/uretim/` klasöründedir:

| Dosya | Not |
|---|---|
| `yigit-kapak-uretim.mp4` (20 MB) | Firmanın hat videosu, web için sıkıştırıldı (kaynak 84 MB) |
| `yigit-kapak-uretim-kapak.webp` | Videonun kapak karesi |
| `kapak-uretim-01…05.webp` | Ham madde, kurutma, ekstrüzyon, kalıptan çıkış, boy kesimi görselleri (saydam zeminli) |

Adım metinleri firmanın "adım adım üretim detay" dosyasındandır. Bölüm, Üretim sayfasında alüminyum üretim adımlarının altındadır; başlığı, videosu ve adımları tema düzenleyiciden değiştirilir.

**Düzeltme:** Üretim sayfasının giriş metni "2008'den beri Beylikdüzü'nde üretiyoruz" diyordu. Firmanın tarihçesine göre üretim 2012'de Çatalca'da başladı, 2020'den beri Tekirdağ Veliköy'deki 3.000 m² fabrikada sürüyor; Beylikdüzü satış merkezidir. Metin buna göre düzeltildi.

## Numune iste: sepete numune satırı

"Numune iste" düğmesi artık WhatsApp yerine numuneyi **sepete ekliyor** (firma isteği, 2026-09-21). Sepette satır şöyle görünür: **"1.5CM Trimless LED Profili — 10 cm numune"**, altında küçük yazıyla numune ürününün adı. Her ürünün numunesi ayrı satırdır; numune satırındaki bağlantı ilgili ürün sayfasına gider.

Çalışması için Shopify'da yapılacaklar:

1. **Bir numune ürünü açın.** Önerilen ad: "Ürün Numunesi", stok kodu `YIG-NUMUNE`, tek varyant, kargo gerektirir. Fiyatı siz belirleyin (ücretsiz verilecekse 0,00 ₺). Arama sonuçlarında çıkmasını istemiyorsanız ürünü hiçbir koleksiyona eklemeyin.
2. **Tema ayarları > Satış ve fiyat > Numune** bölümünden "Numune ürünü" alanında bu ürünü seçin, "Numune boyu (cm)" alanına numune uzunluğunu yazın (öntanımlı 10).
3. Ayar boş bırakılırsa düğme eski davranışına döner ve WhatsApp'tan numune mesajı açar.

Tek bir ürün için farklı bir numune kullanmak isterseniz, o ürünün `custom.numune_urun` metaalanına (ürün referansı) o numune ürününü seçin; tema ayarını geçersiz kılar.

**Not:** Numunenin ücreti, kaç numune istenebileceği ve kargo ücretinin numunede nasıl işleyeceği firmanın kararıdır; şu an numune ürünü fiyatı neyse sepete o yansır.

## Ana sayfa: yeni bölümler

Ana sayfaya üç bölüm eklendi (2026-09-21). Üçü de tema düzenleyiciden (Ana sayfa) değiştirilir:

| Bölüm | Ne yapar |
|---|---|
| Kullanım alanları kart | "LED profilleri nerelerde kullanılır?" — altı alan kartı; her kart Kullanım alanları sayfasındaki ilgili alana gider |
| İhracat | Noktalı dünya haritası, Türkiye'den ülkelere çıkan oklar, "16 ülkeye ihracat" sayısı |
| Blog | Sayfanın en altında seçilen blogun son yazıları; blog yazısı azken elle içerik satırı da eklenebilir (şu an SSS ve Kataloglar) |

**İhracat haritasına ülke eklemek:** İhracat bölümü > "Ülke" bloğu eklenir; "Ülke adı" alanına sitede görünecek ad (ör. Almanya), "Ülke kodu" alanına ISO 3166-1 sayısal kod (Almanya 276) **ya da** İngilizce ülke adı (Germany) yazılır. Ok ve nokta haritada kendiliğinden doğru yere çıkar. Ülke eklenmemişse harita yalnız Türkiye işaretiyle görünür, bölüm yine çalışır.

Harita Natural Earth (kamu malı) verisinden `tools/dunya-harita.mjs` ile üretildi; `theme/assets/yigit-dunya.svg` dosyası temanın içindedir, ayrıca yükleme gerekmez.

## Kurumsal sayfası: tarihçe

Firmanın "Yiğit Alüminyum Tarihçesi" belgesinden yedi dönüm noktası (2007, 2008, 2012, 2012–2020, 2020 fabrika, 2020 mağaza, Bugün) ile vizyon ve misyon, Kurumsal sayfasına yıl şeridi olarak eklendi (2026-09-21). Metinler tema düzenleyiciden (Kurumsal > Tarihçe bölümü) değiştirilir.

Shopify > İçerik > Dosyalar'a yüklenecek görseller `dist/shopify-dosyalar/kurumsal/` klasöründedir:

| Dosya | Nerede kullanılıyor |
|---|---|
| `dukkan-2008-01.webp` | 2008 — Esenyurt'taki ilk dükkânın cephesi |
| `dukkan-2008-02.webp` | Yedek: aynı dükkânın iç görseli (şu an şeritte kullanılmıyor) |

2020 fabrika ve Bugün maddelerinde hâlihazırda yüklü fabrika görselleri (`9.jpg`, `14.jpg`) kullanıldı.

**Sayfa metni:** Kurumsal sayfasının mağazadaki metni de kısaltıldı; şeritte anlatılan tarihçeyi tekrar etmeyen iki paragraflık bir giriş öneriliyor. Metin temanın değil mağazanın içeriği olduğu için Shopify > Online Mağaza > Sayfalar > Kurumsal'dan güncellenmelidir (önerilen metin `dev/mock/pages.json` dosyasındaki halidir; istenirse gönderilebilir). Sayfa başlığı "2008'den beri alüminyum profil" yerine "2007'den bugüne alüminyum profil" oldu: ticaret 2007'de başladı.

## Üretim sayfası tanıtım filmi

Firmanın "TANITIM FİLMİ.mp4" dosyası (53 sn, 1280×720, sesli) Üretim sayfasının başına, süreç adımlarının üstüne yerleştirildi.

| Dosya | Nereye | Not |
|---|---|---|
| `dist/shopify-dosyalar/video/yigit-tanitim-filmi.mp4` (14 MB) | Shopify > İçerik > Dosyalar | Web için sıkıştırıldı (H.264, aynı çözünürlük; kaynak 54 MB). Adı değiştirilmeden yüklenir |
| `dist/shopify-dosyalar/video/yigit-tanitim-filmi-kapak.webp` | Shopify > İçerik > Dosyalar | Oynatmadan önce görünen kare (filmin 38. saniyesi, ekstrüzyon presi) |

- `page.uretim` şablonu bu iki dosyayı adıyla anar. Tema düzenleyicide film görünmezse: Üretim sayfası > Üretim bölümü > "Tanıtım filmi" alanından yüklenen video bir kez seçilir.
- Film yalnız ziyaretçi oynat düğmesine basınca iner; sayfa açılışını yavaşlatmaz. Kapaktaki büyük altın düğmeyle sesli başlar, sonra tarayıcının denetimleri gelir.
- Kapak "Film kapağı" alanından, altındaki yazı "Film başlığı" alanından değişir.

## Menü

Üst menü: **Ürünler · Üretim · Kurumsal · İletişim**. "Kullanım alanları" firmanın isteğiyle üst menüden kaldırıldı (2026-09-21); sayfaya Ürünler menüsünden ve ana sayfadaki kullanım alanları bölümünden gidilir. "Ürünler" başlığı dört ana kategorili geniş bir panel olarak açılır ("Tüm ürünler" yok). Shopify > Online Mağaza > Gezinme > Ana menü > "Ürünler" altına ana kategoriler, ana kategorilerin altına da alt bağlantılar eklenir (üç düzey; bağlantıyı bir üstteki bağlantının üzerine sürükleyince alt bağlantı olur):

| Ana kategori (2. düzey) | Alt bağlantılar (3. düzey) |
|---|---|
| LED Profilleri → koleksiyon `led-profilleri` | Trimless LED Profilleri → `tri̇mless-alcipan-led-profi̇lleri̇` · Tavan Köşe LED Profilleri → `tavan-kose-led-profilleri` · Süpürgelik LED Profilleri → `supurgelik-profilleri-1` · Kanatlı LED Profilleri → `gomme-led-profilleri` · Kanal LED Profilleri → `siva-ustu-led-profilleri` |
| Duvar Panel Profilleri → koleksiyon `duvar-panel-profilleri-1` | Dış Köşe Profili → ürün `pvc-duvar-panel-dis-kose-profili` · İç Köşe Profili → ürün `pvc-duvar-panel-i̇c-kose-profili` · H Birleşim Profili → ürün `pvc-duvar-panel-h-birlesim-profili` · U Bitim Profili → ürün `pvc-panel-u-bitim-profili` |
| Alçıpan Profilleri → koleksiyon `fuga-profilleri` | Z Profili → ürün `alcipan-z-profili` · Fuga Profili → ürün `fuga-profili` · Tek Kanatlı Fuga Profili → ürün `tek-kanatli-fuga-profili` |
| Kullanım Alanları → sayfa `kullanim-alanlari` | (alt bağlantı yok) |

Masaüstünde her ana kategori bir sütundur (başlık altın renkli, altında alt bağlantılar); telefonda alt alta listelenir. Alt bağlantısı olmayan ana kategori yalnız başlık olarak durur. Alt menüden (`footer`) "Numune talebi" bağlantısı kaldırılmalıdır: numune yalnız ürün sayfalarındaki "Numune iste" düğmesiyle istenir.

## Ana sayfa ürün grupları

Ana sayfadaki "Profil gruplarımız" listesi firmanın isteğiyle yalnız ana kategorileri gösterir (2026-09-21): LED Profilleri, PVC Panel Profilleri, Alçıpan Profilleri, Süpürgelik Profilleri. Alt gruplar (trimless, kanal, kanatlı, tavan köşe) menüden ve koleksiyon sayfalarından gezilir. Liste, ana sayfa > Ürün grupları bölümündeki bloklardan değişir.

## Marka varlıkları (yükleme gerekmez)

Logo ve site simgesi temanın içinde gelir, Shopify > Dosyalar'a ayrıca yüklenmez:

| Dosya | Nerede görünür |
|---|---|
| `assets/yigit-logo.png`, `yigit-logo-2x.png` | Menü çubuğu, sayfa altı, film yükleme ekranı |
| `assets/yigit-ikon-64/180/512.png` | Tarayıcı sekmesi simgesi, telefon ana ekran simgesi |

Müşteri kendi dosyasını yüklemek isterse: logo için Tema ayarları > Firma bilgileri > Logo, simge için Shopify'ın kendi simge ayarı. Her ikisinde de panelden yüklenen dosya temadakinin yerine geçer.

## Tema ayarları

Firma bilgileri (e-posta, telefon, sosyal medya) `config/settings_data.json` ile gelir. Logo alanı boş bırakılabilir — boşken temayla gelen logo kullanılır ve arama motorlarına da o gönderilir. Paylaşım görseli (1200 × 630) müşteriden gelecek; boş olduğunda paylaşım etiketi hiç basılmaz, bozuk önizleme oluşmaz.

## WhatsApp, form ve numune

- Sitede form yok. İletişim sayfası ve bütün "Teklif alın" düğmeleri WhatsApp'ı hazır mesajla açar; numara Tema ayarları > İletişim düğmeleri > WhatsApp numarası (boşsa Firma bilgileri > Telefon).
- "Numune iste" yalnız ürün sayfasında, "Sepete ekle"nin altındadır; WhatsApp'ı ürünün adıyla açar. Numuneler koleksiyonu gruplar şeridinden kaldırıldı (koleksiyon mağazada durabilir).

## Ürün Özellikleri penceresi ve teknik bilgi meta alanı

Ürün sayfasındaki "Ürün Özellikleri" penceresi mağazadaki gerçek veriden beslenir: ürün türü, ürün adındaki ölçü, açıklamada geçiyorsa malzeme, varyant seçenekleri, stok kodu ve ürün açıklaması. Firmanın doğruladığı teknik ölçüler için bir ürün meta alanı tanımlanmalı:

- Shopify > Ayarlar > Özel veriler > Ürünler > Tanım ekle: ad "Teknik özellikler", ad alanı ve anahtar `custom.teknik_ozellikler`, tür **Çok satırlı metin**.
- Her satır "Başlık: Değer" biçiminde girilir (örnek: `Boy: 300 cm`, `Et kalınlığı: 1,2 mm`, `Yüzey: Eloksal`). Pencerede tablo satırı olarak görünür.
- Boy uzunluğu için var olan `custom.boy_cm` meta alanı da pencerede gösterilir.

## Taksit ve kart logoları

Ödeme altyapısı **PayTR**. Tema ayarları > Taksit: en fazla taksit sayısı (12), not ve PayTR'nin taksit desteklediği 9 kart programı (paytr.com, 2026-09-15): Bonus, World, Maximum, Axess, CardFinans, Paraf, Advantage, Bankkart, Sağlam Kart.

Logolar temayla gelir (`assets/taksit-*`), programların resmi sitelerinden alındı:

| Program | Dosya | Kaynak | Not |
|---|---|---|---|
| Bonus | `taksit-bonus.png` | bonus.com.tr (sitenin 2026 logosu) | Soldaki kalp rozeti logonun parçası olduğu için kırpılmadı |
| World | `taksit-world.png` | worldcard.com.tr | |
| Maximum | `taksit-maximum.png` | İş Bankası'nın App Store'daki "Maximum Mobil" uygulamasının resmi ekran görüntüsü (maximum.com.tr bağlantı vermedi) | Uygulama başlığındaki logo saydam zemine çıkarıldı (renk #f01683); kaynak çözünürlüğü düşük olduğu için İş Bankası'ndan vektör logo gelirse "Logo" alanına yüklenmesi önerilir |
| Axess | `taksit-axess.png` | axess.com.tr | Sitedeki logonun altındaki "25 yaşında" yazısı kırpıldı |
| CardFinans | `taksit-cardfinans.png` | qnbcard.com.tr (cardfinans.com.tr buraya yönleniyor) | Sitede program logosu yok, QNB logosu kullanıldı |
| Paraf | `taksit-paraf.svg` | paraf.com.tr | Beyaz logo, sitedeki zemin rengi #025090 |
| Advantage | `taksit-advantage.png` | hsbc.com.tr | Ayrı logo yok, HSBC Advantage Classic kart görseli kullanıldı |
| Bankkart | `taksit-bankkart.png` | bankkart.com.tr | |
| Sağlam Kart | `taksit-saglam.svg` | saglamkart.kuveytturk.com.tr | Beyaz logo, sitedeki zemin rengi #004859 |

Bir logoyu değiştirmek için ilgili kartın "Logo" alanına görsel yüklemek yeterli (temadaki dosyanın yerine geçer). Taksit sayısı ve vade farkı PayTR panelindeki taksit ayarlarıyla uyumlu olmalı; PayTR'de kapalı olan programın adı boş bırakılırsa gösterilmez.

## Satış kuralları ve metraj fiyatı

Ürünlerin satış birimi, en az sipariş, artış miktarı ve metre iskonto tablosu meta alanlardan gelir: `custom.satis_kurali`, `custom.urun_kodu`, `custom.tier_price` (dip fiyat), `custom.dip_esik`, `custom.min_siparis`, `custom.adim`. Tanımlar, değerlerin girilmesi, fiyat ve KDV ayarı, indirimin ödemede uygulanma seçenekleri: `FIYAT-VE-SATIS-KURALLARI.md`. Ürün başına değerler `dist/fiyat/fiyat-eslestirme.csv` dosyasında (fiyat içerdiği için depoda değil; `python tools/fiyat-eslestir.py <excel>` ile yeniden üretilir).

## Uyarı

İletişim e-postası `info@yigitaluminyumprofil.com`. Ön denetimde bu alan adının DNS sunucuları yanıt vermiyordu; e-postanın çalıştığı yayından önce doğrulanmalı.

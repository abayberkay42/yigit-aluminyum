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
| Duvar paneli profilleri, duvar kaplamaları | `product.panel` |
| Fuga profilleri, alçıpan Z profili | `product.fuga` |
| Alüminyum süpürgelik, süpürgelik aparatları | `product.supurgelik` |
| LED'li süpürgelik dahil diğer bütün LED ürünleri | `product` (varsayılan) |

## Dosyalar

Şablonlar görselleri `shopify://shop_images/<ad>` ile anar. Aktarımda Shopify > İçerik > Dosyalar'a aynı adla yüklenir:
`room-salon.webp, room-koridor.webp, room-mutfak.webp, room-yatak.webp, room-banyo.webp, room-ofis.webp, room-galeri.webp, room-dis.webp` (bizim ürettiğimiz oda görselleri). Katalog kapakları ve üretim görselleri mağazanın Dosyalar'ında zaten var.

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

## Menü

Üst menüdeki "Ürünler" başlığı, altına bağlantı eklenirse açılır menüye dönüşür. Shopify > Online Mağaza > Gezinme > Ana menü > "Ürünler" > alt bağlantı ekle:

| Sıra | Bağlantı | Hedef |
|---|---|---|
| 1 | Tüm ürünler | Koleksiyon: Tüm ürünler (`/collections/all`) |
| 2 | Kanal LED Profilleri | `siva-ustu-led-profilleri` |
| 3 | Trimless LED Profilleri | `tri̇mless-alcipan-led-profi̇lleri̇` |
| 4 | Kanatlı LED Profilleri | `gomme-led-profilleri` |
| 5 | Tavan Köşe LED Profilleri | `tavan-kose-led-profilleri` |
| 6 | Süpürgelik Profilleri | `supurgelik-profilleri-1` |
| 7 | Duvar Panel Profilleri | `duvar-panel-profilleri-1` |
| 8 | Alçıpan Profilleri | `fuga-profilleri` |

İlk sıra listede ince bir çizgiyle ayrılır; bu yüzden üst bağlantının kendisi ("Tüm ürünler") birinci sırada olmalıdır. Alt bağlantı eklenmezse başlık eskisi gibi düz bağlantı olarak çalışır, tema bozulmaz. Yeni ürün grubu açıldığında bu listeye bir satır eklemek yeterli.

## Marka varlıkları (yükleme gerekmez)

Logo ve site simgesi temanın içinde gelir, Shopify > Dosyalar'a ayrıca yüklenmez:

| Dosya | Nerede görünür |
|---|---|
| `assets/yigit-logo.png`, `yigit-logo-2x.png` | Menü çubuğu, sayfa altı, film yükleme ekranı |
| `assets/yigit-ikon-64/180/512.png` | Tarayıcı sekmesi simgesi, telefon ana ekran simgesi |

Müşteri kendi dosyasını yüklemek isterse: logo için Tema ayarları > Firma bilgileri > Logo, simge için Shopify'ın kendi simge ayarı. Her ikisinde de panelden yüklenen dosya temadakinin yerine geçer.

## Tema ayarları

Firma bilgileri (e-posta, telefon, sosyal medya) `config/settings_data.json` ile gelir. Logo alanı boş bırakılabilir — boşken temayla gelen logo kullanılır ve arama motorlarına da o gönderilir. Paylaşım görseli (1200 × 630) müşteriden gelecek; boş olduğunda paylaşım etiketi hiç basılmaz, bozuk önizleme oluşmaz.

## Uyarı

İletişim e-postası `info@yigitaluminyumprofil.com`. Ön denetimde bu alan adının DNS sunucuları yanıt vermiyordu; e-postanın çalıştığı yayından önce doğrulanmalı.

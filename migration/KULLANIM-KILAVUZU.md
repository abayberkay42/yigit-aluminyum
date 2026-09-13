# Siteyi yönetme kılavuzu

Sitenin tamamı Shopify panelinden yönetilir; koda dokunmanız gerekmez. Bu kılavuz hangi içeriğin nereden değiştirildiğini anlatır.

## Genel kurallar

- **Tema düzenleyici:** Online Mağaza > Temalar > Özelleştir. Soldaki listede sayfanın bölümleri görünür; bölüme tıklayınca ayarları sağda açılır.
- **Sayfa seçimi:** Düzenleyicinin üstündeki açılır menüden hangi sayfayı düzenlediğinizi seçersiniz (ana sayfa, ürün, koleksiyon, sayfalar).
- **Boş alan görünmez:** Metnini ya da görselini silerseniz o alan sitede tamamen kaybolur. Yarım kalmış bir kutu görünmez.
- **Kaydetme:** Sağ üstteki Kaydet'e basmadan değişiklik yayına girmez.

## Ana sayfa

| Bölüm | Ne yapar | Ayarları |
|---|---|---|
| Tanıtım filmi | Sayfanın en başı: kaydırdıkça oynayan film. Masaüstünde yatay, telefonda dikey video | Masaüstü ve mobil için ayrı ayrı: kare adı öneki, kare sayısı, kare ölçüsü, kaydırma uzunluğu (uzadıkça film yavaşlar). Kareler Dosyalar'da durur |
| Ekstrüzyon ve üretim | Açılıştaki hareketli sahne ve kaydırma anlatısı | Başlık satırları, alt metin, düğme; "Kalıp" blokları ürün gruplarını, "Durak" blokları anlatı metinlerini tutar |
| Üretim | Gerçek tesis fotoğrafları | Başlık, metin, bağlantı; üç fotoğraf bloğu (ilki büyük gösterilir) |
| Ürün grupları | Grup listesi ve grup tanıtımı | Her blokta koleksiyon seçilir; görsel seçilmezse grubun ilk ürününün fotoğrafı kullanılır |
| İki yol | Proje/toptan ve mağaza kartları | Başlık, metin, maddeler (her satır bir madde), iki düğme |

**Kalıp bloğu eklemek:** Yeni bir ürün grubu açtığınızda "Ekstrüzyon ve üretim" bölümüne "Kalıp" bloğu ekleyin, koleksiyonu ve örnek ürünü seçin. Kesit listesinden en yakın biçimi seçmeniz yeterli.

## Ürün sayfaları

Dört şablon var: LED profilleri (varsayılan), duvar paneli, fuga-alçıpan, süpürgelik. Bir ürünün şablonu Ürünler > ürün > sağ alttaki **Tema şablonu** alanından seçilir.

Ürün sayfasındaki alanlar:

- **Galeri:** Ürünün medyası. Görsel ve video aynı galeride görünür; sıra Shopify'daki medya sırasıdır.
- **Renk ve ölçü seçimi:** Ürünün varyantlarından gelir. Renk noktalarının doğru renkte görünmesi için renk adı `Siyah`, `Gri`, `Beyaz`, `Mat`, `Antrasit`, `Gümüş`, `Altın` yazılmalıdır.
- **Metraj fiyatı:** Ürünün `custom.tier_price` meta alanına yazılan sayı, "300 metre ve üzeri" satırı olarak görünür. Boşsa satır çıkmaz. İndirimin kendisi Shopify'ın otomatik indirim kuralıyla uygulanır.
- **Numune, stand ve WhatsApp düğmeleri:** Tema düzenleyici > ürün şablonu > "Ek düğmeler". WhatsApp numarası girilince düğme, ürünün adını içeren hazır bir mesaj açar.
- **Adım adım anlatım, karşılaştırma tabloları, sıkça sorulan sorular, taksit tablosu:** Her biri ayrı bölüm. Bunlar ürüne değil şablona bağlıdır: değişiklik o şablonu kullanan bütün ürünlerde görünür.
- **Açıklama:** Shopify'daki ürün açıklaması, "Özellikler" başlığı altında görünür.

## Koleksiyon (ürün grubu) sayfaları

- Başlıktaki kısa giriş, koleksiyon açıklamasının ilk cümlelerinden otomatik alınır; tam açıklama sayfanın altında "Bu grup hakkında" başlığıyla durur.
- Gruplar arası geçiş şeridi tema düzenleyicideki koleksiyon listesinden gelir; sırayı oradan değiştirebilirsiniz.

## Kurumsal sayfalar

| Sayfa | İçerik nereden gelir |
|---|---|
| Kurumsal | Sayfalar > Kurumsal içeriği |
| Üretim | Tema düzenleyici: süreç adımları, film, sayılar, belgeler, VR bağlantısı |
| Kullanım alanları | Tema düzenleyici: her oda bir blok; görsel, metin, ürün grupları ve görselin üstündeki ürün noktaları |
| Kataloglar | Tema düzenleyici: her katalog bir blok (ad, PDF bağlantısı, kapak) |
| Sıkça sorulan sorular | Sayfalar > SSS içeriği |
| İletişim | Form tema düzenleyicide; adres, telefon, e-posta, WhatsApp ve sosyal medya "Bilgi" blokları |

**Ürün noktası eklemek (kullanım alanları):** Oda bloğunda ürünü seçin, sonra yatay ve dikey konumu yüzdeyle ayarlayın. Sol üst köşe %0, sağ alt köşe %100'dür.

## Sepet ve sipariş

Sepet, ödeme ve siparişler Shopify'ın kendi akışıdır. Sepete eklenince yandan çekmece açılır; ödeme adımı Shopify'ın ödeme sayfasıdır.

## Menüler

Online Mağaza > Gezinme. Üst menü `main-menu`, alt menü `footer`. Alt alandaki ikinci menü başlığı tema düzenleyiciden değiştirilir.

**Açılır menü:** Üst menüdeki bir başlığın altına bağlantı eklerseniz o başlık sitede açılır menüye dönüşür. "Ürünler" başlığı böyle çalışır: altındaki ilk sıra "Tüm ürünler", sonrasında ürün grupları listelenir. İlk sıra listede ince bir çizgiyle ayrıldığı için oraya başlığın kendi hedefini ("Tüm ürünler") koymak gerekir. Yeni bir ürün grubu açtığınızda bu listeye bir satır eklemeniz yeterli; başka bir işlem gerekmez. Alt bağlantı eklenmemiş başlıklar düz bağlantı olarak çalışmaya devam eder.

## Diller

Türkçe ana dil, İngilizce ikinci dil. Çeviriler Translate & Adapt uygulamasından girilir. Tema metinleri (düğmeler, etiketler) hazır çevrilidir; ürün, sayfa ve bölüm metinlerinin çevirisi oradan yapılır.

## Firma bilgileri

Tema düzenleyici > Tema ayarları > Firma bilgileri: logo, paylaşım görseli, kuruluş yılı, e-posta, telefon, ilçe, il, sosyal medya adresleri. Buradaki bilgiler arama motorlarına firma bilgisi olarak da iletilir.

**Logo:** Firmanızın logosu temanın içinde hazır gelir; menü çubuğunda ve sayfa altında görünür, ayrıca bir şey yüklemeniz gerekmez. Değiştirmek isterseniz Logo alanına yeni dosyayı yüklemeniz yeterli; yüklediğiniz dosya hazır olanın yerine geçer. Yatay bir kullanım (soldan sağa uzanan) tercih edin, zemini saydam olsun.

**Site simgesi:** Tarayıcı sekmesinde görünen küçük simge de temayla gelir (logonun amblem kısmından hazırlandı). Değiştirmek isterseniz Shopify'ın kendi simge ayarını kullanın; oradan yüklediğiniz dosya temadakinin yerine geçer.

**Paylaşım görseli:** Sayfa bağlantısı WhatsApp, Facebook gibi yerlerde paylaşıldığında çıkacak görseldir. Şu an boş; boş olduğunda bağlantı görselsiz paylaşılır, bozuk bir görüntü oluşmaz. Doldurmak isterseniz 1200 × 630 piksel yatay bir görsel yükleyin. Logonun kendisi bu orana uymaz, uygulama ya da üretim fotoğrafı daha iyi sonuç verir.

## Işık rengi

Menüdeki 3000K / 4000K / 6500K seçimi ziyaretçiye aittir; sitedeki ışık renklerini ve oda fotoğraflarının tonunu değiştirir. Seçim ziyaretçinin tarayıcısında saklanır.

## Dikkat edilecekler

- Ürün görselleri beyaz zeminli ve kare olmalı; ölçüler `GORSEL-STANDARDI.md` dosyasında.
- Oda ve uygulama görselleri 3:2 yatay olmalı.
- Bölümlerde uydurma sayı ya da belge kullanmayın; "Sayı" ve "Belge" blokları yalnız doğrulanmış değerler içindir.
- Bir bölümü tamamen gizlemek isterseniz tema düzenleyicide bölümün yanındaki göz simgesine basmanız yeterli; silmeye gerek yok.

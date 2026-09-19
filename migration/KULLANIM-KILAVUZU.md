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
| Üretim | Gerçek tesis fotoğrafları; sayfanın ana başlığı (h1) bu bölümdedir | Başlık, metin, bağlantı; üç fotoğraf bloğu (ilki büyük gösterilir) |
| Ürün grupları | Grup listesi ve grup tanıtımı | Her blokta koleksiyon seçilir; görsel seçilmezse grubun ilk ürününün fotoğrafı kullanılır |
| İki yol | Proje/toptan ve mağaza kartları | Başlık, metin, maddeler (her satır bir madde), iki düğme. "Teklif alın" düğmesinde "WhatsApp'a yönlendirsin" işaretlidir |

**Kalıp bloğu eklemek:** 3B ekstrüzyon sahnesi Üretim sayfasındadır ("Üretim süreci"nin altında). Yeni bir ürün grubu açtığınızda tema düzenleyicide Üretim sayfasını seçin, "Ekstrüzyon ve üretim" bölümüne "Kalıp" bloğu ekleyin, koleksiyonu ve örnek ürünü seçin. Kesit listesinden en yakın biçimi seçmeniz yeterli.

## Sayfa başı bannerları

Koleksiyonların ve kurumsal sayfaların başındaki büyük görsel:

- **Kurumsal sayfalar:** Tema düzenleyici > sayfayı aç > Sayfa başlığı bölümü > "Banner görseli". Üst etiket, başlık, alt etiket ve giriş metni aynı bölümde.
- **Ürün grupları (koleksiyonlar):** Tema düzenleyici > bir koleksiyon aç > Koleksiyon bölümü. Her grup için bir "Grup bannerı" bloğu var (grup + görsel + alt etiket). Bloğu olmayan grup "Varsayılan banner"ı kullanır. Başlık grubun adı, giriş metni grup açıklamasının başıdır.
- Görsel yatay ve en az 2560 piksel genişlikte olmalı; ortası sakin, koyu tonlu görseller başlığı en iyi taşır. Görsel boşaltılırsa sayfa sade başlığa döner.
- Şu anki görseller yapay zekâyla üretilmiş temsili görsellerdir; gerçek fotoğraflar geldikçe değiştirilebilir.

## Ürün sayfaları

Dört şablon var: LED profilleri (varsayılan), duvar paneli, fuga-alçıpan, süpürgelik. Bir ürünün şablonu Ürünler > ürün > sağ alttaki **Tema şablonu** alanından seçilir.

Ürün sayfasındaki alanlar:

- **Galeri:** Ürünün medyası. Görsel ve video aynı galeride görünür; sıra Shopify'daki medya sırasıdır.
- **Renk ve ölçü seçimi:** Ürünün varyantlarından gelir. Renk noktalarının doğru renkte görünmesi için renk adı `Siyah`, `Gri`, `Beyaz`, `Mat`, `Antrasit`, `Gümüş`, `Altın` yazılmalıdır.
- **Trimless rehberleri:** Trimless ürünlerinde (şablon `product.trimless`) uygulama adımları, kapak montajı, doğru / yanlış montaj, 45° kesim ve spot karşılaştırması firmanın rehber görselleriyle gelir. Adım metni ve görseli tema düzenleyicide her adım bloğundan, alttaki "tek görselde aç" bağlantısı bölümün "Özet görsel" alanından değişir.
- **Satış koşulu ve metraj fiyatı:** Ürünün satış birimi (metre / adet), en az miktarı ve artış miktarı `custom.satis_kurali` meta alanından gelir. Dip fiyatı (`custom.tier_price`) girilmiş LED ürünlerinde metre fiyatı miktara göre canlı hesaplanır. Ayrıntılar ve mağazada yapılacaklar "Fiyat ve satış kuralları" belgesinde.
- **Numune iste ve Ürün Özellikleri:** "Sepete ekle"nin altında yan yana iki düğme. "Numune iste" WhatsApp'ı ürünün adını içeren hazır mesajla açar (numune düğmesi sitede yalnız ürün sayfalarındadır). "Ürün Özellikleri" bir pencere açar: ürün grubu, ürün adındaki ölçü, malzeme (açıklamada geçiyorsa), renk/ölçü seçenekleri, stok kodu, teknik bilgiler ve ürün açıklaması. Ayar: Tema düzenleyici > ürün şablonu > "Ek düğmeler".
- **Teknik bilgiler:** Ürünün "Teknik özellikler" meta alanına her satıra bir bilgi "Başlık: Değer" biçiminde yazılır (örnek: `Boy: 300 cm`). Pencerede tablo satırı olarak görünür. Yalnız doğrulanmış ölçüler girilmelidir.
- **Taksit:** Fiyatın altında "12 aya varan taksit" satırı ve kart görselleri, sayfanın aşağısında kart kart taksit bölümü. Ayar: Tema ayarları > Taksit.
- **Taksit bilgisi:** Kart logolarıyla birlikte bilgi sütununun en altında (fiyatın altından taşındı).
- **Adım adım anlatım, karşılaştırma tabloları (iki sütun görseli eklenebilir), sıkça sorulan sorular, taksit tablosu:** Her biri ayrı bölüm. Bunlar ürüne değil şablona bağlıdır: değişiklik o şablonu kullanan bütün ürünlerde görünür.
- **Açıklama:** Shopify'daki ürün açıklaması, "Ürün Özellikleri" penceresinde "Özellikler" başlığı altında görünür. "Başlık: metin" biçimindeki satırlar düzenli bir listeye dönüşür.

## Koleksiyon (ürün grubu) sayfaları

- Başlıktaki kısa giriş, koleksiyon açıklamasının ilk cümlelerinden otomatik alınır; tam açıklama sayfanın altında "Bu grup hakkında" başlığıyla durur.
- Gruplar arası geçiş şeridi tema düzenleyicideki koleksiyon listesinden gelir; sırayı oradan değiştirebilirsiniz.

## Kurumsal sayfalar

| Sayfa | İçerik nereden gelir |
|---|---|
| Kurumsal | Sayfalar > Kurumsal içeriği |
| Üretim | Tema düzenleyici: süreç adımları, film, sayılar, belgeler, VR bağlantısı; adımların altında 3B ekstrüzyon sahnesi |
| Kullanım alanları | Tema düzenleyici: her oda bir blok; görsel, metin, ürün grupları ve görselin üstündeki ürün noktaları |
| Kataloglar | Tema düzenleyici: her katalog bir blok (ad, PDF bağlantısı, kapak) |
| Sıkça sorulan sorular | Sayfalar > SSS içeriği |
| İletişim | Form yok: WhatsApp kartı (başlık, metin, maddeler, düğme ve hazır mesaj) ve telefon düğmesi; adres, telefon, e-posta ve sosyal medya "Bilgi" blokları |

**Ürün noktası eklemek (kullanım alanları):** Oda bloğunda ürünü seçin, sonra yatay ve dikey konumu yüzdeyle ayarlayın. Sol üst köşe %0, sağ alt köşe %100'dür.

## Sepet ve sipariş

Sepet, ödeme ve siparişler Shopify'ın kendi akışıdır. Sepete eklenince yandan çekmece açılır; ödeme adımı Shopify'ın ödeme sayfasıdır.

## Menüler

Online Mağaza > Gezinme. Üst menü `main-menu`, alt menü `footer`. Alt alandaki ikinci menü başlığı tema düzenleyiciden değiştirilir.

**Açılır menü:** Üst menüdeki bir başlığın altına bağlantı eklerseniz o başlık sitede açılır menüye dönüşür. "Ürünler" üç düzeylidir: altında dört ana kategori (LED Profilleri, Duvar Panel Profilleri, Alçıpan Profilleri, Kullanım Alanları), ana kategorilerin altında ürün grupları ya da ürünler. Bilgisayarda her ana kategori bir sütun olur. Yeni bir ürün grubu ya da ürün eklemek için Gezinme'de ilgili ana kategorinin altına bağlantı ekleyip üzerine sürüklemeniz yeterli. Alt bağlantı eklenmemiş başlıklar düz bağlantı olarak çalışmaya devam eder.

**Menü çubuğu:** Şeffaftır; fareyle üzerine gelince, klavyeyle içinde gezinirken ya da bir menü açıkken belirginleşir. Telefonda (fare olmadığı için) hep belirgin görünür.

## Diller

Türkçe ana dil, İngilizce ikinci dil. Çeviriler Translate & Adapt uygulamasından girilir. Tema metinleri (düğmeler, etiketler) hazır çevrilidir; ürün, sayfa ve bölüm metinlerinin çevirisi oradan yapılır.

## Firma bilgileri

Tema düzenleyici > Tema ayarları > Firma bilgileri: logo, paylaşım görseli, kuruluş yılı, e-posta, telefon, ilçe, il, sosyal medya adresleri. Buradaki bilgiler arama motorlarına firma bilgisi olarak da iletilir.

**Logo:** Firmanızın logosu temanın içinde hazır gelir; menü çubuğunda ve sayfa altında görünür, ayrıca bir şey yüklemeniz gerekmez. Değiştirmek isterseniz Logo alanına yeni dosyayı yüklemeniz yeterli; yüklediğiniz dosya hazır olanın yerine geçer. Yatay bir kullanım (soldan sağa uzanan) tercih edin, zemini saydam olsun. Site beyaz zeminli olduğu için logonun beyaz zemin sürümünü (yazısı koyu) yükleyin.

**Site simgesi:** Tarayıcı sekmesinde görünen küçük simge de temayla gelir (logonun amblem kısmından hazırlandı). Değiştirmek isterseniz Shopify'ın kendi simge ayarını kullanın; oradan yüklediğiniz dosya temadakinin yerine geçer.

**Paylaşım görseli:** Sayfa bağlantısı WhatsApp, Facebook gibi yerlerde paylaşıldığında çıkacak görseldir. Şu an boş; boş olduğunda bağlantı görselsiz paylaşılır, bozuk bir görüntü oluşmaz. Doldurmak isterseniz 1200 × 630 piksel yatay bir görsel yükleyin. Logonun kendisi bu orana uymaz, uygulama ya da üretim fotoğrafı daha iyi sonuç verir.

## WhatsApp ve telefon düğmeleri

Her sayfanın sağ altında WhatsApp ve telefon düğmeleri durur. Ayarları Tema düzenleyici > Tema ayarları > İletişim düğmeleri bölümündedir:

- **WhatsApp numarası:** Boş bırakılırsa Firma bilgileri > Telefon numarası kullanılır. WhatsApp hattınız farklı bir numaradaysa buraya ülke koduyla yazın (örnek: +90 532 000 00 00).
- **Hazır mesaj:** WhatsApp açıldığında yazılı gelen mesaj. Ürün sayfasında mesaja ürünün adı, ürün grubu sayfasında grubun adı kendiliğinden eklenir.
- **Düğmeleri göster/gizle:** İki düğme ayrı ayrı kapatılabilir.

Düğmeler sayfa altına ya da sağ altta duran başka bir düğmenin üstüne gelince kenara çekilir, sonra geri gelir.

## Ürün kartlarında sepete ekleme

Ürün listelerinde (ürün grupları, tüm ürünler, arama, benzer ürünler) her kartta "Sepete ekle" düğmesi vardır. Bilgisayarda kartın üzerine gelince görselin altında açılır, telefonda kartın altında hep görünür. Renk seçeneği olan ürünlerde renk orada seçilir. Renk dışında seçim gerektiren ürünlerde (ör. boy) düğme "Seçenekleri gör" olur ve ürün sayfasına götürür. Stokta olmayan seçenekte düğme "Tükendi" yazar ve basılmaz.

## Işık rengi

3000K / 4000K / 6500K seçimi Üretim sayfasındaki 3B sahnenin son durağında ("Uygulama", salon görseli) bulunur. Ziyaretçiye aittir; salon görselinin ve sitedeki ışık çizgilerinin rengini değiştirir. Seçim ziyaretçinin tarayıcısında saklanır.

## Taksit

Tema düzenleyici > Tema ayarları > Taksit: taksit bilgisini açıp kapatma, en fazla taksit sayısı, not ve PayTR'nin taksit desteklediği dokuz kart programı. Kartların resmi logoları temayla hazır gelir. Bir logoyu değiştirmek isterseniz o kartın "Logo" alanına yeni görseli yükleyin; beyaz logolar için "Logo zemini" rengini markanın rengine ayarlayın. Programın adını silerseniz o kart gösterilmez. Taksit sayısının PayTR panelinizdeki taksit ayarlarıyla aynı olduğunu kontrol edin.

## Dikkat edilecekler

- Ürün görselleri beyaz zeminli ve kare olmalı; ölçüler `GORSEL-STANDARDI.md` dosyasında.
- Oda ve uygulama görselleri 3:2 yatay olmalı.
- Bölümlerde uydurma sayı ya da belge kullanmayın; "Sayı" ve "Belge" blokları yalnız doğrulanmış değerler içindir.
- Bir bölümü tamamen gizlemek isterseniz tema düzenleyicide bölümün yanındaki göz simgesine basmanız yeterli; silmeye gerek yok.

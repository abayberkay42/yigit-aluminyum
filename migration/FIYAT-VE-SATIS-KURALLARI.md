# Fiyat ve satış kuralları

Firmadan gelen iki belge siteye işlendi (2026-09-18):

- **Ürün Kategorileri ve Satış Kuralları** (PDF): 10 kategori için satış birimi, en az sipariş ve artış miktarı.
- **LED Profilleri Her Metre İskonto Tablosu** (Excel, iki dosya): 55 LED profili için liste fiyatı, dip fiyat ve dip fiyat eşiği. İki dosyada fiyatlar aynı; birinde ayrıca her ürün için 1–300 m arası metraj dökümü var.

Sitenin hesabı Excel'deki formülle birebir aynıdır: 55 ürün × 300 metre, toplam 16.500 satır tek tek karşılaştırıldı ve kuruşu kuruşuna tuttu (hem ürün sayfasındaki hesap hem sepetteki hesap).

## Sitede ne değişti

**Ürün sayfası**

- Fiyatın yanında birim yazar: "₺104,00 / metre" ya da "₺73,00 / adet". Yanında "KDV hariç" notu durur (Tema ayarları > Satış > Fiyat notu).
- Miktar kutusunun üstünde satış koşulu yazar: "En az 15 m · 3 m artışla · 1 boy = 3 m". Paketli ürünlerde "1 paket = 50 adet" de yazar.
- Miktar en az miktardan başlar. + ve − düğmeleri artış miktarı kadar ilerler (LED'de 3 m, PVC panelde 50 adet). Elle 40 yazılırsa 42'ye çıkar ve nedeni ekranda yazar. En az miktarın altına inilmez.
- Miktarın altında toplam tutar yazar: "Toplam ₺11.088,00 · 120 m × ₺92,40".
- **Metraj fiyatı paneli** (dip fiyatı girilmiş LED ürünlerinde): miktar değiştikçe metre fiyatı, indirim yüzdesi ve dip fiyata kalan metraj canlı değişir. Açılır "Metraj fiyat tablosu" 51, 102, 150, 201, 252 ve 300 m için metre fiyatlarını gösterir.
- "Ne kadar gerekli?" hesaplayıcısının sonucu da kurala oturur (17 m → 18 m, 60 adet → 100 adet).
- "Ürün Özellikleri" penceresinde ürün kodu (ör. Y6279) ve satış birimi görünür.

**Ürün kartı:** Fiyatın yanında "/ m" ya da "/ adet" yazar. "Sepete ekle" en az miktarı ekler; düğmenin üzerinde miktar yazar (ör. "15 m").

**Sepet**

- Her satırda birim fiyat ve miktar birimiyle yazar ("15 m"). + ve − artış miktarıyla ilerler; en az miktarda − düğmesi kapanır.
- Metraj indirimi olan üründe satırın altında "120 m için metre fiyatı ₺140,20" yazar. Metraj, aynı ürünün sepetteki bütün renklerinin toplamıdır. Toplamın altında beklenen indirim ayrı satırda görünür.
- Koşula uymayan bir miktar sepete girerse (ör. 10 m) satırda uyarı ve "15 m yap" düğmesi çıkar. Düzeltilene kadar "Ödemeye geç" düğmesi kapalıdır.
- Sepet sayacı artık metreyi değil ürün satırını sayar ("2 ürün").

## Satış kuralları

Her ürünün kuralı `custom.satis_kurali` meta alanıyla seçilir. Boş bırakılan ürün eskisi gibi 1 adetten satılır (ör. numune paketleri, süpürgelik aparatları).

| Değer | Kategori | 1 birim uzunluk | Satış birimi | En az | Artış |
|---|---|---|---|---|---|
| `led` | LED profilleri | 3 m | Metre | 15 m (ürüne göre 30 m) | 3 m |
| `supurgelik` | Süpürgelik profilleri | 3 m | Metre | 15 m | 3 m |
| `alcipan` | Alçıpan profilleri | 3 m | Metre | 30 m | 3 m |
| `pvc_panel` | PVC panel profilleri | 2,80 m | Adet | 50 adet (1 paket) | 50 adet |
| `ledli_pvc_panel` | LED'li PVC panel profilleri | 2,80 m | Adet | 15 adet | 1 adet |
| `parke` | Parke profilleri | 2,70 m | Adet | 50 adet (1 paket) | 50 adet |
| `merdiven` | Merdiven basamak profilleri | 2,70 m | Adet | 50 adet (1 paket) | 50 adet |
| `siva` | Sıva profilleri | 3 m | Adet | 10 adet | 1 adet |
| `kapak_polikarbon` | LED profil kapağı, polikarbon | 3 m | Metre | 45 m (15 adet) | 3 m (1 adet) |
| `kapak_esnek` | LED profil kapağı, esnek | Kesintisiz | Metre | 30 m | 1 m |

- **15 m / 30 m ayrımı:** Belgede hangi LED ürününün en az 30 m satılacağı "ayrıca bildirilecek" diyor. Şimdilik bütün LED ürünleri 15 m'den başlıyor. 30 m olacak ürünlerde `custom.min_siparis` alanına 30 yazmak yeterli.
- **Polikarbon kapak:** miktar metre olarak tutulur (45, 48, 51 m…), sayfada "45 m (15 adet)" yazar. Fiyat = metre × metre fiyatı; bu, belgedeki "adet × 3 m × metre fiyatı" ile aynıdır.
- En az miktar artışın katı değilse sistem bir üst katı alır (adım 3 m iken 16 yazılırsa 18 m).

## Metraj indirimi

Excel'deki kural:

- 50 m altında liste fiyatı.
- 50 m'den itibaren metre fiyatı dip fiyata doğru iner: iskonto = (1 − dip / liste) × (metraj / eşik).
- Eşikte (çoğu üründe 300 m, üç üründe 150 m) ve üzerinde dip fiyat.
- Bulunan metre fiyatı siparişin tamamına uygulanır.
- Metraj aynı ürün kodunun toplamıdır; farklı ürünlerin metrajı birleşmez.
- Profiller 3 m olduğu için indirimin başladığı ilk sipariş 51 m'dir.

**Önemli: tema indirimi gösterir, tahsil etmez.** Shopify'da fiyatı sepette düşürmenin yolu bir indirim kuralıdır. Shopify'ın hazır otomatik indirimleri bu sürekli formülü kuramıyor (yalnız sabit yüzde ya da tutar veriyor). Seçenekler:

1. **Shopify Functions ile özel indirim.** Formül zaten yazılı ve doğrulanmış; aynı kod indirim fonksiyonuna taşınır. Shopify'ın kuralına göre özel uygulama içinde fonksiyon çalıştırmak **Shopify Plus** planında mümkün. Mağazanın planı ve Shopify'ın güncel kuralı başlamadan önce kontrol edilir.
2. **App Store'daki bir kademeli indirim uygulaması.** Bu uygulamalar kademe (ör. 51 m'de %X, 102 m'de %Y) tanımlar. Excel'deki sürekli formül kademelere bölünerek yaklaşık uygulanabilir. Ürün başına kademe sayısı sınırı ve aylık ücreti uygulamaya göre değişir.
3. **Teklifle satış.** 50 m üstü siparişler WhatsApp'tan teklifle alınır; sitede tablo bilgi amaçlı kalır.

Hangisi seçilirse seçilsin, **indirim ödemede uygulanmıyorsa site yayına alınmadan önce Tema ayarları > Satış > "Metraj indirimini göster" kapatılmalı.** Yoksa müşteri sepette göremeyeceği bir indirimi ürün sayfasında görür. Kapatınca panel, sepetteki metraj satırı ve indirim toplamı gizlenir; satış kuralları çalışmaya devam eder.

Sepet ve ürün sayfası koşula uymayan miktarı engeller. Ödeme sayfasının kendisinde aynı denetimi Shopify'ın "sepet doğrulama" fonksiyonu yapar; bu da 1. seçenekteki Plus koşuluna bağlıdır. Tema, koşula uymayan sepette ödeme düğmesini zaten kapatıyor.

## Mağazada yapılacaklar

**1. Meta alan tanımları.** Shopify > Ayarlar > Özel veriler > Ürünler > Tanım ekle:

| Ad | Ad alanı ve anahtar | Tür | Not |
|---|---|---|---|
| Satış kuralı | `custom.satis_kurali` | Tek satırlı metin, değerler hazır listeyle sınırlanır (Doğrulama > önceden ayarlanmış seçenekler) | Değerler yukarıdaki tablodaki 10 değer |
| Ürün kodu | `custom.urun_kodu` | Tek satırlı metin | Excel'deki kod (Y6279 gibi) |
| Dip fiyat | `custom.tier_price` | Ondalık sayı | TL / metre, KDV hariç |
| Dip fiyat eşiği | `custom.dip_esik` | Tam sayı | Boşsa 300 m (Tema ayarları > Satış) |
| En az sipariş | `custom.min_siparis` | Tam sayı | Yalnız kategori değerinden farklıysa (ör. 30) |
| Artış miktarı | `custom.adim` | Tam sayı | Yalnız kategori değerinden farklıysa |

**2. Değerlerin girilmesi.** Ürünler > ürünleri seç > Toplu düzenle > sütun olarak meta alanlar eklenir. Her ürünün değerleri ayrıca teslim edilen **fiyat-eslestirme.csv** dosyasındadır (fiyat içerdiği için sitenin kod deposunda tutulmaz). Dosyada ürün başına kural, ürün kodu, Excel'deki liste fiyatı, şu anki fiyat, dip fiyat ve not var.

**3. Fiyatlar.** Varyant fiyatı Excel'deki **liste fiyatı** olarak güncellenir; indirim hesabı liste fiyatından başlar. Excel'deki fiyatlar KDV hariçtir. Mağazanın vergi ayarı (Ayarlar > Vergiler ve harçlar > fiyatlara vergi dahil mi) buna göre kurulmalı ve Tema ayarları > Satış > Fiyat notu aynı şeyi söylemeli. Bu ayarı muhasebeyle birlikte netleştirmenizi öneririm.

**4. Teyit gereken eşleşmeler.** Excel'deki 55 koddan 30'u mağazadaki ürünlerle eşleşti. Aşağıdakiler firmanın teyidini bekliyor. Ürün kodu verilmemiş olanlarda satış kuralı çalışır, metraj indirimi çalışmaz. İlk üç satırda ve Linear Kasa'da kod varsayımla atandı; teyitle kesinleşir.

| Mağazadaki ürün | Soru |
|---|---|
| 1.8CM Ters Trimless LED Profili | Excel'deki 14X18 TERS TRİMLESS (Y6281) mi? (Eşleştirmede böyle kabul edildi) |
| 2CM Ters Trimless LED Profili | Excel'deki 14X20 TERS TRİMLESS (Y6283) mi? (Eşleştirmede böyle kabul edildi) |
| 10X23 Kanatlı LED Profili | Ürün adı 10X23, adresi ve Excel kodu 10X30 (Y6263). Hangisi doğru? |
| İndirekt Trimless Sıva Altı LED Profili | Excel'deki 100X20 İNDİREKT SIVA ALTI (Y2973) ile aynı ürün mü? |
| Alçıpan Gizli Köşe LED Profili (mağazada 2 ürün) | Excel'de 5 kod var: Y6369 oval, Y6368 10X40, Y6304 12X25, Y6244 15X20, Y6249 12X15. Hangisi hangisi? |
| Sıva Altı LED'li Süpürgelik Profili | 15X80 (Y6367) mi, 15X45 (Y6247) mi? |
| LED'li Merdiven Basamak Profili | Y7054 52X61, Y6301 10X65, Y6308 / Y6309 fayans. Hangisi? |
| Linear Kasa (Y1264) | Mağazada 300 cm boy olarak satılıyor, Excel'de metre fiyatı var. Metre satışına geçilecekse "Uzunluk" seçeneği kaldırılmalı |
| 4 avize profili | Excel'de yok ve fiyatları 0. Fiyat ve kural gerekli |
| Alçıpan Z, Fuga, Tek Kanatlı Fuga, 2 alüminyum süpürgelik | Belgeye göre metre ile satılıyor. Mağazadaki fiyat metre fiyatı mı? |

**Excel'de olup mağazada ürünü olmayan 25 kod:** 15MM yaylı slim (Y6377); 15, 22, 25, 32, 50MM slim (Y31, Y79, Y10, Y57, Y80); 15MM sıva üstü tavan (Y6317); 25MM trimless (Y6310); 10MM fayans iç ve dış köşe (Y6287, Y6286; Excel'de fiyat teyidi notu var); LED'li korniş perde (Y1575); 5 alçıpan gizli köşe kodu; 100X20 indirekt sıva altı (Y2973); 15X80 ve 15X45 sıva altı süpürgelik (Y6367, Y6247); 22X45 kanatlı (Y6372); 14X40 kanal (Y6255); 4 LED'li basamak kodu. Bunların bir kısmı yukarıdaki teyitlerle mağazadaki ürünlere bağlanabilir; kalanlar yeni ürün olarak açılır.

## Ayarlar

Tema ayarları > Satış:

- **Fiyat notu:** KDV hariç / KDV dahil / gösterme.
- **Metraj indirimini göster:** açık ya da kapalı (yukarıdaki uyarıya bakın).
- **İndirimin başladığı metraj:** 50.
- **Dip fiyat eşiği:** 300 (ürün bazında `custom.dip_esik`).
- **Metraj notu:** panelin altındaki açıklama.

Kategori kurallarının kendisi (en az, artış, boy uzunluğu) temanın `snippets/satis-kurali.liquid` dosyasındadır. Firmanın kuralı değişirse orada tek satır değişir. Tek bir ürün için farklı değer gerekiyorsa `custom.min_siparis` ve `custom.adim` yeterlidir.

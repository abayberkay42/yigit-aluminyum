# Ürün içeriğinde eksikler

Mağazadaki 55 ürün 11.09.2026'da tek tek ölçüldü. Aşağıdaki maddeler yeni tasarımın tam görünmesi ve ürünlerin satılabilmesi için tamamlanmalıdır. Adresleri (tutamak) verdim; Shopify'da arama kutusuna yapıştırarak ürüne ulaşabilirsiniz.

## 1. Fiyatı sıfır görünen ürünler (öncelikli)

Bu dört ürün şu anda 0,00 ₺ görünüyor ve sepete eklenebiliyor:

- 14X13 Yuvarlak Avize LED Profili
- 12X7 Oval Avize LED Profili
- 12X38 Çift Kanallı Avize LED Profili
- 8X17 Avize LED Profili

Fiyat girilene kadar bu ürünleri satıştan kaldırmanızı öneririm.

## 2. Görseli eksik ürünler

Yeni ürün sayfası her üründe beş görsel bekliyor: beyaz zeminde ürün, ölçülü kesit çizimi, renk seçenekleri, uygulama fotoğrafı, detay makro. Ölçüler `GORSEL-STANDARDI.md` dosyasında.

**Tek görseli olanlar (4):** LED Profil Numune Paketi, Fuga Profilleri Numune Paketi, Süpürgelik Profilleri Numune Paketi, Duvar Panel Profilleri Numune Paketi, Tek Kanatlı Fuga Profili

**İki görseli olanlar (7):** Süpürgelik Bitiş Aparatı, Süpürgelik İç Köşe Aparatı, Süpürgelik Dış Köşe Aparatı, 14X13 Yuvarlak Avize LED Profili, 12X7 Oval Avize LED Profili, 12X38 Çift Kanallı Avize LED Profili, 8X17 Avize LED Profili

**Üç görseli olanlar (3):** Alçıpan Z Profili, Alüminyum Pahlı Süpürgelik Profili, Alüminyum Süpürgelik Profili

Kalan 40 üründe dört görsel var; bunlarda da kesit çizimi ve detay makro eksik.

## 3. Açıklaması olmayan ürünler (7)

Süpürgelik Bitiş Aparatı, Süpürgelik İç Köşe Aparatı, Süpürgelik Dış Köşe Aparatı ve dört numune paketi.

Numune paketleri için paketin içinden ne çıktığı (hangi profiller, kaç parça, hangi renkler) yazılmalı. Aparatlar için hangi süpürgelikle kullanıldığı yeterli.

## 4. Stok kodu (SKU) olmayan varyantlar

54 üründe, toplam 86 varyantta stok kodu boş. Stok kodu; sipariş takibi, depo eşleşmesi ve kademeli fiyat raporlaması için gerekli. Renk ve ölçü içeren bir kalıp öneriyorum:

`YIG-TRM-15-GUM` → grup, ürün, ölçü, renk.

## 5. Seçenek adlandırması

Seçenek adları ürünler arasında tutarsız:

| Kullanım | Ürün sayısı |
|---|---|
| Seçeneksiz (tek varyant) | 38 |
| `Renk` | 8 |
| `RENK` (büyük harf) | 2 |
| `Renk` + `Ölçü` | 4 |
| `Ölçü` + `Renk` (ters sıra) | 1 |
| `Ölçü` | 1 |
| `Uzunluk` | 1 |

Öneri: seçenek adı her üründe `Renk`, `Ölçü`, `Uzunluk`, `Kapak` biçiminde yazılsın; sıra her zaman Renk → Ölçü → Kapak olsun. Renk değerleri de tek biçim olmalı: şu anda `SİYAH`, `GRİ` gibi büyük harfli. Sitede olduğu gibi görünüyor; `Siyah`, `Gri` yazımı daha okunur olur.

Teklifte konuşulan **Renk × Kapak (Polikarbon / Silikon TPE)** matrisi henüz hiçbir üründe yok. Kapak seçeneği eklenecek ürünleri belirlememiz gerekiyor.

## 6. Adresinde bozuk karakter olan ürünler (6)

`supurgelik-i̇c-kose-aparati`, `trimless-i̇c-kose-led-profili`, `14x13-yuvarlak-avi̇ze-led-profi̇li̇`, `pvc-duvar-panel-i̇c-kose-profili`, `esnek-tri̇mless-alcipan-led-profi̇li̇`, `fuga-tri̇mless-alcipan-led-profi̇li̇`

Adresler çalışıyor ve arama sonuçlarında yer alıyor. Bu yüzden **dokunmamayı öneriyorum**. Temizlenmesini isterseniz her biri için kalıcı yönlendirme tanımlarım.

## 7. Kademeli fiyat

300 metre eşiğinin üzerindeki fiyat, ürün sayfasında ayrı bir satır olarak gösterilmeye hazır. Bunun için her üründe bir alan dolduruluyor. Doldurmadan önce netleşmesi gereken: **satış birimi metre mi, boy mu?** Bu tanım, sepetteki miktarın ne anlama geldiğini de belirliyor.

## 8. Paylaşım görseli

Site bağlantısı WhatsApp, Facebook ya da LinkedIn'de paylaşıldığında yanında çıkacak görsel henüz yok. Şu an boş olduğu için bağlantı görselsiz paylaşılıyor; bozuk bir görüntü oluşmuyor ama paylaşımlar sönük duruyor.

Gereken: **1200 × 630 piksel yatay** tek bir görsel. Logonun kendisi bu orana uymuyor; ürünün monte edilmiş hâlini ya da üretim hattını gösteren bir fotoğraf daha iyi sonuç verir. Görsel geldiğinde tema ayarlarından tek seferde tanımlanıyor, her sayfa için ayrı ayrı girilmesi gerekmiyor.

## 9. Logo (tamamlandı, tek eksiği var)

Logonun vektör dosyası alındı ve siteye yerleştirildi; menü çubuğu, sayfa altı ve tarayıcı sekmesi simgesi bundan üretildi. Eksik kalan tek şey **tek renk (beyaz ve siyah) sürüm**. Mevcut logo altın degradeli; sitenin beyaz zemininde sorunsuz çalışıyor. Koyu zeminli bir bölüm eklenirse ya da tek renk baskı gerekirse tasarımcıdan bu sürüm istenmelidir.

## 10. Ürün teknik bilgileri

Ürün sayfalarındaki "Ürün Özellikleri" penceresi şu an mağazadaki bilgilerden doluyor: ürün grubu, ürün adındaki ölçü (ör. 22 mm, 7 × 13 mm), açıklamada geçiyorsa malzeme, renk ve ölçü seçenekleri, ürün açıklamasındaki özellikler. Uydurma bilgi eklenmedi.

Eksik olan, profillerin **ölçülmüş teknik değerleri**: boy uzunluğu, et kalınlığı, iç kanal genişliği (LED şerit genişliği), kapak türü, yüzey işlemi (eloksal / toz boya), ağırlık. Bu bilgiler gelince her ürünün "Teknik özellikler" alanına satır satır girilir ve pencerede tablo olarak görünür. Ürün adındaki ölçünün (ör. "7X13") hangi boyutları ifade ettiği de teyit edilmeli; pencerede milimetre olarak yazılıyor.

Açıklaması hiç olmayan 7 ürün (3. madde) için pencerede yalnız ürün grubu ve seçenekler görünüyor.

## 11. Taksit kart logoları

Ürün sayfasında "12 aya varan taksit" ve kart görselleri gösteriliyor. Resmi banka/kart logoları yüklenene kadar kartlar, program adıyla çizilmiş kart görseli olarak duruyor. Gereken: ödeme altyapınızın (iyzico, PayTR vb.) logo paketi ve **hangi kartlarda kaç taksit ve vade farkı olduğunun** teyidi.

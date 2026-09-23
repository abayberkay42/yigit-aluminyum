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

## 7. Metraj fiyatı ve satış kuralları

Firmanın satış kuralları belgesi ve LED metre iskonto tablosu siteye işlendi (2026-09-18). Ayrıntı "Fiyat ve satış kuralları" belgesinde. Mağaza tarafında eksik olanlar:

- 6 meta alan tanımı ve ürünlere değerlerin girilmesi (değerler teslim edilen eşleştirme dosyasında).
- Varyant fiyatlarının Excel'deki liste fiyatına çekilmesi; KDV dahil / hariç ayarının netleşmesi.
- Hangi LED ürünlerinin en az 30 m satılacağı (belgede "ayrıca bildirilecek").
- 18 üründe Excel koduyla eşleşme teyidi, Y6286 / Y6287 fiyat teyidi.
- **İndirimin ödemede nasıl uygulanacağı kararı.** Karar verilip kurulana kadar yayında "Metraj indirimini göster" ayarı kapalı olmalı.

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

Ürün sayfasında "12 aya varan taksit" ve PayTR'nin taksit desteklediği 9 kart programının resmi logoları gösteriliyor (logolar programların kendi sitelerinden alındı). Eksik kalanlar:

- **Maximum logosu:** maximum.com.tr bağlantı vermediği için İş Bankası'nın resmi "Maximum Mobil" uygulamasının App Store görselinden alındı. Kaynak çözünürlüğü düşük; İş Bankası'ndan vektör (SVG/AI) logo gelirse değiştirilmesi iyi olur.
- **CardFinans** için sitede yalnız QNB logosu var; **Advantage** için yalnız kart görseli. Bankalardan ya da PayTR'den program logoları gelirse bunlar da değiştirilebilir.
- **Hangi kartlarda kaç taksit ve vade farkı olduğu** PayTR panelindeki ayarlarla teyit edilmeli.

## 12. Kurumsal sayfa metninde bayi ağı

Firma bayilik vermediği için sitedeki bayilik başvurusu ve bayilik ifadeleri kaldırıldı (2026-09-19). Kurumsal sayfanın mağazadaki metninde (Shopify > Online Mağaza > Sayfalar > Kurumsal) hâlâ şu cümle var: "…üretim yapmakta; **bayi ağı sayesinde** tüm Türkiye'ye dağıtım sağlamaktadır." Bu metin temanın değil mağazanın içeriği olduğu için oradan düzeltilmeli. Öneri: "…üretim yapmakta ve tüm Türkiye'ye dağıtım sağlamaktadır." İngilizce çevirisinde de "through our dealer network" ifadesi çıkarılmalı.

## 13. Tarihçe için eksik görseller ve ülke listesi

Kurumsal sayfasındaki tarihçe şeridinde üç madde görselsiz duruyor; elimizde o döneme ait fotoğraf yok:

- **2012 – Çatalca fabrikası** (1.100 m², ilk ekstrüzyon presi)
- **2012–2020 – ihracatın başladığı dönem**
- **2020 – Beylikdüzü'ndeki altı katlı mağaza** (tarihçe belgesinde "mağaza görselleri bu başlığın altında kullanılacak" notu var ama dosyalarda mağaza fotoğrafı yok)

Bu fotoğraflar gelirse şeride eklenir; en çok mağaza fotoğrafı gerekiyor, satış merkezi sitede hiç görünmüyor.

**Ülke sayısı:** Firmadan gelen güncel bilgiye göre ihracat **20 ülkeye** yapılıyor: Bulgaristan, Romanya, Yunanistan, Sırbistan, Makedonya, Arnavutluk, Kosova, Bosna-Hersek, Hırvatistan, Gürcistan, Azerbaycan, Irak, Rusya, Almanya, Fransa, İtalya, Amerika Birleşik Devletleri, Kanada, Birleşik Arap Emirlikleri, Suudi Arabistan. Sitede (ana sayfa ihracat bölümü, Kurumsal tarihçesi ve Kurumsal sayfa metni) 20 yazıyor ve ülkeler haritada işaretli. Tarihçe belgesindeki "16 ülke" ifadesi eskidir; firma kendi belgesini de güncellemek isteyebilir.

## 14. Numune ürünü ve numune ücreti

Sepete numune ekleyen düğmenin çalışması için Shopify'da bir "Ürün Numunesi" ürünü açılmalı (bkz. `AKTARIM.md` > "Numune iste"). Karar bekleyen üç konu var:

- **Numune ücreti:** ücretsiz mi, sembolik bir bedel mi? Önizlemede 0,00 ₺ görünüyor.
- **Kargo:** numune tek başına sipariş edilirse kargo ücreti alınacak mı?
- **Sınır:** bir siparişte en fazla kaç numune istenebilir? Şu an sınır yok.

## 15. Google yorumları ve mağaza haritası için gerekenler

- ~~Google İşletme Profili / Yer Kimliği~~ **alındı** (2026-09-23): harita firmanın kendi kaydına bağlandı, yorum düğmeleri çalışıyor.
- ~~Mağaza adresinin teyidi~~ **yapıldı.**
- **Gösterilecek yorumlar:** firma hangi yorumların sitede görüneceğini seçmeli (yazan, puan, tarih, metin).
- **Ziyaretçinin site üzerinden yorum yazması:** bir yorum uygulaması (ör. Judge.me) kurulmalı; tema hazır.

## 16. Polikarbon üretim görsellerinin kadrajı

Firmanın gönderdiği beş üretim görselinin dördünde makine kadrajdan taşıyor (sağ, sol ve alt kenarda kesiliyor); görselin kendisi böyle geldiği için kırpma ayarıyla düzelmiyor. Geçici çözüm olarak kesilen kenarlar yumuşak geçişle söndürüldü, böylece "yarım kalmış" gibi durmuyor. Ham dosyalar `kaynak/kapak-uretim-ham/` klasöründe duruyor.

Kalıcı çözüm iki yoldan biri: (a) makinenin tamamı kadraja giren yeni görseller üretmek (kalıptan çıkış adımında bu yapıldı), (b) firmanın kendi hattından çekilmiş gerçek fotoğrafları kullanmak. Gerçek fotoğraf her zaman daha iyi olur; üretim hattından beş adımı gösteren fotoğraf gelirse bu görsellerin yerine konur.

## 17. Üretim parkuru fotoğrafları

"Üretim Parkurumuz" sayfasındaki altı durağın (kalıphane, ekstrüzyon pres hattı, eloksal hattı, elektrostatik toz boya tesisi, mekanik işlem hattı, paketleme ve sevkiyat) fotoğraf alanları boş. Firma fabrikada her durağa ait fotoğrafları çekecek; geldiklerinde Dosyalar'a yüklenip tema düzenleyiciden ilgili durağa ve ana sayfadaki karta seçilir. Fotoğraf gelene kadar duraklar yalnız yazıyla görünüyor.

Sayfanın başındaki banner şimdilik mevcut üretim bannerını kullanıyor; parkura özel bir banner görseli gelirse değiştirilir.

## 18. YouTube adresi

Mağaza tabelasında ve vitrinde YouTube hesabı görünüyor ama sitede kayıtlı değil. Adres verilirse Tema ayarları > Firma bilgileri > Sosyal medya adresleri'ne eklenir; alt alanda, iletişim sayfasında ve telefon menüsünde kendiliğinden görünür.

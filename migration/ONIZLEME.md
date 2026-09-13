# Yeni temayı Shopify'da önizleme

Tema, mağazaya **yayımlanmamış tema** olarak yüklenir. Canlı site bu süreçte değişmez; müşteri yeni tasarımı kendi ürünleri ve verileriyle, "Önizle" bağlantısından görür.

## Gerekenler

- Mağaza yöneticisi hesabı (ya da "Temalar" yetkisi olan personel hesabı).
- `dist/yigit-aluminyum-tema.zip` (tema)
- `dist/shopify-dosyalar/` içindeki 8 oda görseli
- `dist/shopify-dosyalar/film/` içindeki 944 film karesi (ana sayfanın başındaki kaydırmalı film, masaüstü)
- `dist/shopify-dosyalar/film-mobil/` içindeki 361 film karesi (aynı film, telefon için dikey)

## 1. Oda görsellerini yükleyin

Shopify > İçerik > Dosyalar > Dosya yükle. `dist/shopify-dosyalar/` içindeki 8 dosyayı **adlarını değiştirmeden** yükleyin:

`room-salon.webp, room-koridor.webp, room-mutfak.webp, room-yatak.webp, room-banyo.webp, room-ofis.webp, room-galeri.webp, room-dis.webp`

Tema bu görselleri adlarıyla bulur. Katalog kapakları ve üretim fotoğrafları mağazanın Dosyalar bölümünde zaten var.

**Film kareleri:** Aynı yerden `dist/shopify-dosyalar/film/` içindeki 944 dosya (`yigit-film-0001.webp` … `yigit-film-0944.webp`, masaüstü) ve `dist/shopify-dosyalar/film-mobil/` içindeki 361 dosya (`yigit-film-mobil-0001.webp` … `yigit-film-mobil-0361.webp`, telefon) adları değiştirilmeden yüklenir. Toplam 138 MB + 39 MB; birkaç parti hâlinde seçip yüklemek daha güvenlidir. Video olarak yüklemeyin: Shopify videoyu yeniden kodlar ve kaydırmada takılma olur. Kareler yüklenmeden önizleme açılırsa film bölümü kendini gizler ve ana sayfa doğrudan 3B sahneyle açılır; bu bir arıza değil. Kareler yüklendiği anda film görünür, temada başka bir şey değiştirmek gerekmez.

## 2. Temayı yükleyin

Shopify > Online Mağaza > Temalar > Tema ekle > **Zip dosyası yükle** > `yigit-aluminyum-tema.zip`.

Tema "Tema kitaplığı" altına eklenir. **Yayınla'ya basmayın.**

## 3. Önizleme bağlantısını alın

Temanın yanındaki "…" > **Önizle**. Açılan sayfanın altındaki "Önizlemeyi paylaş" ile bağlantı kopyalanır; bağlantı giriş gerektirmeden açılır.

## 4. Yeni sayfa şablonlarını önizleyin

Canlı temada bulunmayan şablonlar, sayfaya atanmadan önce adrese `?view=` eklenerek önizlenir:

| Sayfa | Önizleme adresi |
|---|---|
| Kurumsal | `/pages/kurumsal?view=kurumsal` |
| Üretim | `/pages/uretim?view=uretim` |
| Kataloglar | `/pages/kataloglar?view=kataloglar` |
| SSS | `/pages/s-s-s?view=sss` |
| İletişim | `/pages/i̇leti̇şi̇m?view=iletisim` (tutamak yayın günü `iletisim` olur) |
| Kullanım alanları | Önce sayfa oluşturulur (aşağıda), sonra `/pages/kullanim-alanlari?view=kullanim-alanlari` |
| Duvar paneli ürünü | örnek: `/products/pvc-duvar-panel-dis-kose-profili?view=panel` |
| Fuga / alçıpan ürünü | örnek: `/products/alcipan-z-profili?view=fuga` |
| Süpürgelik ürünü | örnek: `/products/aluminyum-supurgelik-profili?view=supurgelik` |

Ana sayfa, ürün grupları, koleksiyon, LED ürünleri, sepet, arama ve blog varsayılan şablonla doğrudan görünür.

**Kullanım alanları sayfası:** Shopify > Online Mağaza > Sayfalar > Sayfa ekle. Başlık "Kullanım alanları", içerik boş. Arama motoru önizlemesinde adres `kullanim-alanlari` olmalı. Yayın gününe kadar görünürlüğü "Gizli" bırakılabilir.

## Önizlemede farklı görünecekler

- **Menüler:** Üst ve alt menü mağazanın mevcut menülerini gösterir. Yeni sayfa bağlantıları (Kullanım alanları, Kataloglar, SSS) yayın günü menülere eklenir.
- **"Ürünler" açılır menüsü:** Önizlemede "Ürünler" düz bağlantı olarak görünür. Bu bir eksiklik değil: açılır liste, Shopify > Gezinme'de "Ürünler" başlığının altına bağlantı eklendiğinde oluşur. Bağlantılar `AKTARIM.md` içindeki "Menü" tablosunda sırasıyla verilmiştir; önizlemede de görmek isterseniz o adımı şimdi uygulayabilirsiniz (canlı temayı etkilemez, menüler tema dışıdır).
- **İngilizce:** Tema metinleri İngilizce hazır; sayfa ve bölüm içeriklerinin çevirisi Translate & Adapt ile girilir.
- **Firma bilgileri:** Tema ayarlarında e-posta, telefon ve sosyal medya dolu gelir. Logo ve tarayıcı sekmesi simgesi temanın içinde hazır gelir, ayrıca bir şey yüklemek gerekmez. Paylaşım görseli (bağlantı paylaşıldığında çıkan 1200 × 630 görsel) boştur; boş olduğunda paylaşım etiketi hiç basılmaz, bozuk önizleme oluşmaz.

## Yayın günü

Adımların tamamı `AKTARIM.md` dosyasında: sayfa ve ürün şablonu atamaları, iletişim sayfası tutamak değişikliği ve yönlendirme (`redirects.csv`), menü güncellemesi.

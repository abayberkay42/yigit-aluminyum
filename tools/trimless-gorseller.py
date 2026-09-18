# Firmanın "TRİMLESS LED PROFİLLERİ" klasöründeki görselleri (2026-09-18) sitenin dosya adlarıyla WebP'ye çevirir.
#   dev/mock/files/                  yerel ve Vercel önizlemesi (Shopify "Dosyalar" taklidi)
#   dist/shopify-dosyalar/trimless/  müşterinin Shopify > İçerik > Dosyalar'a aynı adla yükleyeceği kopya
# Görseller büyütülmez, yalnız biçim değişir. "ANA FİKİR" özet görselleri bölümlerde "rehberin tamamı" bağlantısıdır.
# Kullanım: python tools/trimless-gorseller.py [kaynak klasör]
import os, sys, json
from PIL import Image

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(KOK, 'TRİMLESS LED PROFİLLERİ')

ESLESME = {
    'UYGULAMA ADIM GÖRSELLERİ/ANA FİKİR.png': 'trimless-uygulama-rehber.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/01_kanali_acin.png': 'trimless-uygulama-01.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/02_profili_yerlestirin.png': 'trimless-uygulama-02.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/03_vidalayarak_sabitleyin.png': 'trimless-uygulama-03.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/04_siva_uygulayin.png': 'trimless-uygulama-04.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/05_boyamayi_tamamlayin.png': 'trimless-uygulama-05.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/06_led_seridi_yerlestirin.png': 'trimless-uygulama-06.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/07_koruyucu_bandi_cikarin.png': 'trimless-uygulama-07.webp',
    'UYGULAMA ADIM GÖRSELLERİ/SADECE GÖRSELLER/08_isigi_acin.png': 'trimless-uygulama-08.webp',
    'KAPAK NASIL TAKILIR GÖRSELLERİ/ANA FİKİR.png': 'trimless-kapak-rehber.webp',
    'KAPAK NASIL TAKILIR GÖRSELLERİ/SADECE GÖRSELLER/01_Parcalari_Hizalayin.png': 'trimless-kapak-01.webp',
    'KAPAK NASIL TAKILIR GÖRSELLERİ/SADECE GÖRSELLER/02_Bir_Kenari_Oturtun.png': 'trimless-kapak-02.webp',
    'KAPAK NASIL TAKILIR GÖRSELLERİ/SADECE GÖRSELLER/03_Boydan_Boya_Bastirin.png': 'trimless-kapak-03.webp',
    'KAPAK NASIL TAKILIR GÖRSELLERİ/SADECE GÖRSELLER/04_Montaji_Tamamlayin.png': 'trimless-kapak-04.webp',
    'SIK YAPILAN HATA/ANA FİKİR.png': 'trimless-hata-rehber.webp',
    'SIK YAPILAN HATA/SADECE GÖRSELLER/01_Yanlis_Kapaksiz_Vidalama.png': 'trimless-hata-yanlis.webp',
    'SIK YAPILAN HATA/SADECE GÖRSELLER/02_Dogru_Kapak_Takili_Montaj.png': 'trimless-hata-dogru.webp',
    '45 DERECE KESİM_/ANA FİKİR.png': 'trimless-kesim-rehber.webp',
    '45 DERECE KESİM_/SADECE GÖRSELLER/01_45_Derece_Kesim.png': 'trimless-kesim-01.webp',
    '45 DERECE KESİM_/SADECE GÖRSELLER/02_90_Derece_Kose_Birlesimi.png': 'trimless-kesim-02.webp',
    'SPOT VS TRİMLESS/ANA FİKİR.png': 'trimless-spot-rehber.webp',
    'SPOT VS TRİMLESS/SADECE GÖRSELLER/01_Trimless_LED_Profil_Aydinlatma.png': 'trimless-spot-trimless.webp',
    'SPOT VS TRİMLESS/SADECE GÖRSELLER/02_Standart_Spot_Aydinlatma.png': 'trimless-spot-spot.webp',
}

hedefler = [os.path.join(KOK, 'dev', 'mock', 'files'), os.path.join(KOK, 'dist', 'shopify-dosyalar', 'trimless')]
for h in hedefler:
    os.makedirs(h, exist_ok=True)
toplam = 0
for kaynak, ad in ESLESME.items():
    yol = os.path.join(KAYNAK, *kaynak.split('/'))
    im = Image.open(yol).convert('RGB')
    for h in hedefler:
        cikti = os.path.join(h, ad)
        im.save(cikti, 'WEBP', quality=90 if 'rehber' in ad else 86, method=6)
    toplam += os.path.getsize(cikti)
    print(f'{ad:34} {im.size[0]}×{im.size[1]}  {os.path.getsize(cikti) // 1024} KB')
print(f'{len(ESLESME)} görsel, toplam {toplam // 1024} KB')

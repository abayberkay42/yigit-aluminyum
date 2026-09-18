# Firmanın LED profili fiyat tablosunu (Excel) mağazadaki ürünlerle eşleştirir.
#
# Çıktılar:
#   dist/fiyat/fiyat-eslestirme.csv  müşteriye: her ürün için girilecek meta alanlar ve fiyat (depoya girmez)
#   dist/fiyat/magazada-olmayan.csv   Excel'de olup mağazada ürünü bulunmayan kodlar (depoya girmez)
#   dev/mock/metafields.json          yerel önizleme: yalnız mağazada satılan ürünlerin değerleri
#
# Depo herkese açık olduğu için fiyat tablosunun kendisi ve eşleşmeyen kodların fiyatları dist/ altında kalır.
# Kullanım: python tools/fiyat-eslestir.py [excel_yolu]
import csv, json, os, sys
import openpyxl

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(r'~/Downloads/LED_Profilleri_Her_Metre_Iskonto_Tablosu.xlsx')

# Mağaza ürünü (tutamak) → Excel ürün kodu, satış kuralı, not.
# Kod boşsa: Excel'de birden çok aday var ya da ürün tabloda yok; firma teyit edene kadar indirim uygulanmaz.
ESLESME = [
    # Trimless
    ('1-5cm-trimless-alcipan-led-profili', 'Y6131', 'led', ''),
    ('2-2cm-trimless-alcipan-led-profili', 'Y6279', 'led', ''),
    ('3-2cm-trimless-alcipan-led-profili', 'Y6211', 'led', ''),
    ('5cm-trimless-alcipan-led-profili', 'Y6280', 'led', ''),
    ('esnek-tri̇mless-alcipan-led-profi̇li̇', 'Y6282', 'led', ''),
    ('fuga-tri̇mless-alcipan-led-profi̇li̇', 'Y6281', 'led', 'Teyit: "1.8CM Ters Trimless" Excel\'deki 14X18 TERS TRİMLESS (Y6281) kabul edildi'),
    ('2cm-ters-trimless-led-profili', 'Y6283', 'led', 'Teyit: "2CM Ters Trimless" Excel\'deki 14X20 TERS TRİMLESS (Y6283) kabul edildi'),
    ('tek-kanatli-profili', 'Y6272', 'led', ''),
    ('trimless-i̇c-kose-led-profili', 'Y6245', 'led', ''),
    ('trimless-dis-kose-led-profili', 'Y6246', 'led', ''),
    ('indirekt-trimless-siva-alti-led-profili', '', 'led', 'Teyit: Excel\'de 100X20 İNDİREKT SIVA ALTI (Y2973) var; aynı ürün mü?'),
    # Tavan köşe, kartonpiyer, alçıpan
    ('tavan-kose-led-profili', 'Y6337', 'led', ''),
    ('kartonpiyer-led-profili', 'Y111', 'led', ''),
    ('ledli-alcipan-z-profili', 'Y6273', 'led', ''),
    ('alcipan-gizli-kose-led-profili', '', 'led', 'Teyit: Excel\'de 5 alçıpan gizli (köşe) kodu var (Y6369, Y6368, Y6304, Y6244, Y6249); mağazada aynı adlı 2 ürün var'),
    ('alcipan-gizli-kose-led-profili-1', '', 'led', 'Teyit: yukarıdakiyle aynı'),
    ('gizli-kose-led-profili', 'Y7055', 'led', ''),
    # Süpürgelik (LED'li)
    ('ledli-supurgelik-profili', 'Y96', 'led', ''),
    ('alti-oval-ledli-supurgelik-profili', 'Y6231', 'led', ''),
    ('siva-alti-ledli', '', 'led', 'Teyit: Excel\'de 15X80 (Y6367) ve 15X45 (Y6247) sıva altı süpürgelik var'),
    # Kanatlı
    ('8x17-kanatli-led-profili', 'Y6284', 'led', ''),
    ('7x15-kanatli-led-profili', 'Y6122', 'led', ''),
    ('10x30-kanatli-led-profili', 'Y6263', 'led', 'Teyit: ürün adı 10X23, adresi ve Excel kodu 10X30'),
    ('12x24-kanatli-led-profili', 'Y6094', 'led', ''),
    # Kanal
    ('10x6-led-profili', 'Y6265', 'led', ''),
    ('14x8-led-profili', 'Y6261', 'led', ''),
    ('12x18-led-profili', 'Y6093', 'led', ''),
    ('12x18-led-profili-1', 'Y6129', 'led', ''),
    ('22x13-led-profili', 'Y6268', 'led', ''),
    ('32x13-led-profili', 'Y6269', 'led', ''),
    ('14x50-led-profili', 'Y6229', 'led', ''),
    ('neon-led-kanali', 'Y6235', 'led', ''),
    ('kose-led-profili', 'Y6124', 'led', ''),
    # Diğer LED
    ('ledli-merdiven-basamak-profili', '', 'led', 'Teyit: Excel\'de 4 LED\'li basamak kodu var (Y7054, Y6301, Y6308, Y6309)'),
    ('linear-kasa', 'Y1264', 'led', 'Teyit: mağazada 300 cm boy olarak satılıyor, Excel\'de metre fiyatı var; "Uzunluk" seçeneği kaldırılmalı'),
    ('14x13-yuvarlak-avi̇ze-led-profi̇li̇', '', 'led', 'Excel\'de yok; fiyatı da 0'),
    ('12x7-oval-avize-led-profili', '', 'led', 'Excel\'de yok; fiyatı da 0'),
    ('12x38-cift-kanalli-avize-led-profili', '', 'led', 'Excel\'de yok; fiyatı da 0'),
    ('8x17-avize-led-profili', '', 'led', 'Excel\'de yok; fiyatı da 0'),
    # PDF'teki diğer kategoriler (indirim tablosu yok)
    ('pvc-panel-u-bitim-profili', '', 'pvc_panel', ''),
    ('pvc-duvar-panel-h-birlesim-profili', '', 'pvc_panel', ''),
    ('pvc-duvar-panel-i̇c-kose-profili', '', 'pvc_panel', ''),
    ('pvc-duvar-panel-dis-kose-profili', '', 'pvc_panel', ''),
    ('alcipan-z-profili', '', 'alcipan', 'Teyit: mağazadaki fiyat metre fiyatı mı?'),
    ('fuga-profili', '', 'alcipan', 'Teyit: mağazadaki fiyat metre fiyatı mı?'),
    ('tek-kanatli-fuga-profili', '', 'alcipan', 'Teyit: mağazadaki fiyat metre fiyatı mı?'),
    ('aluminyum-supurgelik-profili', '', 'supurgelik', 'Teyit: mağazadaki fiyat metre fiyatı mı?'),
    ('aluminyum-pahli-supurgelik', '', 'supurgelik', 'Teyit: mağazadaki fiyat metre fiyatı mı?'),
]


def tablo(yol):
    ws = openpyxl.load_workbook(yol, data_only=True, read_only=True)['Fiyat Tablosu']
    out = {}
    for r in ws.iter_rows(min_row=4, values_only=True):
        kod = (r[0] or '').strip() if isinstance(r[0], str) else ''
        if kod[:1] == 'Y' and kod[1:2].isdigit():
            out[kod] = {'ad': r[1].strip(), 'liste': r[2], 'dip': r[3], 'esik': r[4]}
    return out


def main():
    fiyat = tablo(EXCEL)
    urunler = {p['handle']: p for p in json.load(open(os.path.join(KOK, 'dev/mock/products.json'), encoding='utf-8'))}
    kullanilan = set()
    satirlar, mock = [], {}
    for handle, kod, kural, notu in ESLESME:
        p = urunler.get(handle)
        if not p:
            sys.exit(f'Mağazada yok: {handle}')
        f = fiyat.get(kod) if kod else None
        if kod and not f:
            sys.exit(f'Excel\'de yok: {kod}')
        if kod:
            kullanilan.add(kod)
        if f and '*' in f['ad']:
            notu = (notu + '; ' if notu else '') + 'Excel notu: fiyat teyit edilmeli (yüzey farkı)'
        magaza = p['variants'][0]['price']
        satirlar.append({
            'Tutamak': handle,
            'Ürün': p['title'],
            'custom.satis_kurali': kural,
            'custom.urun_kodu': kod,
            'Excel adı': f['ad'] if f else '',
            'Varyant fiyatı (Excel liste, KDV hariç)': f['liste'] if f else '',
            'Şu anki fiyat': magaza,
            'custom.tier_price (dip fiyat)': f['dip'] if f else '',
            'custom.dip_esik': f['esik'] if f and f['esik'] != 300 else '',
            'Not': notu,
        })
        m = {'satis_kurali': kural}
        if f:
            m.update({'urun_kodu': kod, 'tier_price': f['dip'], '_liste': f['liste']})
            if f['esik'] != 300:
                m['dip_esik'] = f['esik']
        mock[handle] = m

    hedef = os.path.join(KOK, 'dist', 'fiyat')
    os.makedirs(hedef, exist_ok=True)
    with open(os.path.join(hedef, 'fiyat-eslestirme.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=list(satirlar[0].keys()), delimiter=';')
        w.writeheader()
        w.writerows(satirlar)
    with open(os.path.join(hedef, 'magazada-olmayan.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.writer(fh, delimiter=';')
        w.writerow(['Ürün kodu', 'Excel adı', 'Liste TL/m', 'Dip TL/m', 'Dip eşiği (m)'])
        for kod, f in fiyat.items():
            if kod not in kullanilan:
                w.writerow([kod, f['ad'], f['liste'], f['dip'], f['esik']])
    with open(os.path.join(KOK, 'dev/mock/metafields.json'), 'w', encoding='utf-8') as fh:
        json.dump(mock, fh, ensure_ascii=False, indent=1)

    eslesen = sum(1 for s in satirlar if s['custom.urun_kodu'])
    print(f'Excel: {len(fiyat)} kod | eşleşen ürün: {eslesen} | kodsuz (teyit/yok): {len(satirlar) - eslesen} | mağazada olmayan kod: {len(fiyat) - len(kullanilan)}')


main()

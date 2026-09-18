// Ürün sayfası: galeri, seçenekler (varyant), adet ve sepete ekleme.
// Sepete ekleme Ajax ile yapılır ve sepet çekmecesi açılır; JS yoksa form Shopify'ın /cart/add adresine normal gider.
// Satış koşulu (snippets/satis-kurali.liquid): miktar en az miktardan başlar, adım adım artar; elle yazılan miktar
// kutudan çıkınca ve sepete eklemeden önce kurala oturtulur. Metraj paneli ve toplam miktarla birlikte güncellenir.
import { metreFiyati, oturt } from './metraj.js';

const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
const tl = (kurus) => money.format(kurus / 100);

export function initProduct(root = document) {
  root.querySelectorAll('[data-product]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const t = el.dataset;
    const variants = JSON.parse(el.querySelector('[data-variants]')?.textContent || '[]');
    const form = el.querySelector('.pdp__form');
    if (!form) return;
    const idInput = form.querySelector('[name="id"]');
    const price = el.querySelector('[data-price]');
    const add = form.querySelector('[data-add]');
    const label = add.querySelector('[data-add-label]');
    const status = form.querySelector('[data-status]');
    const qty = form.querySelector('.qty__input');
    const qtyKutu = form.querySelector('[data-qty]');
    const enAz = Number(qtyKutu?.dataset.min) || 1;
    const adim = Number(qtyKutu?.dataset.adim) || 1;
    const birim = qtyKutu?.dataset.birim || '';
    const birimli = (n) => (birim ? `${n} ${birim}` : String(n));
    const metraj = el.querySelector('[data-metraj]');
    const toplam = form.querySelector('[data-toplam]');
    const sets = [...form.querySelectorAll('.opt')];
    let current = variants.find((v) => String(v.id) === idInput.value);

    const slides = [...el.querySelectorAll('[data-media]')];
    const thumbs = [...el.querySelectorAll('[data-thumb]')];
    const show = (id) => {
      slides.forEach((s) => {
        s.hidden = s.dataset.media !== String(id);
        // Gizlenen videonun sesi arkada devam etmesin
        if (s.hidden) s.querySelector('video')?.pause();
      });
      thumbs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.thumb === String(id))));
    };
    thumbs.forEach((b) => b.addEventListener('click', () => show(b.dataset.thumb)));

    // Metre fiyatı ve toplam: metraj paneli yalnız dip fiyatı olan metre ürünlerinde bulunur
    const guncelle = () => {
      if (!current) return;
      const m = Math.max(0, parseInt(qty.value, 10) || 0);
      let birimFiyat = current.price;
      if (metraj) {
        const d = metraj.dataset;
        const esik = Number(d.esik);
        const bas = Number(d.bas);
        birimFiyat = metreFiyati(current.price, d.dip, esik, m, bas);
        const oran = current.price > 0 ? Math.round((1 - birimFiyat / current.price) * 100) : 0;
        const q = (n) => `${n} ${d.kisa}`;
        metraj.querySelector('[data-metraj-fiyat]').textContent = tl(birimFiyat);
        const liste = metraj.querySelector('[data-metraj-liste]');
        liste.hidden = birimFiyat >= current.price;
        liste.lastChild.textContent = tl(current.price);
        const off = metraj.querySelector('[data-metraj-off]');
        off.hidden = oran <= 0;
        off.textContent = d.tOff.replace('[p]', oran);
        metraj.querySelector('[data-metraj-for]').textContent = d.tFor.replace('[m]', q(m));
        metraj.querySelector('[data-metraj-dolu]').style.setProperty('--oran', Math.min(m / esik, 1));
        metraj.classList.toggle('is-indirimde', m >= bas);
        metraj.classList.toggle('is-dipte', m >= esik);
        metraj.querySelector('[data-metraj-durum]').textContent =
          m >= esik ? d.tFloor : m >= bas ? d.tLeft.replace('[m]', q(esik - m)) : d.tStart.replace('[m]', q(bas));
      }
      if (toplam) {
        toplam.querySelector('[data-toplam-v]').textContent = tl(birimFiyat * m);
        toplam.querySelector('[data-toplam-h]').textContent = toplam.dataset.tCalc.replace('[q]', birimli(m)).replace('[p]', tl(birimFiyat));
      }
    };

    // Elle yazılan miktarı kurala oturtur; değiştiyse nedenini söyler
    const duzelt = () => {
      const yazilan = parseInt(qty.value, 10) || 0;
      const dogru = oturt(yazilan, enAz, adim);
      if (dogru !== yazilan) {
        qty.value = dogru;
        const t = qtyKutu?.dataset.tSnapped;
        if (t && yazilan > 0) status.textContent = t.replace('[q]', birimli(dogru)).replace('[min]', birimli(enAz)).replace('[adim]', birimli(adim));
      }
      guncelle();
    };

    const setButton = (v) => {
      const ok = !!v && v.available;
      add.disabled = !ok;
      label.textContent = ok ? t.tAdd : v ? t.tSoldOut : t.tUnavailable;
    };

    form.addEventListener('change', (e) => {
      if (!e.target.matches('.opt input')) return;
      const picked = sets.map((s) => s.querySelector('input:checked')?.value);
      sets.forEach((s, i) => {
        const out = s.querySelector('[data-opt-value]');
        if (out) out.textContent = picked[i] ?? '';
      });
      current = variants.find((v) => v.options.every((o, i) => o === picked[i]));
      if (current) {
        idInput.value = current.id;
        price.textContent = tl(current.price);
        history.replaceState(history.state, '', `${location.pathname}?variant=${current.id}`);
        if (current.media) show(current.media);
      }
      setButton(current);
      status.textContent = '';
      guncelle();
    });

    form.querySelectorAll('[data-qty-step]').forEach((b) =>
      b.addEventListener('click', () => {
        const simdiki = oturt(qty.value, enAz, adim);
        qty.value = Math.max(enAz, simdiki + Number(b.dataset.qtyStep) * adim);
        status.textContent = '';
        guncelle();
      }),
    );
    qty.addEventListener('input', guncelle);
    // Hesaplayıcının yazdığı miktar da "change" ile gelir
    qty.addEventListener('change', duzelt);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (add.disabled) return;
      duzelt();
      add.disabled = true;
      add.setAttribute('aria-busy', 'true');
      label.textContent = t.tAdding;
      try {
        const res = await fetch(`${form.action}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(idInput.value), quantity: parseInt(qty.value, 10) || 1 }], sections: 'cart-drawer' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || data.message);
        status.textContent = t.tAdded;
        document.dispatchEvent(new CustomEvent('yigit:cart-updated', { detail: { sections: data.sections, open: true } }));
      } catch (err) {
        status.textContent = err.message || t.tError;
      } finally {
        add.removeAttribute('aria-busy');
        setButton(current);
      }
    });

    guncelle();
  });
}

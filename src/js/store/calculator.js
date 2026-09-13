// Metraj hesaplayıcı: toplam uzunluk ya da oda ölçüsünden gereken adedi bulur ve miktar kutusuna yazar.
// Satış birimi "boy" ise adet = fire dahil uzunluk / bir boyun uzunluğu (yukarı yuvarlanır); "metre" ise metre sayısıdır.
// Sepete ekleme kararı kullanıcıdadır; hesaplayıcı yalnızca adedi doldurur.
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

export function initCalculator(root = document) {
  root.querySelectorAll('[data-calc]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';

    const unit = el.dataset.unit === 'metre' ? 'metre' : 'boy';
    const boyM = Math.max(0.1, (Number(el.dataset.length) || 300) / 100);
    const waste = Math.max(0, Number(el.dataset.waste) || 0);
    const tier = Number(el.dataset.tier) || 0;

    const modes = [...el.querySelectorAll('.calc__modes input')];
    const fields = [...el.querySelectorAll('[data-calc-field]')];
    const total = el.querySelector('[data-calc-total]');
    const w = el.querySelector('[data-calc-w]');
    const d = el.querySelector('[data-calc-d]');
    const out = {
      need: el.querySelector('[data-calc-need]'),
      waste: el.querySelector('[data-calc-waste]'),
      qty: el.querySelector('[data-calc-qty]'),
      tierRow: el.querySelector('[data-calc-tier-row]'),
      tier: el.querySelector('[data-calc-tier]'),
    };
    const apply = el.querySelector('[data-calc-apply]');
    const note = el.querySelector('[data-calc-note]');
    const noteBase = note?.textContent ?? '';
    let adet = 0;

    const mode = () => modes.find((m) => m.checked)?.value || 'total';
    const form = el.closest('.pdp')?.querySelector('.pdp__form');

    // Ürünün seçili "Uzunluk" seçeneği varsa boy uzunluğu ondan alınır (200CM / 3M / 2500MM hepsi okunur)
    const seciliBoy = () => {
      const inp = [...(form?.querySelectorAll('input[type="radio"]:checked') || [])].find((i) => /uzunluk|length/i.test(i.name));
      const m = inp && String(inp.value).match(/([\d.,]+)\s*(mm|cm|m)?/i);
      if (!m) return null;
      const n = parseFloat(m[1].replace(',', '.'));
      if (!Number.isFinite(n) || n <= 0) return null;
      const birim = (m[2] || 'cm').toLowerCase();
      return birim === 'mm' ? n / 1000 : birim === 'm' ? n : n / 100;
    };

    const hesapla = () => {
      const m = mode();
      fields.forEach((f) => (f.hidden = f.dataset.calcField !== m));
      let uzunluk = 0;
      if (m === 'total') uzunluk = Number(total.value) || 0;
      else {
        const a = Number(w.value) || 0;
        const b = Number(d.value) || 0;
        uzunluk = a > 0 && b > 0 ? 2 * (a + b) : 0; // oda çevresi
      }
      const fireli = uzunluk * (1 + waste / 100);
      const boy = seciliBoy() || boyM;
      adet = uzunluk > 0 ? (unit === 'boy' ? Math.ceil(fireli / boy) : Math.ceil(fireli)) : 0;

      out.need.textContent = uzunluk > 0 ? `${nf.format(uzunluk)} m` : '—';
      out.waste.textContent = uzunluk > 0 ? `${nf.format(fireli)} m` : '—';
      out.qty.textContent = adet > 0 ? (unit === 'boy' ? `${adet} ${apply.dataset.unitBoy}` : `${adet} m`) : '—';
      if (out.tierRow) {
        const kaldi = tier - fireli;
        out.tierRow.hidden = !(uzunluk > 0);
        out.tier.textContent = kaldi > 0 ? `${nf.format(kaldi)} m` : apply.dataset.tierDone;
      }
      apply.disabled = adet <= 0;
    };

    modes.forEach((m) => m.addEventListener('change', hesapla));
    // Uzunluk seçeneği değişince adet yeniden hesaplanır
    form?.addEventListener('change', (e) => { if (e.target.matches('.opt input')) hesapla(); });
    [total, w, d].forEach((i) => i?.addEventListener('input', hesapla));

    apply.addEventListener('click', () => {
      const qty = el.closest('.pdp')?.querySelector('.qty__input');
      if (!qty || adet <= 0) return;
      qty.value = adet;
      qty.dispatchEvent(new Event('change', { bubbles: true }));
      // Sayıyı JS yazar: Shopify'ın çeviri filtresi metin içinde {{ count }} kabul etmiyor
      if (note) note.textContent = `${apply.dataset.applied} ${adet}${unit === 'boy' ? ' ' + apply.dataset.unitBoy : ' m'}`;
      qty.focus({ preventScroll: false });
      setTimeout(() => { if (note) note.textContent = noteBase; }, 6000);
    });

    hesapla();
  });
}

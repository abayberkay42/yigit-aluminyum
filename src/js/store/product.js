// Ürün sayfası: galeri, seçenekler (varyant), adet ve sepete ekleme.
// Sepete ekleme Ajax ile yapılır ve sepet çekmecesi açılır; JS yoksa form Shopify'ın /cart/add adresine normal gider.
const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

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
        price.textContent = money.format(current.price / 100);
        history.replaceState(history.state, '', `${location.pathname}?variant=${current.id}`);
        if (current.media) show(current.media);
      }
      setButton(current);
      status.textContent = '';
    });

    form.querySelectorAll('[data-qty-step]').forEach((b) =>
      b.addEventListener('click', () => {
        qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) + Number(b.dataset.qtyStep));
      }),
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (add.disabled) return;
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
  });
}

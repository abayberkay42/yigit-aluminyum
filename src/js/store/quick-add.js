// Ürün kartında hızlı sepete ekleme (snippets/product-card.liquid → .card__quick).
// Renk seçilirse o rengin varyantı eklenir; sepet çekmecesi güncellenip açılır (store/cart.js).
// Tek dinleyici belgeye bağlı: koleksiyon, arama ve "benzer ürünler" kartlarının hepsi için çalışır.
export function initQuickAdd() {
  document.addEventListener('click', async (e) => {
    const renk = e.target.closest('[data-quick-renk]');
    if (renk) return secRenk(renk);

    const btn = e.target.closest('[data-quick-add]');
    if (!btn || btn.disabled) return;
    const kutu = btn.closest('[data-quick]');
    const etiket = btn.querySelector('[data-quick-label]');
    const durum = kutu.querySelector('[data-quick-status]');
    const t = btn.dataset;

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.classList.add('is-ekleniyor');
    etiket.textContent = t.tAdding;
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(btn.dataset.id), quantity: 1 }], sections: 'cart-drawer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || data.message);
      btn.classList.remove('is-ekleniyor');
      btn.classList.add('is-eklendi');
      etiket.textContent = t.tAdded;
      durum.textContent = t.tAdded;
      document.dispatchEvent(new CustomEvent('yigit:cart-updated', { detail: { sections: data.sections, open: true } }));
      setTimeout(() => {
        btn.classList.remove('is-eklendi');
        etiket.textContent = t.tAdd;
        btn.disabled = false;
      }, 1800);
    } catch (err) {
      btn.classList.remove('is-ekleniyor');
      etiket.textContent = t.tAdd;
      durum.textContent = err.message || t.tError;
      btn.disabled = false;
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });
}

function secRenk(renk) {
  const kutu = renk.closest('[data-quick]');
  const btn = kutu.querySelector('[data-quick-add]');
  const varyantlar = JSON.parse(kutu.querySelector('[data-quick-varyant]')?.textContent || '[]');
  kutu.querySelectorAll('[data-quick-renk]').forEach((b) => b.setAttribute('aria-pressed', String(b === renk)));
  const v = varyantlar.find((x) => x.r === renk.dataset.quickRenk && x.a) || varyantlar.find((x) => x.r === renk.dataset.quickRenk);
  if (!v || !btn) return;
  btn.dataset.id = v.id;
  btn.disabled = !v.a;
  btn.querySelector('[data-quick-label]').textContent = v.a ? btn.dataset.tAdd : btn.dataset.tSoldOut;
}

// "Numune iste" düğmesi: ilgili ürünün numunesini ayrı bir satır olarak sepete ekler.
// Satır, mağazadaki tek "Numune ürünü"nü kullanır; hangi ürünün numunesi olduğu satır özelliğinde taşınır
// (Shopify line item property), bu yüzden her ürün sepette ayrı satır olur.
export function initNumune() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-numune]');
    if (!btn || btn.disabled) return;
    const etiket = btn.querySelector('[data-numune-label]');
    const ilkYazi = etiket.textContent;

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: [{
            id: Number(btn.dataset.id),
            quantity: 1,
            // Görünen özellik satırda yazar; alt çizgili olan gizlidir, yalnız ürüne bağlanmak için
            properties: { Numune: btn.dataset.ad, _numune_url: btn.dataset.kaynak },
          }],
          sections: 'cart-drawer',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || data.message);
      etiket.textContent = btn.dataset.tOk;
      document.dispatchEvent(new CustomEvent('yigit:cart-updated', { detail: { sections: data.sections, open: true } }));
      setTimeout(() => {
        etiket.textContent = ilkYazi;
        btn.disabled = false;
      }, 2200);
    } catch (err) {
      etiket.textContent = err.message || btn.dataset.tHata;
      setTimeout(() => {
        etiket.textContent = ilkYazi;
        btn.disabled = false;
      }, 3000);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });
}

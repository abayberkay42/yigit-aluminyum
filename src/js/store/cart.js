// Sepet çekmecesi: menüdeki sepet bağlantısı açar (JS yoksa sepet sayfasına gider).
// İçerik Liquid'den gelir: sepet değişince Shopify'ın bölüm işleme API'siyle "cart-drawer" yeniden işlenir,
// böylece metinler ve biçimler tek yerde (sections/cart-drawer.liquid) kalır.
const SECTION = 'cart-drawer';
const drawer = () => document.querySelector('[data-cart-drawer]');

function open() {
  const d = drawer();
  if (!d || d.open) return;
  d.showModal();
  document.dispatchEvent(new CustomEvent('yigit:lock'));
}

function close() {
  const d = drawer();
  if (d?.open) d.close();
}

function render(sections) {
  const html = sections?.[SECTION];
  if (!html) return;
  const next = new DOMParser().parseFromString(html, 'text/html').querySelector('.drawer__inner');
  const cur = drawer()?.querySelector('.drawer__inner');
  if (!next || !cur) return;
  const hadFocus = cur.contains(document.activeElement);
  cur.replaceWith(next);
  const count = Number(next.dataset.count || 0);
  document.querySelectorAll('[data-cart-count]').forEach((c) => {
    c.textContent = count;
    c.hidden = count === 0;
  });
  // Değişen satırın düğmesi yeniden oluştu: odak çekmecede kalsın
  if (hadFocus) drawer().querySelector('[data-cart-close]')?.focus();
}

async function changeLine(btn) {
  const line = btn.closest('.line');
  line?.setAttribute('aria-busy', 'true');
  const url = drawer()?.dataset.changeUrl || '/cart/change';
  try {
    const res = await fetch(`${url}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: Number(btn.dataset.lineChange), quantity: Number(btn.dataset.qty), sections: SECTION }),
    });
    const data = await res.json();
    if (document.body.classList.contains('template-cart')) return location.reload();
    render(data.sections);
  } finally {
    line?.removeAttribute('aria-busy');
  }
}

export function initCart() {
  const d = drawer();
  d?.addEventListener('close', () => document.dispatchEvent(new CustomEvent('yigit:unlock')));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-open]') && drawer() && !document.body.classList.contains('template-cart')) {
      e.preventDefault();
      return open();
    }
    // Arka plana (dialog'un kendisine) ya da kapat düğmesine tıklamak kapatır
    if (e.target.closest('[data-cart-close]') || e.target === drawer()) return close();
    const change = e.target.closest('[data-line-change]');
    if (change) changeLine(change);
  });
  document.addEventListener('yigit:cart-updated', (e) => {
    render(e.detail?.sections);
    if (e.detail?.open) open();
  });
}

// Ana sayfa ürün grupları: satırın üzerine gelmek ya da odaklanmak sağdaki paneli o gruba çevirir.
// Görünmeyen paneller `inert`: klavye odağı yalnız görünen paneldeki bağlantılara gider.
export function initGroups(root = document) {
  root.querySelectorAll('[data-groups]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const rows = [...el.querySelectorAll('[data-group]')];
    const panels = [...el.querySelectorAll('[data-panel]')];
    const set = (i) => {
      rows.forEach((r, n) => r.toggleAttribute('data-active', n === i));
      panels.forEach((p, n) => {
        p.toggleAttribute('data-active', n === i);
        p.inert = n !== i;
      });
    };
    rows.forEach((r, i) => {
      r.addEventListener('pointerenter', () => set(i));
      r.addEventListener('focusin', () => set(i));
    });
  });
}

// "Ürün Özellikleri" penceresi (snippets/urun-ozellikleri.liquid). Yerel <dialog>: odak pencerede kalır, Escape kapatır.
// Arka plana tıklamak ve kapat düğmesi de kapatır; açıkken sayfa kaydırması kilitlenir (main.js yigit:lock).
export function initOzellikler() {
  document.addEventListener('click', (e) => {
    const ac = e.target.closest('[data-ozellik-ac]');
    if (ac) {
      const d = document.getElementById(ac.getAttribute('aria-controls'));
      if (d && !d.open) {
        d.showModal();
        document.dispatchEvent(new CustomEvent('yigit:lock'));
        d.addEventListener('close', () => { document.dispatchEvent(new CustomEvent('yigit:unlock')); ac.focus(); }, { once: true });
      }
      return;
    }
    const d = e.target.closest('[data-ozellik]');
    if (!d) return;
    // Arka plan: tıklama doğrudan <dialog> öğesinin kendisine düşer (içerik .ozellik__ic içinde)
    if (e.target === d || e.target.closest('[data-ozellik-kapat]')) d.close();
  });
}

// İletişim sayfasındaki mağaza haritası: Google Haritalar çerçevesi açılışta yüklenmez.
// Ziyaretçi "Haritayı göster" düğmesine basınca eklenir; böylece sayfa açılışında üçüncü taraf
// isteği ve çerezi olmaz. JS çalışmazsa bölümdeki "Google Haritalar'da aç" bağlantısı kalır.
export function initHarita(root = document) {
  root.querySelectorAll('[data-harita]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const btn = el.querySelector('[data-harita-ac]');
    const kutu = el.querySelector('.harita__kutu');
    if (!btn || !kutu || !el.dataset.embed) return;
    btn.addEventListener('click', () => {
      const cerceve = document.createElement('iframe');
      cerceve.src = el.dataset.embed;
      cerceve.title = el.querySelector('.harita__baslik')?.textContent?.trim() || 'Harita';
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'no-referrer-when-downgrade';
      cerceve.allowFullscreen = true;
      cerceve.className = 'harita__cerceve';
      kutu.append(cerceve);
      el.classList.add('is-acik');
      btn.remove();
      cerceve.focus?.();
    }, { once: true });
  });
}

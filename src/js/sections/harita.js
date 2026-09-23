// Mağaza haritası (iletişim sayfası ve alt alan): Google Haritalar çerçevesi sayfa açılışında yüklenmez,
// kutu ekrana girince eklenir. Böylece açılışta üçüncü taraf isteği ve çerezi olmaz, sayfa da yavaşlamaz.
// Çerçeve yüklenemezse (engelleyici eklenti, ağ kısıtı) kutuda "Google Haritalar'da aç" bağlantısı görünür.
const BEKLE = 8000;

export function initHarita(root = document) {
  root.querySelectorAll('[data-harita]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const kutu = el.querySelector('.harita__kutu');
    const yedek = el.querySelector('[data-harita-yedek]');
    if (!kutu || !el.dataset.embed) return;

    const yukle = () => {
      const cerceve = document.createElement('iframe');
      cerceve.src = el.dataset.embed;
      cerceve.title = el.querySelector('.harita__baslik')?.textContent?.trim() || document.title;
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'no-referrer-when-downgrade';
      cerceve.allowFullscreen = true;
      cerceve.className = 'harita__cerceve';
      let geldi = false;
      cerceve.addEventListener('load', () => {
        geldi = true;
        el.classList.add('is-acik');
        if (yedek) yedek.hidden = true;
      });
      setTimeout(() => {
        if (geldi || !yedek) return;
        yedek.hidden = false;
      }, BEKLE);
      kutu.append(cerceve);
    };

    if (!('IntersectionObserver' in window)) {
      yukle();
      return;
    }
    const izle = new IntersectionObserver((girdiler) => {
      for (const g of girdiler) {
        if (!g.isIntersecting) continue;
        izle.disconnect();
        yukle();
      }
    }, { rootMargin: '300px' });
    izle.observe(el);
  });
}

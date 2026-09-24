// Mağaza haritası (iletişim sayfası ve alt alan): Google Haritalar çerçevesi sayfa açılışında yüklenmez,
// kutu ekrana girince eklenir. Böylece açılışta üçüncü taraf isteği ve çerezi olmaz, sayfa da yavaşlamaz.
//
// Haritanın açılmama hâli sessiz olmasın diye ayrıca bir yoklama yapılır: gömülü sayfa (www.google.com)
// açılsa bile haritanın kendisi maps.googleapis.com / maps.gstatic.com adreslerinden gelir. Engelleyici
// eklenti, kurum ağı ya da DNS bu adresleri kapattığında çerçeve yüklenmiş görünür ama içi boş kalır.
// Yoklama küçük bir görselle yapılır; düşerse kutuda "Google Haritalar'da aç" bağlantısı gösterilir.
const YOKLAMA = 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png';
const BEKLE = 7000;

export function initHarita(root = document) {
  root.querySelectorAll('[data-harita]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const kutu = el.querySelector('.harita__kutu');
    const yedek = el.querySelector('[data-harita-yedek]');
    if (!kutu || !el.dataset.embed) return;

    const yedegiGoster = () => {
      if (!yedek) return;
      yedek.hidden = false;
      el.classList.add('is-yedek');
    };

    const yukle = () => {
      const cerceve = document.createElement('iframe');
      cerceve.src = el.dataset.embed;
      cerceve.title = el.querySelector('.harita__baslik')?.textContent?.trim() || document.title;
      cerceve.loading = 'lazy';
      cerceve.referrerPolicy = 'no-referrer-when-downgrade';
      cerceve.allowFullscreen = true;
      cerceve.className = 'harita__cerceve';
      cerceve.addEventListener('load', () => el.classList.add('is-acik'));
      kutu.append(cerceve);

      // Harita kaynakları gerçekten geliyor mu?
      let bitti = false;
      const gorsel = new Image();
      const zaman = setTimeout(() => { if (!bitti) { bitti = true; yedegiGoster(); } }, BEKLE);
      gorsel.addEventListener('load', () => { bitti = true; clearTimeout(zaman); });
      gorsel.addEventListener('error', () => { bitti = true; clearTimeout(zaman); yedegiGoster(); });
      gorsel.src = `${YOKLAMA}?y=${Date.now()}`;
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

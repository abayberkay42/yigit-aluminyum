// Üretim sayfasındaki tanıtım filmi (sections/page-production.liquid → [data-tanitim]).
// Kapak üzerinde büyük oynat düğmesi: basınca film sesli başlar, düğme kaybolur ve tarayıcının denetimleri gelir.
// JS yoksa düğme gizli kalır, video tarayıcının kendi denetimleriyle oynar.
// Film durdurulup sonuna gelince düğme geri gelir. Film yalnız oynatınca iner (preload="none").
export function initTanitim(root = document) {
  root.querySelectorAll('[data-tanitim]').forEach((kutu) => {
    if (kutu.dataset.ready) return;
    kutu.dataset.ready = '1';
    const video = kutu.querySelector('video');
    const dugme = kutu.querySelector('[data-tanitim-oynat]');
    if (!video || !dugme) return;

    // Kapak dururken tarayıcı denetimleri gizli (büyük düğmeyle çakışmasın); oynayınca geri gelir
    const goster = (acik) => {
      dugme.hidden = !acik;
      video.controls = !acik;
      kutu.classList.toggle('is-oynuyor', !acik);
    };
    goster(true);

    dugme.addEventListener('click', async () => {
      goster(false);
      try {
        await video.play();
        video.focus({ preventScroll: true });
      } catch {
        goster(true);
      }
    });
    video.addEventListener('play', () => goster(false));
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.load(); // kapak geri gelsin
      goster(true);
    });
  });
}

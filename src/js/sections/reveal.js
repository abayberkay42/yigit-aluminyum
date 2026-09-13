// [data-reveal] öğeleri ekrana girince bir kez açılır (CSS: .is-in). Hareket azaltmada CSS zaten açık gösterir.
export function initReveal(root = document) {
  const items = [...root.querySelectorAll('[data-reveal]:not(.is-in)')];
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) return items.forEach((el) => el.classList.add('is-in'));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

// Kullanım alanları: ekranın ortasındaki odayı üstteki yapışık listede işaretler.
export function initRooms(root = document) {
  root.querySelectorAll('[data-rooms]').forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const links = [...el.querySelectorAll('[data-room-link]')];
    if (!links.length) return;
    const list = links[0].closest('ul');
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const a = byId.get(e.target.id);
          if (!a) continue;
          links.forEach((l) => l.toggleAttribute('aria-current', l === a));
          if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true');
          // Liste yatay kaydırılıyorsa etkin oda görünür kalsın (sayfa dikey kaymaz)
          list.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    el.querySelectorAll('.room').forEach((r) => io.observe(r));
  });
}

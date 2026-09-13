// Shopify'ın adres yapısını taklit eder: /collections/…, /products/…, /pages/…, dil öneki /en.
import { loadStore } from './data.mjs';

const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

export function resolveRoute(pathname) {
  let p = decodeURIComponent(pathname);
  let lang = 'tr';
  const m = p.match(/^\/(en)(?=\/|$)/);
  if (m) {
    lang = m[1];
    p = p.slice(m[0].length) || '/';
  }
  if (p.length > 1) p = p.replace(/\/+$/, '');

  const store = loadStore(lang);
  const base = { lang, store, path: p, status: 200 };
  const tr = lang === 'tr';
  const notFound = { ...base, status: 404, page_type: '404', template: { name: '404' }, title: tr ? 'Sayfa bulunamadı' : 'Page not found' };
  let r;

  if (p === '/') return { ...base, page_type: 'index', template: { name: 'index' } };
  if (p === '/cart') return { ...base, page_type: 'cart', template: { name: 'cart' }, title: tr ? 'Sepet' : 'Cart' };
  if (p === '/collections') {
    return { ...base, page_type: 'list-collections', template: { name: 'list-collections' }, title: tr ? 'Ürün grupları' : 'Product groups' };
  }
  if ((r = p.match(/^\/collections\/([^/]+)$/))) {
    const c = store.collectionsByHandle[r[1]];
    if (!c) return notFound;
    return { ...base, page_type: 'collection', template: { name: 'collection', suffix: c.template_suffix }, collection: c, title: c.title, description: stripHtml(c.description) };
  }
  if ((r = p.match(/^(?:\/collections\/[^/]+)?\/products\/([^/]+)$/))) {
    const pr = store.productsByHandle[r[1]];
    if (!pr) return notFound;
    return { ...base, page_type: 'product', template: { name: 'product', suffix: pr.template_suffix }, product: pr, title: pr.title, description: stripHtml(pr.description) };
  }
  if (p === '/search') return { ...base, page_type: 'search', template: { name: 'search' }, title: tr ? 'Arama' : 'Search' };
  if ((r = p.match(/^\/blogs\/([^/]+)$/))) {
    const b = store.blogsByHandle[r[1]];
    if (!b) return notFound;
    return { ...base, page_type: 'blog', template: { name: 'blog', suffix: b.template_suffix }, blog: b, title: b.title };
  }
  if ((r = p.match(/^\/blogs\/([^/]+)\/([^/]+)$/))) {
    const b = store.blogsByHandle[r[1]];
    const a = b?.articles.find((x) => x.handle === r[2]);
    if (!a) return notFound;
    return { ...base, page_type: 'article', template: { name: 'article', suffix: a.template_suffix }, blog: b, article: a, title: a.title, description: stripHtml(a.content) };
  }
  if ((r = p.match(/^\/pages\/([^/]+)$/))) {
    const pg = store.pagesByHandle[r[1]];
    if (!pg) return notFound;
    return { ...base, page_type: 'page', template: { name: 'page', suffix: pg.template_suffix }, page: pg, title: pg.title, description: stripHtml(pg.content) };
  }
  return notFound;
}

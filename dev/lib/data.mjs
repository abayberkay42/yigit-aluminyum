// Shopify'ın herkese açık JSON biçimini Liquid nesnelerinin şekline çevirir
// (fiyatlar kuruş, url'ler dil önekli, varsayılan varyant bilgisi vb.).
import fs from 'node:fs';
import path from 'node:path';

const MOCK = path.resolve(import.meta.dirname, '../mock');

export const LOCALES = [
  { iso_code: 'tr', endonym_name: 'Türkçe', name: 'Turkish', primary: true },
  { iso_code: 'en', endonym_name: 'English', name: 'English', primary: false },
];

function read(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(MOCK, file), 'utf8'));
  } catch {
    return fallback;
  }
}

const cents = (v) => (v == null || v === '' ? null : Math.round(parseFloat(v) * 100));
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.tr) : v);

function image(i, alt) {
  if (!i?.src) return null;
  const src = i.src.startsWith('//') ? `https:${i.src}` : i.src;
  return {
    id: i.id,
    src,
    url: src,
    width: i.width,
    height: i.height,
    alt: i.alt || alt,
    aspect_ratio: i.width && i.height ? +(i.width / i.height).toFixed(4) : 1,
    variant_ids: i.variant_ids || [],
  };
}

// Yerelde ürün şablonu ürün türünden türetilir; Shopify'da her ürüne şablon yönetim panelinden atanır
// (LED için varsayılan product.json; trimless, duvar paneli, fuga-alçıpan ve süpürgelik için ayrı şablon).
function templateFor(type = '') {
  const t = type.toLocaleLowerCase('tr');
  if (t.includes('trimless')) return 'trimless';
  if (t.includes('panel') || t.includes('duvar kaplama')) return 'panel';
  if (t.includes('fuga') || t.includes('z profili')) return 'fuga';
  if (t.includes('süpürgelik') && !t.includes('led')) return 'supurgelik';
  return null;
}

// Ürün meta alanları (custom.*): tools/fiyat-eslestir.py üretir. "_liste" önizlemede varyant fiyatının yerine geçer:
// müşteri Excel'deki liste fiyatlarını mağazaya girdiğinde sitenin göreceği durum.
const META = read('metafields.json', {});
function metafields(handle) {
  const m = META[handle];
  if (!m) return {};
  const custom = {};
  for (const [k, v] of Object.entries(m)) if (!k.startsWith('_')) custom[k] = { value: v, type: typeof v === 'number' ? 'number_decimal' : 'single_line_text_field' };
  return { custom };
}

function adaptProduct(p, prefix) {
  const url = `${prefix}/products/${p.handle}`;
  const liste = META[p.handle]?._liste;
  const images = (p.images || []).map((i) => image(i, p.title)).filter(Boolean);
  const variants = p.variants.map((v) => ({
    id: v.id,
    title: v.title,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    options: [v.option1, v.option2, v.option3].filter((o) => o != null),
    sku: v.sku,
    available: v.available,
    price: cents(liste ?? v.price),
    compare_at_price: cents(v.compare_at_price),
    featured_image: v.featured_image ? image(v.featured_image, p.title) : null,
    url: `${url}?variant=${v.id}`,
    requires_shipping: v.requires_shipping,
    weight: v.grams,
  }));
  const first = variants.find((v) => v.available) || variants[0];
  const prices = variants.map((v) => v.price);
  const media = images.map((i, n) => ({ ...i, media_type: 'image', position: n + 1, preview_image: i }));

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    type: p.product_type,
    vendor: p.vendor,
    tags: p.tags,
    description: p.body_html || '',
    content: p.body_html || '',
    url,
    images,
    featured_image: images[0] || null,
    media,
    featured_media: media[0] || null,
    options: p.options.map((o) => o.name),
    options_with_values: p.options.map((o, i) => ({
      name: o.name,
      position: o.position,
      values: o.values,
      selected_value: first?.[`option${i + 1}`] ?? null,
    })),
    variants,
    has_only_default_variant: variants.length === 1 && variants[0].title === 'Default Title',
    selected_variant: null,
    selected_or_first_available_variant: first,
    first_available_variant: first,
    price: Math.min(...prices),
    price_min: Math.min(...prices),
    price_max: Math.max(...prices),
    price_varies: new Set(prices).size > 1,
    compare_at_price: first?.compare_at_price ?? null,
    available: variants.some((v) => v.available),
    created_at: p.created_at,
    published_at: p.published_at,
    template_suffix: templateFor(p.product_type),
    metafields: metafields(p.handle),
    collections: [],
  };
}

function adaptCollection(c, byHandle, prefix) {
  const products = (c.product_handles || []).map((h) => byHandle[h]).filter(Boolean);
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description || '',
    url: `${prefix}/collections/${c.handle}`,
    image: c.image ? image(c.image, c.title) : null,
    products,
    products_count: products.length,
    all_products_count: products.length,
    all_tags: [...new Set(products.flatMap((p) => p.tags))],
    template_suffix: null,
    metafields: {},
  };
}

export function loadStore(lang = 'tr') {
  const prefix = lang === 'tr' ? '' : `/${lang}`;
  const products = read('products.json', []).map((p) => adaptProduct(p, prefix));
  const productsByHandle = Object.fromEntries(products.map((p) => [p.handle, p]));

  const collections = read('collections.json', []).map((c) => adaptCollection(c, productsByHandle, prefix));
  // product.collections: ürünün bulunduğu koleksiyonlar (Shopify'daki gibi otomatik "all" hariç)
  for (const c of collections) for (const pr of c.products) pr.collections.push(c);
  collections.push({
    id: 0,
    handle: 'all',
    title: lang === 'tr' ? 'Tüm ürünler' : 'All products',
    description: '',
    url: `${prefix}/collections/all`,
    image: null,
    products,
    products_count: products.length,
    all_products_count: products.length,
    all_tags: [...new Set(products.flatMap((p) => p.tags))],
    template_suffix: null,
    metafields: {},
  });
  const collectionsByHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));

  const pages = read('pages.json', []).map((pg) => ({
    id: pg.id,
    handle: pg.handle,
    title: pick(pg.title, lang),
    content: pick(pg.content, lang) || '',
    url: `${prefix}/pages/${pg.handle}`,
    template_suffix: pg.template_suffix || null,
    metafields: {},
  }));
  const pagesByHandle = Object.fromEntries(pages.map((p) => [p.handle, p]));

  const link = (l) => ({
    title: pick(l.title, lang),
    url: l.url === '/' ? prefix || '/' : prefix + l.url,
    handle: l.handle || null,
    type: 'http_link',
    active: false,
    current: false,
    links: (l.links || []).map(link),
  });
  const linklists = Object.fromEntries(
    Object.entries(read('menus.json', {})).map(([handle, m]) => [
      handle,
      { handle, title: pick(m.title, lang), links: m.links.map(link) },
    ]),
  );

  // Blog ve yazılar (eski sitedeki tek blog; dev/mock/blogs.json)
  const blogs = read('blogs.json', []).map((b) => {
    const url = `${prefix}/blogs/${b.handle}`;
    const articles = (b.articles || []).map((a) => {
      const content = pick(a.content, lang) || '';
      return {
        id: a.id,
        handle: a.handle,
        title: pick(a.title, lang),
        author: a.author,
        published_at: a.published_at,
        created_at: a.published_at,
        tags: a.tags || [],
        image: a.image ? image(a.image, pick(a.title, lang)) : null,
        content,
        excerpt: '',
        excerpt_or_content: content,
        url: `${url}/${a.handle}`,
        template_suffix: null,
      };
    });
    return { id: b.id, handle: b.handle, title: pick(b.title, lang), url, articles, articles_count: articles.length, template_suffix: null };
  });
  const blogsByHandle = Object.fromEntries(blogs.map((b) => [b.handle, b]));

  const rawShop = read('shop.json', {});
  const shop = { ...rawShop, description: pick(rawShop.description, lang), locale: lang };

  return { lang, prefix, shop, products, productsByHandle, collections, collectionsByHandle, pages, pagesByHandle, linklists, blogs, blogsByHandle };
}

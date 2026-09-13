// Shopify taklidinin istek işleyicisi. theme/ klasörünü Shopify'ın yaptığı gibi işler.
// İki yerde çalışır:
//   - Yerel sunucu (dev/server.mjs): canlı yenileme betiği eklenir, hatalar yığın iziyle gösterilir.
//   - Vercel önizlemesi (api/index.mjs): arama motorlarına kapalı (noindex + robots.txt), hata ayrıntısı gizlenir.
// Sepet durumu isteğin çerezinde taşınır (dev/lib/cart.mjs), sunucu belleğinde tutulmaz.
// Bu klasör (dev/) Shopify'a aktarılmaz.
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer } from './lib/render.mjs';
import { resolveRoute } from './lib/routes.mjs';
import { LOCALES, loadStore } from './lib/data.mjs';
import { addItems, changeLine, updateQuantities, cartFor, cartJson, itemJson, sepetOku, sepetCerezi } from './lib/cart.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const THEME = path.join(ROOT, 'theme');
const ASSETS = path.join(THEME, 'assets');
const MOCK = path.join(ROOT, 'dev', 'mock');
const FILES = path.join(MOCK, 'files');

const TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.glb': 'model/gltf-binary',
};

export const RELOAD_SCRIPT = `<script>new EventSource('/__reload').onmessage=()=>location.reload()</script>`;

// Shopify'daki gibi hem tutamaçla (collections['led-profilleri']) erişilen hem de döngüye sokulan liste.
function indexed(list, key = 'handle') {
  const arr = [...list];
  for (const item of list) arr[item[key]] = item;
  return arr;
}

// Shopify'ın koleksiyon sıralama seçenekleri (adları mağaza dilinde gelir)
const SORTS = {
  tr: [['manual', 'Öne çıkanlar'], ['best-selling', 'En çok satanlar'], ['title-ascending', 'Ada göre, A-Z'], ['title-descending', 'Ada göre, Z-A'], ['price-ascending', 'Fiyat, düşükten yükseğe'], ['price-descending', 'Fiyat, yüksekten düşüğe'], ['created-descending', 'En yeniler']],
  en: [['manual', 'Featured'], ['best-selling', 'Best selling'], ['title-ascending', 'Alphabetically, A-Z'], ['title-descending', 'Alphabetically, Z-A'], ['price-ascending', 'Price, low to high'], ['price-descending', 'Price, high to low'], ['created-descending', 'Date, new to old']],
};
const SORTERS = {
  'title-ascending': (a, b) => a.title.localeCompare(b.title, 'tr'),
  'title-descending': (a, b) => b.title.localeCompare(a.title, 'tr'),
  'price-ascending': (a, b) => a.price - b.price,
  'price-descending': (a, b) => b.price - a.price,
  'created-descending': (a, b) => String(b.created_at).localeCompare(String(a.created_at)),
};

function withSort(collection, sortBy, lang) {
  const sorter = SORTERS[sortBy];
  return {
    ...collection,
    products: sorter ? [...collection.products].sort(sorter) : collection.products,
    sort_by: sortBy || 'manual',
    default_sort_by: 'manual',
    sort_options: SORTS[lang].map(([value, name]) => ({ value, name })),
  };
}

// ?variant=… ile seçili varyant (Shopify ürün sayfasında aynı davranır)
function withVariant(product, variantId) {
  const v = variantId && product.variants.find((x) => String(x.id) === String(variantId));
  if (!v) return product;
  return {
    ...product,
    selected_variant: v,
    selected_or_first_available_variant: v,
    options_with_values: product.options_with_values.map((o, i) => ({ ...o, selected_value: v.options[i] ?? null })),
  };
}

// Shopify "Dosyalar" taklidi: görsellerin ölçüleri dev/mock/files.json'da (tools/files-manifest.mjs)
function loadFiles() {
  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(path.join(MOCK, 'files.json'), 'utf8')); } catch {}
  const out = {};
  for (const [name, { width, height }] of Object.entries(manifest)) {
    const src = `/files/${name}`;
    out[`shopify://shop_images/${name}`] = { id: name, src, url: src, width, height, alt: '', aspect_ratio: +(width / height).toFixed(4) };
  }
  return out;
}

// Shopify arama nesnesi taklidi: ürün (ad, tür, etiket), sayfa ve yazı başlığında büyük/küçük harf duyarsız eşleşme
function searchFor(store, q) {
  const terms = (q || '').trim();
  if (!terms) return { performed: false, terms: '', results: [], results_count: 0 };
  const norm = (s) => String(s || '').toLocaleLowerCase('tr').normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const words = norm(terms).split(/\s+/).filter(Boolean);
  const hit = (...fields) => { const hay = norm(fields.flat().join(' ')); return words.every((w) => hay.includes(w)); };
  const results = [
    ...store.products.filter((p) => hit(p.title, p.type, p.tags)).map((p) => ({ ...p, object_type: 'product' })),
    ...store.pages.filter((p) => hit(p.title)).map((p) => ({ ...p, object_type: 'page' })),
    ...store.blogs.flatMap((b) => b.articles).filter((a) => hit(a.title)).map((a) => ({ ...a, object_type: 'article' })),
  ];
  return { performed: true, terms, results, results_count: results.length, types: ['product', 'page', 'article'] };
}

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// Gövde: JSON ya da form (application/x-www-form-urlencoded). Form alanlarındaki updates[123]=2 biçimi nesneye çevrilir.
async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if ((req.headers['content-type'] || '').includes('application/json')) return raw ? JSON.parse(raw) : {};
  const out = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    const m = k.match(/^updates\[(.*)\]$/);
    if (m) (out.updates ||= {})[m[1]] = v;
    else if (k === 'updates[]') (out.updates ||= []).push(v);
    else out[k] = v;
  }
  return out;
}

export function createApp({ yenile = false, onizleme = false } = {}) {
  const renderer = createRenderer(THEME);

  // Önizleme adresi arama motorlarına kapalıdır: canlı mağazanın verisini taşır, dizinlenirse kopya içerik olur
  const ortakBasliklar = onizleme ? { 'X-Robots-Tag': 'noindex, nofollow' } : {};

  const sendJson = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...ortakBasliklar });
    res.end(JSON.stringify(data));
  };
  const redirect = (res, to) => {
    res.writeHead(303, { Location: to, ...ortakBasliklar });
    res.end();
  };

  function scopeFor(route, url, sepet, origin) {
    const { store, lang } = route;
    const p = store.prefix;
    const language = { ...LOCALES.find((l) => l.iso_code === lang), root_url: p || '/' };
    return {
      shop: store.shop,
      request: { locale: language, path: url.pathname, page_type: route.page_type, design_mode: false, host: url.host, origin, contact_posted: url.searchParams.get('contact_posted') === 'true' },
      files: loadFiles(),
      localization: {
        language,
        available_languages: LOCALES.map((l) => ({ ...l, root_url: l.primary ? '/' : `/${l.iso_code}` })),
        country: { iso_code: 'TR', name: 'Türkiye', currency: { iso_code: 'TRY', symbol: '₺' } },
      },
      routes: {
        root_url: p || '/',
        cart_url: `${p}/cart`,
        cart_add_url: `${p}/cart/add`,
        cart_change_url: `${p}/cart/change`,
        cart_update_url: `${p}/cart/update`,
        search_url: `${p}/search`,
        predictive_search_url: `${p}/search/suggest`,
        collections_url: `${p}/collections`,
        all_products_collection_url: `${p}/collections/all`,
        account_url: `${p}/account`,
      },
      collections: indexed(store.collections),
      all_products: indexed(store.products),
      pages: indexed(store.pages),
      linklists: indexed(Object.values(store.linklists)),
      cart: cartFor(sepet, store),
      page_title: route.title || store.shop.name,
      page_description: route.description || store.shop.description,
      canonical_url: `${store.shop.url}${url.pathname === '/' ? '/' : url.pathname}`,
      // Shopify buraya kendi betiklerini (analitik, hreflang, uygulama kodları) ekler.
      content_for_header: '',
      // Shopify'ın paylaşım görseli: ürün, koleksiyon ya da yazının ana görseli
      page_image: route.product?.featured_image || route.collection?.image || route.collection?.products?.[0]?.featured_image || route.article?.image || null,
      product: route.product ? withVariant(route.product, url.searchParams.get('variant')) : null,
      collection: route.collection ? withSort(route.collection, url.searchParams.get('sort_by'), lang) : null,
      page: route.page ?? null,
      blog: route.blog ?? null,
      article: route.article ?? null,
      blogs: indexed(store.blogs),
      search: route.page_type === 'search' ? searchFor(store, url.searchParams.get('q')) : null,
    };
  }

  // Sepet isteklerine eklenen "sections" parametresi: bölümler sepetin yeni haliyle işlenir.
  async function sectionsFor(list, pathname, url, sepet, origin) {
    const types = (Array.isArray(list) ? list : String(list || '').split(',')).map((s) => s.trim()).filter(Boolean);
    if (!types.length) return undefined;
    return renderer.renderSections(types, scopeFor(resolveRoute(pathname), url, sepet, origin));
  }

  async function handleCart(req, res, url, bare, lang, prefix, sepet, origin) {
    const store = loadStore(lang);
    const cartPath = `${prefix}/cart`;
    if (bare === '/cart.js') return sendJson(res, 200, cartJson(sepet, store));
    const body = await readBody(req);
    try {
      if (/^\/cart\/add(\.js)?$/.test(bare)) {
        const items = body.items || [{ id: body.id, quantity: body.quantity }];
        const ids = addItems(sepet, store, items);
        res.setHeader('Set-Cookie', sepetCerezi(sepet));
        if (!bare.endsWith('.js')) return redirect(res, cartPath);
        const cart = cartFor(sepet, store);
        const lines = cart.items.filter((i) => ids.map(String).includes(String(i.variant_id))).map(itemJson);
        const sections = await sectionsFor(body.sections, cartPath, url, sepet, origin);
        return sendJson(res, 200, body.items ? { items: lines, sections } : { ...lines[0], sections });
      }
      if (/^\/cart\/change(\.js)?$/.test(bare)) changeLine(sepet, body);
      else if (body.updates) updateQuantities(sepet, body.updates);
      res.setHeader('Set-Cookie', sepetCerezi(sepet));
      if (!bare.endsWith('.js')) return redirect(res, cartPath);
      return sendJson(res, 200, { ...cartJson(sepet, store), sections: await sectionsFor(body.sections, cartPath, url, sepet, origin) });
    } catch (err) {
      if (!err.status) throw err;
      // Shopify hata biçimi
      return sendJson(res, err.status, { status: err.status, message: 'Cart Error', description: err.message });
    }
  }

  function serveStatic(res, base, pathname, prefixLen) {
    const file = path.normalize(path.join(base, decodeURIComponent(pathname.slice(prefixLen))));
    if (!file.startsWith(base) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  }

  return async function handler(req, res) {
    const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0];
    const url = new URL(req.url, `${proto}://${req.headers.host}`);
    const origin = `${proto}://${url.host}`;

    // Vercel'de bu iki klasör durağan olarak CDN'den sunulur ve buraya hiç gelmez; yerelde buradan sunulur.
    if (url.pathname.startsWith('/assets/')) return serveStatic(res, ASSETS, url.pathname, '/assets/'.length);
    if (url.pathname.startsWith('/files/')) return serveStatic(res, FILES, url.pathname, '/files/'.length);
    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }
    if (onizleme && url.pathname === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', ...ortakBasliklar });
      return res.end('User-agent: *\nDisallow: /\n');
    }

    const sepet = sepetOku(req);
    try {
      const lang = /^\/en(?=\/|$)/.test(url.pathname) ? 'en' : 'tr';
      const prefix = lang === 'tr' ? '' : '/en';
      const bare = url.pathname.slice(prefix.length) || '/';
      if (bare === '/cart.js' || (req.method === 'POST' && /^\/cart\/(add|change|update)(\.js)?$/.test(bare))) {
        return await handleCart(req, res, url, bare, lang, prefix, sepet, origin);
      }
      // İletişim formu: önizlemede e-posta gönderilmez; Shopify gibi aynı sayfaya "gönderildi" durumuyla döner
      if (req.method === 'POST' && bare === '/contact') {
        await readBody(req);
        const back = new URL(req.headers.referer || `${origin}${prefix}/pages/iletisim`).pathname;
        return redirect(res, `${back}?contact_posted=true#contact_form`);
      }
      // Sepet sayfasındaki form: miktar güncelle ya da ödemeye geç (önizlemede ödeme yok, sepete döner)
      if (req.method === 'POST' && bare === '/cart') {
        const body = await readBody(req);
        if (body.updates) {
          updateQuantities(sepet, body.updates);
          res.setHeader('Set-Cookie', sepetCerezi(sepet));
        }
        return redirect(res, `${prefix}/cart${'checkout' in body ? '?odeme=yerelde-yok' : ''}`);
      }

      const route = resolveRoute(url.pathname);
      if (url.searchParams.has('sections')) {
        return sendJson(res, 200, await sectionsFor(url.searchParams.get('sections'), url.pathname, url, sepet, origin));
      }
      const html = await renderer.renderPage({ template: route.template, scope: scopeFor(route, url, sepet, origin) });
      res.writeHead(route.status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...ortakBasliklar });
      res.end(yenile ? html.replace('</body>', `${RELOAD_SCRIPT}</body>`) : html);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8', ...ortakBasliklar });
      if (onizleme) return res.end('<!doctype html><meta charset="utf-8"><title>Hata</title><p style="font:16px system-ui;padding:24px">Sayfa şu an gösterilemiyor.</p>');
      res.end(`<pre style="white-space:pre-wrap;font:14px/1.6 ui-monospace,monospace;padding:24px">${escapeHtml(err.stack || err)}</pre>${yenile ? RELOAD_SCRIPT : ''}`);
    }
  };
}

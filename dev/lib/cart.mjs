// Önizleme sepeti. Durum sunucu belleğinde değil, ziyaretçinin çerezinde taşınır:
// Vercel'de her istek farklı bir sunucu kopyasına düşebilir, bellekte tutulan sepet bir sonraki istekte kaybolurdu.
// Yerelde ve Vercel'de aynı yol çalışır. Her istek çerezden bir durum okur, değişiklik olursa çereze geri yazar.
// Shopify'ın Liquid `cart` nesnesini ve Ajax API (/cart.js) yanıtını aynı alan adlarıyla üretir,
// böylece tema kodu önizlemede ve canlıda aynı veriyi görür.
const CEREZ = 'onizleme_sepet';
const EN_FAZLA_SATIR = 100;

const fail = (status, message) => Object.assign(new Error(message), { status });

// Satır özellikleri (numune satırında kaynak ürünün adı) satırı ayırır: aynı varyant farklı özelliklerle
// ayrı satır olur, Shopify'da olduğu gibi.
const ozAnahtar = (o) => {
  const g = Object.entries(o || {}).filter(([, v]) => v !== '' && v != null).sort(([a], [b]) => a.localeCompare(b));
  return g.length ? JSON.stringify(g) : '';
};

// İstek çerezinden sepet durumu: { lines: [{ variant_id, quantity, properties }] }. Bozuk ya da yoksa boş sepet.
export function sepetOku(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${CEREZ}=([^;]+)`));
  if (!m) return { lines: [] };
  try {
    const d = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8'));
    if (!Array.isArray(d)) return { lines: [] };
    const lines = d
      .filter((x) => Array.isArray(x) && x.length >= 2)
      .map(([variant_id, quantity, properties]) => ({
        variant_id,
        quantity: Math.max(0, parseInt(quantity, 10) || 0),
        properties: properties && typeof properties === 'object' ? properties : {},
      }))
      .filter((l) => l.quantity > 0)
      .slice(0, EN_FAZLA_SATIR);
    return { lines };
  } catch {
    return { lines: [] };
  }
}

// Yanıta eklenecek Set-Cookie değeri (bir hafta; sayfa JS'i çerezi okumaz, /cart.js kullanır)
export function sepetCerezi(state) {
  const deger = Buffer.from(
    JSON.stringify(state.lines.map((l) => (ozAnahtar(l.properties) ? [l.variant_id, l.quantity, l.properties] : [l.variant_id, l.quantity]))),
  ).toString('base64url');
  return `${CEREZ}=${deger}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly`;
}

function findVariant(store, id) {
  for (const p of store.products) {
    const v = p.variants.find((x) => String(x.id) === String(id).split(':')[0]);
    if (v) return { p, v };
  }
  return null;
}

export function addItems(state, store, items) {
  const added = [];
  for (const it of items) {
    const found = findVariant(store, it.id);
    if (!found) throw fail(404, 'Ürün bulunamadı');
    if (!found.v.available) throw fail(422, 'Bu seçenek şu an satışta değil');
    const q = Math.max(1, parseInt(it.quantity ?? 1, 10) || 1);
    const oz = it.properties && typeof it.properties === 'object' ? it.properties : {};
    const anahtar = ozAnahtar(oz);
    const line = state.lines.find((l) => String(l.variant_id) === String(found.v.id) && ozAnahtar(l.properties) === anahtar);
    if (line) line.quantity += q;
    else if (state.lines.length < EN_FAZLA_SATIR) state.lines.push({ variant_id: found.v.id, quantity: q, properties: oz });
    added.push(found.v.id);
  }
  return added;
}

// Shopify'daki gibi satır numarası (1'den başlar) ya da varyant id / satır anahtarı ile
export function changeLine(state, { line, id, quantity }) {
  const idx = line != null && line !== ''
    ? Number(line) - 1
    : state.lines.findIndex((l) => String(l.variant_id) === String(id).split(':')[0]);
  if (!(idx >= 0 && idx < state.lines.length)) throw fail(400, 'Sepette böyle bir satır yok');
  const q = Math.max(0, parseInt(quantity, 10) || 0);
  if (q === 0) state.lines.splice(idx, 1);
  else state.lines[idx].quantity = q;
}

// updates: { variantId: adet } ya da satır sırasıyla [adet, adet, …]
export function updateQuantities(state, updates) {
  if (Array.isArray(updates)) {
    updates.forEach((q, i) => { if (state.lines[i]) state.lines[i].quantity = Math.max(0, parseInt(q, 10) || 0); });
  } else {
    for (const [id, q] of Object.entries(updates || {})) {
      const l = state.lines.find((x) => String(x.variant_id) === String(id).split(':')[0]);
      if (l) l.quantity = Math.max(0, parseInt(q, 10) || 0);
    }
  }
  state.lines = state.lines.filter((l) => l.quantity > 0);
}

export function clearCart(state) {
  state.lines = [];
}

export function cartFor(state, store) {
  const items = state.lines
    .map((l) => {
      const f = findVariant(store, l.variant_id);
      if (!f) return null;
      const { p, v } = f;
      const image = v.featured_image || p.featured_image;
      const variantTitle = p.has_only_default_variant ? null : v.title;
      const line = v.price * l.quantity;
      return {
        key: `${v.id}:${ozAnahtar(l.properties) ? Buffer.from(ozAnahtar(l.properties)).toString('base64url').slice(0, 10) : 'yerel'}`,
        id: v.id,
        variant_id: v.id,
        product_id: p.id,
        handle: p.handle,
        title: variantTitle ? `${p.title} - ${variantTitle}` : p.title,
        product_title: p.title,
        product_type: p.type,
        variant_title: variantTitle,
        quantity: l.quantity,
        price: v.price,
        original_price: v.price,
        final_price: v.price,
        line_price: line,
        original_line_price: line,
        final_line_price: line,
        url: v.url,
        image,
        featured_image: image,
        product: p,
        variant: v,
        options_with_values: p.has_only_default_variant ? [] : p.options.map((name, i) => ({ name, value: v.options[i] })),
        properties: l.properties || {},
        requires_shipping: true,
        discounts: [],
        line_level_discount_allocations: [],
      };
    })
    .filter(Boolean);
  const total = items.reduce((s, i) => s + i.final_line_price, 0);
  return {
    token: 'yerel',
    note: null,
    attributes: {},
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    items,
    total_price: total,
    items_subtotal_price: total,
    original_total_price: total,
    total_discount: 0,
    currency: { iso_code: 'TRY' },
    requires_shipping: items.length > 0,
    cart_level_discount_applications: [],
  };
}

// /cart.js biçimi: görsel adres dizesi, ürün nesnesi yok
export function cartJson(state, store) {
  const c = cartFor(state, store);
  return { ...c, items: c.items.map(itemJson) };
}

export function itemJson({ product, variant, image, featured_image, ...rest }) {
  return {
    ...rest,
    image: image?.src ?? null,
    featured_image: image ? { url: image.src, alt: image.alt, width: image.width, height: image.height } : null,
    product_has_only_default_variant: product.has_only_default_variant,
  };
}

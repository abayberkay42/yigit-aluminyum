// LiquidJS'e Shopify'a özgü filtreleri ve etiketleri ekler.
// Amaç: theme/ klasöründeki Liquid dosyaları yerelde ve Shopify'da aynı sonucu versin.
// Burada karşılığı olmayan bir filtre kullanılırsa strictFilters hatası verir; bu bilerek böyle.
import fs from 'node:fs';
import path from 'node:path';
import { Liquid, Hash } from 'liquidjs';

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// LiquidJS anahtar-değer argümanlarını [ad, değer] dizisi olarak iletir.
const kw = (args) =>
  Object.fromEntries(args.filter((a) => Array.isArray(a) && a.length === 2 && typeof a[0] === 'string'));
const positional = (args) => args.filter((a) => !Array.isArray(a));

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' };
const handleize = (s) =>
  String(s ?? '')
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR_MAP[c])
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const lookup = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj);

export function createEngine(THEME, hooks) {
  const engine = new Liquid({
    root: path.join(THEME, 'snippets'),
    partials: path.join(THEME, 'snippets'),
    extname: '.liquid',
    cache: false,
    strictFilters: true,
    ownPropertyOnly: true,
  });

  // ---------- Çeviri ----------
  function readLocale(lang) {
    const dir = path.join(THEME, 'locales');
    const file = fs.readdirSync(dir).find((n) => n === `${lang}.json` || n === `${lang}.default.json`);
    return file ? JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) : {};
  }
  const defaultLocale = () => {
    const dir = path.join(THEME, 'locales');
    const file = fs.readdirSync(dir).find((n) => n.endsWith('.default.json'));
    return file ? JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) : {};
  };

  engine.registerFilter('t', function (key, ...args) {
    const lang = this.context.environments.request?.locale?.iso_code || 'tr';
    let value = lookup(readLocale(lang), key) ?? lookup(defaultLocale(), key);
    if (value == null) return `translation missing: ${lang}.${key}`;
    const vars = kw(args);
    if (typeof value === 'object' && ('one' in value || 'other' in value)) {
      value = vars.count === 1 ? value.one : value.other;
    }
    return String(value).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
  });

  // ---------- Para ----------
  const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
  const moneyShort = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const toMoney = (fmt) => (c) => (c == null || c === '' ? '' : fmt.format(Number(c) / 100));
  engine.registerFilter('money', toMoney(money));
  engine.registerFilter('money_without_currency', (c) => toMoney(money)(c).replace(/[^\d.,]/g, ''));
  engine.registerFilter('money_with_currency', (c) => `${toMoney(money)(c)} TRY`);
  engine.registerFilter('money_without_trailing_zeros', toMoney(moneyShort));

  // ---------- Varlıklar ----------
  engine.registerFilter('asset_url', (f) => `/assets/${f}`);
  // Shopify "Dosyalar"a yüklenen dosyanın adresi (canlıda cdn.shopify.com/.../files/ad?v=…); yerelde dev/mock/files
  engine.registerFilter('file_url', (f) => `/files/${f}`);
  // Shopify'da ayrıca Link başlığı olarak da gönderilir; yerelde yalnızca etiket
  engine.registerFilter('preload_tag', (url, ...a) => {
    const o = kw(a);
    const cross = o.crossorigin === true ? ' crossorigin' : o.crossorigin ? ` crossorigin="${esc(o.crossorigin)}"` : '';
    return `<link href="${esc(url)}" rel="preload" as="${esc(o.as || '')}"${o.type ? ` type="${esc(o.type)}"` : ''}${cross}>`;
  });
  engine.registerFilter('asset_img_url', (f) => `/assets/${f}`);
  engine.registerFilter('stylesheet_tag', (u) => `<link href="${u}" rel="stylesheet" type="text/css" media="all">`);
  engine.registerFilter('script_tag', (u) => `<script src="${u}" type="text/javascript"></script>`);
  engine.registerFilter('inline_asset_content', (f) => fs.readFileSync(path.join(THEME, 'assets', f), 'utf8'));

  // ---------- Görseller ----------
  // image_tag, image_url'in hangi görselden üretildiğini bilmek zorunda (genişlik, alt metin).
  const imageMeta = new Map();
  const srcOf = (v) => (typeof v === 'string' ? v : v?.src || v?.url || v?.preview_image?.src || '');

  engine.registerFilter('image_url', (v, ...a) => {
    const o = kw(a);
    const s = srcOf(v);
    if (!s) return '';
    let out = s;
    if (!s.startsWith('/')) {
      const u = new URL(s.startsWith('//') ? `https:${s}` : s);
      if (o.width) u.searchParams.set('width', o.width);
      if (o.height) u.searchParams.set('height', o.height);
      if (o.crop) u.searchParams.set('crop', o.crop);
      out = u.toString();
    }
    imageMeta.set(out, { ...(typeof v === 'object' ? v : {}), requested: o.width });
    return out;
  });

  engine.registerFilter('image_tag', (u, ...a) => {
    const o = kw(a);
    const url = String(u);
    const img = imageMeta.get(url) || {};
    const width = Number(o.width ?? img.requested ?? img.width) || null;
    const ratio = img.width && img.height ? img.width / img.height : null;
    const height = o.height ?? (width && ratio ? Math.round(width / ratio) : img.height);
    let srcset = null;
    if (!url.startsWith('/')) {
      const widths = (o.widths ? String(o.widths).split(',').map(Number) : [352, 832, 1200, 1600]).filter(
        (x) => !img.width || x <= img.width,
      );
      srcset = widths
        .map((x) => {
          const s = new URL(url);
          s.searchParams.set('width', x);
          s.searchParams.delete('height');
          return `${s} ${x}w`;
        })
        .join(', ');
    }
    const attrs = {
      src: url,
      srcset,
      sizes: o.sizes,
      width,
      height,
      alt: o.alt ?? img.alt ?? '',
      class: o.class,
      loading: o.loading ?? 'lazy',
      fetchpriority: o.fetchpriority,
      decoding: 'async',
    };
    const html = Object.entries(attrs)
      .filter(([k, v]) => v != null && (v !== '' || k === 'alt'))
      .map(([k, v]) => `${k}="${esc(v)}"`)
      .join(' ');
    return `<img ${html}>`;
  });

  // Shopify'ın video nesnesi (video ayarı) için <video> etiketi; yerelde yalnızca ilk kaynak
  engine.registerFilter('video_tag', (v, ...a) => {
    const o = kw(a);
    const src = v?.sources?.[0]?.url || v?.src || '';
    const poster = v?.preview_image?.src || '';
    return `<video${o.controls ? ' controls' : ''}${o.muted ? ' muted' : ''} playsinline preload="${esc(o.preload || 'metadata')}"${poster ? ` poster="${esc(poster)}"` : ''} src="${esc(src)}"></video>`;
  });
  // YouTube/Vimeo ürün medyası (Shopify'da media_type external_video)
  engine.registerFilter('external_video_tag', (v) =>
    `<iframe src="${esc(v?.embed_url || '')}" loading="lazy" allow="autoplay; encrypted-media" allowfullscreen title="${esc(v?.alt || '')}"></iframe>`,
  );
  engine.registerFilter('placeholder_svg_tag', (_name, cls) =>
    `<svg class="${esc(cls || '')}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="300" fill="currentColor" opacity=".08"/></svg>`,
  );

  // ---------- Metin ve bağlantı ----------
  engine.registerFilter('handleize', handleize);
  engine.registerFilter('handle', handleize);
  engine.registerFilter('pluralize', (n, one, other) => (Number(n) === 1 ? one : other));
  engine.registerFilter('link_to', (text, url, title) => `<a href="${esc(url)}"${title ? ` title="${esc(title)}"` : ''}>${text}</a>`);
  engine.registerFilter('within', (url) => url);
  engine.registerFilter('url_param_escape', (v) => encodeURIComponent(String(v)));
  engine.registerFilter('default_pagination', () => '');
  engine.registerFilter('metafield_text', (v) => (v?.value ?? v ?? ''));
  engine.registerFilter('time_tag', (d, ...a) => {
    const date = new Date(d);
    const opts = positional(a)[0];
    return `<time datetime="${date.toISOString()}">${date.toLocaleDateString('tr-TR', opts ? undefined : { dateStyle: 'long' })}</time>`;
  });

  // ---------- Etiketler ----------
  // İçeriği Liquid olarak işlenip bir sarmalayıcıya konan etiketler ({% style %}).
  const wrapTag = (name, open, close) =>
    engine.registerTag(name, {
      parse(token, remain) {
        this.tpls = [];
        const stream = this.liquid.parser
          .parseStream(remain)
          .on(`tag:end${name}`, () => stream.stop())
          .on('template', (t) => this.tpls.push(t))
          .on('end', () => {
            throw new Error(`{% ${name} %} kapatılmamış`);
          });
        stream.start();
      },
      *render(ctx, emitter) {
        emitter.write(open);
        yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
        emitter.write(close);
      },
    });
  wrapTag('style', '<style>', '</style>');

  // İçeriği Liquid olarak işlenmeyen etiketler ({% schema %}, {% javascript %}, {% stylesheet %}).
  const rawTag = (name, open, close) =>
    engine.registerTag(name, {
      parse(token, remain) {
        this.text = '';
        while (remain.length) {
          const t = remain.shift();
          if (t.name === `end${name}`) return;
          this.text += t.getText();
        }
        throw new Error(`{% ${name} %} kapatılmamış`);
      },
      render() {
        return open === null ? '' : `${open}${this.text}${close}`;
      },
    });
  rawTag('schema', null, null);
  rawTag('javascript', '<script>', '</script>');
  rawTag('stylesheet', '<style>', '</style>');

  const FORM_ACTIONS = {
    product: '/cart/add',
    contact: '/contact#contact_form',
    customer: '/contact#newsletter',
    cart: '/cart',
    localization: '/localization',
  };
  engine.registerTag('form', {
    parse(token, remain) {
      const m = token.args.match(/^\s*(['"])([\w-]+)\1\s*,?\s*([\s\S]*)$/);
      this.type = m?.[2] || 'form';
      let rest = (m?.[3] || '').trim();
      const obj = rest.match(/^([A-Za-z_][\w.]*)\s*(,|$)/);
      if (obj) rest = rest.slice(obj[0].length).trim();
      this.hash = new Hash(rest);
      this.tpls = [];
      const stream = this.liquid.parser
        .parseStream(remain)
        .on('tag:endform', () => stream.stop())
        .on('template', (t) => this.tpls.push(t))
        .on('end', () => {
          throw new Error('{% form %} kapatılmamış');
        });
      stream.start();
    },
    *render(ctx, emitter) {
      const attrs = yield this.hash.render(ctx);
      const extra = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${esc(v)}"`)
        .join('');
      emitter.write(
        `<form method="post" action="${FORM_ACTIONS[this.type] || '#'}" accept-charset="UTF-8"${extra}>` +
          `<input type="hidden" name="form_type" value="${this.type}"><input type="hidden" name="utf8" value="✓">`,
      );
      // İletişim formu gönderildikten sonra Shopify form.posted_successfully? değerini true verir
      const posted = this.type === 'contact' && !!ctx.getAll().request?.contact_posted;
      ctx.push({ form: { errors: null, posted_successfully: posted, 'posted_successfully?': posted, id: attrs.id ?? null } });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
      emitter.write('</form>');
    },
  });

  // Yerel veri küçük olduğu için sayfalama yalnızca paginate nesnesini sağlar, listeyi bölmez.
  engine.registerTag('paginate', {
    parse(token, remain) {
      const m = token.args.match(/^\s*([\w.]+)\s+by\s+(\S+)/);
      if (!m) throw new Error(`paginate sözdizimi hatalı: ${token.args}`);
      [, this.items, this.by] = m;
      this.tpls = [];
      const stream = this.liquid.parser
        .parseStream(remain)
        .on('tag:endpaginate', () => stream.stop())
        .on('template', (t) => this.tpls.push(t))
        .on('end', () => {
          throw new Error('{% paginate %} kapatılmamış');
        });
      stream.start();
    },
    *render(ctx, emitter) {
      const size = Number(yield this.liquid.evalValue(this.by, ctx)) || 1;
      const items = (yield this.liquid.evalValue(this.items, ctx)) || [];
      ctx.push({
        paginate: {
          current_page: 1,
          page_size: size,
          items: items.length,
          pages: Math.max(1, Math.ceil(items.length / size)),
          previous: null,
          next: null,
          parts: [],
        },
      });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
    },
  });

  const unquote = (s) => s.trim().replace(/^['"]|['"]$/g, '');
  engine.registerTag('sections', {
    parse(token) {
      this.name = unquote(token.args);
    },
    *render(ctx) {
      return yield hooks.renderGroup(this.name, ctx.getAll());
    },
  });
  engine.registerTag('section', {
    parse(token) {
      this.name = unquote(token.args);
    },
    *render(ctx) {
      return yield hooks.renderStaticSection(this.name, ctx.getAll());
    },
  });

  return engine;
}

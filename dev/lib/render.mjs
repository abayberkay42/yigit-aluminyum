// JSON şablonları, bölüm grupları ve layout'u Shopify'ın yaptığı sırayla işler.
// Bölüm sarmalayıcıları (id="shopify-section-…", class="shopify-section …") Shopify ile aynıdır,
// böylece CSS ve JS yerelde ve canlıda aynı DOM'u görür.
import fs from 'node:fs';
import path from 'node:path';
import { Drop } from 'liquidjs';
import { createEngine } from './shopify.mjs';

// Shopify JSON şablonlarının başındaki /* … */ yorum bloğuna izin verir.
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
const defaultsOf = (settings = []) =>
  Object.fromEntries(settings.filter((s) => s.id).map((s) => [s.id, s.default ?? null]));

// {{ template }} → "product.ozel"; {{ template.name }} → "product"
export class TemplateDrop extends Drop {
  constructor(name, suffix = null) {
    super();
    this.name = name;
    this.suffix = suffix;
    this.directory = null;
  }
  valueOf() {
    return this.suffix ? `${this.name}.${this.suffix}` : this.name;
  }
}

export function createRenderer(THEME) {
  const sectionFile = (type) => path.join(THEME, 'sections', `${type}.liquid`);

  function schemaOf(type) {
    const src = fs.readFileSync(sectionFile(type), 'utf8');
    const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    return m ? JSON.parse(m[1]) : {};
  }

  function buildSection(id, cfg) {
    const schema = schemaOf(cfg.type);
    const blockSchemas = Object.fromEntries((schema.blocks || []).map((b) => [b.type, b]));
    const order = cfg.block_order || Object.keys(cfg.blocks || {});
    const blocks = order
      .filter((bid) => cfg.blocks?.[bid] && !cfg.blocks[bid].disabled)
      .map((bid) => {
        const b = cfg.blocks[bid];
        return {
          id: bid,
          type: b.type,
          settings: { ...defaultsOf(blockSchemas[b.type]?.settings), ...(b.settings || {}) },
          shopify_attributes: '',
        };
      });
    return {
      schema,
      section: {
        id,
        type: cfg.type,
        settings: { ...defaultsOf(schema.settings), ...(cfg.settings || {}) },
        blocks,
        block_order: order,
        location: 'template',
      },
    };
  }

  // Shopify, kaynak türündeki ayarları (menü, koleksiyon, ürün, sayfa) tutamaç değil nesne olarak verir.
  function resolveSettings(defs = [], values, scope) {
    const out = { ...values };
    for (const d of defs) {
      const v = out[d.id];
      if (v == null || v === '') continue;
      if (d.type === 'link_list') out[d.id] = scope.linklists?.[v] ?? null;
      else if (d.type === 'collection') out[d.id] = scope.collections?.[v] ?? null;
      else if (d.type === 'product') out[d.id] = scope.all_products?.[v] ?? null;
      else if (d.type === 'page') out[d.id] = scope.pages?.[v] ?? null;
      // Shopify "Dosyalar"daki görsel: shopify://shop_images/ad.webp → görsel nesnesi (yerelde dev/mock/files)
      else if (d.type === 'image_picker') out[d.id] = scope.files?.[v] ?? null;
      // Dosyalar'daki video: shopify://files/videos/ad.mp4
      else if (d.type === 'video') out[d.id] = scope.files?.[v] ?? null;
      else if (d.type === 'collection_list') out[d.id] = v.map((h) => scope.collections?.[h]).filter(Boolean);
      else if (d.type === 'product_list') out[d.id] = v.map((h) => scope.all_products?.[h]).filter(Boolean);
    }
    return out;
  }

  async function renderSection(id, cfg, scope, groupClass = '') {
    if (cfg.disabled) return '';
    const { schema, section } = buildSection(id, cfg);
    section.settings = resolveSettings(schema.settings, section.settings, scope);
    const blockDefs = Object.fromEntries((schema.blocks || []).map((b) => [b.type, b.settings]));
    for (const b of section.blocks) b.settings = resolveSettings(blockDefs[b.type], b.settings, scope);
    const file = sectionFile(cfg.type);
    // Shopify'da {% render %} ile çağrılan parçacıklar genel nesneleri (shop, product, settings…) görür;
    // LiquidJS'te bunlar "globals" olarak verilir, bölüme özgü `section` verilmez.
    const html = await engine.render(engine.parse(fs.readFileSync(file, 'utf8'), file), { ...scope, section }, { globals: scope });
    const tag = schema.tag || 'div';
    const cls = ['shopify-section', groupClass, schema.class].filter(Boolean).join(' ');
    return `<${tag} id="shopify-section-${id}" class="${cls}">${html}</${tag}>`;
  }

  async function renderGroup(name, scope) {
    const group = readJSON(path.join(THEME, 'sections', `${name}.json`));
    const out = [];
    for (const key of group.order || Object.keys(group.sections)) {
      out.push(await renderSection(`sections--${name}__${key}`, group.sections[key], scope, `shopify-section-group-${name}`));
    }
    return out.join('\n');
  }

  const renderStaticSection = (type, scope) => renderSection(type, { type }, scope);

  const engine = createEngine(THEME, { renderGroup, renderStaticSection });

  function themeSettings(scope = {}) {
    const tanimlar = [];
    const varsayilan = {};
    for (const group of readJSON(path.join(THEME, 'config', 'settings_schema.json'))) {
      if (!group.settings) continue;
      for (const s of group.settings) if (s.id) tanimlar.push(s);
      Object.assign(varsayilan, defaultsOf(group.settings));
    }
    const data = readJSON(path.join(THEME, 'config', 'settings_data.json'));
    const current = typeof data.current === 'string' ? data.presets?.[data.current] : data.current;
    // Tema ayarları da bölüm ayarlarıyla aynı çözümlemeden geçer: image_picker (logo, paylaşım
    // görseli), link_list, collection gibi türler Shopify'da tutamaç değil nesne olarak gelir.
    return resolveSettings(tanimlar, { ...varsayilan, ...(current || {}) }, scope);
  }

  async function renderPage({ template, scope }) {
    const names = [template.suffix ? `${template.name}.${template.suffix}` : null, template.name].filter(Boolean);
    const tdir = path.join(THEME, 'templates');
    const found = names.find((n) => fs.existsSync(path.join(tdir, `${n}.json`)) || fs.existsSync(path.join(tdir, `${n}.liquid`)));
    if (!found) throw new Error(`Şablon bulunamadı: ${names.join(', ')}`);

    const fullScope = { ...scope, settings: themeSettings(scope), template: new TemplateDrop(template.name, template.suffix) };
    let content;
    let layout = 'theme';
    const jsonFile = path.join(tdir, `${found}.json`);
    if (fs.existsSync(jsonFile)) {
      const t = readJSON(jsonFile);
      const parts = [];
      for (const key of t.order || Object.keys(t.sections)) {
        parts.push(await renderSection(`template--${found.replace(/\./g, '-')}__${key}`, t.sections[key], fullScope));
      }
      content = parts.join('\n');
      if ('layout' in t) layout = t.layout;
    } else {
      const file = path.join(tdir, `${found}.liquid`);
      content = await engine.render(engine.parse(fs.readFileSync(file, 'utf8'), file), fullScope);
    }

    if (layout === false || layout === 'none') return content;
    const lfile = path.join(THEME, 'layout', `${layout}.liquid`);
    return engine.render(engine.parse(fs.readFileSync(lfile, 'utf8'), lfile), { ...fullScope, content_for_layout: content }, { globals: fullScope });
  }

  // Shopify'ın bölüm işleme API'si (?sections=a,b ve sepet isteklerindeki "sections"): bölümü tek başına,
  // sarmalayıcısıyla birlikte döndürür. Tema JS'i sepet çekmecesini bu yolla yeniler.
  async function renderSections(types, scope) {
    const fullScope = { ...scope, settings: themeSettings(scope), template: new TemplateDrop(scope.request?.page_type || 'index') };
    const out = {};
    for (const type of types) {
      out[type] = fs.existsSync(sectionFile(type)) ? await renderStaticSection(type, fullScope) : null;
    }
    return out;
  }

  return { renderPage, renderSections };
}

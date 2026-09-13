// Canlı mağazanın herkese açık JSON uçlarından ürün ve koleksiyon verisini çeker.
// Yalnızca yerel geliştirme için örnek veridir; Shopify'a aktarımda kullanılmaz.
import fs from 'node:fs/promises';

const BASE = 'https://www.yigitaluminium.com';
const OUT = new URL('./mock/', import.meta.url);

async function get(p) {
  const r = await fetch(BASE + p);
  if (!r.ok) throw new Error(`${p} → ${r.status}`);
  return r.json();
}

await fs.mkdir(OUT, { recursive: true });
const { products } = await get('/products.json?limit=250');
const { collections } = await get('/collections.json?limit=250');

for (const c of collections) {
  const { products: list } = await get(`/collections/${encodeURIComponent(c.handle)}/products.json?limit=250`);
  c.product_handles = list.map((p) => p.handle);
}

await fs.writeFile(new URL('products.json', OUT), JSON.stringify(products, null, 1));
await fs.writeFile(new URL('collections.json', OUT), JSON.stringify(collections, null, 1));
console.log(`${products.length} ürün, ${collections.length} koleksiyon yazıldı → dev/mock/`);

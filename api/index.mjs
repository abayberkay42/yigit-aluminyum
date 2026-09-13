// Vercel önizlemesi: Shopify taklidinin istek işleyicisi sunucu işlevi olarak çalışır (dev/app.mjs).
// /assets ve /files durağan olarak CDN'den sunulur (vercel.json + tools/vercel-hazirla.mjs); buraya yalnız
// sayfa, sepet, arama ve form istekleri gelir. Önizleme modu: arama motorlarına kapalı, hata ayrıntısı gizli.
import { createApp } from '../dev/app.mjs';

export default createApp({ onizleme: true });

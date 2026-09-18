// Metraj fiyatı: firmanın "LED Profilleri Her Metre İskonto Tablosu" (2026-09) formülü, kuruş cinsinden.
//   m < başlangıç (50)  → liste fiyatı L
//   m ≥ eşik T (300)    → dip fiyat D
//   arada               → max(D, yuvarla(L × (1 − iskonto))), iskonto = (1 − D/L) × min(m/T, 1)
// Metraj, sepetteki aynı ürünün (bütün renkleri) toplamıdır. Bulunan metre fiyatı bütün metrajda geçer.
// Aynı hesap sepette Liquid ile yapılır: snippets/metraj-fiyat.liquid. İkisi Excel'in 16.500 satırıyla doğrulandı
// (tools/metraj-dogrula.mjs).
export function metreFiyati(listeKurus, dip, esik, metre, baslangic = 50) {
  const L = Number(listeKurus);
  const D = Math.round(Number(dip) * 100);
  const T = Number(esik);
  if (!(D > 0) || !(T > 0) || !(L > D) || !(metre >= baslangic)) return L;
  if (metre >= T) return D;
  const iskonto = (1 - D / L) * Math.min(metre / T, 1);
  return Math.max(D, Math.round(L * (1 - iskonto)));
}

// Miktarı kurala oturtur: en az miktar, adımın katı (yukarı yuvarlanır)
export function oturt(miktar, enAz = 1, adim = 1) {
  const n = Math.max(Number(miktar) || 0, enAz);
  return Math.ceil(n / adim - 1e-9) * adim;
}

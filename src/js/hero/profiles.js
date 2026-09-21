// Ürün gruplarının kalıp kesitleri, milimetre cinsinden dış çizgi noktaları.
// Bunlar temsili çizimlerdir; firmanın gerçek kesit çizimleri (DXF) geldiğinde aynı yapıyla değiştirilir.
// Hem 3B sahne (kalıp ağzı + ekstrüzyon) hem de düğmelerdeki küçük kesit simgeleri buradan üretilir.

export const PROFILES = {
  led: {
    label: 'LED kanal',
    mm: [22, 14.5],
    outline: [
      [-11, 0], [11, 0], [11, 14.5], [9.5, 14.5], [9.5, 13], [8.6, 13], [8.6, 12], [9.5, 12],
      [9.5, 1.5], [-9.5, 1.5], [-9.5, 12], [-8.6, 12], [-8.6, 13], [-9.5, 13], [-9.5, 14.5], [-11, 14.5],
    ],
  },
  trimless: {
    // Firmanın gerçek trimless profiline göre: 22 mm kanal, iki yanda sıvaya gömülen delikli kanat,
    // kanal ağzında difüzör kapağının oturduğu tırnak. Kanatlardaki delikler 3B sahnede yüzey deseni olarak basılır.
    label: 'Trimless',
    mm: [50, 11.8],
    kanatBandi: [11, 25],
    outline: [
      [-25, 10.6], [-11, 10.6], [-11, 0], [11, 0], [11, 10.6], [25, 10.6], [25, 11.8],
      [9.6, 11.8], [9.6, 10.4], [8.4, 10.4], [8.4, 1.2], [-8.4, 1.2], [-8.4, 10.4], [-9.6, 10.4], [-9.6, 11.8], [-25, 11.8],
    ],
  },
  kose: {
    label: 'Köşe',
    mm: [16, 16],
    outline: [
      [0, 0], [16, 0], [16, 2.2], [13.8, 4.4], [12.7, 3.3], [14.2, 1.5], [1.5, 1.5],
      [1.5, 14.2], [3.3, 12.7], [4.4, 13.8], [2.2, 16], [0, 16],
    ],
  },
  supurgelik: {
    label: 'Süpürgelik',
    mm: [12, 60],
    outline: [
      [0, 0], [12, 0], [12, 1.5], [1.6, 1.5], [1.6, 54.5], [6, 58.4], [6, 60], [0, 60],
    ],
  },
  z: {
    label: 'Z profili',
    mm: [22, 12],
    outline: [
      [-10, 0], [1.2, 0], [1.2, 10.8], [12, 10.8], [12, 12], [0, 12], [0, 1.2], [-10, 1.2],
    ],
  },
  panel: {
    label: 'Duvar paneli H',
    mm: [12, 10],
    outline: [
      [-6, 0], [6, 0], [6, 1.2], [0.7, 1.2], [0.7, 8.8], [6, 8.8], [6, 10], [-6, 10],
      [-6, 8.8], [-0.7, 8.8], [-0.7, 1.2], [-6, 1.2],
    ],
  },
};

// Dış çizgiyi merkeze alır ve en uzun kenarı `size` birim olacak şekilde ölçekler.
export function normalize(outline, size = 1) {
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = size / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return outline.map(([x, y]) => [(x - cx) * s, (y - cy) * s]);
}

// SVG yol verisi (simgeler için): y ekseni ters çevrilir.
export function toSvgPath(outline, size = 20) {
  const pts = normalize(outline, size).map(([x, y]) => `${(x + size / 2).toFixed(2)} ${(size / 2 - y).toFixed(2)}`);
  return `M${pts.join('L')}Z`;
}

import { defineConfig } from 'vite';

// Çıktı doğrudan Shopify temasının assets/ klasörüne yazılır. Shopify'da assets/ düz bir klasördür:
// alt klasör yok, dosya adları sabit. Parça dosyaları "yigit-" önekiyle ayrılır.
export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'theme/assets',
    emptyOutDir: false,
    assetsDir: '',
    modulePreload: false,
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      input: { yigit: 'src/js/main.js' },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'yigit-[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});

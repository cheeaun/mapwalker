import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';

// https://github.com/vitejs/vite/issues/2248#issuecomment-899020512
import replace from '@rollup/plugin-replace';
import { injectManifest } from 'rollup-plugin-workbox';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    preact(),
    Icons({
      scale: 1.75,
      compiler: 'jsx',
      jsx: 'preact',
    }),
    injectManifest({
      swSrc: './src/sw.js',
      swDest: 'dist/sw.js',
      globDirectory: 'dist',
      mode: 'production',
    }),
    replace({
      is_vite_preview: true, // this is used to conditionally call Workbox's precacheAndRoute function
    }),
  ],
  server: {
    https: true, // because Geolocation
    host: true,
    port: 3001,
  },
  build: {
    sourcemap: true,
  },
});

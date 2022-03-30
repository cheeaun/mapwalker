import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';

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

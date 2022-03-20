import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [preact()],
  server: {
    https: true, // because Geolocation
    host: true,
    port: 3001,
  },
  build: {
    sourcemap: true,
  },
});

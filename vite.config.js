import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    https: true, // because Geolocation
    host: true,
    port: 3001,
  },
});

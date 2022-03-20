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
    rollupOptions: {
      output: {
        manualChunks(id) {
          console.log(id);
          if (id.includes('.css')) return; // Do nothing for CSS
          if (id.includes('mapbox-gl')) return 'mapbox-gl';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});

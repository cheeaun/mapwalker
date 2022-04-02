import { render } from 'preact';
import { App } from './app';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css';
import 'react-spring-bottom-sheet/dist/style.css';
import './index.css';

render(<App />, document.getElementById('app'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // It's important to use type: 'modlue' here in dev.
    navigator.serviceWorker.register('./src/sw.js', {
      type: import.meta.env.DEV ? 'module' : 'classic',
    });
  });
}

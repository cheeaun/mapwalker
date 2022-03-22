import { useControl } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

function GeocoderControl(props) {
  useControl(() => new MapboxGeocoder(props), {
    position: props.position,
  });
  return null;
}

export default GeocoderControl;

import { useRef, useState, useEffect } from 'preact/hooks';
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  useControl,
} from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import { fetchRoutes } from './apis';
import LS from './ls';
import pinImgURL from '../assets/pin.png';

const { VITE_MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN } = import.meta.env;

const OVERVIEW_ZOOM_BACK = 2;

function GeocoderControl(props) {
  useControl(() => new MapboxGeocoder(props), {
    position: props.position,
  });
  return null;
}

class Legend {
  onAdd() {
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-legend';
    this._container.innerHTML = `
      <h2>Map Legend</h2>
      <dl>
        <dt><span class="path" /></dt>
        <dd>Foot/cycling paths</dd>
        <dt><span class="bridge" /></dt>
        <dd>Bridges</dd>
        <dt><span class="stairs" /></dt>
        <dd>Stairs</dd>
        <dt><span class="tunnel" /></dt>
        <dd>Tunnel/underground/under bridge</dd>
      </dl>
    `;
    return this._container;
  }
  onRemove() {
    this._container.remove();
  }
}
function LegendControl(props) {
  useControl(() => new Legend(), {
    position: props.position,
  });
}

const emptyGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

export function App() {
  const mapRef = useRef();
  const overviewMapDivRef = useRef();
  const overviewMapRef = useRef();

  const [loading, setLoading] = useState(false);

  const geolocateControlRef = useRef();
  const [geolocationGeoJSON, setGeolocationGeoJSON] = useState(emptyGeoJSON);

  const [walkRouteGeoJSON, setWalkRouteGeoJSON] = useState(
    LS.get('walk-route') || null,
  );
  useEffect(() => {
    LS.set('walk-route', walkRouteGeoJSON);
  }, [walkRouteGeoJSON]);

  const [destinationMarker, setDestinationMarker] = useState(
    LS.get('destination-marker') || null,
  );
  useEffect(() => {
    LS.set('destination-marker', destinationMarker);
  }, [destinationMarker]);

  const [markerPinned, setMarkerPinned] = useState(
    LS.get('marker-pinned') || false,
  );
  useEffect(() => {
    LS.set('marker-pinned', markerPinned);
  }, [markerPinned]);

  const mapStyles = {
    walkRoute: {
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'provider'], 'ors'],
          '#95378C',
          ['==', ['get', 'provider'], 'graphhopper'],
          '#EB1E4E',
          '#0E90DF',
        ],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 15, 1, 18, 0.5],
        'line-width': ['interpolate', ['linear'], ['zoom'], 15, 4, 18, 14],
        'line-dasharray': [0, 2],
      },
    },
  };

  const clickFired = useRef(false);
  const mapHandleClick = (e) => {
    if (clickFired.current && !markerPinned) {
      const { lngLat } = e;
      setDestinationMarker(lngLat);
    }
  };
  const mapHandleClickDebounced = AwesomeDebouncePromise(mapHandleClick, 350);
  const orientationGranted = useRef(false);

  // For debugging
  window._map = mapRef;
  useEffect(() => {
    if (window.navigator.standalone) {
      setTimeout(() => {
        document.body.classList.add('standalone');
        mapRef.current.resize();
      }, 1000);
    }
  }, []);

  return (
    <>
      <div id="map">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft"
          initialViewState={
            LS.get('view-state') || {
              center: [103.8198, 1.3521],
            }
          }
          boxZoom={false}
          renderWorldCopies={false}
          maxZoom={21}
          attributionControl={false}
          logoPosition="top-right"
          onLoad={(e) => {
            geolocateControlRef.current?.trigger();
          }}
          onMoveStart={(e) => {
            if (e.geolocateSource) return;
            if (overviewMapDivRef.current.hidden) return;
            overviewMapDivRef.current.classList.add('faded');
          }}
          onMoveEnd={(e) => {
            if (e.geolocateSource) return;
            if (overviewMapDivRef.current.hidden) return;
            overviewMapDivRef.current.classList.remove('faded');
            LS.set('view-state', e.viewState);
          }}
          onMove={(e) => {
            const { viewState } = e;
            const lowZoomLevel = viewState.zoom < 16;
            overviewMapDivRef.current.hidden = lowZoomLevel;
            if (!lowZoomLevel) {
              overviewMapRef.current?.jumpTo({
                ...viewState,
                center: [viewState.longitude, viewState.latitude],
                zoom: viewState.zoom - OVERVIEW_ZOOM_BACK,
              });
            }
          }}
          onClick={(e) => {
            console.log('map click', e);
            if (e.originalEvent.detail > 1) return;
            clickFired.current = true;
            mapHandleClickDebounced(e);
          }}
          onDblClick={(e) => {
            if (clickFired.current) {
              clickFired.current = false;
            }
          }}
          onZoomStart={(e) => {
            if (clickFired.current) {
              clickFired.current = false;
            }
          }}
          onDragStart={(e) => {
            if (clickFired.current) {
              clickFired.current = false;
            }
          }}
        >
          <AttributionControl position="top-right" compact />
          <GeocoderControl
            accessToken={MAPBOX_ACCESS_TOKEN}
            marker={false}
            clearAndBlurOnSelect={true}
            collapsed={true}
            position="top-left"
          />
          <LegendControl position="bottom-left" />
          <NavigationControl visualizePitch={true} position="top-right" />
          <GeolocateControl
            ref={geolocateControlRef}
            fitBoundsOptions={{
              zoom: 17,
            }}
            positionOptions={{
              enableHighAccuracy: true,
              timeout: 3000,
            }}
            trackUserLocation
            showUserHeading
            position="top-right"
            onGeolocate={(e) => {
              console.log({ onGeolocate: e });
              const { coords } = e;
              setGeolocationGeoJSON({
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [coords.longitude, coords.latitude],
                    },
                  },
                ],
              });

              if (
                window.DeviceOrientationEvent &&
                !orientationGranted.current
              ) {
                if (
                  typeof DeviceOrientationEvent.requestPermission === 'function'
                ) {
                  DeviceOrientationEvent.requestPermission()
                    .then(function (permissionState) {
                      if (permissionState === 'granted') {
                        console.log('granted');
                        orientationGranted.current = true;
                      }
                    })
                    .catch((e) => {});
                }
              }
            }}
          />
          <Source
            id="walk-route"
            type="geojson"
            data={walkRouteGeoJSON || emptyGeoJSON}
          >
            <Layer id="walk-route" type="line" {...mapStyles.walkRoute} />
          </Source>
          <Marker
            anchor="bottom"
            draggable={!markerPinned}
            longitude={destinationMarker?.lng || 0}
            latitude={destinationMarker?.lat || 0}
            onDragEnd={(e) => {
              const { lngLat } = e;
              setDestinationMarker(lngLat);
            }}
          >
            <img src={pinImgURL} width="18" hidden={!destinationMarker} />
          </Marker>
        </Map>
      </div>
      <div id="overview-map" ref={overviewMapDivRef} hidden>
        <Map
          ref={overviewMapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft"
          initialViewState={{
            center: [103.8198, 1.3521],
            zoom: 11,
          }}
          attributionControl={false}
          interactive={false}
          maxZoom={16}
          minZoom={14.5}
        >
          <Source
            id="walk-route"
            type="geojson"
            data={walkRouteGeoJSON || emptyGeoJSON}
          >
            <Layer id="walk-route" type="line" {...mapStyles.walkRoute} />
          </Source>
          <Source id="geolocation" type="geojson" data={geolocationGeoJSON}>
            <Layer
              id="geolocation-outer"
              type="circle"
              paint={{
                'circle-radius': 5,
                'circle-color': '#1ea1f1',
              }}
            />
            <Layer
              id="geolocation-inner"
              type="circle"
              paint={{
                'circle-radius': 3,
                'circle-color': '#1ea1f1',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
              }}
            />
          </Source>
          <Marker
            anchor="bottom"
            longitude={destinationMarker?.lng || 0}
            latitude={destinationMarker?.lat || 0}
          >
            <img src={pinImgURL} width="10" hidden={!destinationMarker} />
          </Marker>
        </Map>
      </div>
      <div id="actions" class={loading ? 'disabled' : ''}>
        {loading && <div class="loading" />}
        {!!destinationMarker ? (
          <>
            <button
              type="button"
              onClick={() => {
                setDestinationMarker(null);
                setMarkerPinned(false);
              }}
              title="Remove marker"
            >
              ❌
            </button>
            <button
              type="button"
              onClick={() => {
                setMarkerPinned(!markerPinned);
              }}
              class={markerPinned ? '' : 'faded'}
              title={markerPinned ? 'Unpin marker' : 'Pin marker'}
            >
              📌
            </button>
            {/* Find marker button */}
            <button
              type="button"
              onClick={() => {
                mapRef.current?.flyTo({
                  center: destinationMarker,
                });
              }}
              title="Fly to marker"
            >
              🔍
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                console.log({
                  geolocationGeoJSON,
                  destinationMarker,
                });
                const results = await fetchRoutes(
                  geolocationGeoJSON.features[0].geometry.coordinates,
                  [destinationMarker.lng, destinationMarker.lat],
                );
                setWalkRouteGeoJSON(results);
                setLoading(false);
                setMarkerPinned(true);
              }}
              title="Generate route to marker"
            >
              🔃
            </button>
          </>
        ) : (
          !!walkRouteGeoJSON && (
            <button
              type="button"
              onClick={() => {
                setWalkRouteGeoJSON(null);
              }}
              title="Clear route"
            >
              🗑️
            </button>
          )
        )}
      </div>
    </>
  );
}

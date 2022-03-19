import { useRef, useState, useEffect, useMemo } from 'preact/hooks';
import mapboxgl from 'mapbox-gl';
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
import { BottomSheet } from 'react-spring-bottom-sheet';
import prettyMetric from 'pretty-metric';
import humanizeDuration from 'humanize-duration';

import { fetchRoutes } from './apis';
import LS from './ls';
import pinImgURL from '../assets/pin.png';
import walkDotBlueImgURL from '../assets/walk-dot-blue.png';
import walkDotPurpleImgURL from '../assets/walk-dot-purple.png';
import walkDotRedImgURL from '../assets/walk-dot-red.png';

const { VITE_MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN, DEV } = import.meta.env;

const OVERVIEW_ZOOM_BACK = 2;

function GeocoderControl(props) {
  useControl(() => new MapboxGeocoder(props), {
    position: props.position,
  });
  return null;
}

const emptyGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

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
  walkRoute2: {
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10,
        1,
        15,
        20,
        19,
        24,
      ],
      'icon-allow-overlap': true,
      // 'icon-ignore-placement': true,
      'icon-padding': 0,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 18, 0.75],
      'icon-image': [
        'case',
        ['==', ['get', 'provider'], 'ors'],
        'walk-dot-purple',
        ['==', ['get', 'provider'], 'graphhopper'],
        'walk-dot-red',
        'walk-dot-blue',
      ],
    },
  },
};

function routeInfoText(distance) {
  // Walking speed: 1.33m per second
  const timeDurationSecs = (distance / 1.33) * 1000;
  return `${prettyMetric(distance).humanize()} (${humanizeDuration(
    timeDurationSecs,
    {
      units: ['h', 'm'],
      round: true,
    },
  )})`;
}

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

  const clickFired = useRef(false);
  const mapHandleClick = (e) => {
    if (clickFired.current && !markerPinned) {
      const { lngLat } = e;
      setDestinationMarker(lngLat);
    }
  };
  const mapHandleClickDebounced = AwesomeDebouncePromise(mapHandleClick, 350);
  const orientationGranted = useRef(false);

  const [mapTextLayerID, setMapTextLayerID] = useState(null);
  const [legendSheetOpen, setLegendSheetOpen] = useState(false);
  const [markerSheetOpen, setMarkerSheetOpen] = useState(false);
  const backupDestinationMarker = useRef(destinationMarker);
  const backupWalkRouteGeoJSON = useRef(walkRouteGeoJSON);

  const distances = useMemo(() => {
    const info = {};
    walkRouteGeoJSON?.features?.forEach((feature) => {
      const { provider, distance } = feature.properties;
      info[provider] = distance;
    });
    return info;
  }, [backupWalkRouteGeoJSON]);

  return (
    <>
      <div id="map">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={`mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle${
            DEV ? '/draft' : ''
          }`}
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

            const { layers } = mapRef.current.getStyle();
            setMapTextLayerID(
              layers.find(
                (layer) =>
                  layer.type === 'symbol' && layer?.layout?.['text-field'],
              )?.id,
            );

            mapRef.current.loadImage(walkDotBlueImgURL, (error, image) => {
              if (error) return;
              mapRef.current.addImage('walk-dot-blue', image);
              overviewMapRef.current.addImage('walk-dot-blue', image);
            });
            mapRef.current.loadImage(walkDotPurpleImgURL, (error, image) => {
              if (error) return;
              mapRef.current.addImage('walk-dot-purple', image);
              overviewMapRef.current.addImage('walk-dot-purple', image);
            });
            mapRef.current.loadImage(walkDotRedImgURL, (error, image) => {
              if (error) return;
              mapRef.current.addImage('walk-dot-red', image);
              overviewMapRef.current.addImage('walk-dot-red', image);
            });
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
          }}
          onIdle={(e) => {
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
          onZoomEnd={(e) => {
            const { zoom } = e.viewState;
            console.log('zoom', zoom);
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
            onError={(e) => {
              alert(`${e.code}: ${e.message}`);
            }}
          />
          <Source
            id="walk-route"
            type="geojson"
            data={walkRouteGeoJSON || emptyGeoJSON}
          >
            {/* <Layer id="walk-route" type="line" {...mapStyles.walkRoute} /> */}
            <Layer
              id="walk-route"
              type="symbol"
              {...mapStyles.walkRoute2}
              beforeId={mapTextLayerID}
            />
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
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setMarkerSheetOpen(true);
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
            {/* <Layer id="walk-route" type="line" {...mapStyles.walkRoute} /> */}
            <Layer
              id="walk-route"
              type="symbol"
              {...mapStyles.walkRoute2}
              beforeId={mapTextLayerID}
            />
          </Source>
          <Source id="geolocation" type="geojson" data={geolocationGeoJSON}>
            <Layer
              id="geolocation-outer"
              type="circle"
              paint={{
                'circle-radius': 12,
                'circle-color': '#1ea1f1',
                'circle-opacity': 0.3,
              }}
              beforeId={mapTextLayerID}
            />
            <Layer
              id="geolocation-inner"
              type="circle"
              paint={{
                'circle-radius': 3,
                'circle-color': '#1ea1f1',
                'circle-stroke-width': 2,
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
      <div id="actions">
        {loading && <div class="loading" />}
        <button
          type="button"
          onClick={() => {
            setLegendSheetOpen(true);
          }}
          title="Legend"
        >
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path d="m11 7h2v2h-2zm0 4h2v6h-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            setMarkerSheetOpen(true);
          }}
          title="Actions"
          disabled={loading}
        >
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path d="m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z" />
          </svg>
        </button>
      </div>
      <BottomSheet
        open={legendSheetOpen}
        onDismiss={() => {
          setLegendSheetOpen(false);
        }}
      >
        <div class="bottom-sheet-container legend-sheet-container">
          <h2>Map Legend</h2>
          <dl>
            <dt>
              <span class="path" />
            </dt>
            <dd>Foot paths, cycling paths</dd>
            <dt>
              <span class="bridge" />
            </dt>
            <dd>Bridges</dd>
            <dt>
              <span class="stairs" />
            </dt>
            <dd>Stairs</dd>
            <dt>
              <span class="tunnel" />
            </dt>
            <dd>Tunnels, underground paths, under bridge</dd>
            <dt>
              <img src={walkDotBlueImgURL} width="10" height="10" />
            </dt>
            <dd>
              Route from OpenStreetMap
              {distances['osm-de'] &&
                ` - ${routeInfoText(distances['osm-de'])}`}
            </dd>
            <dt>
              <img src={walkDotPurpleImgURL} width="10" height="10" />
            </dt>
            <dd>
              Route from OpenRouteService
              {distances.ors && ` - ${routeInfoText(distances.ors)}`}
            </dd>
            <dt>
              <img src={walkDotRedImgURL} width="10" height="10" />
            </dt>
            <dd>
              Route from GraphHopper
              {distances.graphhopper &&
                ` - ${routeInfoText(distances.graphhopper)}`}
            </dd>
          </dl>
        </div>
      </BottomSheet>
      <BottomSheet
        open={markerSheetOpen}
        onDismiss={() => {
          setMarkerSheetOpen(false);
        }}
      >
        <div class="bottom-sheet-container marker-sheet-container">
          {!!destinationMarker ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDestinationMarker(null);
                  backupDestinationMarker.current = destinationMarker;
                  setMarkerPinned(false);
                }}
              >
                <span>❌</span> Remove marker
              </button>
              <button
                type="button"
                onClick={() => {
                  setMarkerPinned(!markerPinned);
                  setMarkerSheetOpen(false);
                }}
                class={markerPinned ? '' : 'faded'}
              >
                <span>📌</span> {markerPinned ? 'Unpin marker' : 'Pin marker'}
              </button>
              {!!walkRouteGeoJSON && (
                <button
                  type="button"
                  onClick={() => {
                    const bounds = new mapboxgl.LngLatBounds();
                    walkRouteGeoJSON.features.forEach((feature) => {
                      feature.geometry.coordinates.forEach((coord) => {
                        bounds.extend(coord);
                      });
                    });
                    mapRef.current?.fitBounds(bounds, {
                      padding: 100,
                    });
                    setMarkerSheetOpen(false);
                  }}
                >
                  <span>🔭</span> Zoom whole route
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  mapRef.current?.flyTo({
                    center: destinationMarker,
                  });
                  setMarkerSheetOpen(false);
                }}
              >
                <span>🔍</span> Fly to marker
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setMarkerSheetOpen(false);
                  console.log({
                    geolocationGeoJSON,
                    destinationMarker,
                  });
                  if (!geolocationGeoJSON) {
                    alert('Please allow location access to generate routes');
                    return;
                  }
                  const results = await fetchRoutes(
                    geolocationGeoJSON.features[0].geometry.coordinates,
                    [destinationMarker.lng, destinationMarker.lat],
                  );
                  setWalkRouteGeoJSON(results);
                  setLoading(false);
                  setMarkerPinned(true);
                }}
              >
                <span>🔃</span> Generate walk routes to marker
              </button>
            </>
          ) : (
            <>
              {!destinationMarker && (
                <button
                  type="button"
                  onClick={() => {
                    const center = mapRef.current?.getCenter();
                    setDestinationMarker({
                      lat: center.lat,
                      lng: center.lng,
                    });
                    setMarkerSheetOpen(false);
                  }}
                >
                  <span>📌</span> Place marker on map
                </button>
              )}
              {!destinationMarker && backupDestinationMarker.current && (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationMarker(backupDestinationMarker.current);
                  }}
                >
                  <span>♻️</span> Restore marker
                </button>
              )}
              {!!walkRouteGeoJSON ? (
                <button
                  type="button"
                  onClick={() => {
                    backupWalkRouteGeoJSON.current = walkRouteGeoJSON;
                    setWalkRouteGeoJSON(null);
                  }}
                >
                  🗑️ Clear route
                </button>
              ) : (
                backupWalkRouteGeoJSON.current && (
                  <button
                    type="button"
                    onClick={() => {
                      setWalkRouteGeoJSON(backupWalkRouteGeoJSON.current);
                    }}
                  >
                    <span>♻️</span> Restore route
                  </button>
                )
              )}
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'preact/hooks';
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
import haversine from 'haversine-distance';

import { fetchRoutes } from './apis';
import LS from './ls';
import pinImgURL from '../assets/pin.png';
import walkDotBlueImgURL from '../assets/walk-dot-blue.png';
import walkDotPurpleImgURL from '../assets/walk-dot-purple.png';
import walkDotRedImgURL from '../assets/walk-dot-red.png';
import iconImgURL from '../assets/icon-192.png';

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
        16,
        19,
        32,
      ],
      'icon-allow-overlap': true,
      // 'icon-ignore-placement': true,
      'icon-padding': 0,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 15, 0.4, 18, 0.75],
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

let orientationGranted = false;
function requestOrientation(fn = () => {}) {
  if (window.DeviceOrientationEvent && !orientationGranted) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(function (permissionState) {
          if (permissionState === 'granted') {
            console.log('granted');
            orientationGranted = true;
            fn();
          }
        })
        .catch((e) => {});
    }
  }
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

  const [mapTextLayerID, setMapTextLayerID] = useState(null);
  const [legendSheetOpen, setLegendSheetOpen] = useState(false);
  const [markerSheetOpen, setMarkerSheetOpen] = useState(false);
  const [aboutSheetOpen, setAboutSheetOpen] = useState(
    LS.get('not-first-time') ? false : true,
  );
  const backupDestinationMarker = useRef(destinationMarker);
  const backupWalkRouteGeoJSON = useRef(walkRouteGeoJSON);

  const distances = useMemo(() => {
    const info = {};
    walkRouteGeoJSON?.features?.forEach((feature) => {
      const { provider, distance } = feature.properties;
      info[provider] = distance;
    });
    return info;
  }, [walkRouteGeoJSON]);

  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (aboutSheetOpen || markerSheetOpen || legendSheetOpen) {
      setSheetOpen(true);
    } else if (sheetOpen) {
      setTimeout(() => {
        setSheetOpen(false);
      }, 300);
    }
  }, [legendSheetOpen, markerSheetOpen, aboutSheetOpen]);

  const [overviewMapExpanded, setOverviewMapExpanded] = useState(false);
  useEffect(() => {
    mapRef.current?.resize();
    overviewMapRef.current?.resize();
    if (geolocationGeoJSON) {
      geolocateControlRef.current?.trigger();
    }
  }, [overviewMapExpanded]);

  const aboutSheetInitialFocusRef = useRef();
  const markerSheetInitialFocusRef = useRef();

  const airDistanceToMarker = useMemo(() => {
    if (!destinationMarker || !geolocationGeoJSON?.features?.length) return 0;
    const { lng, lat } = destinationMarker;
    const [originLng, originLat] =
      geolocationGeoJSON.features[0].geometry.coordinates;
    return haversine(
      {
        longitude: originLng,
        latitude: originLat,
      },
      {
        longitude: lng,
        latitude: lat,
      },
    );
  }, [destinationMarker, geolocationGeoJSON]);

  const requestOrientationTriggerGeolocation = useCallback(() => {
    if (geolocationGeoJSON) {
      requestOrientation(() => {
        // Turn off
        geolocateControlRef.current?.trigger();
        // Turn it back on again
        setTimeout(() => {
          geolocateControlRef.current?.trigger();
        }, 1);
      });
    }
  }, [geolocationGeoJSON]);

  return (
    <div class={`${overviewMapExpanded ? 'split-view' : ''}`}>
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
          keyboard={false}
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
            if (!lowZoomLevel && !overviewMapExpanded) {
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
            requestOrientationTriggerGeolocation();
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
          <NavigationControl
            showZoom={false}
            visualizePitch
            position="top-right"
          />
          <GeolocateControl
            ref={geolocateControlRef}
            fitBoundsOptions={{
              zoom: 17,
            }}
            positionOptions={{
              enableHighAccuracy: true,
              timeout: 5000,
            }}
            trackUserLocation
            showUserHeading
            position="top-right"
            onGeolocate={(e) => {
              console.log({ onGeolocate: e });
              const { coords } = e;
              if (coords) {
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

                requestOrientation();
              } else {
                setGeolocationGeoJSON(null);
              }
            }}
            onError={(e) => {
              alert(`${e.code}: ${e.message}`);
              setGeolocationGeoJSON(null);
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
          interactive={!overviewMapExpanded}
          maxZoom={16}
          keyboard={false}
          onClick={() => {
            requestOrientationTriggerGeolocation();
          }}
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
            <img src={pinImgURL} width="12" hidden={!destinationMarker} />
          </Marker>
        </Map>
        <button
          type="button"
          onClick={() => {
            setOverviewMapExpanded(!overviewMapExpanded);
          }}
        >
          {overviewMapExpanded ? (
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path
                fill="currentColor"
                d="m5 16h3v3h2v-5h-5zm3-8h-3v2h5v-5h-2zm6 11h2v-3h3v-2h-5zm2-11v-3h-2v5h5v-2z"
              />
            </svg>
          ) : (
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path
                fill="currentColor"
                d="m7 14h-2v5h5v-2h-3zm-2-4h2v-3h3v-2h-5zm12 7h-3v2h5v-5h-2zm-3-12v2h3v3h2v-5z"
              />
            </svg>
          )}
        </button>
      </div>
      <div id="actions">
        {loading && <div class="loading" />}
        <button
          type="button"
          onClick={() => {
            setAboutSheetOpen(true);
          }}
          title="About"
        >
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path
              fill="currentColor"
              d="m11 7h2v2h-2zm0 4h2v6h-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            setLegendSheetOpen(true);
          }}
          title="Legend"
        >
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path
              fill="currentColor"
              d="m11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zm-4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm13.1-12h-16.2c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9v-16.2c0-.5-.5-.9-.9-.9zm-1.1 16h-14v-14h14z"
            />
          </svg>
        </button>
        <button
          type="button"
          class="bold"
          onClick={() => {
            setMarkerSheetOpen(true);
          }}
          title="Actions"
          disabled={loading}
        >
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path
              fill="currentColor"
              d="m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z"
            />
          </svg>
        </button>
      </div>
      <div class="bd" onClick={(e) => e.stopPropagation()} hidden={!sheetOpen}>
        <BottomSheet
          open={aboutSheetOpen}
          onDismiss={() => {
            setAboutSheetOpen(false);
            LS.set('not-first-time', true);
          }}
          initialFocusRef={aboutSheetInitialFocusRef}
        >
          <div class="bottom-sheet-container">
            <img
              alt=""
              src={iconImgURL}
              width="96"
              height="96"
              style={{
                borderRadius: 24,
                boxShadow: '0 1px 2px #ccc',
                float: 'right',
                marginLeft: 10,
              }}
            />
            <h1>MapWalker</h1>
            <p>
              MapWalker is a very opinionated map-based walking route planner.
            </p>
            <p>
              The map tiles and styles escalate <b>all</b> walking paths and
              roads to the surface. They are color-coded based on their types,
              such as stairs, bridges, tunnels, etc.
            </p>
            <p>
              Once a marker is placed, walk routes can be generated from current
              location to the marker. Up to 3 walk routes will be generated from
              different routing engines, overlayed on the map simultaneuously
              for comparison as each has its own pros and cons.
            </p>
            <p>
              <a href="https://github.com/cheeaun/mapwalker" target="_blank">
                Built
              </a>{' '}
              by{' '}
              <a href="https://twitter.com/cheeaun" target="_blank">
                @cheeaun
              </a>
              .
            </p>
            <button
              type="button"
              class="block bold"
              ref={aboutSheetInitialFocusRef}
              onClick={() => {
                setAboutSheetOpen(false);
                LS.set('not-first-time', true);
              }}
            >
              <span>🚶</span> Start walking now!
            </button>
          </div>
        </BottomSheet>
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
                {distances['osm-de'] && (
                  <>
                    <br />
                    <span class="insignificant">
                      {routeInfoText(distances['osm-de'])}
                    </span>
                  </>
                )}
              </dd>
              <dt>
                <img src={walkDotPurpleImgURL} width="10" height="10" />
              </dt>
              <dd>
                Route from OpenRouteService
                {distances.ors && (
                  <>
                    <br />
                    <span class="insignificant">
                      {routeInfoText(distances.ors)}
                    </span>
                  </>
                )}
              </dd>
              <dt>
                <img src={walkDotRedImgURL} width="10" height="10" />
              </dt>
              <dd>
                Route from GraphHopper
                {distances.graphhopper && (
                  <>
                    <br />
                    <span class="insignificant">
                      {routeInfoText(distances.graphhopper)}
                    </span>
                  </>
                )}
              </dd>
            </dl>
          </div>
        </BottomSheet>
        <BottomSheet
          open={markerSheetOpen}
          onDismiss={() => {
            setMarkerSheetOpen(false);
          }}
          initialFocusRef={markerSheetInitialFocusRef}
        >
          <div class="bottom-sheet-container marker-sheet-container">
            {!!destinationMarker && !!geolocationGeoJSON && (
              <div
                class="insignificant"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Air distance to marker:{' '}
                {prettyMetric(airDistanceToMarker).humanize()}
              </div>
            )}
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
                  class="bold block"
                  ref={markerSheetInitialFocusRef}
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
                    <span>🗑️</span> Clear route
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
      </div>
    </div>
  );
}

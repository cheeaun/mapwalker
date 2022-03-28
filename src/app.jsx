import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'preact/hooks';
import { Suspense, lazy } from 'preact/compat';
import mapboxgl from 'mapbox-gl';
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
} from 'react-map-gl';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { BottomSheet } from 'react-spring-bottom-sheet';
import prettyMetric from 'pretty-metric';
import prettyImperial from 'pretty-imperial';
import humanizeDuration from 'humanize-duration';
import haversine from 'haversine-distance';
import { useRect } from '@reach/rect';
import usePageVisibility from 'use-page-visibility';

import { fetchRoutes } from './apis';
import LS from './ls';
import pinImgURL from '../assets/pin.png';
import walkDotBlueImgURL from '../assets/walk-dot-blue.png';
import walkDotPurpleImgURL from '../assets/walk-dot-purple.png';
import walkDotRedImgURL from '../assets/walk-dot-red.png';
import iconImgURL from '../assets/icon-192.png';

const { VITE_MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN, DEV } = import.meta.env;

const OVERVIEW_ZOOM_BACK = 2;
const POINTER_PADDING = 10;

const MAPSTYLE = `mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle${
  DEV ? '/draft' : ''
}`;

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

const GeocoderControl = lazy(() => import('./geocoder-control'));

function bearingDegrees(x1, y1, x2, y2) {
  const radians = Math.atan2(y2 - y1, x2 - x1);
  return (radians * 180) / Math.PI;
}

function hasHeading() {
  return document.querySelector('.mapboxgl-user-location-show-heading');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function App() {
  const mapDivRef = useRef();
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
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
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
      setGeolocateActiveLock();
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
    if (geolocationGeoJSON && !hasHeading()) {
      requestOrientation(async () => {
        let times = 0;
        do {
          if (times++ > 10) break; // Prevent infinite loop
          geolocateControlRef.current?.trigger();
          await sleep(100);
        } while (!hasHeading());
      });
    }
  }, [geolocationGeoJSON]);

  const markerPointerRef = useRef();
  const markerPointerMiniRef = useRef();

  const mapRect = useRect(mapDivRef);
  const overviewMapRect = useRect(overviewMapDivRef);

  const renderMapArrow = useCallback(() => {
    if (destinationMarker && markerPointerRef.current) {
      const { width, height } = mapRect;

      const { lng, lat } = destinationMarker;
      const { x, y } = mapRef.current.project([lng, lat]);
      const constrainedX = Math.max(
        Math.min(x, width - POINTER_PADDING),
        POINTER_PADDING,
      );
      const constrainedY = Math.max(
        Math.min(y, height - POINTER_PADDING),
        POINTER_PADDING,
      );

      // center point of map
      const centerX = width / 2;
      const centerY = height / 2;

      // bearing in degrees, from center to destination
      const bearing = bearingDegrees(centerX, centerY, x, y);

      if (
        constrainedX < x + POINTER_PADDING &&
        constrainedX > x - POINTER_PADDING &&
        constrainedY < y + POINTER_PADDING &&
        constrainedY > y - POINTER_PADDING
      ) {
        markerPointerRef.current.hidden = true;
      } else {
        markerPointerRef.current.hidden = false;
        markerPointerRef.current.style.transform = `translate(${constrainedX}px, ${constrainedY}px) rotate(${
          bearing + 90
        }deg)`;
      }
    } else {
      markerPointerRef.current.hidden = true;
    }
  }, [destinationMarker, mapRect]);

  const renderOverviewMapArrow = useCallback(() => {
    if (destinationMarker && markerPointerMiniRef.current) {
      const { width, height } = overviewMapRect;

      const { lng, lat } = destinationMarker;
      const { x, y } = overviewMapRef.current.project([lng, lat]);
      const constrainedX = Math.max(
        Math.min(x, width - POINTER_PADDING),
        POINTER_PADDING,
      );
      const constrainedY = Math.max(
        Math.min(y, height - POINTER_PADDING),
        POINTER_PADDING,
      );

      // center point of map
      const centerX = width / 2;
      const centerY = height / 2;

      // bearing in degrees, from center to destination
      const bearing = bearingDegrees(centerX, centerY, x, y);

      if (
        constrainedX < x + POINTER_PADDING &&
        constrainedX > x - POINTER_PADDING &&
        constrainedY < y + POINTER_PADDING &&
        constrainedY > y - POINTER_PADDING
      ) {
        markerPointerMiniRef.current.hidden = true;
      } else {
        markerPointerMiniRef.current.hidden = false;
        markerPointerMiniRef.current.style.transform = `translate(${constrainedX}px, ${constrainedY}px) rotate(${
          bearing + 90
        }deg)`;
      }
    } else {
      markerPointerMiniRef.current.hidden = true;
    }
  }, [destinationMarker, overviewMapRect]);

  const geolocateState = useRef(null);
  const setGeolocateActiveLock = useCallback(() => {
    if (
      geolocateState.current !== 'ACTIVE_LOCK' ||
      !document.querySelector('.mapboxgl-ctrl-geolocate-active')
    ) {
      geolocateControlRef.current?.trigger();
    }
  }, []);
  usePageVisibility((visible) => {
    if (visible) {
      setGeolocateActiveLock();
    }
  });

  const zoomWholeRoute = useCallback((routeGeoJSON) => {
    if (!routeGeoJSON) return;
    const bounds = new mapboxgl.LngLatBounds();
    routeGeoJSON.features.forEach((feature) => {
      feature.geometry.coordinates.forEach((coord) => {
        bounds.extend(coord);
      });
    });
    mapRef.current?.fitBounds(bounds, {
      padding: 100,
    });
  }, []);

  const [theme, setTheme] = useState(LS.get('theme') || 'auto');
  useEffect(() => {
    const html = document.documentElement;
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (theme === 'light') {
      html.classList.add('is-light');
      html.classList.remove('is-dark');
      colorSchemeMeta?.setAttribute('content', 'light');
      LS.set('theme', theme);
    } else if (theme === 'dark') {
      html.classList.add('is-dark');
      html.classList.remove('is-light');
      colorSchemeMeta?.setAttribute('content', 'dark');
      LS.set('theme', theme);
    } else {
      html.classList.remove('is-dark', 'is-light');
      colorSchemeMeta?.setAttribute('content', 'light dark');
      LS.del('theme');
    }
  }, [theme]);

  const [unitSystem, setUnitSystem] = useState(
    LS.get('unit-system') || 'metric',
  );
  useEffect(() => {
    if (unitSystem === 'imperial') {
      LS.set('unit-system', unitSystem);
    } else {
      LS.del('unit-system');
    }
  }, [unitSystem]);
  const prettyUnit = useCallback(
    (d) => {
      // d = number in meters
      if (unitSystem === 'imperial') {
        // convert meter to miles
        const miles = d / 1609.34;
        return prettyImperial(miles).input('mi').humanize();
      }
      return prettyMetric(d).humanize();
    },
    [unitSystem],
  );

  const routeInfoText = useCallback(
    (distance) => {
      // Walking speed: 1.33m per second
      const timeDurationSecs = (distance / 1.33) * 1000;
      return `${prettyUnit(distance)} (${humanizeDuration(timeDurationSecs, {
        units: ['h', 'm'],
        round: true,
      })})`;
    },
    [prettyUnit],
  );

  return (
    <div class={`${overviewMapExpanded ? 'split-view' : ''}`}>
      <div id="map" ref={mapDivRef}>
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={MAPSTYLE}
          initialViewState={
            LS.get('view-state') || {
              longitude: 0,
              latitude: 0,
            }
          }
          boxZoom={false}
          renderWorldCopies={false}
          maxZoom={21}
          attributionControl={false}
          logoPosition="top-right"
          keyboard={false}
          onLoad={(e) => {
            setGeolocateActiveLock();

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
            if (!overviewMapDivRef.current.hidden) {
              overviewMapDivRef.current.classList.add('faded');
            }
          }}
          onMoveEnd={(e) => {
            if (e.geolocateSource) return;
            if (!overviewMapDivRef.current.hidden) {
              overviewMapDivRef.current.classList.remove('faded');
            }
          }}
          onIdle={(e) => {
            if (!overviewMapDivRef.current.hidden) {
              overviewMapDivRef.current.classList.remove('faded');
            }
            const { target } = e;
            const center = target.getCenter();
            const viewState = {
              longitude: center.lng,
              latitude: center.lat,
              zoom: target.getZoom(),
              bearing: target.getBearing(),
              pitch: target.getPitch(),
            };
            LS.set('view-state', viewState);
            renderMapArrow();
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

            renderMapArrow();
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
          <Suspense>
            <GeocoderControl
              accessToken={MAPBOX_ACCESS_TOKEN}
              marker={false}
              clearAndBlurOnSelect={true}
              collapsed={true}
              position="top-left"
            />
          </Suspense>
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
            position="bottom-right"
            onGeolocate={(e) => {
              const {
                target: { _watchState },
                coords,
              } = e;
              console.log(_watchState, { onGeolocate: e });
              geolocateState.current = _watchState;
              if (coords?.longitude) {
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
              const { code, message } = e;
              // 1. PERMISSION_DENIED
              // 2. POSITION_UNAVAILABLE
              // 3. TIMEOUT
              if (code !== 3) {
                alert(`${code}: ${message}`);
              }
              setGeolocationGeoJSON(null);
            }}
          />
          <NavigationControl
            showZoom={false}
            visualizePitch
            position="bottom-right"
          />
          <div class="marker-pointer" ref={markerPointerRef} hidden />
          <div id="actions">
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
                  d="m11 18h2v-2h-2zm1-16c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setOptionsSheetOpen(true);
              }}
              title="Options"
            >
              <svg height="24" viewBox="0 0 24 24" width="24">
                <path
                  fill="currentColor"
                  d="m19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64zm-1.98-1.71c.04.31.05.52.05.73s-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7zm-5.45-3.27c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
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
              {loading ? (
                <div class="loading" />
              ) : (
                <svg height="24" viewBox="0 0 24 24" width="24">
                  <path
                    fill="currentColor"
                    d="m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z"
                  />
                </svg>
              )}
            </button>
          </div>
        </Map>
      </div>
      <div id="overview-map" ref={overviewMapDivRef} hidden>
        <Map
          ref={overviewMapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={MAPSTYLE}
          initialViewState={{
            longitude: 0,
            latitude: 0,
          }}
          attributionControl={false}
          interactive={!overviewMapExpanded}
          maxZoom={17}
          keyboard={false}
          onClick={() => {
            requestOrientationTriggerGeolocation();
          }}
          onIdle={renderOverviewMapArrow}
          onMove={renderOverviewMapArrow}
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
          <Marker
            anchor="center"
            longitude={
              geolocationGeoJSON?.features[0]?.geometry?.coordinates[0] || 0
            }
            latitude={
              geolocationGeoJSON?.features[0]?.geometry?.coordinates[1] || 0
            }
          >
            <div id="geolocation-marker" hidden={!geolocationGeoJSON} />
          </Marker>
          <Marker
            anchor="bottom"
            longitude={destinationMarker?.lng || 0}
            latitude={destinationMarker?.lat || 0}
          >
            <img src={pinImgURL} width="12" hidden={!destinationMarker} />
          </Marker>
          <div class="marker-pointer mini" ref={markerPointerMiniRef} hidden />
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
          open={optionsSheetOpen}
          onDismiss={() => {
            setOptionsSheetOpen(false);
          }}
        >
          <div class="bottom-sheet-container options-sheet-container">
            <h2>Options</h2>
            <p>
              <label>
                Theme:{' '}
                <select
                  id="theme-switcher"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                  }}
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </p>
            <p>
              <label>
                Unit system:{' '}
                <select
                  id="unit-system-switcher"
                  value={unitSystem}
                  onChange={(e) => {
                    setUnitSystem(e.target.value);
                  }}
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </label>
            </p>
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
                Air distance to marker: {prettyUnit(airDistanceToMarker)}
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
                      zoomWholeRoute(walkRouteGeoJSON);
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
                    zoomWholeRoute(results);
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

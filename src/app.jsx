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
  Popup,
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

import IconWalk from '~icons/ic/round-directions-walk';
import IconAbout from '~icons/mdi/information-outline';
import IconLegend from '~icons/mdi/help-circle-outline';
import IconOptions from '~icons/mdi/cog-outline';
import IconActions from '~icons/mdi/view-grid-outline';
import IconExpand from '~icons/mdi/fullscreen';
import IconRestore from '~icons/mdi/backup-restore';
import IconGPS from '~icons/mdi/crosshairs-gps';
import IconCollapse from '~icons/mdi/fullscreen-exit';
import IconRemove from '~icons/mdi/close-box-outline';
import IconFit from '~icons/mdi/fit-to-screen-outline';
import IconFly from '~icons/mdi/ufo-outline';
import IconRoutes from '~icons/mdi/routes';
import IconTheme from '~icons/mdi/theme-light-dark';
import IconUnit from '~icons/mdi/power-socket-us';

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
      'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 15, 1, 19, 56],
      // 'icon-allow-overlap': true,
      // 'icon-ignore-placement': true,
      'icon-padding': 0,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 15, 0.5, 18, 1],
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
  const [geolocationGeoJSON, setGeolocationGeoJSON] = useState(null);

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

  const [showPopup, setShowPopup] = useState(false);
  const clickFired = useRef(false);
  const mapHandleClick = (e) => {
    if (clickFired.current) {
      if (destinationMarker) {
        if (showPopup) {
          setShowPopup(false);
        } else {
          setShowPopup({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          });
        }
      } else {
        const { lngLat } = e;
        setDestinationMarker(lngLat);
      }
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
      if (!info[provider]) {
        info[provider] = [];
      }
      info[provider].push(distance);
    });
    return info;
  }, [walkRouteGeoJSON]);

  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (
      aboutSheetOpen ||
      markerSheetOpen ||
      legendSheetOpen ||
      optionsSheetOpen
    ) {
      setSheetOpen(true);
    } else if (sheetOpen) {
      setTimeout(() => {
        setSheetOpen(false);
      }, 300);
    }
  }, [legendSheetOpen, markerSheetOpen, aboutSheetOpen, optionsSheetOpen]);

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
    if (!destinationMarker || !geolocationGeoJSON) return 0;
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
      if (geolocationGeoJSON) {
        overviewMapRef.current?.easeTo({
          center: geolocationGeoJSON.features[0].geometry.coordinates,
        });
      }
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

  const [showMiniLocationButton, setShowMiniLocationButton] = useState(false);

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

            const hideNavControl =
              viewState.pitch === 0 && viewState.bearing === 0;
            document.querySelector(
              '#map .mapboxgl-ctrl-compass',
            ).style.display = hideNavControl ? 'none' : 'block';
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
            <Layer id="walk-route" type="symbol" {...mapStyles.walkRoute2} />
          </Source>
          <Marker
            anchor="bottom"
            longitude={destinationMarker?.lng || 0}
            latitude={destinationMarker?.lat || 0}
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
          {showPopup && (
            <Popup
              anchor="bottom"
              longitude={showPopup.lng}
              latitude={showPopup.lat}
              closeButton={false}
              closeOnMove
              onClose={() => setShowPopup(false)}
            >
              <button
                type="button"
                onClick={() => {
                  backupDestinationMarker.current = destinationMarker;
                  setDestinationMarker({
                    lng: showPopup.lng,
                    lat: showPopup.lat,
                  });
                  setShowPopup(false);
                }}
              >
                Move marker here
              </button>
            </Popup>
          )}
          <div id="actions">
            <button
              type="button"
              onClick={() => {
                setAboutSheetOpen(true);
              }}
              title="About"
            >
              <IconAbout />
            </button>
            <button
              type="button"
              onClick={() => {
                setLegendSheetOpen(true);
              }}
              title="Legend"
            >
              <IconLegend />
            </button>
            <button
              type="button"
              onClick={() => {
                setOptionsSheetOpen(true);
              }}
              title="Options"
            >
              <IconOptions />
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
              {loading ? <div class="loading" /> : <IconActions />}
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
          onIdle={() => {
            renderOverviewMapArrow();

            const pitch = overviewMapRef.current.getPitch();
            const bearing = overviewMapRef.current.getBearing();
            const hideNavControl = pitch === 0 && bearing === 0;
            document.querySelector(
              '#overview-map .mapboxgl-ctrl-compass',
            ).style.display = hideNavControl ? 'none' : 'block';

            // check  if geolocationGeoJSON is in view
            if (geolocationGeoJSON) {
              const overviewMapBounds = overviewMapRef.current.getBounds();
              const isInBounds = overviewMapBounds.contains(
                geolocationGeoJSON?.features[0].geometry.coordinates,
              );
              setShowMiniLocationButton(!isInBounds);
            }
          }}
          onMove={renderOverviewMapArrow}
        >
          <NavigationControl
            showZoom={false}
            visualizePitch
            position="bottom-right"
          />
          <Source
            id="walk-route"
            type="geojson"
            data={walkRouteGeoJSON || emptyGeoJSON}
          >
            {/* <Layer id="walk-route" type="line" {...mapStyles.walkRoute} /> */}
            <Layer id="walk-route" type="symbol" {...mapStyles.walkRoute2} />
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
        <div id="mini-actions">
          <button
            type="button"
            onClick={() => {
              setOverviewMapExpanded(!overviewMapExpanded);
            }}
          >
            {overviewMapExpanded ? <IconCollapse /> : <IconExpand />}
          </button>
          {overviewMapExpanded && showMiniLocationButton && geolocationGeoJSON && (
            <button
              type="button"
              onClick={() => {
                overviewMapRef.current?.easeTo({
                  center: geolocationGeoJSON.features[0].geometry.coordinates,
                });
              }}
            >
              <IconGPS />
            </button>
          )}
        </div>
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
              location to the marker. Up to 6 walk routes will be generated from
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
              <span>
                <IconWalk />
              </span>{' '}
              Start walking now!
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
                Route from OSRM
                {distances.osrm?.map((dist) => (
                  <>
                    <br />
                    <span class="insignificant">{routeInfoText(dist)}</span>
                  </>
                ))}
              </dd>
              <dt>
                <img src={walkDotPurpleImgURL} width="10" height="10" />
              </dt>
              <dd>
                Route from OpenRouteService
                {distances.ors?.map((dist) => (
                  <>
                    <br />
                    <span class="insignificant">{routeInfoText(dist)}</span>
                  </>
                ))}
              </dd>
              <dt>
                <img src={walkDotRedImgURL} width="10" height="10" />
              </dt>
              <dd>
                Route from GraphHopper
                {distances.graphhopper?.map((dist) => (
                  <>
                    <br />
                    <span class="insignificant">{routeInfoText(dist)}</span>
                  </>
                ))}
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
                <span>
                  <IconTheme /> Theme
                </span>
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
                <span>
                  <IconUnit /> Unit system
                </span>
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
            {backupDestinationMarker.current &&
              (destinationMarker?.lng !== backupDestinationMarker.current.lng ||
                destinationMarker?.lat !==
                  backupDestinationMarker.current.lat) && (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationMarker(backupDestinationMarker.current);
                  }}
                >
                  <span>
                    <IconRestore />
                  </span>{' '}
                  Restore marker
                </button>
              )}
            {!!destinationMarker ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDestinationMarker(null);
                    backupDestinationMarker.current = destinationMarker;
                  }}
                >
                  <span>
                    <IconRemove />
                  </span>{' '}
                  Remove marker
                </button>
                {!!walkRouteGeoJSON && (
                  <button
                    type="button"
                    onClick={() => {
                      zoomWholeRoute(walkRouteGeoJSON);
                      setMarkerSheetOpen(false);
                    }}
                  >
                    <span>
                      <IconFit />
                    </span>{' '}
                    Zoom whole route
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
                  <span>
                    <IconFly />
                  </span>{' '}
                  Fly to marker
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
                    zoomWholeRoute(results);
                  }}
                >
                  <span>
                    <IconRoutes />
                  </span>{' '}
                  Generate walk routes to marker
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
                      <span>
                        <IconRestore />
                      </span>{' '}
                      Restore route
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

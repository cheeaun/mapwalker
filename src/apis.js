const {
  VITE_ORS_API_KEY: ORS_API_KEY,
  VITE_GRAPHHOPPER_API_KEY: GRAPHHOPPER_API_KEY,
} = import.meta.env;

const APIS = {
  OSRM: (origin, destination) =>
    `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${origin.join(
      ',',
    )};${destination.join(',')}`,
  ORS: () =>
    `https://api.openrouteservice.org/v2/directions/foot-hiking/geojson`,
  GHOP: () => `https://graphhopper.com/api/1/route`,
};

export const fetchRoutes = async (origin, destination, params) => {
  const fetch1 = fetch(
    APIS.OSRM(origin, destination) +
      '?' +
      new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        continue_straight: false,
        generate_hints: false,
        alternatives: 1,
        ...params,
      }),
  )
    .then((r) => r.json())
    .catch((e) => {});

  const fetch2 = fetch(APIS.ORS(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ORS_API_KEY,
    },
    body: JSON.stringify({
      coordinates: [origin, destination],
      instructions: false,
      alternative_routes: {
        target_count: 2,
      },
    }),
  })
    .then((r) => r.json())
    .catch((e) => {});

  const fetch3Params = new URLSearchParams({
    vehicle: 'foot',
    key: GRAPHHOPPER_API_KEY,
    instructions: true,
    points_encoded: false,
    point: [...origin].reverse().join(','),
    algorithm: 'alternative_route',
    'alternative_route.max_paths': 2,
  });
  fetch3Params.append('point', [...destination].reverse().join(','));
  const fetch3 = fetch(APIS.GHOP() + '?' + fetch3Params)
    .then((r) => r.json())
    .catch((e) => {});

  const [response1, response2, response3] = await Promise.all([
    fetch1,
    fetch2,
    fetch3,
  ]);

  console.log({
    response1,
    response2,
    response3,
  });

  const results = {
    type: 'FeatureCollection',
    features: [
      ...response1?.routes.map((route, index) => {
        return {
          type: 'Feature',
          geometry: route?.geometry,
          properties: {
            index,
            provider: 'osrm',
            distance: route?.distance,
          },
        };
      }),
      ...response2?.features.map((feature, index) => {
        return {
          type: 'Feature',
          geometry: feature?.geometry,
          properties: {
            index,
            provider: 'ors',
            distance: feature?.properties?.summary?.distance,
          },
        };
      }),
      ...response3?.paths.map((path, index) => {
        return {
          type: 'Feature',
          geometry: path?.points,
          properties: {
            index,
            provider: 'graphhopper',
            distance: path?.distance,
          },
        };
      }),
    ],
  };

  return results;
};

const {
  VITE_ORS_API_KEY: ORS_API_KEY,
  VITE_GRAPHHOPPER_API_KEY: GRAPHHOPPER_API_KEY,
} = import.meta.env;

const APIS = {
  OSM_DE: (origin, destination) =>
    `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${origin.join(
      ',',
    )};${destination.join(',')}`,
  ORS: () =>
    `https://api.openrouteservice.org/v2/directions/foot-hiking/geojson`,
  GHOP: () => `https://graphhopper.com/api/1/route`,
};

export const fetchRoutes = async (origin, destination, params) => {
  const fetch1 = fetch(
    APIS.OSM_DE(origin, destination) +
      '?' +
      new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        continue_straight: false,
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
      {
        type: 'Feature',
        geometry: response1?.routes[0]?.geometry,
        properties: {
          index: 0,
          provider: 'osm-de',
        },
      },
      {
        type: 'Feature',
        geometry: response2?.features[0]?.geometry,
        properties: {
          index: 1,
          provider: 'ors',
        },
      },
      {
        type: 'Feature',
        geometry: response3?.paths[0]?.points,
        properties: {
          index: 2,
          provider: 'graphhopper',
        },
      },
    ],
  };

  return results;
};

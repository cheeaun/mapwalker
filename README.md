MapWalker
===

MapWalker is a very opinionated map-based walking route planner.

The map tiles and styles escalate all walking paths and roads to the surface. They are color-coded based on their types, such as stairs, bridges, tunnels, etc.

Once a marker is placed, walk routes can be generated from current location to the marker. Up to 3 walk routes will be generated from different routing engines, overlayed on the map simultaneuously for comparison as each has its own pros and cons.

Technicalities
---

- `npm i` - installs all dependencies
- `npm run dev` - runs the development server
- `npm run build` - builds the production version
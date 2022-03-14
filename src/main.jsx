import { render } from "preact";
import { App } from "./app";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css";
import "./index.css";

render(<App />, document.getElementById("app"));

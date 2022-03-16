var K=Object.defineProperty,F=Object.defineProperties;var M=Object.getOwnPropertyDescriptors;var T=Object.getOwnPropertySymbols;var J=Object.prototype.hasOwnProperty,Y=Object.prototype.propertyIsEnumerable;var j=(t,e,a)=>e in t?K(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a,v=(t,e)=>{for(var a in e||(e={}))J.call(e,a)&&j(t,a,e[a]);if(T)for(var a of T(e))Y.call(e,a)&&j(t,a,e[a]);return t},V=(t,e)=>F(t,M(e));import{j as q,a as X,F as W,s as O,l as b,y as C,A as Z,M as H,b as _,N as $,G as ee,S as w,L as z,c as L,u as N,d as te,e as oe}from"./vendor.ae71023e.js";const ne=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))f(i);new MutationObserver(i=>{for(const c of i)if(c.type==="childList")for(const g of c.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&f(g)}).observe(document,{childList:!0,subtree:!0});function a(i){const c={};return i.integrity&&(c.integrity=i.integrity),i.referrerpolicy&&(c.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?c.credentials="include":i.crossorigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function f(i){if(i.ep)return;i.ep=!0;const c=a(i);fetch(i.href,c)}};ne();const{VITE_ORS_API_KEY:re,VITE_GRAPHHOPPER_API_KEY:ie}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},R={OSM_DE:(t,e)=>`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${t.join(",")};${e.join(",")}`,ORS:()=>"https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",GHOP:()=>"https://graphhopper.com/api/1/route"},ae=async(t,e,a)=>{var P,u,E;const f=fetch(R.OSM_DE(t,e)+"?"+new URLSearchParams(v({geometries:"geojson",overview:"full",continue_straight:!1},a))).then(l=>l.json()).catch(l=>{}),i=fetch(R.ORS(),{method:"POST",headers:{"Content-Type":"application/json",Authorization:re},body:JSON.stringify({coordinates:[t,e],instructions:!1})}).then(l=>l.json()).catch(l=>{}),c=new URLSearchParams({vehicle:"foot",key:ie,instructions:!0,points_encoded:!1,point:[...t].reverse().join(",")});c.append("point",[...e].reverse().join(","));const g=fetch(R.GHOP()+"?"+c).then(l=>l.json()).catch(l=>{}),[A,d,h]=await Promise.all([f,i,g]);return console.log({response1:A,response2:d,response3:h}),{type:"FeatureCollection",features:[{type:"Feature",geometry:(P=A==null?void 0:A.routes[0])==null?void 0:P.geometry,properties:{index:0,provider:"osm-de"}},{type:"Feature",geometry:(u=d==null?void 0:d.features[0])==null?void 0:u.geometry,properties:{index:1,provider:"ors"}},{type:"Feature",geometry:(E=h==null?void 0:h.paths[0])==null?void 0:E.points,properties:{index:2,provider:"graphhopper"}}]}},k="mapwalker-";var m={get:t=>{try{return JSON.parse(localStorage.getItem(k+t))}catch{return null}},set:(t,e)=>{try{e?localStorage.setItem(k+t,JSON.stringify(e)):localStorage.removeItem(k+t)}catch{}},del:t=>{try{localStorage.removeItem(k+t)}catch{}}},U="data:image/png;base64,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";const n=q,y=X,Q=W,{VITE_MAPBOX_ACCESS_TOKEN:B}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},ce=2;function se(t){return N(()=>new te(t),{position:t.position}),null}class le{onAdd(){return this._container=document.createElement("div"),this._container.className="mapboxgl-ctrl mapboxgl-ctrl-legend",this._container.innerHTML=`
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
    `,this._container}onRemove(){this._container.remove()}}function de(t){N(()=>new le,{position:t.position})}const D={type:"FeatureCollection",features:[]};function ue(){const t=O(),e=O(),a=O(),[f,i]=b(!1),c=O(),[g,A]=b(D),[d,h]=b(m.get("walk-route")||null);C(()=>{m.set("walk-route",d)},[d]);const[r,P]=b(m.get("destination-marker")||null);C(()=>{m.set("destination-marker",r)},[r]);const[u,E]=b(m.get("marker-pinned")||!1);C(()=>{m.set("marker-pinned",u)},[u]);const l={walkRoute:{layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":["case",["==",["get","provider"],"ors"],"#95378C",["==",["get","provider"],"graphhopper"],"#EB1E4E","#0E90DF"],"line-opacity":["interpolate",["linear"],["zoom"],15,1,18,.5],"line-width":["interpolate",["linear"],["zoom"],15,4,18,14],"line-dasharray":[0,2]}}},p=O(!1),x=Z(o=>{if(p.current&&!u){const{lngLat:s}=o;P(s)}},350),G=O(!1);return y(Q,{children:[n("div",{id:"map",children:y(H,{ref:t,mapboxAccessToken:B,mapStyle:"mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft",initialViewState:m.get("view-state")||{center:[103.8198,1.3521]},boxZoom:!1,renderWorldCopies:!1,maxZoom:21,attributionControl:!1,logoPosition:"top-right",onLoad:o=>{var s;(s=c.current)==null||s.trigger()},onMoveStart:o=>{o.geolocateSource||e.current.hidden||e.current.classList.add("faded")},onMoveEnd:o=>{o.geolocateSource||e.current.hidden||(e.current.classList.remove("faded"),m.set("view-state",o.viewState))},onMove:o=>{var I;const{viewState:s}=o,S=s.zoom<16;e.current.hidden=S,S||(I=a.current)==null||I.jumpTo(V(v({},s),{center:[s.longitude,s.latitude],zoom:s.zoom-ce}))},onClick:o=>{console.log("map click",o),!(o.originalEvent.detail>1)&&(p.current=!0,x(o))},onDblClick:o=>{p.current&&(p.current=!1)},onZoomStart:o=>{p.current&&(p.current=!1)},onDragStart:o=>{p.current&&(p.current=!1)},children:[n(_,{position:"top-right",compact:!0}),n(se,{accessToken:B,marker:!1,clearAndBlurOnSelect:!0,collapsed:!0,position:"top-left"}),n(de,{position:"bottom-left"}),n($,{visualizePitch:!0,position:"top-right"}),n(ee,{ref:c,fitBoundsOptions:{zoom:17},positionOptions:{enableHighAccuracy:!0,timeout:3e3},trackUserLocation:!0,showUserHeading:!0,position:"top-right",onGeolocate:o=>{console.log({onGeolocate:o});const{coords:s}=o;A({type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:[s.longitude,s.latitude]}}]}),window.DeviceOrientationEvent&&!G.current&&typeof DeviceOrientationEvent.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().then(function(S){S==="granted"&&(console.log("granted"),G.current=!0)}).catch(S=>{})}}),n(w,{id:"walk-route",type:"geojson",data:d||D,children:n(z,v({id:"walk-route",type:"line"},l.walkRoute))}),n(L,{anchor:"bottom",draggable:!u,longitude:(r==null?void 0:r.lng)||0,latitude:(r==null?void 0:r.lat)||0,onDragEnd:o=>{const{lngLat:s}=o;P(s)},children:n("img",{src:U,width:"18",hidden:!r})})]})}),n("div",{id:"overview-map",ref:e,hidden:!0,children:y(H,{ref:a,mapboxAccessToken:B,mapStyle:"mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft",initialViewState:{center:[103.8198,1.3521],zoom:11},attributionControl:!1,interactive:!1,maxZoom:16,minZoom:14.5,children:[n(w,{id:"walk-route",type:"geojson",data:d||D,children:n(z,v({id:"walk-route",type:"line"},l.walkRoute))}),y(w,{id:"geolocation",type:"geojson",data:g,children:[n(z,{id:"geolocation-outer",type:"circle",paint:{"circle-radius":5,"circle-color":"#1ea1f1"}}),n(z,{id:"geolocation-inner",type:"circle",paint:{"circle-radius":3,"circle-color":"#1ea1f1","circle-stroke-width":1,"circle-stroke-color":"#fff"}})]}),n(L,{anchor:"bottom",longitude:(r==null?void 0:r.lng)||0,latitude:(r==null?void 0:r.lat)||0,children:n("img",{src:U,width:"10",hidden:!r})})]})}),y("div",{id:"actions",class:f?"disabled":"",children:[f&&n("div",{class:"loading"}),r?y(Q,{children:[n("button",{type:"button",onClick:()=>{P(null),E(!1)},title:"Remove marker",children:"\u274C"}),n("button",{type:"button",onClick:()=>{E(!u)},class:u?"":"faded",title:u?"Unpin marker":"Pin marker",children:"\u{1F4CC}"}),n("button",{type:"button",onClick:()=>{var o;(o=t.current)==null||o.flyTo({center:r})},title:"Fly to marker",children:"\u{1F50D}"}),n("button",{type:"button",onClick:async()=>{i(!0),console.log({geolocationGeoJSON:g,destinationMarker:r});const o=await ae(g.features[0].geometry.coordinates,[r.lng,r.lat]);h(o),i(!1),E(!0)},title:"Generate route to marker",children:"\u{1F503}"})]}):!!d&&n("button",{type:"button",onClick:()=>{h(null)},title:"Clear route",children:"\u{1F5D1}\uFE0F"})]})]})}oe(n(ue,{}),document.getElementById("app"));

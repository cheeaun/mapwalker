var ce=Object.defineProperty,le=Object.defineProperties;var se=Object.getOwnPropertyDescriptors;var Z=Object.getOwnPropertySymbols;var de=Object.prototype.hasOwnProperty,ue=Object.prototype.propertyIsEnumerable;var q=(o,r,c)=>r in o?ce(o,r,{enumerable:!0,configurable:!0,writable:!0,value:c}):o[r]=c,I=(o,r)=>{for(var c in r||(r={}))de.call(r,c)&&q(o,c,r[c]);if(Z)for(var c of Z(r))ue.call(r,c)&&q(o,c,r[c]);return o},H=(o,r)=>le(o,se(r));import{j as Ae,a as he,F as pe,s as S,l as b,y as G,A as ge,d as me,M as N,b as fe,N as ve,G as ke,S as K,L as x,c as _,J as T,p as we,h as Ee,m as be,u as Pe,e as Ce,f as Se}from"./vendor.ca7819ad.js";const Oe=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))O(l);new MutationObserver(l=>{for(const d of l)if(d.type==="childList")for(const f of d.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&O(f)}).observe(document,{childList:!0,subtree:!0});function c(l){const d={};return l.integrity&&(d.integrity=l.integrity),l.referrerpolicy&&(d.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?d.credentials="include":l.crossorigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function O(l){if(l.ep)return;l.ep=!0;const d=c(l);fetch(l.href,d)}};Oe();const{VITE_ORS_API_KEY:ye,VITE_GRAPHHOPPER_API_KEY:Be}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},J={OSM_DE:(o,r)=>`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${o.join(",")};${r.join(",")}`,ORS:()=>"https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",GHOP:()=>"https://graphhopper.com/api/1/route"},De=async(o,r,c)=>{var P,v,y,p,V,R,z,B;const O=fetch(J.OSM_DE(o,r)+"?"+new URLSearchParams(I({geometries:"geojson",overview:"full",continue_straight:!1},c))).then(k=>k.json()).catch(k=>{}),l=fetch(J.ORS(),{method:"POST",headers:{"Content-Type":"application/json",Authorization:ye},body:JSON.stringify({coordinates:[o,r],instructions:!1})}).then(k=>k.json()).catch(k=>{}),d=new URLSearchParams({vehicle:"foot",key:Be,instructions:!0,points_encoded:!1,point:[...o].reverse().join(",")});d.append("point",[...r].reverse().join(","));const f=fetch(J.GHOP()+"?"+d).then(k=>k.json()).catch(k=>{}),[w,s,h]=await Promise.all([O,l,f]);return console.log({response1:w,response2:s,response3:h}),{type:"FeatureCollection",features:[{type:"Feature",geometry:(P=w==null?void 0:w.routes[0])==null?void 0:P.geometry,properties:{index:0,provider:"osm-de",distance:(v=w==null?void 0:w.routes[0])==null?void 0:v.distance}},{type:"Feature",geometry:(y=s==null?void 0:s.features[0])==null?void 0:y.geometry,properties:{index:1,provider:"ors",distance:(R=(V=(p=s==null?void 0:s.features[0])==null?void 0:p.properties)==null?void 0:V.summary)==null?void 0:R.distance}},{type:"Feature",geometry:(z=h==null?void 0:h.paths[0])==null?void 0:z.points,properties:{index:2,provider:"graphhopper",distance:(B=h==null?void 0:h.paths[0])==null?void 0:B.distance}}]}},F="mapwalker-";var m={get:o=>{try{return JSON.parse(localStorage.getItem(F+o))}catch{return null}},set:(o,r)=>{try{r?localStorage.setItem(F+o,JSON.stringify(r)):localStorage.removeItem(F+o)}catch{}},del:o=>{try{localStorage.removeItem(F+o)}catch{}}},$="data:image/png;base64,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",ee="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAS1BMVEVHcEz////////////////////////////////r9fx0wOw9puUOkN8xn+OTzfDY7fklmuI4pOQZld+UzfB0vuz///83pOT///91vuyKtLkHAAAAGXRSTlMAMGunv5t3GAzD3+//89fH9/H7199s8XjfKy/6XAAAAIpJREFUeAFlj4WBgDAMAEM5oJLitv+kX3u/ajyRTGd6GMZJKtbQMLbIA84H1TjDkDWGZdXCumBEJkjyum17uh2djByqwSdS2MklA1F3X1g10AuoblVxq8J/RU/QtSp2jQxycX4nPXikw62q+7bl4pDav342dtXWOWIKex1DHeaicVmpTM8A/dVJ4gNfKwijr/kcwwAAAABJRU5ErkJggg==",te="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEz////////////////////////////////////////46vj46vfz1fDz1e/djtXdjdXTbcnTbMnCM7TCM7PALLC/LLC9Ja+9Ja66GKq6GKm2DKWzAKGsmQwTAAAAHHRSTlMADBgwa2x3eJunv8PDx8fX19/f7+/x8fPz9/f7XCOcjAAAAJJJREFUeAEFwQFu3DAMADBKsu+uQLH/P7TY0jiWRwZUzND9NIKoF+DeR4h3xiu/rGvp3zNU1ndhzv2jnsq3P6XXzsh5V9fM+XHd3atH9j6ZPs6GvZWRabqBx0ckAEAelwG8PDofWyVkuJzRVufXuY3St1VHPjNijNQ/vXY5da4d5d/6u3sJYkzAeo6AnJHO0xv/AX/8TAjqcSv9AAAAAElFTkSuQmCC",oe="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEzuSnH////72+L////////////zfpn////sM17rKFbuRWv////////////1m7DuPmfuS3HuRGv87PD97PDzfpruRGzzfZn////////1m6/tPmfrHk4InpgzAAAAHHRSTlMA72vHDJts37/3+/EYMKfX8+/xw8Pf8d93eNfz3D4s5QAAAI9JREFUeF5ljssWgjAUA28LLekTEBDQ/P93yqUuPMfZzWwSUYqtgDuyNHqLL7a/3WHZDTmNgNNi0QXehA5WJAOXh5QiGVYUOfAi5+FiJnd4cZgYh5tAgyoA+WjhSQL/ocIwtBD5hhOPjTTqhhxxSsEayJiSjgNZxP8e8+06xok026LXtXh88epKPh1QfVH5APz1C0cNUS3tAAAAAElFTkSuQmCC",ze="data:image/png;base64,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";const e=Ae,a=he,U=pe,{VITE_MAPBOX_ACCESS_TOKEN:Y,DEV:Ie}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},Re=2;function Me(o){return Pe(()=>new Ce(o),{position:o.position}),null}const X={type:"FeatureCollection",features:[]},re={walkRoute:{layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":["case",["==",["get","provider"],"ors"],"#95378C",["==",["get","provider"],"graphhopper"],"#EB1E4E","#0E90DF"],"line-opacity":["interpolate",["linear"],["zoom"],15,1,18,.5],"line-width":["interpolate",["linear"],["zoom"],15,4,18,14],"line-dasharray":[0,2]}},walkRoute2:{layout:{"symbol-placement":"line","symbol-spacing":["interpolate",["linear"],["zoom"],10,1,15,16,19,32],"icon-allow-overlap":!0,"icon-padding":0,"icon-size":["interpolate",["linear"],["zoom"],15,.4,18,.75],"icon-image":["case",["==",["get","provider"],"ors"],"walk-dot-purple",["==",["get","provider"],"graphhopper"],"walk-dot-red","walk-dot-blue"]}}};function Q(o){const r=o/1.33*1e3;return`${we(o).humanize()} (${Ee(r,{units:["h","m"],round:!0})})`}function He(){const o=S(),r=S(),c=S(),[O,l]=b(!1),d=S(),[f,w]=b(X),[s,h]=b(m.get("walk-route")||null);G(()=>{m.set("walk-route",s)},[s]);const[n,P]=b(m.get("destination-marker")||null);G(()=>{m.set("destination-marker",n)},[n]);const[v,y]=b(m.get("marker-pinned")||!1);G(()=>{m.set("marker-pinned",v)},[v]);const p=S(!1),R=ge(t=>{if(p.current&&!v){const{lngLat:i}=t;P(i)}},350),z=S(!1),[B,k]=b(null),[ne,W]=b(!1),[ie,C]=b(!1),[ae,L]=b(!m.get("not-first-time")),j=S(n),M=S(s),D=me(()=>{var i;const t={};return(i=s==null?void 0:s.features)==null||i.forEach(u=>{const{provider:E,distance:A}=u.properties;t[E]=A}),t},[M]);return a(U,{children:[e("div",{id:"map",children:a(N,{ref:o,mapboxAccessToken:Y,mapStyle:`mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle${Ie?"/draft":""}`,initialViewState:m.get("view-state")||{center:[103.8198,1.3521]},boxZoom:!1,renderWorldCopies:!1,maxZoom:21,attributionControl:!1,logoPosition:"top-right",onLoad:t=>{var u,E;(u=d.current)==null||u.trigger();const{layers:i}=o.current.getStyle();k((E=i.find(A=>{var g;return A.type==="symbol"&&((g=A==null?void 0:A.layout)==null?void 0:g["text-field"])}))==null?void 0:E.id),o.current.loadImage(ee,(A,g)=>{A||(o.current.addImage("walk-dot-blue",g),c.current.addImage("walk-dot-blue",g))}),o.current.loadImage(te,(A,g)=>{A||(o.current.addImage("walk-dot-purple",g),c.current.addImage("walk-dot-purple",g))}),o.current.loadImage(oe,(A,g)=>{A||(o.current.addImage("walk-dot-red",g),c.current.addImage("walk-dot-red",g))})},onMoveStart:t=>{t.geolocateSource||r.current.hidden||r.current.classList.add("faded")},onMoveEnd:t=>{t.geolocateSource||r.current.hidden||r.current.classList.remove("faded")},onIdle:t=>{r.current.hidden||(r.current.classList.remove("faded"),m.set("view-state",t.viewState))},onMove:t=>{var E;const{viewState:i}=t,u=i.zoom<16;r.current.hidden=u,u||(E=c.current)==null||E.jumpTo(H(I({},i),{center:[i.longitude,i.latitude],zoom:i.zoom-Re}))},onClick:t=>{console.log("map click",t),!(t.originalEvent.detail>1)&&(p.current=!0,R(t))},onDblClick:t=>{p.current&&(p.current=!1)},onZoomStart:t=>{p.current&&(p.current=!1)},onZoomEnd:t=>{const{zoom:i}=t.viewState;console.log("zoom",i)},onDragStart:t=>{p.current&&(p.current=!1)},children:[e(fe,{position:"top-right",compact:!0}),e(Me,{accessToken:Y,marker:!1,clearAndBlurOnSelect:!0,collapsed:!0,position:"top-left"}),e(ve,{visualizePitch:!0,position:"top-right"}),e(ke,{ref:d,fitBoundsOptions:{zoom:17},positionOptions:{enableHighAccuracy:!0,timeout:3e3},trackUserLocation:!0,showUserHeading:!0,position:"top-right",onGeolocate:t=>{console.log({onGeolocate:t});const{coords:i}=t;w({type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:[i.longitude,i.latitude]}}]}),window.DeviceOrientationEvent&&!z.current&&typeof DeviceOrientationEvent.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().then(function(u){u==="granted"&&(console.log("granted"),z.current=!0)}).catch(u=>{})},onError:t=>{alert(`${t.code}: ${t.message}`)}}),e(K,{id:"walk-route",type:"geojson",data:s||X,children:e(x,H(I({id:"walk-route",type:"symbol"},re.walkRoute2),{beforeId:B}))}),e(_,{anchor:"bottom",draggable:!v,longitude:(n==null?void 0:n.lng)||0,latitude:(n==null?void 0:n.lat)||0,onDragEnd:t=>{const{lngLat:i}=t;P(i)},onClick:t=>{t.originalEvent.stopPropagation(),C(!0)},children:e("img",{src:$,width:"18",hidden:!n})})]})}),e("div",{id:"overview-map",ref:r,hidden:!0,children:a(N,{ref:c,mapboxAccessToken:Y,mapStyle:"mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft",initialViewState:{center:[103.8198,1.3521],zoom:11},attributionControl:!1,interactive:!1,maxZoom:16,minZoom:14.5,children:[e(K,{id:"walk-route",type:"geojson",data:s||X,children:e(x,H(I({id:"walk-route",type:"symbol"},re.walkRoute2),{beforeId:B}))}),a(K,{id:"geolocation",type:"geojson",data:f,children:[e(x,{id:"geolocation-outer",type:"circle",paint:{"circle-radius":12,"circle-color":"#1ea1f1","circle-opacity":.3},beforeId:B}),e(x,{id:"geolocation-inner",type:"circle",paint:{"circle-radius":3,"circle-color":"#1ea1f1","circle-stroke-width":2,"circle-stroke-color":"#fff"}})]}),e(_,{anchor:"bottom",longitude:(n==null?void 0:n.lng)||0,latitude:(n==null?void 0:n.lat)||0,children:e("img",{src:$,width:"10",hidden:!n})})]})}),a("div",{id:"actions",children:[O&&e("div",{class:"loading"}),e("button",{type:"button",onClick:()=>{L(!0)},title:"About",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m11 7h2v2h-2zm0 4h2v6h-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"})})}),e("button",{type:"button",onClick:()=>{W(!0)},title:"Legend",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zm-4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm13.1-12h-16.2c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9v-16.2c0-.5-.5-.9-.9-.9zm-1.1 16h-14v-14h14z"})})}),e("button",{type:"button",onClick:()=>{C(!0)},title:"Actions",disabled:O,children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z"})})})]}),e(T,{open:ae,onDismiss:()=>{L(!1),m.set("not-first-time",!0)},children:a("div",{class:"bottom-sheet-container",children:[e("img",{alt:"",src:ze,width:"96",height:"96",style:{borderRadius:24,boxShadow:"0 1px 2px #ccc",float:"right",marginLeft:10}}),e("h1",{children:"MapWalker"}),e("p",{children:"MapWalker is a very opinionated map-based walking route planner."}),a("p",{children:["The map tiles and styles escalate ",e("b",{children:"all"})," walking paths and roads to the surface. They are color-coded based on their types, such as stairs, bridges, tunnels, etc."]}),e("p",{children:"Once a marker is placed, walk routes can be generated from current location to the marker. Up to 3 walk routes will be generated from different routing engines, overlayed on the map simultaneuously for comparison as each has its own pros and cons."}),a("p",{children:[e("a",{href:"https://github.com/cheeaun/mapwalker",target:"_blank",children:"Built"})," ","by"," ",e("a",{href:"https://twitter.com/cheeaun",target:"_blank",children:"@cheeaun"}),"."]}),e("button",{type:"button",class:"block",onClick:()=>{L(!1),m.set("not-first-time",!0)},children:"\u{1F6B6} Start walking now!"})]})}),e(T,{open:ne,onDismiss:()=>{W(!1)},children:a("div",{class:"bottom-sheet-container legend-sheet-container",children:[e("h2",{children:"Map Legend"}),a("dl",{children:[e("dt",{children:e("span",{class:"path"})}),e("dd",{children:"Foot paths, cycling paths"}),e("dt",{children:e("span",{class:"bridge"})}),e("dd",{children:"Bridges"}),e("dt",{children:e("span",{class:"stairs"})}),e("dd",{children:"Stairs"}),e("dt",{children:e("span",{class:"tunnel"})}),e("dd",{children:"Tunnels, underground paths, under bridge"}),e("dt",{children:e("img",{src:ee,width:"10",height:"10"})}),a("dd",{children:["Route from OpenStreetMap",D["osm-de"]&&` - ${Q(D["osm-de"])}`]}),e("dt",{children:e("img",{src:te,width:"10",height:"10"})}),a("dd",{children:["Route from OpenRouteService",D.ors&&` - ${Q(D.ors)}`]}),e("dt",{children:e("img",{src:oe,width:"10",height:"10"})}),a("dd",{children:["Route from GraphHopper",D.graphhopper&&` - ${Q(D.graphhopper)}`]})]})]})}),e(T,{open:ie,onDismiss:()=>{C(!1)},children:e("div",{class:"bottom-sheet-container marker-sheet-container",children:n?a(U,{children:[a("button",{type:"button",onClick:()=>{P(null),j.current=n,y(!1)},children:[e("span",{children:"\u274C"})," Remove marker"]}),a("button",{type:"button",onClick:()=>{y(!v),C(!1)},class:v?"":"faded",children:[e("span",{children:"\u{1F4CC}"})," ",v?"Unpin marker":"Pin marker"]}),!!s&&a("button",{type:"button",onClick:()=>{var i;const t=new be.LngLatBounds;s.features.forEach(u=>{u.geometry.coordinates.forEach(E=>{t.extend(E)})}),(i=o.current)==null||i.fitBounds(t,{padding:100}),C(!1)},children:[e("span",{children:"\u{1F52D}"})," Zoom whole route"]}),a("button",{type:"button",onClick:()=>{var t;(t=o.current)==null||t.flyTo({center:n}),C(!1)},children:[e("span",{children:"\u{1F50D}"})," Fly to marker"]}),a("button",{type:"button",onClick:async()=>{if(l(!0),C(!1),console.log({geolocationGeoJSON:f,destinationMarker:n}),!f){alert("Please allow location access to generate routes");return}const t=await De(f.features[0].geometry.coordinates,[n.lng,n.lat]);h(t),l(!1),y(!0)},children:[e("span",{children:"\u{1F503}"})," Generate walk routes to marker"]})]}):a(U,{children:[!n&&a("button",{type:"button",onClick:()=>{var i;const t=(i=o.current)==null?void 0:i.getCenter();P({lat:t.lat,lng:t.lng}),C(!1)},children:[e("span",{children:"\u{1F4CC}"})," Place marker on map"]}),!n&&j.current&&a("button",{type:"button",onClick:()=>{P(j.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore marker"]}),s?e("button",{type:"button",onClick:()=>{M.current=s,h(null)},children:"\u{1F5D1}\uFE0F Clear route"}):M.current&&a("button",{type:"button",onClick:()=>{h(M.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore route"]})]})})})]})}Se(e(He,{}),document.getElementById("app"));

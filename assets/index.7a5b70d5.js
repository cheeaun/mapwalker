var ce=Object.defineProperty,le=Object.defineProperties;var se=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var de=Object.prototype.hasOwnProperty,ue=Object.prototype.propertyIsEnumerable;var N=(o,r,c)=>r in o?ce(o,r,{enumerable:!0,configurable:!0,writable:!0,value:c}):o[r]=c,D=(o,r)=>{for(var c in r||(r={}))de.call(r,c)&&N(o,c,r[c]);if(q)for(var c of q(r))ue.call(r,c)&&N(o,c,r[c]);return o},j=(o,r)=>le(o,se(r));import{j as he,a as pe,F as Ae,s as C,l as w,y as V,A as me,d as ge,M as Q,b as fe,N as ve,G as be,S as J,L as x,c as _,J as K,p as ke,h as Se,m as we,u as ye,e as Ee,f as Ce}from"./vendor.ca7819ad.js";const Oe=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))O(l);new MutationObserver(l=>{for(const d of l)if(d.type==="childList")for(const f of d.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&O(f)}).observe(document,{childList:!0,subtree:!0});function c(l){const d={};return l.integrity&&(d.integrity=l.integrity),l.referrerpolicy&&(d.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?d.credentials="include":l.crossorigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function O(l){if(l.ep)return;l.ep=!0;const d=c(l);fetch(l.href,d)}};Oe();const{VITE_ORS_API_KEY:Pe,VITE_GRAPHHOPPER_API_KEY:Re}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},T={OSM_DE:(o,r)=>`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${o.join(",")};${r.join(",")}`,ORS:()=>"https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",GHOP:()=>"https://graphhopper.com/api/1/route"},Ie=async(o,r,c)=>{var y,v,P,A,M,B,z,R;const O=fetch(T.OSM_DE(o,r)+"?"+new URLSearchParams(D({geometries:"geojson",overview:"full",continue_straight:!1},c))).then(b=>b.json()).catch(b=>{}),l=fetch(T.ORS(),{method:"POST",headers:{"Content-Type":"application/json",Authorization:Pe},body:JSON.stringify({coordinates:[o,r],instructions:!1})}).then(b=>b.json()).catch(b=>{}),d=new URLSearchParams({vehicle:"foot",key:Re,instructions:!0,points_encoded:!1,point:[...o].reverse().join(",")});d.append("point",[...r].reverse().join(","));const f=fetch(T.GHOP()+"?"+d).then(b=>b.json()).catch(b=>{}),[k,s,p]=await Promise.all([O,l,f]);return console.log({response1:k,response2:s,response3:p}),{type:"FeatureCollection",features:[{type:"Feature",geometry:(y=k==null?void 0:k.routes[0])==null?void 0:y.geometry,properties:{index:0,provider:"osm-de",distance:(v=k==null?void 0:k.routes[0])==null?void 0:v.distance}},{type:"Feature",geometry:(P=s==null?void 0:s.features[0])==null?void 0:P.geometry,properties:{index:1,provider:"ors",distance:(B=(M=(A=s==null?void 0:s.features[0])==null?void 0:A.properties)==null?void 0:M.summary)==null?void 0:B.distance}},{type:"Feature",geometry:(z=p==null?void 0:p.paths[0])==null?void 0:z.points,properties:{index:2,provider:"graphhopper",distance:(R=p==null?void 0:p.paths[0])==null?void 0:R.distance}}]}},F="mapwalker-";var g={get:o=>{try{return JSON.parse(localStorage.getItem(F+o))}catch{return null}},set:(o,r)=>{try{r?localStorage.setItem(F+o,JSON.stringify(r)):localStorage.removeItem(F+o)}catch{}},del:o=>{try{localStorage.removeItem(F+o)}catch{}}},$="data:image/png;base64,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",ee="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAS1BMVEVHcEz////////////////////////////////r9fx0wOw9puUOkN8xn+OTzfDY7fklmuI4pOQZld+UzfB0vuz///83pOT///91vuyKtLkHAAAAGXRSTlMAMGunv5t3GAzD3+//89fH9/H7199s8XjfKy/6XAAAAIpJREFUeAFlj4WBgDAMAEM5oJLitv+kX3u/ajyRTGd6GMZJKtbQMLbIA84H1TjDkDWGZdXCumBEJkjyum17uh2djByqwSdS2MklA1F3X1g10AuoblVxq8J/RU/QtSp2jQxycX4nPXikw62q+7bl4pDav342dtXWOWIKex1DHeaicVmpTM8A/dVJ4gNfKwijr/kcwwAAAABJRU5ErkJggg==",te="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEz////////////////////////////////////////46vj46vfz1fDz1e/djtXdjdXTbcnTbMnCM7TCM7PALLC/LLC9Ja+9Ja66GKq6GKm2DKWzAKGsmQwTAAAAHHRSTlMADBgwa2x3eJunv8PDx8fX19/f7+/x8fPz9/f7XCOcjAAAAJJJREFUeAEFwQFu3DAMADBKsu+uQLH/P7TY0jiWRwZUzND9NIKoF+DeR4h3xiu/rGvp3zNU1ndhzv2jnsq3P6XXzsh5V9fM+XHd3atH9j6ZPs6GvZWRabqBx0ckAEAelwG8PDofWyVkuJzRVufXuY3St1VHPjNijNQ/vXY5da4d5d/6u3sJYkzAeo6AnJHO0xv/AX/8TAjqcSv9AAAAAElFTkSuQmCC",oe="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEzuSnH////72+L////////////zfpn////sM17rKFbuRWv////////////1m7DuPmfuS3HuRGv87PD97PDzfpruRGzzfZn////////1m6/tPmfrHk4InpgzAAAAHHRSTlMA72vHDJts37/3+/EYMKfX8+/xw8Pf8d93eNfz3D4s5QAAAI9JREFUeF5ljssWgjAUA28LLekTEBDQ/P93yqUuPMfZzWwSUYqtgDuyNHqLL7a/3WHZDTmNgNNi0QXehA5WJAOXh5QiGVYUOfAi5+FiJnd4cZgYh5tAgyoA+WjhSQL/ocIwtBD5hhOPjTTqhhxxSsEayJiSjgNZxP8e8+06xok026LXtXh88epKPh1QfVH5APz1C0cNUS3tAAAAAElFTkSuQmCC";const e=he,i=pe,U=Ae,{VITE_MAPBOX_ACCESS_TOKEN:X,DEV:ze}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},De=2;function Be(o){return ye(()=>new Ee(o),{position:o.position}),null}const W={type:"FeatureCollection",features:[]},re={walkRoute:{layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":["case",["==",["get","provider"],"ors"],"#95378C",["==",["get","provider"],"graphhopper"],"#EB1E4E","#0E90DF"],"line-opacity":["interpolate",["linear"],["zoom"],15,1,18,.5],"line-width":["interpolate",["linear"],["zoom"],15,4,18,14],"line-dasharray":[0,2]}},walkRoute2:{layout:{"symbol-placement":"line","symbol-spacing":["interpolate",["linear"],["zoom"],10,1,15,20,19,24],"icon-allow-overlap":!0,"icon-padding":0,"icon-size":["interpolate",["linear"],["zoom"],10,.5,18,.75],"icon-image":["case",["==",["get","provider"],"ors"],"walk-dot-purple",["==",["get","provider"],"graphhopper"],"walk-dot-red","walk-dot-blue"]}}};function Z(o){const r=o/1.33*1e3;return`${ke(o).humanize()} (${Se(r,{units:["h","m"],round:!0})})`}function He(){const o=C(),r=C(),c=C(),[O,l]=w(!1),d=C(),[f,k]=w(W),[s,p]=w(g.get("walk-route")||null);V(()=>{g.set("walk-route",s)},[s]);const[n,y]=w(g.get("destination-marker")||null);V(()=>{g.set("destination-marker",n)},[n]);const[v,P]=w(g.get("marker-pinned")||!1);V(()=>{g.set("marker-pinned",v)},[v]);const A=C(!1),B=me(t=>{if(A.current&&!v){const{lngLat:a}=t;y(a)}},350),z=C(!1),[R,b]=w(null),[ne,Y]=w(!1),[ae,E]=w(!1),[ie,L]=w(!g.get("not-first-time")),G=C(n),H=C(s),I=ge(()=>{var a;const t={};return(a=s==null?void 0:s.features)==null||a.forEach(u=>{const{provider:S,distance:h}=u.properties;t[S]=h}),t},[H]);return i(U,{children:[e("div",{id:"map",children:i(Q,{ref:o,mapboxAccessToken:X,mapStyle:`mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle${ze?"/draft":""}`,initialViewState:g.get("view-state")||{center:[103.8198,1.3521]},boxZoom:!1,renderWorldCopies:!1,maxZoom:21,attributionControl:!1,logoPosition:"top-right",onLoad:t=>{var u,S;(u=d.current)==null||u.trigger();const{layers:a}=o.current.getStyle();b((S=a.find(h=>{var m;return h.type==="symbol"&&((m=h==null?void 0:h.layout)==null?void 0:m["text-field"])}))==null?void 0:S.id),o.current.loadImage(ee,(h,m)=>{h||(o.current.addImage("walk-dot-blue",m),c.current.addImage("walk-dot-blue",m))}),o.current.loadImage(te,(h,m)=>{h||(o.current.addImage("walk-dot-purple",m),c.current.addImage("walk-dot-purple",m))}),o.current.loadImage(oe,(h,m)=>{h||(o.current.addImage("walk-dot-red",m),c.current.addImage("walk-dot-red",m))})},onMoveStart:t=>{t.geolocateSource||r.current.hidden||r.current.classList.add("faded")},onMoveEnd:t=>{t.geolocateSource||r.current.hidden||r.current.classList.remove("faded")},onIdle:t=>{r.current.hidden||(r.current.classList.remove("faded"),g.set("view-state",t.viewState))},onMove:t=>{var S;const{viewState:a}=t,u=a.zoom<16;r.current.hidden=u,u||(S=c.current)==null||S.jumpTo(j(D({},a),{center:[a.longitude,a.latitude],zoom:a.zoom-De}))},onClick:t=>{console.log("map click",t),!(t.originalEvent.detail>1)&&(A.current=!0,B(t))},onDblClick:t=>{A.current&&(A.current=!1)},onZoomStart:t=>{A.current&&(A.current=!1)},onZoomEnd:t=>{const{zoom:a}=t.viewState;console.log("zoom",a)},onDragStart:t=>{A.current&&(A.current=!1)},children:[e(fe,{position:"top-right",compact:!0}),e(Be,{accessToken:X,marker:!1,clearAndBlurOnSelect:!0,collapsed:!0,position:"top-left"}),e(ve,{visualizePitch:!0,position:"top-right"}),e(be,{ref:d,fitBoundsOptions:{zoom:17},positionOptions:{enableHighAccuracy:!0,timeout:3e3},trackUserLocation:!0,showUserHeading:!0,position:"top-right",onGeolocate:t=>{console.log({onGeolocate:t});const{coords:a}=t;k({type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:[a.longitude,a.latitude]}}]}),window.DeviceOrientationEvent&&!z.current&&typeof DeviceOrientationEvent.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().then(function(u){u==="granted"&&(console.log("granted"),z.current=!0)}).catch(u=>{})},onError:t=>{alert(`${t.code}: ${t.message}`)}}),e(J,{id:"walk-route",type:"geojson",data:s||W,children:e(x,j(D({id:"walk-route",type:"symbol"},re.walkRoute2),{beforeId:R}))}),e(_,{anchor:"bottom",draggable:!v,longitude:(n==null?void 0:n.lng)||0,latitude:(n==null?void 0:n.lat)||0,onDragEnd:t=>{const{lngLat:a}=t;y(a)},onClick:t=>{t.originalEvent.stopPropagation(),E(!0)},children:e("img",{src:$,width:"18",hidden:!n})})]})}),e("div",{id:"overview-map",ref:r,hidden:!0,children:i(Q,{ref:c,mapboxAccessToken:X,mapStyle:"mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle/draft",initialViewState:{center:[103.8198,1.3521],zoom:11},attributionControl:!1,interactive:!1,maxZoom:16,minZoom:14.5,children:[e(J,{id:"walk-route",type:"geojson",data:s||W,children:e(x,j(D({id:"walk-route",type:"symbol"},re.walkRoute2),{beforeId:R}))}),i(J,{id:"geolocation",type:"geojson",data:f,children:[e(x,{id:"geolocation-outer",type:"circle",paint:{"circle-radius":12,"circle-color":"#1ea1f1","circle-opacity":.3},beforeId:R}),e(x,{id:"geolocation-inner",type:"circle",paint:{"circle-radius":3,"circle-color":"#1ea1f1","circle-stroke-width":2,"circle-stroke-color":"#fff"}})]}),e(_,{anchor:"bottom",longitude:(n==null?void 0:n.lng)||0,latitude:(n==null?void 0:n.lat)||0,children:e("img",{src:$,width:"10",hidden:!n})})]})}),i("div",{id:"actions",children:[O&&e("div",{class:"loading"}),e("button",{type:"button",onClick:()=>{L(!0)},title:"About",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m11 7h2v2h-2zm0 4h2v6h-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"})})}),e("button",{type:"button",onClick:()=>{Y(!0)},title:"Legend",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zm-4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm13.1-12h-16.2c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9v-16.2c0-.5-.5-.9-.9-.9zm-1.1 16h-14v-14h14z"})})}),e("button",{type:"button",onClick:()=>{E(!0)},title:"Actions",disabled:O,children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{d:"m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z"})})})]}),e(K,{open:ie,onDismiss:()=>{L(!1),g.set("not-first-time",!0)},children:i("div",{class:"bottom-sheet-container",children:[e("h2",{children:"MapWalker"}),e("p",{children:"MapWalker is a very opinionated map-based walking route planner."}),i("p",{children:["The map tiles and styles escalate ",e("b",{children:"all"})," walking paths and roads to the surface. They are color-coded based on their types, such as stairs, bridges, tunnels, etc."]}),e("p",{children:"Once a marker is placed, walk routes can be generated from current location to the marker. Up to 3 walk routes will be generated from different routing engines, overlayed on the map simultaneuously for comparison as each has its own pros and cons."}),i("p",{children:[e("a",{href:"https://github.com/cheeaun/mapwalker",target:"_blank",children:"Built"})," ","by"," ",e("a",{href:"https://twitter.com/cheeaun",target:"_blank",children:"@cheeaun"}),"."]}),e("button",{type:"button",class:"block",onClick:()=>{L(!1),g.set("not-first-time",!0)},children:"\u{1F6B6} Start walking now!"})]})}),e(K,{open:ne,onDismiss:()=>{Y(!1)},children:i("div",{class:"bottom-sheet-container legend-sheet-container",children:[e("h2",{children:"Map Legend"}),i("dl",{children:[e("dt",{children:e("span",{class:"path"})}),e("dd",{children:"Foot paths, cycling paths"}),e("dt",{children:e("span",{class:"bridge"})}),e("dd",{children:"Bridges"}),e("dt",{children:e("span",{class:"stairs"})}),e("dd",{children:"Stairs"}),e("dt",{children:e("span",{class:"tunnel"})}),e("dd",{children:"Tunnels, underground paths, under bridge"}),e("dt",{children:e("img",{src:ee,width:"10",height:"10"})}),i("dd",{children:["Route from OpenStreetMap",I["osm-de"]&&` - ${Z(I["osm-de"])}`]}),e("dt",{children:e("img",{src:te,width:"10",height:"10"})}),i("dd",{children:["Route from OpenRouteService",I.ors&&` - ${Z(I.ors)}`]}),e("dt",{children:e("img",{src:oe,width:"10",height:"10"})}),i("dd",{children:["Route from GraphHopper",I.graphhopper&&` - ${Z(I.graphhopper)}`]})]})]})}),e(K,{open:ae,onDismiss:()=>{E(!1)},children:e("div",{class:"bottom-sheet-container marker-sheet-container",children:n?i(U,{children:[i("button",{type:"button",onClick:()=>{y(null),G.current=n,P(!1)},children:[e("span",{children:"\u274C"})," Remove marker"]}),i("button",{type:"button",onClick:()=>{P(!v),E(!1)},class:v?"":"faded",children:[e("span",{children:"\u{1F4CC}"})," ",v?"Unpin marker":"Pin marker"]}),!!s&&i("button",{type:"button",onClick:()=>{var a;const t=new we.LngLatBounds;s.features.forEach(u=>{u.geometry.coordinates.forEach(S=>{t.extend(S)})}),(a=o.current)==null||a.fitBounds(t,{padding:100}),E(!1)},children:[e("span",{children:"\u{1F52D}"})," Zoom whole route"]}),i("button",{type:"button",onClick:()=>{var t;(t=o.current)==null||t.flyTo({center:n}),E(!1)},children:[e("span",{children:"\u{1F50D}"})," Fly to marker"]}),i("button",{type:"button",onClick:async()=>{if(l(!0),E(!1),console.log({geolocationGeoJSON:f,destinationMarker:n}),!f){alert("Please allow location access to generate routes");return}const t=await Ie(f.features[0].geometry.coordinates,[n.lng,n.lat]);p(t),l(!1),P(!0)},children:[e("span",{children:"\u{1F503}"})," Generate walk routes to marker"]})]}):i(U,{children:[!n&&i("button",{type:"button",onClick:()=>{var a;const t=(a=o.current)==null?void 0:a.getCenter();y({lat:t.lat,lng:t.lng}),E(!1)},children:[e("span",{children:"\u{1F4CC}"})," Place marker on map"]}),!n&&G.current&&i("button",{type:"button",onClick:()=>{y(G.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore marker"]}),s?e("button",{type:"button",onClick:()=>{H.current=s,p(null)},children:"\u{1F5D1}\uFE0F Clear route"}):H.current&&i("button",{type:"button",onClick:()=>{p(H.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore route"]})]})})})]})}Ce(e(He,{}),document.getElementById("app"));

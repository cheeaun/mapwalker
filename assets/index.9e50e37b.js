var Ze=Object.defineProperty,Ne=Object.defineProperties;var _e=Object.getOwnPropertyDescriptors;var Oe=Object.getOwnPropertySymbols;var $e=Object.prototype.hasOwnProperty,et=Object.prototype.propertyIsEnumerable;var ze=(a,r,s)=>r in a?Ze(a,r,{enumerable:!0,configurable:!0,writable:!0,value:s}):a[r]=s,T=(a,r)=>{for(var s in r||(r={}))$e.call(r,s)&&ze(a,s,r[s]);if(Oe)for(var s of Oe(r))et.call(r,s)&&ze(a,s,r[s]);return a},Y=(a,r)=>Ne(a,_e(r));import{j as tt,a as nt,F as rt,s as w,l as k,y as I,A as ot,d as De,h as it,b as R,u as Ie,c as at,m as st,p as ct,e as lt,f as dt,M as Re,g as ut,S as Be,L as Me,i as ae,k as ht,G as At,N as mt,J as q,n as pt,o as gt}from"./vendor.85af7e45.js";const ft=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))h(d);new MutationObserver(d=>{for(const p of d)if(p.type==="childList")for(const f of p.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&h(f)}).observe(document,{childList:!0,subtree:!0});function s(d){const p={};return d.integrity&&(p.integrity=d.integrity),d.referrerpolicy&&(p.referrerPolicy=d.referrerpolicy),d.crossorigin==="use-credentials"?p.credentials="include":d.crossorigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function h(d){if(d.ep)return;d.ep=!0;const p=s(d);fetch(d.href,p)}};ft();const vt="modulepreload",xe={},kt="./",bt=function(r,s){return!s||s.length===0?r():Promise.all(s.map(h=>{if(h=`${kt}${h}`,h in xe)return;xe[h]=!0;const d=h.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${p}`))return;const f=document.createElement("link");if(f.rel=d?"stylesheet":vt,d||(f.as="script",f.crossOrigin=""),f.href=h,document.head.appendChild(f),d)return new Promise((c,b)=>{f.addEventListener("load",c),f.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${h}`)))})})).then(()=>r())},{VITE_ORS_API_KEY:wt,VITE_GRAPHHOPPER_API_KEY:Ct}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},se={OSM_DE:(a,r)=>`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a.join(",")};${r.join(",")}`,ORS:()=>"https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",GHOP:()=>"https://graphhopper.com/api/1/route"},Et=async(a,r,s)=>{var o,S,E,B,C,J,U,j;const h=fetch(se.OSM_DE(a,r)+"?"+new URLSearchParams(T({geometries:"geojson",overview:"full",continue_straight:!1},s))).then(P=>P.json()).catch(P=>{}),d=fetch(se.ORS(),{method:"POST",headers:{"Content-Type":"application/json",Authorization:wt},body:JSON.stringify({coordinates:[a,r],instructions:!1})}).then(P=>P.json()).catch(P=>{}),p=new URLSearchParams({vehicle:"foot",key:Ct,instructions:!0,points_encoded:!1,point:[...a].reverse().join(",")});p.append("point",[...r].reverse().join(","));const f=fetch(se.GHOP()+"?"+p).then(P=>P.json()).catch(P=>{}),[c,b,m]=await Promise.all([h,d,f]);return console.log({response1:c,response2:b,response3:m}),{type:"FeatureCollection",features:[{type:"Feature",geometry:(o=c==null?void 0:c.routes[0])==null?void 0:o.geometry,properties:{index:0,provider:"osm-de",distance:(S=c==null?void 0:c.routes[0])==null?void 0:S.distance}},{type:"Feature",geometry:(E=b==null?void 0:b.features[0])==null?void 0:E.geometry,properties:{index:1,provider:"ors",distance:(J=(C=(B=b==null?void 0:b.features[0])==null?void 0:B.properties)==null?void 0:C.summary)==null?void 0:J.distance}},{type:"Feature",geometry:(U=m==null?void 0:m.paths[0])==null?void 0:U.points,properties:{index:2,provider:"graphhopper",distance:(j=m==null?void 0:m.paths[0])==null?void 0:j.distance}}]}},X="mapwalker-";var g={get:a=>{try{return JSON.parse(localStorage.getItem(X+a))}catch{return null}},set:(a,r)=>{try{r?localStorage.setItem(X+a,JSON.stringify(r)):localStorage.removeItem(X+a)}catch{}},del:a=>{try{localStorage.removeItem(X+a)}catch{}}},Le="data:image/png;base64,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",He="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAS1BMVEVHcEz////////////////////////////////r9fx0wOw9puUOkN8xn+OTzfDY7fklmuI4pOQZld+UzfB0vuz///83pOT///91vuyKtLkHAAAAGXRSTlMAMGunv5t3GAzD3+//89fH9/H7199s8XjfKy/6XAAAAIpJREFUeAFlj4WBgDAMAEM5oJLitv+kX3u/ajyRTGd6GMZJKtbQMLbIA84H1TjDkDWGZdXCumBEJkjyum17uh2djByqwSdS2MklA1F3X1g10AuoblVxq8J/RU/QtSp2jQxycX4nPXikw62q+7bl4pDav342dtXWOWIKex1DHeaicVmpTM8A/dVJ4gNfKwijr/kcwwAAAABJRU5ErkJggg==",Fe="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEz////////////////////////////////////////46vj46vfz1fDz1e/djtXdjdXTbcnTbMnCM7TCM7PALLC/LLC9Ja+9Ja66GKq6GKm2DKWzAKGsmQwTAAAAHHRSTlMADBgwa2x3eJunv8PDx8fX19/f7+/x8fPz9/f7XCOcjAAAAJJJREFUeAEFwQFu3DAMADBKsu+uQLH/P7TY0jiWRwZUzND9NIKoF+DeR4h3xiu/rGvp3zNU1ndhzv2jnsq3P6XXzsh5V9fM+XHd3atH9j6ZPs6GvZWRabqBx0ckAEAelwG8PDofWyVkuJzRVufXuY3St1VHPjNijNQ/vXY5da4d5d/6u3sJYkzAeo6AnJHO0xv/AX/8TAjqcSv9AAAAAElFTkSuQmCC",Ve="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEVHcEzuSnH////72+L////////////zfpn////sM17rKFbuRWv////////////1m7DuPmfuS3HuRGv87PD97PDzfpruRGzzfZn////////1m6/tPmfrHk4InpgzAAAAHHRSTlMA72vHDJts37/3+/EYMKfX8+/xw8Pf8d93eNfz3D4s5QAAAI9JREFUeF5ljssWgjAUA28LLekTEBDQ/P93yqUuPMfZzWwSUYqtgDuyNHqLL7a/3WHZDTmNgNNi0QXehA5WJAOXh5QiGVYUOfAi5+FiJnd4cZgYh5tAgyoA+WjhSQL/ocIwtBD5hhOPjTTqhhxxSsEayJiSjgNZxP8e8+06xok026LXtXh88epKPh1QfVH5APz1C0cNUS3tAAAAAElFTkSuQmCC",Pt="data:image/png;base64,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";const e=tt,i=nt,G=rt,{VITE_MAPBOX_ACCESS_TOKEN:ce,DEV:yt}={VITE_MAPBOX_ACCESS_TOKEN:"pk.eyJ1IjoiY2hlZWF1biIsImEiOiJjbDBkdXJud3gwY21qM2Rtenk1ZTM4dzNqIn0.lIVOhBl1NrdplE6DrbEngw",VITE_ORS_API_KEY:"5b3ce3597851110001cf624888ac0dd0f3434a208374935e71ad9bcd",VITE_GRAPHHOPPER_API_KEY:"LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0},St=2,v=10,je=`mapbox://styles/cheeaun/cl0ds1jbz003014px6nthvdle${yt?"/draft":""}`,le={type:"FeatureCollection",features:[]},Te={walkRoute:{layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":["case",["==",["get","provider"],"ors"],"#95378C",["==",["get","provider"],"graphhopper"],"#EB1E4E","#0E90DF"],"line-opacity":["interpolate",["linear"],["zoom"],15,1,18,.5],"line-width":["interpolate",["linear"],["zoom"],15,4,18,14],"line-dasharray":[0,2]}},walkRoute2:{layout:{"symbol-placement":"line","symbol-spacing":["interpolate",["linear"],["zoom"],10,1,15,16,19,32],"icon-allow-overlap":!0,"icon-padding":0,"icon-size":["interpolate",["linear"],["zoom"],15,.4,18,.75],"icon-image":["case",["==",["get","provider"],"ors"],"walk-dot-purple",["==",["get","provider"],"graphhopper"],"walk-dot-red","walk-dot-blue"]}}};let Ge=!1;function Ke(a=()=>{}){window.DeviceOrientationEvent&&!Ge&&typeof DeviceOrientationEvent.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().then(function(r){r==="granted"&&(console.log("granted"),Ge=!0,a())}).catch(r=>{})}const Ot=pt(()=>bt(()=>import("./geocoder-control.aed74808.js"),["assets/geocoder-control.aed74808.js","assets/vendor.85af7e45.js"]));function Ue(a,r,s,h){return Math.atan2(h-r,s-a)*180/Math.PI}function Ye(){return document.querySelector(".mapboxgl-user-location-show-heading")}function zt(a){return new Promise(r=>setTimeout(r,a))}function Dt(){var Ee,Pe,ye,Se;const a=w(),r=w(),s=w(),h=w(),[d,p]=k(!1),f=w(),[c,b]=k(le),[m,K]=k(g.get("walk-route")||null);I(()=>{g.set("walk-route",m)},[m]);const[o,S]=k(g.get("destination-marker")||null);I(()=>{g.set("destination-marker",o)},[o]);const[E,B]=k(g.get("marker-pinned")||!1);I(()=>{g.set("marker-pinned",E)},[E]);const C=w(!1),U=ot(t=>{if(C.current&&!E){const{lngLat:n}=t;S(n)}},350),[j,P]=k(null),[W,de]=k(!1),[qe,ue]=k(!1),[Q,O]=k(!1),[Z,N]=k(!g.get("not-first-time")),_=w(o),$=w(m),M=De(()=>{var n;const t={};return(n=m==null?void 0:m.features)==null||n.forEach(u=>{const{provider:A,distance:l}=u.properties;t[A]=l}),t},[m]),[he,Ae]=k(!1);I(()=>{Z||Q||W?Ae(!0):he&&setTimeout(()=>{Ae(!1)},300)},[W,Q,Z]);const[x,Xe]=k(!1);I(()=>{var t,n;(t=r.current)==null||t.resize(),(n=h.current)==null||n.resize(),c&&ee()},[x]);const me=w(),pe=w(),Je=De(()=>{var l;if(!o||!((l=c==null?void 0:c.features)!=null&&l.length))return 0;const{lng:t,lat:n}=o,[u,A]=c.features[0].geometry.coordinates;return it({longitude:u,latitude:A},{longitude:t,latitude:n})},[o,c]),ge=R(()=>{c&&!Ye()&&Ke(async()=>{var n;let t=0;do{if(t++>10)break;(n=f.current)==null||n.trigger(),await zt(100)}while(!Ye())})},[c]),L=w(),H=w(),fe=Ie(a),ve=Ie(s),ke=R(()=>{if(o&&L.current){const{width:t,height:n}=fe,{lng:u,lat:A}=o,{x:l,y}=r.current.project([u,A]),z=Math.max(Math.min(l,t-v),v),D=Math.max(Math.min(y,n-v),v),re=t/2,oe=n/2,ie=Ue(re,oe,l,y);z<l+v&&z>l-v&&D<y+v&&D>y-v?L.current.hidden=!0:(L.current.hidden=!1,L.current.style.transform=`translate(${z}px, ${D}px) rotate(${ie+90}deg)`)}else L.current.hidden=!0},[o,fe]),be=R(()=>{if(o&&H.current){const{width:t,height:n}=ve,{lng:u,lat:A}=o,{x:l,y}=h.current.project([u,A]),z=Math.max(Math.min(l,t-v),v),D=Math.max(Math.min(y,n-v),v),re=t/2,oe=n/2,ie=Ue(re,oe,l,y);z<l+v&&z>l-v&&D<y+v&&D>y-v?H.current.hidden=!0:(H.current.hidden=!1,H.current.style.transform=`translate(${z}px, ${D}px) rotate(${ie+90}deg)`)}else H.current.hidden=!0},[o,ve]),we=w(null),ee=R(()=>{var t;(we.current!=="ACTIVE_LOCK"||!document.querySelector(".mapboxgl-ctrl-geolocate-active"))&&((t=f.current)==null||t.trigger())},[]);at(t=>{t&&ee()});const Ce=R(t=>{var u;if(!t)return;const n=new st.LngLatBounds;t.features.forEach(A=>{A.geometry.coordinates.forEach(l=>{n.extend(l)})}),(u=r.current)==null||u.fitBounds(n,{padding:100})},[]),[F,We]=k(g.get("theme")||"auto");I(()=>{const t=document.documentElement,n=document.querySelector('meta[name="color-scheme"]');F==="light"?(t.classList.add("is-light"),t.classList.remove("is-dark"),n==null||n.setAttribute("content","light"),g.set("theme",F)):F==="dark"?(t.classList.add("is-dark"),t.classList.remove("is-light"),n==null||n.setAttribute("content","dark"),g.set("theme",F)):(t.classList.remove("is-dark","is-light"),n==null||n.setAttribute("content","light dark"),g.del("theme"))},[F]);const[V,Qe]=k(g.get("unit-system")||"metric");I(()=>{V==="imperial"?g.set("unit-system",V):g.del("unit-system")},[V]);const te=R(t=>{if(V==="imperial"){const n=t/1609.34;return ct(n).input("mi").humanize()}return lt(t).humanize()},[V]),ne=R(t=>{const n=t/1.33*1e3;return`${te(t)} (${dt(n,{units:["h","m"],round:!0})})`},[te]);return i("div",{class:`${x?"split-view":""}`,children:[e("div",{id:"map",ref:a,children:i(Re,{ref:r,mapboxAccessToken:ce,mapStyle:je,initialViewState:g.get("view-state")||{center:[103.8198,1.3521]},boxZoom:!1,renderWorldCopies:!1,maxZoom:21,attributionControl:!1,logoPosition:"top-right",keyboard:!1,onLoad:t=>{var u;ee();const{layers:n}=r.current.getStyle();P((u=n.find(A=>{var l;return A.type==="symbol"&&((l=A==null?void 0:A.layout)==null?void 0:l["text-field"])}))==null?void 0:u.id),r.current.loadImage(He,(A,l)=>{A||(r.current.addImage("walk-dot-blue",l),h.current.addImage("walk-dot-blue",l))}),r.current.loadImage(Fe,(A,l)=>{A||(r.current.addImage("walk-dot-purple",l),h.current.addImage("walk-dot-purple",l))}),r.current.loadImage(Ve,(A,l)=>{A||(r.current.addImage("walk-dot-red",l),h.current.addImage("walk-dot-red",l))})},onMoveStart:t=>{t.geolocateSource||s.current.hidden||s.current.classList.add("faded")},onMoveEnd:t=>{t.geolocateSource||s.current.hidden||s.current.classList.remove("faded")},onIdle:t=>{s.current.hidden||(s.current.classList.remove("faded"),g.set("view-state",t.viewState),ke())},onMove:t=>{var A;const{viewState:n}=t,u=n.zoom<16;s.current.hidden=u,!u&&!x&&((A=h.current)==null||A.jumpTo(Y(T({},n),{center:[n.longitude,n.latitude],zoom:n.zoom-St}))),ke()},onClick:t=>{console.log("map click",t),!(t.originalEvent.detail>1)&&(C.current=!0,U(t),ge())},onDblClick:t=>{C.current&&(C.current=!1)},onZoomStart:t=>{C.current&&(C.current=!1)},onZoomEnd:t=>{const{zoom:n}=t.viewState;console.log("zoom",n)},onDragStart:t=>{C.current&&(C.current=!1)},children:[e(ut,{position:"top-right",compact:!0}),e(Be,{id:"walk-route",type:"geojson",data:m||le,children:e(Me,Y(T({id:"walk-route",type:"symbol"},Te.walkRoute2),{beforeId:j}))}),e(ae,{anchor:"bottom",draggable:!E,longitude:(o==null?void 0:o.lng)||0,latitude:(o==null?void 0:o.lat)||0,onDragEnd:t=>{const{lngLat:n}=t;S(n)},onClick:t=>{t.originalEvent.stopPropagation(),O(!0)},children:e("img",{src:Le,width:"18",hidden:!o})}),e(ht,{children:e(Ot,{accessToken:ce,marker:!1,clearAndBlurOnSelect:!0,collapsed:!0,position:"top-left"})}),e(At,{ref:f,fitBoundsOptions:{zoom:17},positionOptions:{enableHighAccuracy:!0,timeout:5e3},trackUserLocation:!0,showUserHeading:!0,position:"bottom-right",onGeolocate:t=>{const{target:{_watchState:n},coords:u}=t;console.log(n,{onGeolocate:t}),we.current=n,u!=null&&u.longitude?(b({type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:[u.longitude,u.latitude]}}]}),Ke()):b(null)},onError:t=>{const{code:n,message:u}=t;n!==3&&alert(`${n}: ${u}`),b(null)}}),e(mt,{showZoom:!1,visualizePitch:!0,position:"bottom-right"}),e("div",{class:"marker-pointer",ref:L,hidden:!0}),i("div",{id:"actions",children:[e("button",{type:"button",onClick:()=>{N(!0)},title:"About",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m11 7h2v2h-2zm0 4h2v6h-2zm1-9c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"})})}),e("button",{type:"button",onClick:()=>{de(!0)},title:"Legend",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m11 18h2v-2h-2zm1-16c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"})})}),e("button",{type:"button",onClick:()=>{ue(!0)},title:"Options",children:e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64zm-1.98-1.71c.04.31.05.52.05.73s-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7zm-5.45-3.27c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"})})}),e("button",{type:"button",class:"bold",onClick:()=>{O(!0)},title:"Actions",disabled:d,children:d?e("div",{class:"loading"}):e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m3 3v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4zm4-16v8h8v-8zm6 6h-4v-4h4zm-6 4v8h8v-8zm6 6h-4v-4h4z"})})})]})]})}),i("div",{id:"overview-map",ref:s,hidden:!0,children:[i(Re,{ref:h,mapboxAccessToken:ce,mapStyle:je,initialViewState:{center:[103.8198,1.3521],zoom:11},attributionControl:!1,interactive:!x,maxZoom:16,keyboard:!1,onClick:()=>{ge()},onIdle:be,onMove:be,children:[e(Be,{id:"walk-route",type:"geojson",data:m||le,children:e(Me,Y(T({id:"walk-route",type:"symbol"},Te.walkRoute2),{beforeId:j}))}),e(ae,{anchor:"center",longitude:((Pe=(Ee=c==null?void 0:c.features[0])==null?void 0:Ee.geometry)==null?void 0:Pe.coordinates[0])||0,latitude:((Se=(ye=c==null?void 0:c.features[0])==null?void 0:ye.geometry)==null?void 0:Se.coordinates[1])||0,children:e("div",{id:"geolocation-marker",hidden:!c})}),e(ae,{anchor:"bottom",longitude:(o==null?void 0:o.lng)||0,latitude:(o==null?void 0:o.lat)||0,children:e("img",{src:Le,width:"12",hidden:!o})}),e("div",{class:"marker-pointer mini",ref:H,hidden:!0})]}),e("button",{type:"button",onClick:()=>{Xe(!x)},children:x?e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m5 16h3v3h2v-5h-5zm3-8h-3v2h5v-5h-2zm6 11h2v-3h3v-2h-5zm2-11v-3h-2v5h5v-2z"})}):e("svg",{height:"24",viewBox:"0 0 24 24",width:"24",children:e("path",{fill:"currentColor",d:"m7 14h-2v5h5v-2h-3zm-2-4h2v-3h3v-2h-5zm12 7h-3v2h5v-5h-2zm-3-12v2h3v3h2v-5z"})})})]}),i("div",{class:"bd",onClick:t=>t.stopPropagation(),hidden:!he,children:[e(q,{open:Z,onDismiss:()=>{N(!1),g.set("not-first-time",!0)},initialFocusRef:me,children:i("div",{class:"bottom-sheet-container",children:[e("img",{alt:"",src:Pt,width:"96",height:"96",style:{borderRadius:24,boxShadow:"0 1px 2px #ccc",float:"right",marginLeft:10}}),e("h1",{children:"MapWalker"}),e("p",{children:"MapWalker is a very opinionated map-based walking route planner."}),i("p",{children:["The map tiles and styles escalate ",e("b",{children:"all"})," walking paths and roads to the surface. They are color-coded based on their types, such as stairs, bridges, tunnels, etc."]}),e("p",{children:"Once a marker is placed, walk routes can be generated from current location to the marker. Up to 3 walk routes will be generated from different routing engines, overlayed on the map simultaneuously for comparison as each has its own pros and cons."}),i("p",{children:[e("a",{href:"https://github.com/cheeaun/mapwalker",target:"_blank",children:"Built"})," ","by"," ",e("a",{href:"https://twitter.com/cheeaun",target:"_blank",children:"@cheeaun"}),"."]}),i("button",{type:"button",class:"block bold",ref:me,onClick:()=>{N(!1),g.set("not-first-time",!0)},children:[e("span",{children:"\u{1F6B6}"})," Start walking now!"]})]})}),e(q,{open:W,onDismiss:()=>{de(!1)},children:i("div",{class:"bottom-sheet-container legend-sheet-container",children:[e("h2",{children:"Map Legend"}),i("dl",{children:[e("dt",{children:e("span",{class:"path"})}),e("dd",{children:"Foot paths, cycling paths"}),e("dt",{children:e("span",{class:"bridge"})}),e("dd",{children:"Bridges"}),e("dt",{children:e("span",{class:"stairs"})}),e("dd",{children:"Stairs"}),e("dt",{children:e("span",{class:"tunnel"})}),e("dd",{children:"Tunnels, underground paths, under bridge"}),e("dt",{children:e("img",{src:He,width:"10",height:"10"})}),i("dd",{children:["Route from OpenStreetMap",M["osm-de"]&&i(G,{children:[e("br",{}),e("span",{class:"insignificant",children:ne(M["osm-de"])})]})]}),e("dt",{children:e("img",{src:Fe,width:"10",height:"10"})}),i("dd",{children:["Route from OpenRouteService",M.ors&&i(G,{children:[e("br",{}),e("span",{class:"insignificant",children:ne(M.ors)})]})]}),e("dt",{children:e("img",{src:Ve,width:"10",height:"10"})}),i("dd",{children:["Route from GraphHopper",M.graphhopper&&i(G,{children:[e("br",{}),e("span",{class:"insignificant",children:ne(M.graphhopper)})]})]})]})]})}),e(q,{open:qe,onDismiss:()=>{ue(!1)},children:i("div",{class:"bottom-sheet-container options-sheet-container",children:[e("h2",{children:"Options"}),e("p",{children:i("label",{children:["Theme:"," ",i("select",{id:"theme-switcher",value:F,onChange:t=>{We(t.target.value)},children:[e("option",{value:"auto",children:"Auto"}),e("option",{value:"light",children:"Light"}),e("option",{value:"dark",children:"Dark"})]})]})}),e("p",{children:i("label",{children:["Unit system:"," ",i("select",{id:"unit-system-switcher",value:V,onChange:t=>{Qe(t.target.value)},children:[e("option",{value:"metric",children:"Metric"}),e("option",{value:"imperial",children:"Imperial"})]})]})})]})}),e(q,{open:Q,onDismiss:()=>{O(!1)},initialFocusRef:pe,children:i("div",{class:"bottom-sheet-container marker-sheet-container",children:[!!o&&!!c&&i("div",{class:"insignificant",style:{width:"100%",textAlign:"center"},children:["Air distance to marker: ",te(Je)]}),o?i(G,{children:[i("button",{type:"button",onClick:()=>{S(null),_.current=o,B(!1)},children:[e("span",{children:"\u274C"})," Remove marker"]}),i("button",{type:"button",onClick:()=>{B(!E),O(!1)},class:E?"":"faded",children:[e("span",{children:"\u{1F4CC}"})," ",E?"Unpin marker":"Pin marker"]}),!!m&&i("button",{type:"button",onClick:()=>{Ce(m),O(!1)},children:[e("span",{children:"\u{1F52D}"})," Zoom whole route"]}),i("button",{type:"button",onClick:()=>{var t;(t=r.current)==null||t.flyTo({center:o}),O(!1)},children:[e("span",{children:"\u{1F50D}"})," Fly to marker"]}),i("button",{type:"button",class:"bold block",ref:pe,onClick:async()=>{if(p(!0),O(!1),console.log({geolocationGeoJSON:c,destinationMarker:o}),!c){alert("Please allow location access to generate routes");return}const t=await Et(c.features[0].geometry.coordinates,[o.lng,o.lat]);K(t),p(!1),B(!0),Ce(t)},children:[e("span",{children:"\u{1F503}"})," Generate walk routes to marker"]})]}):i(G,{children:[!o&&i("button",{type:"button",onClick:()=>{var n;const t=(n=r.current)==null?void 0:n.getCenter();S({lat:t.lat,lng:t.lng}),O(!1)},children:[e("span",{children:"\u{1F4CC}"})," Place marker on map"]}),!o&&_.current&&i("button",{type:"button",onClick:()=>{S(_.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore marker"]}),m?i("button",{type:"button",onClick:()=>{$.current=m,K(null)},children:[e("span",{children:"\u{1F5D1}\uFE0F"})," Clear route"]}):$.current&&i("button",{type:"button",onClick:()=>{K($.current)},children:[e("span",{children:"\u267B\uFE0F"})," Restore route"]})]})]})})]})]})}gt(e(Dt,{}),document.getElementById("app"));
//# sourceMappingURL=index.9e50e37b.js.map

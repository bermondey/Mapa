// Service worker: mapa sin conexión (carcasa de la app + mapas vistos o descargados)
const V='mapa-v2',SHELL=['./','./index.html','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(/opentopomap\.org|arcgisonline\.com|elevation-tiles-prod/.test(u.host)){
  const key=new Request(r.url.replace(/^https:\/\/[abc]\.tile\.opentopomap/,'https://a.tile.opentopomap'));
  e.respondWith(caches.open('tiles').then(async c=>{
   const m=await c.match(key);if(m)return m;
   try{const n=await fetch(r);if(n.ok)c.put(key,n.clone());return n}catch(err){return new Response('',{status:504})}}));
  return}
 if(/overpass-api|nominatim|open-meteo|lauegi/.test(u.host))return;
 e.respondWith(fetch(r,{cache:'no-cache'}).then(n=>{if(n.ok)caches.open(V).then(c=>c.put(r,n.clone()));return n})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))))});

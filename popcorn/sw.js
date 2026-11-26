// Pass the Popcorn offline support. Bump VERSION on every release.
const VERSION='popcorn-v6';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('popcorn-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  // The page itself: try the network first so updates show up, fall back to the cached copy offline.
  if(req.mode==='navigate'||(url.origin===location.origin&&url.pathname.endsWith('index.html'))){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));return;
  }
  // Everything else (icons, Google Fonts): cache first, then network, and keep a copy.
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r})));
});

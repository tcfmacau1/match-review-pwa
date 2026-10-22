const CACHE='matchledger-pwa-v4.1.0';
const ASSETS=['./','./index.html','./mobile.css','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('matchledger-pwa-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();if(e.data?.type==='CHECK_READY')e.waitUntil((async()=>{const c=await caches.open(CACHE);const ready=(await Promise.all(ASSETS.map(a=>c.match(new URL(a,self.registration.scope).href)))).every(Boolean);e.source?.postMessage({type:'CACHE_READY',ready});})());});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!u.href.startsWith(self.registration.scope))return;
e.respondWith((async()=>{const c=await caches.open(CACHE);if(e.request.mode==='navigate')return (await c.match('./index.html'))||fetch(e.request);return (await c.match(e.request,{ignoreSearch:true}))||fetch(e.request);})());});

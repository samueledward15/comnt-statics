// Trusses Lab service worker: app shell offline, fonts cached on first use, YouTube always online.
const V = 'trusses-v2';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/truss.js', 'js/content.js', 'js/labs.js', 'manifest.webmanifest',
  'assets/logo/comnt-logo-animated.svg', 'assets/logo/comnt-logo-animated-reverse.svg', 'icons/favicon.svg', 'icons/icon-192.png',
  ...['happy', 'talk', 'think', 'wow', 'laugh', 'glare', 'tea', 'starry', 'sweat', 'wink'].map(f => `assets/faces/${f}.svg`)];

self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || /youtube|ytimg|googlevideo/.test(u.hostname)) return;
  if (u.origin === location.origin) {
    // network-first for the app files so updates show up; cache as fallback
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(e.request, c)); return res; })));
  }
});

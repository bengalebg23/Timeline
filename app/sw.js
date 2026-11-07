// Family Timeline service worker
const CACHE = 'timeline-v0.10.0';
const CORE = ['./', './index.html', './manifest.json?v=3', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Pages: network first so new versions show straight away; cache when offline.
// Everything else (fonts, icons): cache first.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Firebase data, sign-in and Tally's vault: always live, never cached
  if (/(firebaseio\.com|firebasedatabase\.app|googleapis\.com)$/.test(new URL(req.url).hostname)) return;
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html', {ignoreSearch: true})));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque'){
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  })));
});

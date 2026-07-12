const CACHE = 'gigio-gym-v15';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './goku.jpg'];

self.addEventListener('install', (e) => {
  // allSettled: se un singolo file non si scarica, l'installazione NON fallisce tutta
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // La PAGINA (navigazione): prima internet, così apre sempre l'ultima versione;
  // se sei offline, usa la copia salvata. Non resta mai bloccata su una versione vecchia.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Altre risorse (immagini, ecc.): prima la copia salvata, poi internet.
  // Non restituisce MAI una risposta vuota (che causava l'errore del service worker).
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached || Response.error());
    })
  );
});

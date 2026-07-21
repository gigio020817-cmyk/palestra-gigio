const CACHE = 'gigio-gym-v37';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './goku.jpg', './img/erjola-bg.jpg'];
// immagini esercizi impacchettate: precaricate così funzionano OFFLINE (in palestra)
const IMG_SHELL = [
  './img/exercises/Barbell_Glute_Bridge/0.jpg',
  './img/exercises/Barbell_Glute_Bridge/1.jpg',
  './img/exercises/Barbell_Hip_Thrust/0.jpg',
  './img/exercises/Barbell_Hip_Thrust/1.jpg',
  './img/exercises/Barbell_Shoulder_Press/0.jpg',
  './img/exercises/Barbell_Shoulder_Press/1.jpg',
  './img/exercises/Barbell_Shrug/0.jpg',
  './img/exercises/Barbell_Shrug/1.jpg',
  './img/exercises/Butterfly/0.jpg',
  './img/exercises/Butterfly/1.jpg',
  './img/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg',
  './img/exercises/Close-Grip_Front_Lat_Pulldown/1.jpg',
  './img/exercises/Crunches/0.jpg',
  './img/exercises/Crunches/1.jpg',
  './img/exercises/Dumbbell_Bench_Press/0.jpg',
  './img/exercises/Dumbbell_Bench_Press/1.jpg',
  './img/exercises/Dumbbell_Bicep_Curl/0.jpg',
  './img/exercises/Dumbbell_Bicep_Curl/1.jpg',
  './img/exercises/Dumbbell_Lunges/0.jpg',
  './img/exercises/Dumbbell_Lunges/1.jpg',
  './img/exercises/EZ-Bar_Curl/0.jpg',
  './img/exercises/EZ-Bar_Curl/1.jpg',
  './img/exercises/Front_Barbell_Squat/0.jpg',
  './img/exercises/Front_Barbell_Squat/1.jpg',
  './img/exercises/Goblet_Squat/0.jpg',
  './img/exercises/Goblet_Squat/1.jpg',
  './img/exercises/Hammer_Curls/0.jpg',
  './img/exercises/Hammer_Curls/1.jpg',
  './img/exercises/Machine_Bench_Press/0.jpg',
  './img/exercises/Machine_Bench_Press/1.jpg',
  './img/exercises/One-Arm_Dumbbell_Row/0.jpg',
  './img/exercises/One-Arm_Dumbbell_Row/1.jpg',
  './img/exercises/One-Arm_Kettlebell_Row/0.jpg',
  './img/exercises/One-Arm_Kettlebell_Row/1.jpg',
  './img/exercises/Plank/0.jpg',
  './img/exercises/Plank/1.jpg',
  './img/exercises/Romanian_Deadlift/0.jpg',
  './img/exercises/Romanian_Deadlift/1.jpg',
  './img/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg',
  './img/exercises/Seated_Bent-Over_Rear_Delt_Raise/1.jpg',
  './img/exercises/Seated_Dumbbell_Press/0.jpg',
  './img/exercises/Seated_Dumbbell_Press/1.jpg',
  './img/exercises/Seated_Triceps_Press/0.jpg',
  './img/exercises/Seated_Triceps_Press/1.jpg',
  './img/exercises/Side_Lateral_Raise/0.jpg',
  './img/exercises/Side_Lateral_Raise/1.jpg',
  './img/exercises/Standing_Calf_Raises/0.jpg',
  './img/exercises/Standing_Calf_Raises/1.jpg',
  './img/exercises/Underhand_Cable_Pulldowns/0.jpg',
  './img/exercises/Underhand_Cable_Pulldowns/1.jpg',
  './img/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
  './img/exercises/Wide-Grip_Lat_Pulldown/1.jpg',
];
const PRECACHE = SHELL.concat(IMG_SHELL);

self.addEventListener('install', (e) => {
  // allSettled: se un singolo file non si scarica, l'installazione NON fallisce tutta
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
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

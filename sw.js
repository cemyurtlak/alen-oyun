/* Servis çalışanı: oyunu telefona/tablete kaydeder → sonraki açılışlar anında, internet yokken de çalışır.
   - Kod (html/js/css): önce ağ, ağ yoksa önbellek (güncellemeler hemen gelsin)
   - Görsel ve sesler: önce önbellek (anında açılır), yoksa indirip saklar
   - Kurulumdan sonra tüm görseller ve efekt sesleri arka planda yavaşça indirilir
   SURUM değeri tools/sw_liste.py ile otomatik güncellenir. */
const SURUM = 'dbee09d7fa';
const KOD = 'alen-kod-' + SURUM, MEDYA = 'alen-medya-v2';
importScripts('sw_liste.js');

const KABUK = ['./', 'index.html', 'css/style.css', 'manifest.json', 'audio/voice/index.js',
  'js/images.js', 'js/data.js', 'js/settings.js', 'js/audiocache.js', 'js/speech.js', 'js/sounds.js',
  'js/animalsounds.js', 'js/mic.js', 'js/music.js', 'js/core.js', 'js/learn.js', 'js/home.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(KOD).then(c => c.addAll(KABUK)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const adlar = await caches.keys();
    await Promise.all(adlar.filter(a => a !== KOD && a !== MEDYA).map(a => caches.delete(a)));
    await self.clients.claim();
    isit(); // arka planda görselleri/efektleri indir
  })());
});

const medyaMi = (u) => /\.(webp|png|jpg|svg|mp3|woff2?)$/i.test(u.pathname);

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const yerel = u.origin === location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!yerel && !font) return;
  if (r.headers.has('range')) return; // kısmi istekleri tarayıcıya bırak
  if (font || (yerel && medyaMi(u))) e.respondWith(onceOnbellek(r));
  else if (yerel) e.respondWith(onceAg(r));
});

async function onceOnbellek(r) {
  const c = await caches.open(MEDYA);
  const v = await c.match(r, { ignoreSearch: true });
  if (v) return v;
  const y = await fetch(r);
  if (y.ok || y.type === 'opaque') c.put(r, y.clone()).catch(() => {});
  return y;
}

async function onceAg(r) {
  const c = await caches.open(KOD);
  try {
    const y = await fetch(r);
    if (y.ok) c.put(r, y.clone()).catch(() => {});
    return y;
  } catch (err) {
    const v = await c.match(r, { ignoreSearch: true });
    if (v) return v;
    throw err;
  }
}

// Görselleri ve efekt seslerini arka planda, sırayla (aynı anda 3) indir
async function isit() {
  const c = await caches.open(MEDYA);
  const liste = (self.WARM_FILES || []).slice();
  const isci = async () => {
    while (liste.length) {
      const yol = liste.shift();
      try {
        if (await c.match(yol)) continue;
        const y = await fetch(yol);
        if (y.ok) await c.put(yol, y);
      } catch (e) { /* yoksay */ }
    }
  };
  await Promise.all([isci(), isci(), isci()]);
}

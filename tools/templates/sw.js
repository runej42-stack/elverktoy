// Service worker for Elverktøy. Generert av tools/build.mjs – ikke rediger i dist/.
// Lagrer alle filene ved installasjon (sjekket mot hash fra bygget) og svarer fra lageret,
// så appen virker uten nett. En ny versjon tas i bruk først når brukeren trykker «Oppdater».
//
// Nødbryter: Legg ut en sw.js med bare denne linjen for å fjerne appens lager hos alle brukere av denne mappen:
//   self.addEventListener('install', () => self.skipWaiting()); self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n.startsWith('elverktoy:' + new URL(self.registration.scope).pathname + ':')).map((n) => caches.delete(n)))).then(() => self.registration.unregister())));

const VERSION = '%%VERSION%%';
const ASSETS = %%ASSETS%%;
// Lageret deles av alle mapper på samme domene. Navnet tar med mappen (scope), så to utgaver
// (f.eks. /elverktoy/ og /elverktoy-test/) ikke sletter hverandres filer.
const SCOPE_URL = self.registration.scope;
const PREFIX = 'elverktoy:' + new URL(SCOPE_URL).pathname + ':';
const CACHE = PREFIX + VERSION;
// Navnet før mappen kom med. Slike lagre slettes bare når de hører til denne mappen.
const LEGACY_PREFIX = 'elverktoy-';

/**
 * Et omdirigert svar (f.eks. http → https eller / → /index.html) godtas ikke som svar på en
 * navigering i Chrome og Safari. Da lages et nytt svar med samme innhold og topptekster.
 */
async function unredirect(res) {
  if (!res || !res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Filer med samme innhold hentes én gang og lagres under alle adressene.
    // './' er den samme index.html som './index.html', og hentes som index.html.
    const groups = new Map();
    for (const asset of ASSETS) {
      if (!groups.has(asset.integrity)) groups.set(asset.integrity, []);
      groups.get(asset.integrity).push(asset.url);
    }
    for (const [integrity, urls] of groups) {
      const from = urls.find((u) => u !== './') || urls[0];
      const res = await fetch(from, { cache: 'reload', integrity });
      if (!res.ok) throw new Error('Kunne ikke hente ' + from);
      const clean = await unredirect(res);
      for (const url of urls) await cache.put(url, clean.clone());
    }
  })());
});

/** Lagre med det gamle navnet ('elverktoy-<versjon>') som har denne mappens index.html. */
async function isOwnLegacy(key) {
  if (!key.startsWith(LEGACY_PREFIX)) return false;
  const cache = await caches.open(key);
  return !!(await cache.match(new URL('./index.html', SCOPE_URL).href));
}

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key === CACHE) continue;
      if (key.startsWith(PREFIX) || await isOwnLegacy(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      // Et lagret svar som ble omdirigert, pakkes om, ellers viser nettleseren en feilside.
      const shell = await cache.match('./index.html');
      if (shell) return unredirect(shell);
    }
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || fetch(req);
  })());
});

// Kjører den genererte sw.js i node:vm med falske self, caches og fetch:
// installering (index.html hentes én gang, sjekkes mot hash), opprydding og omdirigerte svar.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import { build } from '../tools/build.mjs';

const SCOPE = 'https://r-j.no/elverktoy/';
const dir = mkdtempSync(path.join(tmpdir(), 'elverktoy-sw-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));
const { web } = await build({ brandId: 'noytral', out: dir, quiet: true });
const html = await readFile(path.join(web, 'index.html'), 'utf8');

const TYPES = { html: 'text/html; charset=utf-8', webmanifest: 'application/manifest+json', png: 'image/png' };

/** Gjør et svar «omdirigert», slik nettleseren merker det etter f.eks. http → https. */
function asRedirected(res) {
  Object.defineProperty(res, 'redirected', { value: true });
  return res;
}

class FakeCache {
  constructor() { this.store = new Map(); }
  key(req, ignoreSearch = false) {
    const u = new URL(typeof req === 'string' ? req : req.url, SCOPE + 'sw.js');
    if (ignoreSearch) u.search = '';
    return u.href;
  }
  async put(req, res) { this.store.set(this.key(req), res); }
  async match(req, opts = {}) {
    const k = this.key(req, opts.ignoreSearch);
    const hit = [...this.store].find(([key]) => (opts.ignoreSearch ? this.key(key, true) : key) === k);
    if (!hit) return undefined;
    // Lageret tar vare på at svaret var omdirigert.
    const copy = hit[1].clone();
    return hit[1].redirected ? asRedirected(copy) : copy;
  }
}

function fakeCaches() {
  const map = new Map();
  return {
    map,
    async open(name) {
      if (!map.has(name)) map.set(name, new FakeCache());
      return map.get(name);
    },
    async keys() { return [...map.keys()]; },
    async delete(name) { return map.delete(name); },
  };
}

/** Henter filene fra bygget og sjekker integriteten slik nettleseren gjør. */
function fakeFetch({ redirect = [], tamper = [] } = {}) {
  const calls = [];
  const fn = async (url, opts = {}) => {
    calls.push({ url: String(url), opts });
    const rel = new URL(url, SCOPE + 'sw.js').pathname.slice(new URL(SCOPE).pathname.length) || 'index.html';
    // tamper: serveren gir noe annet enn det bygget laget (f.eks. en feilside eller en gammel fil).
    const body = tamper.includes(rel) ? Buffer.from('noe annet') : await readFile(path.join(web, rel));
    if (opts.integrity && opts.integrity !== 'sha256-' + createHash('sha256').update(body).digest('base64')) {
      throw new TypeError('Integriteten stemmer ikke for ' + url);
    }
    const res = new Response(body, { status: 200, headers: { 'content-type': TYPES[rel.split('.').pop()] || 'application/octet-stream' } });
    return redirect.includes(rel) ? asRedirected(res) : res;
  };
  fn.calls = calls;
  return fn;
}

async function loadSW({ caches = fakeCaches(), fetch = fakeFetch() } = {}) {
  const src = await readFile(path.join(web, 'sw.js'), 'utf8');
  const handlers = {};
  const self = {
    registration: { scope: SCOPE },
    location: new URL(SCOPE + 'sw.js'),
    clients: { claimed: 0, async claim() { this.claimed++; } },
    skipped: 0,
    skipWaiting() { this.skipped++; },
    addEventListener(type, fn) { handlers[type] = fn; },
  };
  const ctx = vm.createContext({ self, caches, fetch, Response, URL, console });
  vm.runInContext(src, ctx);
  return {
    self, handlers, caches, fetch,
    CACHE: vm.runInContext('CACHE', ctx),
    ASSETS: JSON.parse(JSON.stringify(vm.runInContext('ASSETS', ctx))),
  };
}

/** Sender en hendelse og venter på waitUntil/respondWith. */
async function fire(sw, type, extra = {}) {
  let wait = null;
  sw.handlers[type]({ ...extra, waitUntil(p) { wait = p; }, respondWith(p) { wait = p; } });
  return wait ? await wait : undefined;
}

test('install henter index.html én gang, lagrer den under ./ og ./index.html og sender integritet med', async () => {
  const sw = await loadSW();
  await fire(sw, 'install');
  assert.ok(sw.ASSETS.some((a) => a.url === './') && sw.ASSETS.some((a) => a.url === './index.html'));
  const index = sw.fetch.calls.filter((c) => c.url === './' || c.url.endsWith('index.html'));
  assert.deepEqual(index.map((c) => c.url), ['./index.html']);
  assert.equal(sw.fetch.calls.length, sw.ASSETS.length - 1);
  for (const c of sw.fetch.calls) {
    const asset = sw.ASSETS.find((a) => a.url === c.url);
    assert.ok(asset, 'hentet en fil som ikke står i listen: ' + c.url);
    assert.equal(c.opts.integrity, asset.integrity);
    assert.match(c.opts.integrity, /^sha256-/);
    assert.equal(c.opts.cache, 'reload');
  }
  assert.ok(sw.CACHE.startsWith('elverktoy:/elverktoy/:'), sw.CACHE);
  const cache = sw.caches.map.get(sw.CACHE);
  for (const a of sw.ASSETS) assert.ok(await cache.match(a.url), 'mangler i lageret: ' + a.url);
  assert.equal(await (await cache.match('./')).text(), html);
  assert.equal(await (await cache.match('./index.html')).text(), html);
  // En ny versjon venter til brukeren trykker «Oppdater».
  assert.equal(sw.self.skipped, 0);
  await fire(sw, 'message', { data: { type: 'SKIP_WAITING' } });
  assert.equal(sw.self.skipped, 1);
});

test('install feiler når en fil ikke stemmer med hashen', async () => {
  const sw = await loadSW({ fetch: fakeFetch({ tamper: ['manifest.webmanifest'] }) });
  await assert.rejects(fire(sw, 'install'), /Integriteten stemmer ikke/);
});

test('activate sletter bare gamle lagre for samme mappe', async () => {
  const sw = await loadSW();
  const caches = sw.caches;
  await caches.open(sw.CACHE);
  await caches.open('elverktoy:/elverktoy/:0.1.0-gammel');
  await caches.open('elverktoy:/elverktoy-test/:0.1.0-annen');
  await caches.open('elverktoy:/elverktoy/test/:0.1.0-under');
  // Gamle navn uten mappe: slettes bare når de har denne mappens index.html.
  await (await caches.open('elverktoy-0.1.0-egen')).put(SCOPE + 'index.html', new Response('x'));
  await (await caches.open('elverktoy-0.1.0-fremmed')).put('https://r-j.no/elverktoy-test/index.html', new Response('x'));
  await caches.open('noe-annet');
  await fire(sw, 'activate');
  assert.deepEqual((await caches.keys()).sort(), [
    sw.CACHE,
    'elverktoy-0.1.0-fremmed',
    'elverktoy:/elverktoy-test/:0.1.0-annen',
    'elverktoy:/elverktoy/test/:0.1.0-under',
    'noe-annet',
  ].sort());
  assert.equal(sw.self.clients.claimed, 1);
});

test('et omdirigert svar pakkes om, både ved install og før det brukes til navigering', async () => {
  const sw = await loadSW({ fetch: fakeFetch({ redirect: ['index.html', 'manifest.webmanifest'] }) });
  await fire(sw, 'install');
  const cache = sw.caches.map.get(sw.CACHE);
  for (const url of ['./', './index.html', './manifest.webmanifest']) {
    const stored = cache.store.get(cache.key(url));
    assert.equal(stored.redirected, false, url + ' er fortsatt omdirigert');
    assert.equal(stored.status, 200);
  }
  const stored = cache.store.get(cache.key('./index.html'));
  assert.equal(await stored.clone().text(), html);
  assert.match(stored.headers.get('content-type'), /^text\/html/);

  // Et gammelt, omdirigert svar i lageret skal ikke gi feilside ved navigering.
  await cache.put('./index.html', asRedirected(new Response(html, { headers: { 'content-type': TYPES.html } })));
  const res = await fire(sw, 'fetch', { request: { method: 'GET', url: SCOPE + '?x=1', mode: 'navigate' } });
  assert.equal(res.redirected, false);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), html);
});

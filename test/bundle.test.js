// Bygger appen og kjører regneeksemplene mot den ferdige filen, ikke bare mot kildekoden.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { build, checkOutDir } from '../tools/build.mjs';
import { transform } from '../tools/bundler.mjs';
import { FEATURES } from '../src/core/features.js';

const dir = mkdtempSync(path.join(tmpdir(), 'elverktoy-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));

/** Kjører det innebygde skriptet og gir konteksten (__BUILD__ og __elverktoyModules). */
function contextFrom(html) {
  const script = html.match(/<script>\n(globalThis\.__BUILD__[\s\S]*?)<\/script>/);
  assert.ok(script, 'fant ikke det innebygde skriptet');
  const context = vm.createContext({});
  vm.runInContext(script[1], context);
  return context;
}

const modulesFrom = (html) => contextFrom(html).__elverktoyModules;

for (const brandId of ['rhj', 'noytral']) {
  test(`bygget (${brandId}) kjører alle regneeksemplene`, async () => {
    const out = path.join(dir, brandId);
    // Bygget skal bare slette web/ og fil/, ikke andre mapper i out (f.eks. dist/preview).
    mkdirSync(path.join(out, 'preview'), { recursive: true });
    writeFileSync(path.join(out, 'preview', 'behold.txt'), 'x');
    const { web, filePath } = await build({ brandId, out, quiet: true });
    assert.ok(existsSync(path.join(out, 'preview', 'behold.txt')), 'bygget slettet en mappe det ikke laget selv');
    for (const file of [path.join(web, 'index.html'), filePath]) {
      const html = await readFile(file, 'utf8');
      assert.ok(!/<script[^>]+src=|<link[^>]+stylesheet[^>]+href=|fonts\.googleapis|@import/i.test(html), 'bygget skal ikke hente filer utenfra');
      const m = modulesFrom(html);
      const results = m['src/core/cases.js'].runAllCases(m['src/calcs/index.js'].CALCS);
      assert.ok(results.length >= 20);
      const failed = results.filter((r) => !r.pass);
      assert.equal(failed.length, 0, failed.map((r) => `${r.calc.id}: ${r.failures}`).join('\n'));
      assert.equal(m['src/brand/active.js'].brand.id, brandId);
      // Tabellkontroll er skjult i standardbygget; beta følger kildefila.
      assert.equal(m['src/core/features.js'].FEATURES.tablecheck, false);
      assert.equal(m['src/core/features.js'].FEATURES.beta, FEATURES.beta);
    }
    const sw = await readFile(path.join(web, 'sw.js'), 'utf8');
    assert.ok(/sha256-/.test(sw) && !sw.includes('%%'), 'service worker mangler hash eller har plassholdere igjen');
    assert.ok(!sw.includes('.htaccess'), '.htaccess skal ikke med i service workerens liste');
    const manifest = JSON.parse(await readFile(path.join(web, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.display, 'standalone');
    const version = JSON.parse(await readFile(path.join(web, 'version.json'), 'utf8'));
    assert.equal(version.tablecheck, false);

    const htaccessFile = path.join(web, '.htaccess');
    assert.ok(existsSync(htaccessFile), 'dist/web/.htaccess mangler');
    const htaccess = await readFile(htaccessFile, 'utf8');
    assert.ok(htaccess.includes('AddType application/manifest+json .webmanifest'));
    assert.ok(htaccess.includes('Header set Cache-Control "no-cache"'));
    assert.ok(htaccess.includes('"^(index\\.html|sw\\.js|version\\.json|manifest\\.webmanifest)$"'), 'feil mønster for filnavnene');
    // DirectoryIndex krever AllowOverride Indexes og kan gi 500-feil; index.html er standard uansett.
    assert.ok(!/DirectoryIndex/i.test(htaccess), '.htaccess skal ikke ha DirectoryIndex');
    const deflate = htaccess.match(/<IfModule mod_deflate\.c>([\s\S]*?)\n<\/IfModule>/);
    assert.ok(deflate, '.htaccess mangler komprimering (mod_deflate)');
    assert.ok(deflate[1].includes('AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json application/manifest+json'));
  });
}

test('bygget med Tabellkontroll (--tabellkontroll)', async () => {
  const { web, filePath } = await build({ brandId: 'noytral', out: path.join(dir, 'tabellkontroll'), quiet: true, tablecheck: true });
  for (const file of [path.join(web, 'index.html'), filePath]) {
    const ctx = contextFrom(await readFile(file, 'utf8'));
    assert.equal(ctx.__elverktoyModules['src/core/features.js'].FEATURES.tablecheck, true);
    assert.equal(ctx.__elverktoyModules['src/core/features.js'].FEATURES.beta, FEATURES.beta);
    assert.equal(ctx.__BUILD__.tablecheck, true);
  }
  const version = JSON.parse(await readFile(path.join(web, 'version.json'), 'utf8'));
  assert.equal(version.tablecheck, true);
});

test('bygget nekter å bruke prosjektmappa eller en mappe over den som --out', async () => {
  const project = path.resolve(import.meta.dirname, '..');
  for (const bad of [project, path.dirname(project), path.parse(project).root]) {
    assert.throws(() => checkOutDir(bad), /prosjektmappa/);
    await assert.rejects(build({ brandId: 'noytral', out: bad, quiet: true }), /prosjektmappa/);
  }
  checkOutDir(path.join(project, 'dist'));
  checkOutDir(dir);
});

test('bundleren avviser det den ikke kan pakke trygt', () => {
  assert.throws(() => transform('a.js', 'export default 1;'), /export default/);
  assert.throws(() => transform('a.js', 'export let x = 1;'), /export let/);
  assert.throws(() => transform('a.js', "import x from './b.js';"), /navngitte/);
  assert.throws(() => transform('a.js', "import { x } from 'pakke';"), /relative/);
  assert.throws(() => transform('a.js', "export { x } from './b.js';"), /re-eksport/);
  assert.throws(() => transform('a.js', "const m = import('./b.js');"), /dynamisk/);
  const t = transform('src/a.js', "import { a, b as c } from './b.js';\nimport * as n from '../d.js';\nexport function f() {}\nexport const K = 1;\nconst z = 2;\nexport { z as Z };\n");
  assert.deepEqual(t.deps, ['src/b.js', 'd.js']);
  assert.deepEqual(t.exports.map((e) => e.name), ['f', 'K', 'Z']);
  assert.ok(t.body.includes('const { a, b: c } = __m["src/b.js"];'));
});

// Bygger appen i to varianter fra samme kode:
//   dist/web/  – PWA for en nettvert (index.html med alt innebygd, sw.js, manifest, ikoner, .htaccess)
//   dist/fil/  – én selvstendig HTML-fil til deling som fil
// Bruk: node tools/build.mjs [--brand=rhj|noytral] [--out=dist] [--tabellkontroll]
// Tabellkontroll er skjult i bygget med mindre --tabellkontroll er med.
// Bare undermappene web/ og fil/ i --out slettes og lages på nytt (dist/preview får stå).

import { readFile, writeFile, mkdir, rm, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { bundle } from './bundler.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Apache hos nettverten (r-j.no/elverktoy/). Lastes opp sammen med resten av dist/web.
const HTACCESS = [
  '# Elverktøy – innstillinger for Apache. Lastes opp sammen med resten av dist/web.',
  'AddType application/manifest+json .webmanifest',
  'AddCharset utf-8 .html .js .json .webmanifest',
  '# Komprimerer tekstfilene (index.html er over 500 kB). AddOutputFilterByType hører til mod_filter.',
  '<IfModule mod_deflate.c>',
  '  <IfModule mod_filter.c>',
  '    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json application/manifest+json',
  '  </IfModule>',
  '</IfModule>',
  '<IfModule mod_headers.c>',
  '  # Telefonene skal alltid spørre etter siste versjon av disse filene.',
  '  <FilesMatch "^(index\\.html|sw\\.js|version\\.json|manifest\\.webmanifest)$">',
  '    Header set Cache-Control "no-cache"',
  '  </FilesMatch>',
  '  <FilesMatch "\\.png$">',
  '    Header set Cache-Control "max-age=604800"',
  '  </FilesMatch>',
  '  Header set X-Content-Type-Options "nosniff"',
  '  Header set Referrer-Policy "no-referrer"',
  '</IfModule>',
  '',
].join('\n');

/** Sperre: bygget sletter undermapper i out, så out kan ikke være prosjektmappa eller en mappe over den. */
export function checkOutDir(out) {
  const rel = path.relative(path.resolve(out), root);
  const outside = rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel);
  if (!outside) throw new Error(`--out kan ikke være prosjektmappa eller en mappe over den (${path.resolve(out)}). Bruk f.eks. --out=dist.`);
}

export async function build({ brandId = 'rhj', out = path.join(root, 'dist'), quiet = false, tablecheck = false } = {}) {
  const log = quiet ? () => {} : (...a) => console.log(...a);
  checkOutDir(out);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const brandFile = path.join(root, 'src', 'brand', `${brandId}.js`);
  if (!existsSync(brandFile)) throw new Error(`Ukjent merkevareprofil: ${brandId}`);
  const { brand } = await import(pathToFileURL(brandFile));
  const { brandCSS } = await import(pathToFileURL(path.join(root, 'src', 'ui', 'theme.js')));
  const version = pkg.version;
  const date = new Date().toISOString().slice(0, 10);

  // Funksjonsbrytere: alt fra src/core/features.js (f.eks. beta), men Tabellkontroll bare når den er bedt om.
  const { FEATURES: sourceFeatures } = await import(pathToFileURL(path.join(root, 'src', 'core', 'features.js')));
  const features = { ...sourceFeatures, tablecheck: !!tablecheck };

  // 1. Pakk modulene. Bare valgt merkevareprofil kommer med.
  const { code, order } = await bundle('src/main.js', {
    root,
    overrides: {
      'src/brand/active.js': `import { brand as chosen } from './${brandId}.js';\nexport const brand = chosen;\n`,
      'src/core/features.js': `// Laget av tools/build.mjs.\nexport const FEATURES = ${JSON.stringify(features)};\n`,
    },
  });

  // 2. Kontroller at bundleren fant de samme eksportene som Node selv ser.
  //    (For src/core/features.js sammenlignes den utbyttede filen med kildefila: begge skal gi FEATURES.)
  for (const m of order) {
    if (m.id === 'src/brand/active.js') continue;
    const ns = await import(pathToFileURL(path.join(root, m.id)));
    const actual = Object.keys(ns).sort().join(',');
    const found = m.exports.map((e) => e.name).sort().join(',');
    if (actual !== found) throw new Error(`${m.id}: bundleren fant [${found}], Node ser [${actual}]`);
  }

  const css = await readFile(path.join(root, 'css', 'app.css'), 'utf8');
  const template = await readFile(path.join(root, 'index.html'), 'utf8');
  const iconDir = path.join(root, 'icons', brandId);
  const icons = existsSync(iconDir) ? (await readdir(iconDir)).filter((f) => f.endsWith('.png')) : [];
  if (!icons.length) log(`Advarsel: fant ingen ikoner i icons/${brandId}/ (kjør tools/icons.html via utviklingsserveren).`);

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const safeScript = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
  const region = (html, name, replacement) => {
    const re = new RegExp(`<!--build:${name}-->[\\s\\S]*?<!--/build:${name}-->`);
    if (!re.test(html)) throw new Error(`index.html mangler <!--build:${name}-->`);
    return html.replace(re, () => replacement);
  };

  let faviconData = '';
  if (icons.includes('icon-192.png')) {
    faviconData = 'data:image/png;base64,' + (await readFile(path.join(iconDir, 'icon-192.png'))).toString('base64');
  }

  function page(target) {
    const info = { version, brand: brandId, target, date, tablecheck: features.tablecheck };
    let html = template;
    html = region(html, 'links', target === 'web'
      ? '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" type="image/png" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
      : (faviconData ? `<link rel="icon" type="image/png" href="${faviconData}">` : ''));
    html = region(html, 'css', `<style>\n${css}\n${brandCSS(brand)}\n</style>`);
    html = region(html, 'js', `<script>\nglobalThis.__BUILD__ = ${JSON.stringify(info)};\n${safeScript(code)}</script>`);
    html = html
      .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(brand.name)}</title>`)
      .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(")/, (a, p, q) => p + esc(brand.shortName) + q)
      .replace(/(<meta name="theme-color" content=")[^"]*(")/, (a, p, q) => p + brand.themeColor.dark + q)
      .replace(/(<meta name="description" content=")[^"]*(")/, (a, p, q) => p + esc(brand.description) + q);
    return html;
  }

  // 3. Nettversjonen.
  const web = path.join(out, 'web');
  const fil = path.join(out, 'fil');
  // Bare det bygget selv lager, slettes.
  await rm(web, { recursive: true, force: true });
  await rm(fil, { recursive: true, force: true });
  await mkdir(path.join(web, 'icons'), { recursive: true });
  await writeFile(path.join(web, 'index.html'), page('web'));
  for (const f of icons) await copyFile(path.join(iconDir, f), path.join(web, 'icons', f));
  const manifest = {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    lang: 'nb',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: brand.background,
    theme_color: brand.themeColor.dark,
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ].filter((i) => icons.includes(path.basename(i.src))),
  };
  await writeFile(path.join(web, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(web, 'version.json'), JSON.stringify({ version, date, brand: brandId, tablecheck: features.tablecheck }, null, 2));
  // Innstillinger for Apache. Skal ikke med i service workerens liste.
  await writeFile(path.join(web, '.htaccess'), HTACCESS);

  // 4. Service worker med hash for hver fil. Cachenavnet følger innholdet.
  const files = ['index.html', 'manifest.webmanifest', ...icons.map((f) => `icons/${f}`)];
  const assets = [{ url: './', file: 'index.html' }, ...files.map((f) => ({ url: './' + f, file: f }))];
  const all = createHash('sha256');
  const list = [];
  for (const a of assets) {
    const buf = await readFile(path.join(web, a.file));
    all.update(buf);
    list.push({ url: a.url, integrity: 'sha256-' + createHash('sha256').update(buf).digest('base64') });
  }
  const cacheVersion = `${version}-${all.digest('hex').slice(0, 10)}`;
  const swTemplate = await readFile(path.join(root, 'tools', 'templates', 'sw.js'), 'utf8');
  await writeFile(path.join(web, 'sw.js'), swTemplate
    .replace('%%VERSION%%', cacheVersion)
    .replace('%%ASSETS%%', JSON.stringify(list, null, 2)));

  // 5. Én-fil-versjonen.
  await mkdir(fil, { recursive: true });
  const fileName = `${brand.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/[^A-Za-z0-9]+/g, '-')}-v${version}.html`;
  const filePage = page('file');
  await writeFile(path.join(fil, fileName), filePage);

  const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} kB`;
  log(`Bygget ${brand.name} ${version} (${brandId}), ${order.length} moduler, cache ${cacheVersion}, Tabellkontroll ${features.tablecheck ? 'med' : 'skjult'}`);
  const shown = (f) => path.relative(root, f).split(path.sep).join('/') || f;
  log(`  ${shown(path.join(web, 'index.html'))}  ${kb(page('web'))}`);
  log(`  ${shown(path.join(fil, fileName))}  ${kb(filePage)}`);
  return { web, fileName, filePath: path.join(fil, fileName), code, order, cacheVersion, features };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    // Bare første = deler, så en mappe kan ha = i navnet.
    const i = a.indexOf('=');
    return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)];
  }));
  const tablecheck = args.tabellkontroll === true || ['ja', 'true', '1'].includes(String(args.tabellkontroll).toLowerCase());
  // --out og --brand trenger en verdi (--out=mappe), ikke bare navnet.
  for (const k of ['out', 'brand']) {
    if (args[k] === true || args[k] === '') {
      console.error(`Bygget feilet: --${k} trenger en verdi, f.eks. ${k === 'out' ? '--out=dist' : '--brand=rhj'}.`);
      process.exit(1);
    }
  }
  build({ brandId: args.brand || 'rhj', out: args.out ? path.resolve(root, args.out) : undefined, tablecheck }).catch((e) => {
    console.error('Bygget feilet: ' + e.message);
    process.exit(1);
  });
}

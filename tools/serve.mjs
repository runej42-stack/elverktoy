// Utviklingsserver uten pakker. Lytter bare på 127.0.0.1, så Windows-brannmuren ikke spør.
//   node tools/serve.mjs [mappe] [--port=5173] [--open]
// POST /__dev/save?file=icons/<profil>/<navn>.png lagrer ikoner som tools/icons.html lager,
// og dist/preview/<navn>.png lagrer forhåndsvisninger (f.eks. fra tools/pdf-preview.html).

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith('--port='));
const port = Number(portArg ? portArg.split('=')[1] : process.env.PORT || 5173);
const dirArg = args.find((a) => !a.startsWith('--'));
const root = path.resolve(projectRoot, dirArg || '.');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const SAVE_PATTERN = /^(icons\/[a-z0-9-]+|dist\/preview)\/[a-z0-9-]+\.png$/;

async function handleSave(req, res, url) {
  const file = url.searchParams.get('file') || '';
  if (!SAVE_PATTERN.test(file) || dirArg) {
    res.writeHead(400).end('Ugyldig filnavn');
    return;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 5 * 1024 * 1024) {
      res.writeHead(413).end('For stor');
      return;
    }
    chunks.push(chunk);
  }
  const target = path.join(projectRoot, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.concat(chunks));
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('Lagret ' + file);
}

const handler = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'POST' && url.pathname === '/__dev/save') {
      await handleSave(req, res, url);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(root, '.' + rel);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    const info = await stat(file).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Finnes ikke: ' + rel);
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(e && e.message));
  }
};

const url = `http://localhost:${port}/`;

// --open: åpner appen i standardnettleseren (brukes av Start-Elverktoy.cmd).
function openBrowser() {
  if (!args.includes('--open')) return;
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref();
}

// Både IPv4 og IPv6 på loopback, så «localhost» virker uansett hva det slås opp til.
http.createServer(handler)
  .on('error', (e) => {
    if (e.code !== 'EADDRINUSE') throw e;
    console.log(`Port ${port} er opptatt – appen kjører sannsynligvis allerede på ${url}`);
    openBrowser();
    process.exit(0);
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Elverktøy: ${url}  (mappe: ${path.relative(projectRoot, root) || '.'})`);
    openBrowser();
  });
http.createServer(handler).on('error', () => { /* uten IPv6 holder IPv4 */ }).listen(port, '::1');

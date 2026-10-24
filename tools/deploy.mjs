// Legger ut appen på https://r-j.no/elverktoy/ uten at noen må dra filer i filbehandlingen.
//   node tools/deploy.mjs                 tester, bygger, laster opp og sjekker
//   node tools/deploy.mjs --forhandsvis   viser hva som ville blitt lastet opp, uten å koble til
//   node tools/deploy.mjs --bare-sjekk    sjekker bare at nettsiden har de samme filene som dist/web
//
// Opplastingen går med SFTP og en egen nøkkel (~/.ssh/elverktoy_rjno). Det lagres ikke noe passord.
// Den offentlige delen av nøkkelen ligger i ~/.ssh/authorized_keys på webhotellet.
// sw.js lastes opp til slutt: telefonene sjekker de nye filene mot hashene i sw.js, så alt annet
// må ligge ute før den nye service workeren kan installeres.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const TARGET = {
  host: 'linweb21.hmg9.webhuset.no',
  user: 'rjno',
  dir: 'www/elverktoy',
  url: 'https://r-j.no/elverktoy/',
  key: path.join(os.homedir(), '.ssh', 'elverktoy_rjno'),
  // Webserveren kjennes igjen på vertsnøkkelen (sjekket 24.10.2026). Den lagres i en egen fil første gang.
  knownHosts: path.join(os.homedir(), '.ssh', 'known_hosts_elverktoy'),
  hostFingerprint: 'SHA256:FQ5ItjgB3PfD/TwgrPWm2CAirsZYGag56uylcuma8io',
};

const args = new Set(process.argv.slice(2));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

/** Alle filene i dist/web, med sti relativt til mappa (skråstrek). */
async function listFiles(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

/** Rekkefølgen filene lastes opp i: alt annet først, sw.js sist. */
export function uploadOrder(files) {
  return [...files.filter((f) => f !== 'sw.js'), ...files.filter((f) => f === 'sw.js')];
}

/** Kommandoene til sftp -b. Bindestrek foran mkdir: feilen ignoreres når mappa finnes. */
export function sftpBatch(files, localDir, remoteDir) {
  const dirs = [...new Set(files.filter((f) => f.includes('/')).map((f) => f.slice(0, f.lastIndexOf('/'))))];
  const q = (s) => `"${s.replace(/\\/g, '/').replace(/"/g, '\\"')}"`;
  return [
    `-mkdir ${q(remoteDir)}`,
    ...dirs.map((d) => `-mkdir ${q(`${remoteDir}/${d}`)}`),
    ...uploadOrder(files).map((f) => `put ${q(path.join(localDir, f))} ${q(`${remoteDir}/${f}`)}`),
  ].join('\n') + '\n';
}

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, ...opts });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', (e) => resolve({ code: -1, out: String(e.message) }));
    child.on('close', (code) => resolve({ code, out }));
  });
}

/** Sjekker hver fil over https mot den lokale. Gir lista over avvik. */
async function verify(webDir, files) {
  const problems = [];
  const stamp = Date.now();
  for (const f of files) {
    if (f === '.htaccess') {
      // Apache viser aldri .htaccess. 403 betyr at den ligger der og er i bruk.
      const res = await fetch(TARGET.url + f, { cache: 'no-store' });
      if (res.status !== 403) problems.push(`${f}: ventet 403, fikk ${res.status}`);
      continue;
    }
    const res = await fetch(`${TARGET.url}${f}?sjekk=${stamp}`, { cache: 'no-store' });
    if (!res.ok) { problems.push(`${f}: HTTP ${res.status}`); continue; }
    const remote = Buffer.from(await res.arrayBuffer());
    const local = await readFile(path.join(webDir, f));
    if (sha(remote) !== sha(local)) problems.push(`${f}: innholdet på nettsiden er ikke likt det lokale`);
  }
  const head = await fetch(TARGET.url, { method: 'HEAD', cache: 'no-store' });
  if (!/no-cache/.test(head.headers.get('cache-control') || '')) problems.push('index.html: mangler Cache-Control: no-cache (.htaccess virker ikke?)');
  return problems;
}

async function main() {
  const webDir = path.join(root, 'dist', 'web');
  const checkOnly = args.has('--bare-sjekk');
  const preview = args.has('--forhandsvis');

  if (!checkOnly) {
    if (!preview) {
      console.log('1/4 Kjører testene …');
      const t = await run(process.execPath, ['--test'], { cwd: root });
      if (t.code !== 0) {
        console.error(t.out.split('\n').filter((l) => /fail|✖|Error/.test(l)).slice(0, 20).join('\n'));
        throw new Error('Testene feilet. Ingenting er lastet opp.');
      }
    }
    console.log(`${preview ? '' : '2/4 '}Bygger …`);
    await build({ quiet: true });
  }
  if (!existsSync(webDir)) throw new Error('Fant ikke dist/web. Kjør bygget først.');
  const files = await listFiles(webDir);

  if (preview) {
    console.log(`Ville lastet opp ${files.length} filer til ${TARGET.user}@${TARGET.host}:${TARGET.dir} (sw.js sist):`);
    for (const f of uploadOrder(files)) console.log('  ' + f);
    return;
  }

  if (!checkOnly) {
    if (!existsSync(TARGET.key)) throw new Error(`Fant ikke nøkkelen ${TARGET.key}.`);
    console.log(`3/4 Laster opp ${files.length} filer til ${TARGET.url} …`);
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'elverktoy-sftp-'));
    try {
      const batch = path.join(tmp, 'opplasting.txt');
      await writeFile(batch, sftpBatch(files, webDir, TARGET.dir));
      const sshOpts = ['-i', TARGET.key, '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'ConnectTimeout=15', '-o', `UserKnownHostsFile=${TARGET.knownHosts}`];
      // Første gang: koble til én gang for å lagre vertsnøkkelen, og sjekk at den er den vi kjenner.
      if (!existsSync(TARGET.knownHosts)) {
        const first = await run('ssh', [...sshOpts, '-o', 'StrictHostKeyChecking=accept-new', `${TARGET.user}@${TARGET.host}`, 'true']);
        const fp = existsSync(TARGET.knownHosts) ? await run('ssh-keygen', ['-lf', TARGET.knownHosts]) : { out: '' };
        if (!fp.out.includes(TARGET.hostFingerprint)) {
          await rm(TARGET.knownHosts, { force: true });
          throw new Error(fp.out ? 'Webserveren har en annen vertsnøkkel enn før. Opplastingen er stoppet for sikkerhets skyld.' : `Fikk ikke kontakt med webserveren:\n${first.out.trim()}`);
        }
      }
      // Bare den lagrede vertsnøkkelen godtas. Er den endret, stopper opplastingen.
      // Webhotellet avviser av og til en oppkobling før innlogging (mange samtidige forsøk fra andre).
      // Da ventes det litt og prøves igjen, høyst tre ganger. Opplastingen kan trygt gjentas.
      let res;
      for (let attempt = 1; attempt <= 3; attempt++) {
        res = await run('sftp', ['-b', batch, ...sshOpts, '-o', 'StrictHostKeyChecking=yes', `${TARGET.user}@${TARGET.host}`]);
        const refused = res.code !== 0 && /Connection closed|Connection reset|kex_exchange_identification/i.test(res.out) && !/Permission denied|Authenticated/i.test(res.out);
        if (!refused || attempt === 3) break;
        console.log(`   Serveren avviste oppkoblingen. Prøver igjen om 30 sekunder (${attempt + 1} av 3) …`);
        await new Promise((r) => setTimeout(r, 30000));
      }
      if (res.code !== 0) {
        if (/REMOTE HOST IDENTIFICATION HAS CHANGED|Host key verification failed/i.test(res.out)) {
          throw new Error('Webserveren har en annen vertsnøkkel enn før. Opplastingen er stoppet for sikkerhets skyld.');
        }
        const denied = /Permission denied/i.test(res.out);
        throw new Error(denied
          ? 'Webserveren godtok ikke nøkkelen. Ligger den offentlige delen i ~/.ssh/authorized_keys på webhotellet?'
          : `Opplastingen feilet:\n${res.out.trim()}`);
      }
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }

  console.log(`${checkOnly ? '' : '4/4 '}Sjekker nettsiden …`);
  const problems = await verify(webDir, files);
  if (problems.length) {
    console.error('Avvik:\n' + problems.map((p) => '  ' + p).join('\n'));
    process.exit(1);
  }
  const { version } = JSON.parse(await readFile(path.join(webDir, 'version.json'), 'utf8'));
  console.log(`Ferdig. Versjon ${version} ligger på ${TARGET.url}, og alle ${files.length} filene er like de lokale.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

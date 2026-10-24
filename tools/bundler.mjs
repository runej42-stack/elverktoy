// Liten bundler uten pakker: pakker appens ES-moduler i ett vanlig <script>.
//
// Strenge regler (bygget feiler ellers):
//  - bare statiske, relative importer på egen linje: import { a, b as c } from './x.js';
//    eller import * as ns from './x.js';
//  - bare navngitte eksporter: export function/const/class navn, eller export { a, b as c };
//  - ikke export default, export let/var, re-eksport, import() eller import.meta
//  - ingen sirkulære importer
// Hver modul pakkes i sin egen funksjon, så navn ikke kolliderer mellom moduler.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const IMPORT_RE = /^import\s+([\s\S]*?)\s+from\s+(['"])([^'"]+)\2\s*;?[ \t]*$/gm;
const SIDE_IMPORT_RE = /^import\s+(['"])([^'"]+)\1\s*;?[ \t]*$/gm;
const EXPORT_DECL_RE = /^export\s+((?:async\s+)?function\s*\*?\s*|const\s+|class\s+)([A-Za-z_$][\w$]*)/gm;
const EXPORT_LIST_RE = /^export\s*\{([^}]*)\}\s*;?[ \t]*$/gm;

function fail(id, msg) {
  throw new Error(`${id}: ${msg}`);
}

function resolve(fromId, spec) {
  if (!spec.startsWith('./') && !spec.startsWith('../')) fail(fromId, `bare relative importer er lov («${spec}»)`);
  if (!spec.endsWith('.js')) fail(fromId, `import må slutte på .js («${spec}»)`);
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromId), spec));
}

function parseClause(id, clause) {
  clause = clause.trim();
  const ns = clause.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
  if (ns) return { ns: ns[1] };
  const named = clause.match(/^\{([\s\S]*)\}$/);
  if (!named) fail(id, `bare navngitte importer er lov («import ${clause}»)`);
  const parts = named[1].split(',').map((s) => s.trim()).filter(Boolean).map((p) => {
    const m = p.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
    if (!m) fail(id, `kan ikke lese import «${p}»`);
    return { name: m[1], local: m[2] || m[1] };
  });
  return { names: parts };
}

/** Gjør om én moduls kildekode. Gir { id, deps, exports, body }. */
export function transform(id, src) {
  src = src.replace(/\r\n/g, '\n');
  if (/^export\s+default\b/m.test(src)) fail(id, 'export default er ikke lov');
  if (/^export\s+(let|var)\b/m.test(src)) fail(id, 'export let/var er ikke lov');
  if (/^export\s*\*/m.test(src)) fail(id, 'export * er ikke lov');
  if (/^export\s*\{[^}]*\}\s*from\b/m.test(src)) fail(id, 're-eksport er ikke lov');
  if (/^export\s+(const|let|var)\s*[{[]/m.test(src)) fail(id, 'eksport med destrukturering er ikke lov');
  if (/\bimport\s*\(/.test(src)) fail(id, 'dynamisk import() er ikke lov');
  if (/\bimport\.meta\b/.test(src)) fail(id, 'import.meta er ikke lov');

  const deps = [];
  const exports = [];
  let body = src.replace(IMPORT_RE, (all, clause, q, spec) => {
    const dep = resolve(id, spec);
    deps.push(dep);
    const c = parseClause(id, clause);
    if (c.ns) return `const ${c.ns} = __m[${JSON.stringify(dep)}];`;
    return `const { ${c.names.map((n) => (n.name === n.local ? n.name : `${n.name}: ${n.local}`)).join(', ')} } = __m[${JSON.stringify(dep)}];`;
  });
  body = body.replace(SIDE_IMPORT_RE, (all, q, spec) => {
    deps.push(resolve(id, spec));
    return '';
  });
  body = body.replace(EXPORT_DECL_RE, (all, kind, name) => {
    exports.push({ name, local: name });
    return kind + name;
  });
  body = body.replace(EXPORT_LIST_RE, (all, list) => {
    for (const p of list.split(',').map((s) => s.trim()).filter(Boolean)) {
      const m = p.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
      if (!m) fail(id, `kan ikke lese eksport «${p}»`);
      exports.push({ name: m[2] || m[1], local: m[1] });
    }
    return '';
  });
  const leftover = body.match(/^(import|export)\b.*$/m);
  if (leftover) fail(id, `ukjent import/export-linje: «${leftover[0].slice(0, 80)}»`);
  return { id, deps, exports, body };
}

/**
 * Pakker inngangsmodulen og alt den importerer. overrides: { 'src/x.js': 'kildekode' }
 * erstatter filer (brukes for å velge merkevareprofil).
 */
export async function bundle(entry, { root, overrides = {} }) {
  const modules = new Map();
  const order = [];
  const visiting = new Set();

  async function visit(id, from) {
    if (modules.has(id)) return;
    if (visiting.has(id)) fail(from, `sirkulær import av ${id}`);
    visiting.add(id);
    const src = Object.prototype.hasOwnProperty.call(overrides, id)
      ? overrides[id]
      : await readFile(path.join(root, id), 'utf8').catch(() => fail(from || id, `finner ikke ${id}`));
    const mod = transform(id, src);
    for (const dep of mod.deps) await visit(dep, id);
    visiting.delete(id);
    modules.set(id, mod);
    order.push(mod);
  }
  await visit(entry, entry);

  const parts = ['(function () {\n"use strict";\nvar __m = Object.create(null);\nglobalThis.__elverktoyModules = __m;\n'];
  for (const m of order) {
    const ret = m.exports.map((e) => (e.name === e.local ? e.name : `${JSON.stringify(e.name)}: ${e.local}`)).join(', ');
    parts.push(`// ---- ${m.id} ----\n__m[${JSON.stringify(m.id)}] = (function () {\n${m.body}\nreturn { ${ret} };\n})();\n`);
  }
  parts.push('})();\n');
  return { code: parts.join(''), order };
}

// Leser tabellene for strømføringsevne (JSON fra avskriften) og skriver src/data/iz.js.
//   node tools/import-iz.mjs <sti til iz_tables.json>
// Hver tabell beholder kildene sine. Kontrollen mot NEK 400:2026 registreres i
// src/data/iz-verified.js (hvem og når), ikke her.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2];
if (!input) throw new Error('Bruk: node tools/import-iz.mjs <iz_tables.json>');
const data = JSON.parse(await readFile(input, 'utf8'));

const header = `// Strømføringsevne og korreksjonsfaktorer etter IEC 60364-5-52:2009 tillegg B
// (samme tabeller som NEK 400-5-52, tabell 52B.x). Generert av tools/import-iz.mjs
// fra avskrift av offentlig tilgjengelige gjengivelser – se «sources» i hver tabell.
// Ikke rediger for hånd. Kontroll mot NEK 400:2026 registreres i iz-verified.js.

export const IZ_TABLES = ${JSON.stringify(data, null, 1)};
`;
await writeFile(path.join(root, 'src', 'data', 'iz.js'), header, 'utf8');
console.log(`Skrev src/data/iz.js med ${Object.keys(data).length} tabeller`);

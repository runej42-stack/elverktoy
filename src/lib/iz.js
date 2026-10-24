// Strømføringsevne: Iz = tabellverdi · korreksjonsfaktorer (temperatur, samlet forlegning, jord).
// Tabellene ligger i src/data/iz.js (avskrift av IEC 60364-5-52 tillegg B, samme som NEK 400-5-52).
// Mellom tabellverdier velges alltid den ugunstige siden (høyere temperatur, flere kurser).

import { v, silent } from '../core/engine.js';
import { IZ_TABLES } from '../data/iz.js';

// Sortert etter hvor ofte en elektriker i bolig og vanlig næring bruker dem. Metode F og G
// (enlederkabler i fri luft) er tatt bort: mellom trafo og tavle brukes skinner, og enlederkabel
// på bro eller i jord er i praksis e-verkets og storanleggenes område.
export const METHODS = [
  { value: 'A1', label: 'A1 – kabel direkte i isolert vegg, eller PN i rør i isolert vegg (bolig)', ground: false },
  { value: 'B2', label: 'B2 – kabel i rør eller kanal på vegg', ground: false },
  { value: 'C', label: 'C – kabel klamret på vegg eller i tak, eller innstøpt (synlig anlegg)', ground: false },
  { value: 'D1', label: 'D1 – kabel i rør i jord (utelys, garasje, lader)', ground: true },
  { value: 'D2', label: 'D2 – kabel direkte i jord', ground: true },
  { value: 'E', label: 'E – kabel på kabelbro eller kabelstige (næring)', ground: false },
  { value: 'A2', label: 'A2 – kabel i rør i isolert vegg', ground: false },
  { value: 'B1', label: 'B1 – PN (enledere) i rør eller kanal på vegg', ground: false },
];

export const isGround = (method) => method === 'D1' || method === 'D2';
export const isFreeAir = (method) => method === 'E';

/** Tabellnøkkel ut fra isolasjon (tp = termoplast/PVC 70 °C, th = termoherd/PEX 90 °C), belastede ledere og forlegning. */
export function tableKey(ins, loaded, method, material) {
  if (isFreeAir(method)) {
    const al = material === 'Al';
    if (ins === 'th') return al ? 'B.52.13' : 'B.52.12';
    return al ? 'B.52.11' : 'B.52.10';
  }
  if (ins === 'th') return loaded === 3 ? 'B.52.5' : 'B.52.3';
  return loaded === 3 ? 'B.52.4' : 'B.52.2';
}

/** Kolonnen i tabellen. Metode E har egne kolonner for 2 og 3 belastede ledere. */
function columnKey({ method, loaded }) {
  if (method === 'E') return loaded === 3 ? 'E3' : 'E2';
  return method;
}

/** Tabellverdi for Iz (A), eller null når tabellen ikke har verdien. */
export function tableIz({ ins, loaded, material, method, S }) {
  const t = IZ_TABLES[tableKey(ins, loaded, method, material)];
  if (!t) return null;
  const i = t.sizes.indexOf(S);
  if (i < 0) return null;
  const key = columnKey({ method, loaded });
  const col = key && (t[material === 'Al' ? 'Al' : 'Cu'] || {})[key];
  const val = col ? col[i] : null;
  return val == null ? null : val;
}

/** Første verdi i lista som er ≥ x (den ugunstige siden), med indeks. */
function atOrAbove(list, x) {
  for (let i = 0; i < list.length; i++) if (list[i] >= x - 1e-9) return i;
  return -1;
}

/** Temperaturfaktor. Luft: tabell B.52.14 (30 °C). Jord: B.52.15 (20 °C). */
export function tempFactor({ ins, method, temp }) {
  const key = isGround(method) ? 'B.52.15' : 'B.52.14';
  const t = IZ_TABLES[key];
  if (!t) return null;
  const i = atOrAbove(t.temps, temp);
  if (i < 0) return null;
  const f = t[ins === 'th' ? 'XLPE' : 'PVC'][i];
  return f == null ? null : { factor: f, temp: t.temps[i], key };
}

// ---------- Samlet forlegning ----------

/** Radene i B.52.17 med norsk tekst. Verdien er radnummeret i tabellen. */
const B17 = {
  1: 'Samlet i bunt, på vegg, innstøpt eller i rør eller kanal',
  2: 'Ett lag på vegg, gulv eller bro uten hull',
  3: 'Ett lag rett under tak av tre',
  4: 'Ett lag på perforert bro, liggende eller stående',
  5: 'Ett lag på kabelstige eller i klammer',
};

/** Bro og stige for metode E (B.52.20). system og arrangement peker på radene i tabellen. */
const TRAY = {
  'e-perf': { key: 'B.52.20', system: 'Perforated', arrangement: 'touching', label: 'Perforert bro, kablene inntil hverandre' },
  'e-perf-avstand': { key: 'B.52.20', system: 'Perforated', arrangement: 'spaced', label: 'Perforert bro, avstand lik kabeldiameteren' },
  'e-vert': { key: 'B.52.20', system: 'Vertical', arrangement: 'touching', label: 'Stående perforert bro, kablene inntil hverandre' },
  'e-vert-avstand': { key: 'B.52.20', system: 'Vertical', arrangement: 'spaced', label: 'Stående perforert bro, avstand lik kabeldiameteren' },
  'e-tett': { key: 'B.52.20', system: 'Unperforated', arrangement: 'touching', label: 'Bro uten hull (tett bunn), kablene inntil hverandre' },
  'e-stige': { key: 'B.52.20', system: 'Cable ladder', arrangement: 'touching', label: 'Kabelstige eller klammer, kablene inntil hverandre' },
  'e-stige-avstand': { key: 'B.52.20', system: 'Cable ladder', arrangement: 'spaced', label: 'Kabelstige eller klammer, avstand lik kabeldiameteren' },
};

export const isTray = (arr) => typeof arr === 'string' && Object.prototype.hasOwnProperty.call(TRAY, arr);

/** Avstand mellom kursene i jord. D2: B.52.18 (mellom kablene). D1: B.52.19 (mellom rørene). */
const GAPS = {
  D2: [
    { value: 'touching', label: 'Kablene inntil hverandre' },
    { value: 'oneCableDiameter', label: 'Én kabeldiameter mellom' },
    { value: '0.125m', label: '0,125 m mellom' },
    { value: '0.25m', label: '0,25 m mellom' },
    { value: '0.5m', label: '0,5 m mellom' },
  ],
  D1: [
    { value: 'touching', label: 'Rørene inntil hverandre' },
    { value: '0.25m', label: '0,25 m mellom rørene' },
    { value: '0.5m', label: '0,5 m mellom rørene' },
    { value: '1.0m', label: '1 m mellom rørene' },
  ],
};

/** Valgene for avstand mellom kursene i jord. */
export function groundGapOptions(method) {
  return GAPS[method] || GAPS.D2;
}

/** Faktor for flere kurser i jord (B.52.18, og B.52.19 del A: flerlederkabel i hvert rør). */
function groundFactor({ method, n, gap = 'touching' }) {
  if (!n || n <= 1) return { factor: 1, n: 1, key: null };
  const key = method === 'D1' ? 'B.52.19' : 'B.52.18';
  const t = IZ_TABLES[key];
  if (!t) return { factor: null, problem: `Mangler tabell ${key}.` };
  const set = method === 'D1' ? t.multiCoreSingleWayDucts.factors : t.factors;
  const col = set[gap];
  if (!col) return { factor: null, problem: `Tabell ${key} har ingen verdi for denne avstanden.` };
  const i = atOrAbove(t.circuits, n);
  if (i < 0) return { factor: null, problem: `Tabell ${key} dekker opptil ${t.circuits[t.circuits.length - 1]} kurser i jord.` };
  const f = col[i];
  if (f == null) return { factor: null, problem: `Tabell ${key} har ingen verdi for ${t.circuits[i]} kurser med denne avstanden.` };
  const gapLabel = (groundGapOptions(method).find((g) => g.value === gap) || {}).label || '';
  const mis = t.likelyMisprint;
  const misprint = !!(mis && mis.circuits === t.circuits[i] && mis.clearance === gap);
  return { factor: f, n: t.circuits[i], key, capped: false, text: gapLabel.toLowerCase(), ground: true, misprint };
}

const b17 = (item) => ({ value: item, label: B17[item] });
const tray = (id) => ({ value: id, label: TRAY[id].label });

/** Valgene for samlet forlegning. A, B og jord har ingen valg her (feltet skjules). */
export function groupOptions(method) {
  if (method === 'C') return [1, 2, 3].map(b17);
  if (method === 'E') return [...['e-perf', 'e-perf-avstand', 'e-vert', 'e-vert-avstand', 'e-tett', 'e-stige', 'e-stige-avstand'].map(tray), b17(1)];
  return [b17(1)];
}

/** Har metoden noe å velge mellom for samlet forlegning? (A og B har bare bunt.) */
export const hasGroupChoice = (method) => method === 'C' || method === 'E';

function trayRows(arr) {
  const d = TRAY[arr];
  const t = d && IZ_TABLES[d.key];
  if (!t) return [];
  return t.rows.filter((r) => r.system.startsWith(d.system) && r.arrangement.startsWith(d.arrangement));
}

/** Antall broer eller stiger tabellen har verdier for, for valgt bro/stige. */
export function trayCountOptions(arr) {
  return trayRows(arr).map((r) => ({ value: r.trays, label: String(r.trays) }));
}

/**
 * Faktor for samlet forlegning i luft.
 * B.52.17 (arrangement 1–3 og bunt, n kurser samlet) og B.52.20 (bro og stige: nTray per bro, trays broer).
 * Gir { factor, n, key, capped, text } eller { factor: null, problem } når tabellen ikke dekker valget.
 */
export function groupFactor({ method, arrangement, n, nTray = 1, trays = 1, gap }) {
  if (isGround(method)) return groundFactor({ method, n, gap });
  if (isTray(arrangement)) {
    const d = TRAY[arrangement];
    const t = IZ_TABLES[d.key];
    const row = trayRows(arrangement).find((r) => r.trays === trays);
    if (!t || !row) return { factor: null, problem: `Tabell ${d.key} har ingen verdi for ${trays} broer eller stiger med denne forlegningen.` };
    const counts = t.cablesPerTray || t.circuitsPerTray;
    const i = atOrAbove(counts, nTray);
    if (i < 0) return { factor: null, problem: `Tabell ${d.key} dekker opptil ${counts[counts.length - 1]} kurser per bro eller stige.` };
    const f = row.factors[i];
    if (f == null) {
      const problem = d.arrangement === 'spaced'
        ? `Tabell ${d.key} har ingen verdi for ${counts[i]} kabler med avstand. Velg «inntil hverandre» (gir lavere faktor) eller færre kabler.`
        : `Tabell ${d.key} har ingen verdi for ${counts[i]} kabler på ${d.label.charAt(0).toLowerCase()}${d.label.slice(1)}. Velg færre per bro, flere broer eller en annen forlegning.`;
      return { factor: null, problem };
    }
    return { factor: f, n: counts[i], trays, key: d.key, capped: false, text: d.label, tray: true };
  }
  const t = IZ_TABLES['B.52.17'];
  if (!t) return { factor: null, problem: 'Mangler tabell B.52.17.' };
  const item = method === 'C' || method === 'E' ? arrangement : 1;
  const row = t.arrangements.find((a) => a.item === item) || t.arrangements[0];
  // Én kurs: faktoren i første kolonne. Den er 1 unntatt rett under tak av tre (rad 3: 0,95).
  if (!n || n <= 1) {
    const f1 = row.factors[0];
    return f1 < 1 ? { factor: f1, n: 1, key: 'B.52.17', capped: false, text: B17[row.item] } : { factor: 1, n: 1, key: null };
  }
  let i = atOrAbove(t.circuits, n);
  let capped = false;
  if (i < 0) { i = t.circuits.length - 1; capped = true; }
  let f = row.factors[i];
  // Tabellen gir ingen videre reduksjon etter ni kurser for ett lag (rad 2–5).
  for (let j = i; f == null && j >= 0; j--) f = row.factors[j];
  return f == null ? { factor: null, problem: 'Tabell B.52.17 har ingen verdi for dette.' } : { factor: f, n: t.circuits[i], key: 'B.52.17', capped, text: B17[row.item] };
}

// ---------- Iz ----------

const mm2 = (S) => String(S).replace('.', ',');

/**
 * Hvorfor Iz ikke kan regnes ut for valget, eller null når alt er i orden.
 * ignoreSize: sjekk bare det som gjelder uansett tverrsnitt (brukes før søket etter tverrsnitt).
 */
export function izProblem(p, { ignoreSize = false } = {}) {
  const { method, loaded, S, material } = p;
  if (!tempFactor(p)) {
    const key = isGround(method) ? 'B.52.15' : 'B.52.14';
    return `Temperaturen er utenfor tabell ${key} for denne isolasjonen.`;
  }
  const g = groupFactor(p);
  if (g.factor == null) return g.problem;
  if (!ignoreSize && tableIz(p) == null) {
    const key = tableKey(p.ins, loaded, method, material);
    if (method === 'E' && S > 300) return `Metode E går bare opp til 300 mm² (tabell ${key}).`;
    return `Tabell ${key} har ingen verdi for ${mm2(S)} mm² ${material} med metode ${method}.`;
  }
  return null;
}

/** Tabellene som brukes for valget (for merking av tabeller som ikke er kontrollert). */
export function tablesUsed(p) {
  const keys = [tableKey(p.ins, p.loaded, p.method, p.material), isGround(p.method) ? 'B.52.15' : 'B.52.14'];
  const g = groupFactor(p);
  if (g.key) keys.push(g.key);
  return keys;
}

/**
 * Iz med steg. Gir { Iz, Iz0, kT, kG } eller null når tabellen mangler verdien (se izProblem).
 * params: { ins, loaded, material, method, S, temp, arrangement, n, nTray, trays, gap }
 */
export function izFor(p, ctx = silent) {
  const Iz0 = tableIz(p);
  if (Iz0 == null) return null;
  const kT = tempFactor(p);
  const kG = groupFactor(p);
  if (!kT || kG.factor == null) return null;
  const group = kG.tray
    ? `${kG.text.charAt(0).toLowerCase()}${kG.text.slice(1)}, ${kG.n} per bro, ${kG.trays} ${kG.trays === 1 ? 'bro' : 'broer'}`
    : kG.ground ? `${kG.n} kurser i jord, ${kG.text}`
      : kG.n > 1 ? `${kG.n} kurser samlet` : 'alene';
  const Iz = ctx.step('Iz', 'Iz₀·kT·kG', { 'Iz₀': v(Iz0, 'A'), kT: kT.factor, kG: kG.factor }, 'A', {
    text: `Tabell ${tableKey(p.ins, p.loaded, p.method, p.material)} (${p.method}, ${mm2(p.S)} mm² ${p.material}) · temperatur ${kT.temp} °C · ${group}`,
  });
  return { Iz, Iz0, kT, kG };
}

/**
 * Ledertemperatur ved strømmen I. Temperaturstigningen er proporsjonal med I², som er samme
 * grunnlag som korreksjonsfaktorene for temperatur i tabell B.52.14 og B.52.15.
 *
 * Ved samlet forlegning (kG < 1) varmer de andre kursene også denne. Faktoren kG er regnet for
 * like stor last i alle kursene, så her regnes det med at de andre kan gå med full last:
 *   egen oppvarming (I/Iz₁)² · (θmaks − θa), der Iz₁ = Iz/kG er Iz for kursen alene,
 *   pluss oppvarming fra de andre (1 − kG²) · (θmaks − θa).
 * Med kG = 1 blir det θa + (I/Iz)² · (θmaks − θa).
 */
export function conductorTemp({ I, Iz, kG = 1, ambient, thetaMax }, ctx = silent, label = 'θ') {
  if (!(kG < 1)) {
    return ctx.step(label, 'θa + (I/Iz)²·(θmaks − θa)', {
      θa: v(ambient, '°C'), I: v(I, 'A'), Iz: v(Iz, 'A'), θmaks: v(thetaMax, '°C'),
    }, '°C', { text: 'Ledertemperatur ut fra strømmen: temperaturstigningen øker med strømmen i andre potens' });
  }
  const Iz1 = ctx.step('Iz₁', 'Iz/kG', { Iz: v(Iz, 'A'), kG }, 'A', { text: 'Strømføringsevne for kursen alene' });
  return ctx.step(label, 'θa + ((1 − kG²) + (I/Iz₁)²)·(θmaks − θa)', {
    θa: v(ambient, '°C'), kG, I: v(I, 'A'), 'Iz₁': v(Iz1, 'A'), θmaks: v(thetaMax, '°C'),
  }, '°C', { text: 'Ledertemperatur ut fra strømmen, med de andre kursene i gruppen på full last' });
}

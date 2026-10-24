// PDF-dokumentene for en jobb: kursfortegnelse, måleprotokoll, sluttkontroll, risikovurdering
// og alt samlet.

import { Report } from './report.js';
import { CHECKLIST, RISK, RCD_OPTIONS, evaluateCircuit, circuitStatus, networkLabel, checklistSummary } from './model.js';
import { formatNumber } from '../core/number.js';

export const DOCS = [
  { id: 'kurs', title: 'Kursfortegnelse', summary: 'Liste over kursene til sikringsskapet' },
  { id: 'maaling', title: 'Måleprotokoll', summary: 'Målinger per kurs med vurdering' },
  { id: 'sluttkontroll', title: 'Sluttkontroll', summary: 'Sjekkliste etter NEK 400-6' },
  { id: 'risiko', title: 'Risikovurdering', summary: 'Vurderinger før og under arbeidet' },
  { id: 'alt', title: 'Hele jobben', summary: 'Alt over, pluss lagrede beregninger og notater' },
];

const n = (x, opts) => (x == null || x === '' ? '–' : formatNumber(Number(x), opts));
const dateText = (iso) => {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};
const deviceText = (c) => `${c.device === 'gG' ? 'gG' : c.device} ${c.In} A`;
const rcdText = (c) => (RCD_OPTIONS.find((o) => o.value === c.rcd) || { label: '–' }).label.replace('Ingen', '–');
const sizeText = (c) => (c.S ? `${n(c.S)}${c.Spe && c.Spe !== c.S ? ` / PE ${n(c.Spe)}` : ''}` : '–');
const slug = (s) => String(s || 'jobb').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'jobb';

function meta(job) {
  const net = [networkLabel(job.network),
    job.Ik3 != null ? `Ik3 maks ${n(job.Ik3)} kA` : '',
    job.Ikmin != null ? `Ik min ${n(job.Ikmin)} kA` : '',
    job.mainFuse ? `hovedsikring ${n(job.mainFuse)} A` : ''].filter(Boolean).join(' · ');
  return [
    ['Kunde', [job.customer, job.customerContact].filter(Boolean).join(', ')],
    ['Adresse', job.address],
    ['Utført av', [job.company, job.installer].filter(Boolean).join(', ')],
    ['Dato', dateText(job.date)],
    ['Nett', net],
    ['Nettselskap', job.gridCompany],
    ['Beskrivelse', job.description],
  ];
}

function kursTable(r, job) {
  r.heading('Kursfortegnelse');
  if (!job.circuits.length) { r.para('Ingen kurser registrert.'); return; }
  r.table({
    columns: [
      { title: 'Kurs', width: 0.8 }, { title: 'Beskrivelse', width: 3.4 }, { title: 'Vern', width: 1.2 },
      { title: 'Jordfeil', width: 1.6 }, { title: 'Kabel', width: 1.9 }, { title: 'mm²', width: 1.3 }, { title: 'Lengde m', width: 1, align: 'right' },
    ],
    rows: job.circuits.map((c) => [c.no, [c.desc, c.room].filter(Boolean).join(' – '), deviceText(c), rcdText(c), c.cable || '–', sizeText(c), n(c.L)]),
  });
}

function maalingTable(r, job) {
  r.heading('Måleprotokoll');
  if (!job.circuits.length) { r.para('Ingen kurser registrert.'); return; }
  const polarity = (v) => (v === 'ok' ? 'OK' : v === 'fail' ? 'Feil' : v === 'na' ? 'I.a.' : '–');
  r.table({
    columns: [
      { title: 'Kurs', width: 0.8 }, { title: 'Vern', width: 1.1 },
      { title: 'Isolasjon MΩ', width: 1.3, align: 'right' }, { title: 'R1+R2 Ω', width: 1.2, align: 'right' },
      { title: 'Ik A', width: 1, align: 'right' }, { title: 'JFB ms', width: 1, align: 'right' },
      { title: 'JFB mA', width: 1, align: 'right' }, { title: 'Polaritet', width: 1.1, align: 'center' },
      { title: 'Status', width: 0.9, status: true },
    ],
    rows: job.circuits.map((c) => {
      const m = c.meas || {};
      return [c.no, deviceText(c), n(m.riso), n(m.r1r2), n(m.ik), n(m.rcdTime), n(m.rcdCurrent), polarity(m.polarity), circuitStatus(c) || 'na'];
    }),
  });
  const notes = [];
  for (const c of job.circuits) {
    for (const e of evaluateCircuit(c)) if (e.status === 'fail' || e.status === 'border') notes.push(`Kurs ${c.no}, ${e.label}: ${e.text}`);
    if (c.remark) notes.push(`Kurs ${c.no}: ${c.remark}`);
  }
  if (notes.length) {
    r.para('Avvik og merknader', { bold: true });
    for (const t of notes) r.para(`• ${t}`, { size: 9 });
  }
  r.para('Krav brukt i vurderingen: isolasjon ≥ 1 MΩ ved 500 V DC; Ik ≥ strøm for utkobling innen 0,4 s; jordfeilbryter ≤ 300 ms ved IΔn (S-type 130–500 ms) og utløsning mellom 0,5 og 1,0 · IΔn.', { size: 8, color: '#5c636a' });
}

function checklistSection(r, title, list, state) {
  r.heading(title);
  const sum = checklistSummary(list, state || {});
  r.para(`${sum.done} av ${sum.total} punkter vurdert${sum.deviations ? `, ${sum.deviations} avvik` : ''}.`, { size: 9, color: '#5c636a' });
  for (const sec of list) {
    r.para(sec.title, { bold: true, size: 10 });
    r.checklist(sec.items.map(([id, text]) => {
      const s = (state || {})[id] || {};
      return { status: s.status || null, text, note: s.note || '' };
    }));
  }
}

function calculations(r, job) {
  if (!job.calculations.length) return;
  r.heading('Lagrede beregninger');
  for (const calc of job.calculations) {
    r.para(`${calc.title} – ${dateText(calc.savedAt)}`, { bold: true, size: 10 });
    r.para(calc.text.split('\n').filter((l) => l && !/^Elverktøy|hjelpemiddel/.test(l)).join('\n'), { size: 9 });
  }
}

/** Lager PDF-en. Gir { bytes, fileName, title, pages, doc }. */
export function buildPdf(job, kind, { appName = 'Elverktøy', version = '' } = {}) {
  const doc = DOCS.find((d) => d.id === kind) || DOCS[0];
  const title = kind === 'alt' ? 'Dokumentasjon' : doc.title;
  const r = new Report({
    title,
    subtitle: [job.title, job.address].filter(Boolean).join(' – '),
    meta: meta(job),
    footer: `${appName}${version ? ` ${version}` : ''} · laget ${dateText(new Date().toISOString())} · hjelpemiddel, kontroller mot NEK 400:2026`,
    author: [job.company, job.installer].filter(Boolean).join(', '),
    creator: appName,
  });
  if (kind === 'kurs' || kind === 'alt') kursTable(r, job);
  if (kind === 'maaling' || kind === 'alt') maalingTable(r, job);
  if (kind === 'sluttkontroll' || kind === 'alt') checklistSection(r, 'Sluttkontroll', CHECKLIST, job.checklist);
  if (kind === 'risiko' || kind === 'alt') checklistSection(r, 'Risikovurdering', RISK, job.risk);
  if (kind === 'alt') {
    calculations(r, job);
    if (job.notes) { r.heading('Notater'); r.para(job.notes); }
  }
  if (kind !== 'kurs') r.signatures(['Sted og dato', 'Signatur']);
  const bytes = r.finish();
  return { bytes, fileName: `${slug(doc.title)}-${slug(job.title)}-${String(job.date || '').slice(0, 10)}.pdf`, title: `${title} – ${job.title || 'jobb'}`, pages: r.doc.pages, doc: r.doc };
}

// Datamodell for jobber: kurser med målinger, sjekklister og lagrede beregninger.
// Vurderingen av målinger skjer her (rene funksjoner), så den kan testes.

import { NETWORKS } from '../core/settings.js';
import { tripCurrent } from '../data/vern.js';
import { r20 } from '../lib/kabel.js';
import { ALPHA } from '../data/ledere.js';

export const JOB_SCHEMA = 1;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function newJob(settings = {}) {
  const now = new Date().toISOString();
  return {
    id: uid(), schema: JOB_SCHEMA, createdAt: now, updatedAt: now,
    title: '', address: '', customer: '', customerContact: '', description: '',
    company: '', installer: '', date: now.slice(0, 10),
    network: settings.network || 'TN400', Ik3: null, Ikmin: null, mainFuse: null, gridCompany: '',
    circuits: [], checklist: {}, risk: {}, calculations: [], notes: '',
  };
}

export function newCircuit(job) {
  const n = job.circuits.length + 1;
  return {
    id: uid(), no: String(n), desc: '', room: '',
    device: 'C', In: 16, rcd: 'A30', cable: '', material: 'Cu', S: 2.5, Spe: 2.5, L: null, phases: 1,
    meas: { riso: null, r1r2: null, ik: null, rcdTime: null, rcdCurrent: null, polarity: null, phaseSeq: null },
    remark: '',
  };
}

export const RCD_OPTIONS = [
  { value: 'none', label: 'Ingen' },
  { value: 'A30', label: 'Type A 30 mA' },
  { value: 'F30', label: 'Type F 30 mA' },
  { value: 'B30', label: 'Type B 30 mA' },
  { value: 'A300', label: 'Type A 300 mA' },
  { value: 'S300', label: 'Type S 300 mA (forsinket)' },
];

export const rcdInfo = (code) => {
  if (!code || code === 'none') return null;
  const type = code[0];
  const idn = Number(code.slice(1));
  return { type, idn, selective: type === 'S' };
};

export const networkLabel = (id) => (NETWORKS.find((n) => n.id === id) || NETWORKS[0]).label;

/** Forventet R1 + R2 (Ω) ved 20 °C, eller null når lengde/tverrsnitt mangler. */
export function expectedR1R2(c, theta = 20) {
  if (!c.L || !c.S || !c.Spe) return null;
  const mat = c.material === 'Al' ? 'Al' : 'Cu';
  const a = r20(mat, c.S);
  const b = r20(mat, c.Spe);
  if (a == null || b == null) return null;
  return ((a + b) * c.L / 1000) * (1 + ALPHA[mat] * (theta - 20));
}

/**
 * Vurderer målingene på en kurs. Gir en liste med { key, label, status, text }.
 * status: 'ok' | 'border' | 'fail' | null (ikke målt).
 */
export function evaluateCircuit(c) {
  const out = [];
  const m = c.meas || {};

  // Isolasjonsresistans: kurser til og med 500 V måles med 500 V DC og skal ha minst 1 MΩ.
  if (m.riso != null) {
    out.push({ key: 'riso', label: 'Isolasjon', status: m.riso >= 1 ? 'ok' : 'fail', text: `${fmt(m.riso)} MΩ (krav ≥ 1 MΩ ved 500 V DC)` });
  } else out.push({ key: 'riso', label: 'Isolasjon', status: null, text: 'Ikke målt' });

  // Kontinuitet: sammenlignes med forventet verdi når lengde og tverrsnitt er kjent.
  if (m.r1r2 != null) {
    const exp = expectedR1R2(c);
    if (exp == null) out.push({ key: 'r1r2', label: 'R1 + R2', status: 'ok', text: `${fmt(m.r1r2)} Ω (kontinuitet bekreftet)` });
    else {
      const ratio = m.r1r2 / exp;
      out.push({
        key: 'r1r2', label: 'R1 + R2', status: ratio > 1.5 ? 'border' : 'ok',
        text: `${fmt(m.r1r2)} Ω, forventet ca. ${fmt(exp)} Ω${ratio > 1.5 ? ' – høyere enn forventet, sjekk koblinger' : ''}`,
      });
    }
  } else out.push({ key: 'r1r2', label: 'R1 + R2', status: null, text: 'Ikke målt' });

  // Kortslutningsstrøm/utkobling: målt Ik mot strømmen som gir utkobling innen 0,4 s.
  if (m.ik != null) {
    const trip = tripCurrent(c.device, Number(c.In), 0.4);
    if (!trip) out.push({ key: 'ik', label: 'Ik', status: 'ok', text: `${fmt(m.ik)} A` });
    else {
      const status = m.ik < trip.Ia ? 'fail' : m.ik < trip.Ia * 1.2 ? 'border' : 'ok';
      out.push({
        key: 'ik', label: 'Ik', status,
        text: `${fmt(m.ik)} A, krav ≥ ${fmt(trip.Ia)} A (${trip.basis})${status === 'border' ? ' – målt kald, ved driftstemperatur blir Ik ca. 20 % lavere' : ''}`,
      });
    }
  } else out.push({ key: 'ik', label: 'Ik', status: null, text: 'Ikke målt' });

  // Jordfeilbryter: utløsetid ved IΔn og utløsestrøm.
  const rcd = rcdInfo(c.rcd);
  if (rcd) {
    if (m.rcdTime != null) {
      const ok = rcd.selective ? m.rcdTime >= 130 && m.rcdTime <= 500 : m.rcdTime <= 300;
      out.push({ key: 'rcdTime', label: 'JFB tid', status: ok ? 'ok' : 'fail', text: `${fmt(m.rcdTime)} ms ved IΔn (krav ${rcd.selective ? '130–500' : '≤ 300'} ms)` });
    } else out.push({ key: 'rcdTime', label: 'JFB tid', status: null, text: 'Ikke målt' });
    if (m.rcdCurrent != null) {
      const ok = m.rcdCurrent >= 0.5 * rcd.idn && m.rcdCurrent <= rcd.idn;
      out.push({ key: 'rcdCurrent', label: 'JFB strøm', status: ok ? 'ok' : 'fail', text: `${fmt(m.rcdCurrent)} mA (krav ${fmt(0.5 * rcd.idn)}–${fmt(rcd.idn)} mA)` });
    } else out.push({ key: 'rcdCurrent', label: 'JFB strøm', status: null, text: 'Ikke målt' });
  }

  if (m.polarity) out.push({ key: 'polarity', label: 'Polaritet', status: m.polarity === 'ok' ? 'ok' : m.polarity === 'na' ? 'na' : 'fail', text: m.polarity === 'ok' ? 'Riktig' : m.polarity === 'na' ? 'Ikke aktuelt' : 'Feil' });
  if (c.phases === 3 && m.phaseSeq) out.push({ key: 'phaseSeq', label: 'Fasefølge', status: m.phaseSeq === 'ok' ? 'ok' : 'fail', text: m.phaseSeq === 'ok' ? 'Riktig (høyredreiende)' : 'Feil' });
  return out;
}

/** Samlet status for en kurs: verste av målingene, null når ingenting er målt. */
export function circuitStatus(c) {
  const st = evaluateCircuit(c).map((e) => e.status).filter((s) => s && s !== 'na');
  if (!st.length) return null;
  if (st.includes('fail')) return 'fail';
  if (st.includes('border')) return 'border';
  return 'ok';
}

const fmt = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');

// ---------- Sjekklister (egne formuleringer; rekkefølge etter NEK 400-6) ----------

export const CHECKLIST = [
  {
    id: 'besiktigelse', title: 'Besiktigelse', items: [
      ['b-utstyr', 'Utstyret er riktig valgt for bruksområdet og miljøet (merking, IP-grad, mekanisk styrke).'],
      ['b-beroring', 'Beskyttelse mot direkte berøring: kapslinger, deksler og isolasjon er på plass og uskadd.'],
      ['b-brann', 'Brannskiller og gjennomføringer er tettet, og varmeavgivende utstyr står med nok avstand.'],
      ['b-tverrsnitt', 'Ledertverrsnitt, vern og innstillinger stemmer med kursfortegnelsen og beregningene.'],
      ['b-jordfeil', 'Jordfeilvern er montert der det kreves, med riktig type (A, F eller B).'],
      ['b-ov', 'Overspenningsvern er montert der det kreves, med korte tilkoblingsledere.'],
      ['b-jording', 'Hovedjording, jordelektrode og utjevningsforbindelser er utført og tilkoblet.'],
      ['b-merking', 'Kurser, ledere og fordeling er merket, og kursfortegnelsen henger i fordelingen.'],
      ['b-tilkobling', 'Tilkoblinger er trukket til med riktig moment, og ingen ledere er løse eller skadde.'],
      ['b-tilgang', 'Brytere, vern og fordelinger er tilgjengelige for betjening og vedlikehold.'],
      ['b-spesielle', 'Spesielle rom og områder (bad, utendørs, ladepunkt, solcelleanlegg) oppfyller kravene i del 7.'],
    ],
  },
  {
    id: 'maling', title: 'Måling og prøving', items: [
      ['m-kontinuitet', 'Kontinuitet i beskyttelsesledere og utjevningsforbindelser.'],
      ['m-isolasjon', 'Isolasjonsresistans (500 V DC, minst 1 MΩ for kurser til og med 500 V).'],
      ['m-selv', 'Beskyttelse med SELV/PELV eller elektrisk separasjon, der det er brukt.'],
      ['m-polaritet', 'Polaritet: enpolede brytere og vern bryter faseleder.'],
      ['m-utkobling', 'Automatisk utkobling: sløyfeimpedans eller kortslutningsstrøm er målt og vurdert mot vernene.'],
      ['m-jordfeil', 'Jordfeilbrytere er prøvd (utløsetid og utløsestrøm).'],
      ['m-fasefolge', 'Fasefølge ved trefase stikkontakter og motorer.'],
      ['m-funksjon', 'Funksjonsprøving: brytere, termostater, komfyrvakt, nødlys og styringer virker.'],
      ['m-spenningsfall', 'Spenningsfall er kontrollert der det er aktuelt.'],
    ],
  },
  {
    id: 'dok', title: 'Dokumentasjon', items: [
      ['d-kurs', 'Kursfortegnelse er laget og levert.'],
      ['d-maaling', 'Måleprotokoll er laget.'],
      ['d-samsvar', 'Samsvarserklæring er utarbeidet (fel § 12) og overlevert eier.'],
      ['d-risiko', 'Risikovurdering er dokumentert.'],
      ['d-bruker', 'Brukerdokumentasjon og FDV er overlevert eier.'],
      ['d-melding', 'Ferdigmelding er sendt nettselskapet.'],
    ],
  },
];

// Risikovurdering: egne spørsmål, inspirert av DSBs veiledning om risikovurdering (juni 2026).
export const RISK = [
  {
    id: 'r-bruk', title: 'Bruk og miljø', items: [
      ['r-brukere', 'Hvem skal bruke anlegget (barn, eldre, ufaglærte, publikum)?'],
      ['r-miljo', 'Ytre påvirkninger: fukt, støv, kulde, korrosjon, mekanisk påkjenning, UV.'],
      ['r-brann', 'Brannrisiko: brennbare materialer, rømningsveier, kabler i bærende konstruksjoner.'],
    ],
  },
  {
    id: 'r-forsyning', title: 'Forsyning og vern', items: [
      ['r-nett', 'Nettype og kortslutningsverdier er avklart med nettselskapet.'],
      ['r-ov', 'Behov for overspenningsvern er vurdert (443.4).'],
      ['r-selektiv', 'Selektivitet mellom vern er vurdert der utfall får store følger.'],
      ['r-effekt', 'Effektbehov og fremtidige laster (elbil, varmepumpe, solceller) er vurdert.'],
    ],
  },
  {
    id: 'r-valg', title: 'Valg og utførelse', items: [
      ['r-kabel', 'Kabeltype og brannklasse (minst Dca-s2,d2,a1 etter NEK 400:2026) er riktig valgt.'],
      ['r-forlegning', 'Forlegning, samlet forlegning og omgivelsestemperatur er tatt med i dimensjoneringen.'],
      ['r-avvik', 'Avvik fra NEK 400 er begrunnet og dokumentert med likeverdig sikkerhet.'],
    ],
  },
];

/** Antall avkryssede, avvik og totalt i en sjekkliste. */
export function checklistSummary(list, state) {
  let total = 0; let done = 0; let deviations = 0;
  for (const sec of list) {
    for (const [id] of sec.items) {
      total++;
      const st = state[id] && state[id].status;
      if (st) done++;
      if (st === 'fail') deviations++;
    }
  }
  return { total, done, deviations };
}

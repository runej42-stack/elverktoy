// Jobber og dokumentasjon: liste, jobb, kurs med målinger, sjekklister, PDF og sikkerhetskopi.
// Endringer lagres automatisk (litt forsinket, og alltid når appen legges bort).

import { h, clear, nextId } from './dom.js';
import { icon } from './icons.js';
import { section, linkList, emptyNote, segmented } from './components.js';
import { toast, showModal } from './toast.js';
import { go, back } from './router.js';
import { formatNumber, formatInput, parseNumber } from '../core/number.js';
import { getSettings, NETWORKS } from '../core/settings.js';
import { buildInfo } from '../core/env.js';
import { brand } from '../brand/active.js';
import { listJobs, getJob, saveJob, deleteJob, exportBackup, parseBackup, importJobs } from '../jobs/store.js';
import {
  newJob, newCircuit, evaluateCircuit, circuitStatus, CHECKLIST, RISK, RCD_OPTIONS, checklistSummary, expectedR1R2, networkLabel,
} from '../jobs/model.js';
import { DOCS, buildPdf } from '../jobs/documents.js';
import { drawPage, A4 } from '../jobs/pdf.js';
import { DEVICE_TYPES, MCB_SIZES, GG_SIZES } from '../data/vern.js';
import { SIZES } from '../data/ledere.js';

// ---------- Lagring med forsinkelse ----------
let pending = null;
let pendingTimer = 0;
function scheduleSave(job) {
  pending = job;
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(flush, 400);
}
async function flush() {
  clearTimeout(pendingTimer);
  if (!pending) return;
  const job = pending;
  pending = null;
  try { await saveJob(job); } catch (e) { toast('Kunne ikke lagre: ' + e.message, 5000); }
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
}

// ---------- Små skjemafelt ----------
function textField(label, value, onInput, { placeholder = '', multiline = false, type = 'text' } = {}) {
  const id = nextId('j');
  const el = multiline
    ? h('textarea', { id, class: 'textarea', rows: 4, placeholder })
    : h('input', { id, type, class: 'text-input', placeholder, autocomplete: 'off' });
  el.value = value || '';
  el.addEventListener('input', () => onInput(el.value));
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label), el);
}

function numField(label, value, unit, onInput, { help = '' } = {}) {
  const id = nextId('j');
  const inp = h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off' });
  inp.value = value == null ? '' : formatInput(value);
  const err = h('div', { class: 'field-error', hidden: true });
  inp.addEventListener('input', () => {
    const x = parseNumber(inp.value);
    const bad = x !== null && Number.isNaN(x);
    err.hidden = !bad;
    err.textContent = bad ? 'Ugyldig tall' : '';
    if (!bad) onInput(x);
  });
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label),
    h('div', { class: 'input-wrap' }, inp, unit ? h('span', { class: 'unit' }, unit) : null),
    help ? h('div', { class: 'field-help' }, help) : null, err);
}

function selectField(label, value, options, onChange) {
  if (options.length <= 4) {
    return h('div', { class: 'field' }, h('div', { class: 'field-label' }, label), segmented({ options, value, onChange }).el);
  }
  const id = nextId('j');
  const sel = h('select', { id, class: 'select' }, options.map((o) => h('option', { value: String(o.value) }, o.label)));
  sel.value = String(value);
  sel.addEventListener('change', () => {
    const o = options.find((x) => String(x.value) === sel.value);
    onChange(o ? o.value : sel.value);
  });
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label), h('div', { class: 'select-wrap' }, sel));
}

const statusIcon = (status) => {
  const name = status === 'ok' ? 'check' : status === 'fail' ? 'x' : status === 'border' ? 'alert' : 'info';
  return h('span', { class: `status-dot ${status || 'none'}`, 'aria-label': status || 'ikke vurdert' }, icon(name));
};

const dateText = (iso) => (iso ? new Date(iso).toLocaleDateString('nb-NO') : '');

/** Laster en jobb og tegner innholdet når den er hentet. */
function withJob(id, title, render, backPath) {
  const content = h('div', { class: 'jobs' }, emptyNote('Henter …'));
  getJob(id).then((job) => {
    clear(content);
    if (!job) { content.append(emptyNote('Fant ikke jobben. Den kan være slettet.')); return; }
    render(content, job);
  }).catch((e) => { clear(content); content.append(emptyNote('Kunne ikke hente jobben: ' + e.message)); });
  return { title, back: backPath, content };
}

// ---------- Liste ----------
export function jobsListView() {
  const content = h('div', { class: 'jobs' });
  const list = h('div', null, emptyNote('Henter jobber …'));
  content.append(
    h('button', {
      type: 'button', class: 'btn primary wide',
      onclick: async () => {
        const job = newJob(getSettings());
        await saveJob(job);
        // Via jobbsiden, så «Tilbake» og «Ferdig» på infosiden lander på jobben.
        go(`/jobber/${job.id}`);
        go(`/jobber/${job.id}/info`);
      },
    }, icon('jobs'), 'Ny jobb'),
    list,
    section('Sikkerhetskopi',
      h('p', { class: 'muted small' }, 'Jobbene lagres bare på denne enheten. Sletter du appen eller nettleserdata, forsvinner de. Ta sikkerhetskopi jevnlig.'),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn', onclick: doExport }, icon('download'), 'Lag sikkerhetskopi'),
        importButton())));
  listJobs().then((jobs) => {
    clear(list);
    if (!jobs.length) { list.append(emptyNote('Ingen jobber ennå. Trykk «Ny jobb» for å starte.')); return; }
    list.append(h('div', { class: 'list' }, jobs.map((j) => {
      const status = j.circuits.map(circuitStatus);
      const sum = status.includes('fail') ? 'fail' : status.includes('border') ? 'border' : status.length && status.every((s) => s === 'ok') ? 'ok' : null;
      return h('a', { class: 'row', href: `#/jobber/${j.id}` },
        statusIcon(sum),
        h('span', { class: 'row-main' },
          h('span', { class: 'row-title' }, j.title || 'Uten navn'),
          h('span', { class: 'row-sub' }, [j.address, `${j.circuits.length} kurser`, `endret ${dateText(j.updatedAt)}`].filter(Boolean).join(' · '))),
        icon('chevron', 'row-chev'));
    })));
  });
  return { title: 'Jobber', content };
}

async function doExport() {
  const text = await exportBackup({ appVersion: buildInfo().version, settings: getSettings() });
  const name = `elverktoy-sikkerhetskopi-${new Date().toISOString().slice(0, 10)}.txt`;
  await shareOrDownload(new Blob([text], { type: 'text/plain' }), name, 'Sikkerhetskopi');
}

function importButton() {
  const input = h('input', { type: 'file', accept: '.txt,.json,text/plain,application/json', hidden: true });
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    const { jobs, problems } = await parseBackup(await file.text());
    showModal({
      title: 'Hent sikkerhetskopi',
      body: h('div', null,
        problems.map((p) => h('p', { class: 'field-error' }, p)),
        h('p', null, `Filen inneholder ${jobs.length} jobber. Nye jobber legges til, og eksisterende erstattes bare hvis kopien er nyere. Ingenting slettes.`)),
      actions: [
        { label: 'Avbryt' },
        jobs.length ? {
          label: 'Hent', primary: true,
          onClick: () => { importJobs(jobs).then((r) => { toast(`${r.added} nye, ${r.updated} oppdatert`); go('/jobber'); location.reload(); }); },
        } : null,
      ].filter(Boolean),
    });
  });
  return h('label', { class: 'btn' }, icon('copy'), 'Hent fra fil', input);
}

// ---------- Deling av filer ----------
export async function shareOrDownload(blob, name, title) {
  const file = new File([blob], name, { type: blob.type });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name, style: { display: 'none' } });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  toast('Filen er lastet ned');
  return 'downloaded';
}

// ---------- Jobb ----------
export function jobView(id) {
  return withJob(id, 'Jobb', (content, job) => {
    const cl = checklistSummary(CHECKLIST, job.checklist);
    const rk = checklistSummary(RISK, job.risk);
    const notes = h('textarea', { class: 'textarea', rows: 4, placeholder: 'Notater til jobben' });
    notes.value = job.notes || '';
    notes.addEventListener('input', () => { job.notes = notes.value; scheduleSave(job); });

    content.append(
      h('a', { class: 'card job-head', href: `#/jobber/${job.id}/info` },
        h('div', { class: 'row-main' },
          h('h2', null, job.title || 'Uten navn'),
          h('div', { class: 'muted' }, [job.address, job.customer].filter(Boolean).join(' · ') || 'Trykk for å legge inn kunde og adresse'),
          h('div', { class: 'muted small' }, [networkLabel(job.network), job.Ik3 != null ? `Ik3 ${formatNumber(job.Ik3)} kA` : '', job.Ikmin != null ? `Ik min ${formatNumber(job.Ikmin)} kA` : ''].filter(Boolean).join(' · '))),
        icon('chevron', 'row-chev')),
      section(`Kurser (${job.circuits.length})`,
        job.circuits.length ? h('div', { class: 'list' }, job.circuits.map((c) => h('a', { class: 'row', href: `#/jobber/${job.id}/kurs/${c.id}` },
          statusIcon(circuitStatus(c)),
          h('span', { class: 'row-main' },
            h('span', { class: 'row-title' }, `${c.no}  ${c.desc || 'Uten beskrivelse'}`),
            h('span', { class: 'row-sub' }, [`${c.device} ${c.In} A`, c.cable, c.S ? `${formatNumber(c.S)} mm²` : ''].filter(Boolean).join(' · '))),
          icon('chevron', 'row-chev')))) : emptyNote('Ingen kurser ennå.'),
        h('button', {
          type: 'button', class: 'btn wide',
          onclick: async () => {
            const c = newCircuit(job);
            job.circuits.push(c);
            await saveJob(job);
            go(`/jobber/${job.id}/kurs/${c.id}`);
          },
        }, '+ Legg til kurs')),
      section('Kontroll',
        linkList([
          { title: 'Sluttkontroll', sub: `${cl.done} av ${cl.total} vurdert${cl.deviations ? `, ${cl.deviations} avvik` : ''}`, href: `/jobber/${job.id}/sluttkontroll`, icon: 'check' },
          { title: 'Risikovurdering', sub: `${rk.done} av ${rk.total} vurdert${rk.deviations ? `, ${rk.deviations} avvik` : ''}`, href: `/jobber/${job.id}/risiko`, icon: 'alert' },
        ])),
      section(`Lagrede beregninger (${job.calculations.length})`,
        job.calculations.length
          ? h('div', { class: 'list' }, job.calculations.map((calc) => h('details', { class: 'row calc-snap' },
            h('summary', null, h('span', { class: 'row-title' }, calc.title), h('span', { class: 'row-sub' }, ` · ${dateText(calc.savedAt)}`)),
            h('pre', { class: 'snap-text' }, calc.text),
            h('div', { class: 'btn-row' },
              h('button', {
                type: 'button', class: 'btn small',
                onclick: () => { job.calculations = job.calculations.filter((x) => x.id !== calc.id); saveJob(job).then(() => location.reload()); },
              }, 'Fjern')))))
          : emptyNote('Bruk «Lagre» i en kalkulator for å legge beregningen til jobben.')),
      section('Notater', notes),
      section('Dokumentasjon',
        h('div', { class: 'list' }, DOCS.map((d) => h('button', {
          type: 'button', class: 'row as-button',
          onclick: () => { flush().then(() => pdfPreview(job, d.id)); },
        }, icon('download', 'row-icon'), h('span', { class: 'row-main' }, h('span', { class: 'row-title' }, d.title), h('span', { class: 'row-sub' }, d.summary)), icon('chevron', 'row-chev'))))),
      h('button', {
        type: 'button', class: 'btn danger wide',
        onclick: () => showModal({
          title: 'Slette jobben?',
          body: h('p', null, `«${job.title || 'Uten navn'}» og alle kurser, målinger og sjekklister slettes fra denne enheten.`),
          actions: [{ label: 'Avbryt' }, { label: 'Slett', primary: true, onClick: () => { deleteJob(job.id).then(() => { toast('Jobben er slettet'); go('/jobber'); }); } }],
        }),
      }, 'Slett jobben'));
  }, '/jobber');
}

export function jobInfoView(id) {
  return withJob(id, 'Jobbinfo', (content, job) => {
    const set = (key) => (val) => { job[key] = val; scheduleSave(job); };
    content.append(
      section('Jobb',
        textField('Navn på jobben', job.title, set('title'), { placeholder: 'f.eks. Bad – Storgata 5' }),
        textField('Adresse', job.address, set('address')),
        textField('Beskrivelse', job.description, set('description'), { multiline: true })),
      section('Kunde',
        textField('Kunde', job.customer, set('customer')),
        textField('Kontakt (telefon/e-post)', job.customerContact, set('customerContact'))),
      section('Utført av',
        textField('Firma', job.company, set('company')),
        textField('Installatør/montør', job.installer, set('installer')),
        textField('Dato', job.date, set('date'), { type: 'date' })),
      section('Forsyning',
        selectField('Nett', job.network, NETWORKS.map((nw) => ({ value: nw.id, label: nw.short })), set('network')),
        numField('Ik3 maks ved inntaket', job.Ik3, 'kA', set('Ik3')),
        numField('Ik min ved inntaket', job.Ikmin, 'kA', set('Ikmin'), { help: 'IT: Ik2 min. TN: Ik1 min fase–PE.' }),
        numField('Hovedsikring', job.mainFuse, 'A', set('mainFuse')),
        textField('Nettselskap', job.gridCompany, set('gridCompany'))),
      h('button', { type: 'button', class: 'btn primary wide', onclick: () => { flush().then(() => back(`/jobber/${job.id}`)); } }, 'Ferdig'));
  }, `/jobber/${id}`);
}

// ---------- Kurs ----------
export function circuitView(jobId, cid) {
  return withJob(jobId, 'Kurs', (content, job) => {
    const c = job.circuits.find((x) => x.id === cid);
    if (!c) { content.append(emptyNote('Fant ikke kursen.')); return; }
    const build = () => {
    clear(content);
    const evalBox = h('div', { class: 'card checks' });
    const drawEval = () => {
      clear(evalBox);
      const list = evaluateCircuit(c);
      const exp = expectedR1R2(c);
      for (const e of list) {
        evalBox.append(h('div', { class: `check ${e.status || 'info'}` },
          h('span', { class: 'check-icon' }, icon(e.status === 'ok' ? 'check' : e.status === 'fail' ? 'x' : e.status === 'border' ? 'alert' : 'info')),
          h('div', { class: 'check-body' }, h('div', { class: 'check-title' }, e.label), h('div', { class: 'check-detail' }, e.text))));
      }
      if (exp != null && c.meas.r1r2 == null) evalBox.append(h('p', { class: 'muted small' }, `Forventet R1 + R2 ved 20 °C: ${formatNumber(exp)} Ω`));
    };
    const set = (key) => (val) => { c[key] = val; scheduleSave(job); drawEval(); };
    // Felt som endrer hvilke andre felt som vises, tegner hele skjemaet på nytt.
    const setRebuild = (key) => (val) => { c[key] = val; scheduleSave(job); build(); };
    const setM = (key) => (val) => { c.meas[key] = val; scheduleSave(job); drawEval(); };
    const sizeOpts = (mat) => SIZES[mat === 'Al' ? 'Al' : 'Cu'].map((s) => ({ value: s, label: `${formatNumber(s)} mm²` }));
    const inOpts = () => (c.device === 'gG' ? GG_SIZES : MCB_SIZES).map((a) => ({ value: a, label: `${a} A` }));
    const okOpts = [{ value: 'ok', label: 'OK' }, { value: 'fail', label: 'Feil' }, { value: 'na', label: 'I.a.' }];

    content.append(
      section('Kurs',
        textField('Kursnummer', c.no, set('no')),
        textField('Beskrivelse', c.desc, set('desc'), { placeholder: 'f.eks. Stikk stue' }),
        textField('Rom / sted', c.room, set('room')),
        selectField('Vern', c.device, DEVICE_TYPES, setRebuild('device')),
        selectField('Merkestrøm', c.In, inOpts(), set('In')),
        selectField('Jordfeilvern', c.rcd, RCD_OPTIONS, setRebuild('rcd')),
        selectField('Faser', c.phases, [{ value: 1, label: '1-fase' }, { value: 3, label: '3-fase' }], setRebuild('phases'))),
      section('Kabel',
        textField('Kabeltype', c.cable, set('cable'), { placeholder: 'f.eks. PFXP 3G2,5' }),
        selectField('Materiale', c.material, [{ value: 'Cu', label: 'Kobber' }, { value: 'Al', label: 'Aluminium' }], setRebuild('material')),
        selectField('Tverrsnitt fase', c.S, sizeOpts(c.material), set('S')),
        selectField('Tverrsnitt PE', c.Spe, sizeOpts(c.material), set('Spe')),
        numField('Lengde', c.L, 'm', set('L'))),
      section('Målinger',
        numField('Isolasjonsresistans', c.meas.riso, 'MΩ', setM('riso'), { help: 'Skriv f.eks. 299 når instrumentet viser «> 299 MΩ».' }),
        numField('Kontinuitet R1 + R2', c.meas.r1r2, 'Ω', setM('r1r2')),
        numField('Kortslutningsstrøm Ik (målt)', c.meas.ik, 'A', setM('ik'), { help: 'IT: Ik fase–fase. TN: Ik fase–PE.' }),
        c.rcd !== 'none' ? numField('Jordfeilbryter: utløsetid ved IΔn', c.meas.rcdTime, 'ms', setM('rcdTime')) : null,
        c.rcd !== 'none' ? numField('Jordfeilbryter: utløsestrøm', c.meas.rcdCurrent, 'mA', setM('rcdCurrent')) : null,
        selectField('Polaritet', c.meas.polarity || '', [{ value: '', label: '–' }, ...okOpts], setM('polarity')),
        c.phases === 3 ? selectField('Fasefølge', c.meas.phaseSeq || '', [{ value: '', label: '–' }, ...okOpts.slice(0, 2)], setM('phaseSeq')) : null),
      section('Vurdering', evalBox),
      section('Merknad', textField('Merknad', c.remark, set('remark'), { multiline: true })),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => { flush().then(() => back(`/jobber/${job.id}`)); } }, 'Ferdig'),
        h('button', {
          type: 'button', class: 'btn danger',
          onclick: () => showModal({
            title: 'Slette kursen?',
            body: h('p', null, `Kurs ${c.no} med målinger slettes.`),
            actions: [{ label: 'Avbryt' }, { label: 'Slett', primary: true, onClick: () => { job.circuits = job.circuits.filter((x) => x.id !== c.id); saveJob(job).then(() => back(`/jobber/${job.id}`)); } }],
          }),
        }, 'Slett kursen')));
    drawEval();
    };
    build();
  }, `/jobber/${jobId}`);
}

// ---------- Sjekklister ----------
export function checklistView(jobId, kind) {
  const list = kind === 'risiko' ? RISK : CHECKLIST;
  const key = kind === 'risiko' ? 'risk' : 'checklist';
  return withJob(jobId, kind === 'risiko' ? 'Risikovurdering' : 'Sluttkontroll', (content, job) => {
    const state = job[key] || (job[key] = {});
    const summary = h('p', { class: 'muted' });
    const drawSummary = () => {
      const s = checklistSummary(list, state);
      summary.textContent = `${s.done} av ${s.total} vurdert${s.deviations ? `, ${s.deviations} avvik` : ''}.`;
    };
    content.append(summary);
    for (const sec of list) {
      content.append(section(sec.title, h('div', { class: 'checklist' }, sec.items.map(([id, text]) => {
        const item = state[id] || {};
        const note = h('input', { type: 'text', class: 'text-input small', placeholder: 'Merknad / avvik', value: item.note || '' });
        note.hidden = item.status !== 'fail' && !item.note;
        note.addEventListener('input', () => { state[id] = { ...(state[id] || {}), note: note.value }; scheduleSave(job); });
        const seg = segmented({
          options: [{ value: 'ok', label: 'OK' }, { value: 'fail', label: 'Avvik' }, { value: 'na', label: 'I.a.' }],
          value: item.status,
          onChange: (v) => {
            state[id] = { ...(state[id] || {}), status: v };
            if (v === 'fail') note.hidden = false;
            scheduleSave(job);
            drawSummary();
          },
          cls: 'small',
        });
        return h('div', { class: 'check-item' }, h('p', null, text), seg.el, note);
      }))));
    }
    content.append(h('button', { type: 'button', class: 'btn primary wide', onclick: () => { flush().then(() => back(`/jobber/${job.id}`)); } }, 'Ferdig'));
    drawSummary();
  }, `/jobber/${jobId}`);
}

// ---------- PDF ----------
function pdfPreview(job, kind) {
  const b = buildInfo();
  const pdf = buildPdf(job, kind, { appName: brand.name, version: b.version === 'dev' ? '' : b.version });
  const pages = h('div', { class: 'pdf-pages' });
  for (const page of pdf.pages) {
    const canvas = h('canvas', { class: 'pdf-page' });
    const scale = 2;
    canvas.width = Math.round(A4.w * scale);
    canvas.height = Math.round(A4.h * scale);
    drawPage(canvas.getContext('2d'), page, scale);
    pages.append(canvas);
  }
  const blob = new Blob([pdf.bytes], { type: 'application/pdf' });
  showModal({
    title: pdf.title,
    body: h('div', null, h('p', { class: 'muted small' }, `${pdf.pages.length} ${pdf.pages.length === 1 ? 'side' : 'sider'} · forhåndsvisning`), pages),
    actions: [
      { label: 'Lukk' },
      { label: 'Del PDF', primary: true, onClick: () => { shareOrDownload(blob, pdf.fileName, pdf.title); return false; } },
    ],
  });
}

// ---------- Lagre beregning i jobb (fra kalkulatorene) ----------
export async function saveCalculationToJob(snapshot) {
  const jobs = await listJobs();
  const pick = async (job) => {
    const target = job || newJob(getSettings());
    if (!job) target.title = snapshot.title;
    target.calculations.push({ ...snapshot, id: Date.now().toString(36) });
    await saveJob(target);
    toast(`Lagret i «${target.title || 'Uten navn'}»`);
  };
  let modal = null;
  modal = showModal({
    title: 'Lagre i jobb',
    body: h('div', { class: 'list' },
      h('button', { type: 'button', class: 'row as-button', onclick: () => { pick(null); modal.close(); } },
        icon('jobs', 'row-icon'), h('span', { class: 'row-main' }, h('span', { class: 'row-title' }, 'Ny jobb'))),
      jobs.map((j) => h('button', { type: 'button', class: 'row as-button', onclick: () => { pick(j); modal.close(); } },
        h('span', { class: 'row-main' }, h('span', { class: 'row-title' }, j.title || 'Uten navn'), h('span', { class: 'row-sub' }, j.address || ''))))),
    actions: [{ label: 'Avbryt' }],
  });
}

export { flush as flushJobs };

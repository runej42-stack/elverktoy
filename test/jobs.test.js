import test from 'node:test';
import assert from 'node:assert/strict';
import { newJob, newCircuit, evaluateCircuit, circuitStatus, expectedR1R2, checklistSummary, CHECKLIST } from '../src/jobs/model.js';
import { saveJob, listJobs, getJob, deleteJob, exportBackup, parseBackup, importJobs } from '../src/jobs/store.js';
import { buildPdf, DOCS } from '../src/jobs/documents.js';
import { runs, textWidth, wrap, PdfDoc } from '../src/jobs/pdf.js';

const statusOf = (c, key) => (evaluateCircuit(c).find((e) => e.key === key) || {}).status;

test('vurdering av målinger', () => {
  const job = newJob({ network: 'TN400' });
  const c = newCircuit(job);
  Object.assign(c, { device: 'B', In: 16, rcd: 'A30', S: 2.5, Spe: 2.5, L: 20 });
  assert.equal(circuitStatus(c), null, 'ingen målinger gir ingen status');
  c.meas.riso = 0.8;
  assert.equal(statusOf(c, 'riso'), 'fail');
  c.meas.riso = 1;
  assert.equal(statusOf(c, 'riso'), 'ok');
  c.meas.ik = 79;
  assert.equal(statusOf(c, 'ik'), 'fail', 'B16 trenger 80 A');
  c.meas.ik = 90;
  assert.equal(statusOf(c, 'ik'), 'border', 'under 20 % margin');
  c.meas.ik = 200;
  assert.equal(statusOf(c, 'ik'), 'ok');
  c.meas.rcdTime = 310;
  assert.equal(statusOf(c, 'rcdTime'), 'fail');
  c.meas.rcdTime = 25;
  c.meas.rcdCurrent = 14;
  assert.equal(statusOf(c, 'rcdCurrent'), 'fail', 'under 0,5 · IΔn');
  c.meas.rcdCurrent = 22;
  assert.equal(circuitStatus(c), 'ok');
  c.rcd = 'S300';
  c.meas.rcdTime = 100;
  c.meas.rcdCurrent = 200;
  assert.equal(statusOf(c, 'rcdTime'), 'fail', 'S-type skal bruke minst 130 ms');
  // Forventet R1 + R2: (7,41 + 7,41) · 20 m = 0,2964 Ω
  assert.ok(Math.abs(expectedR1R2(c) - 0.2964) < 1e-9);
  c.meas.r1r2 = 0.5;
  assert.equal(statusOf(c, 'r1r2'), 'border', 'mer enn 1,5 · forventet');
});

test('gG bruker utløsestrøm for 0,4 s', () => {
  const c = newCircuit(newJob());
  Object.assign(c, { device: 'gG', In: 16 });
  c.meas.ik = 100;
  assert.equal(statusOf(c, 'ik'), 'fail', 'gG 16 A trenger 107 A');
  c.meas.ik = 140;
  assert.equal(statusOf(c, 'ik'), 'ok');
});

test('sjekklisteoppsummering', () => {
  const s = checklistSummary(CHECKLIST, { 'b-utstyr': { status: 'ok' }, 'b-beroring': { status: 'fail' } });
  assert.equal(s.done, 2);
  assert.equal(s.deviations, 1);
  assert.ok(s.total >= 20);
});

test('lagring, sikkerhetskopi og fletting uten IndexedDB', async () => {
  const a = newJob();
  a.title = 'Jobb A';
  await saveJob(a);
  const b = newJob();
  b.title = 'Jobb B';
  await saveJob(b);
  assert.equal((await listJobs()).length, 2);
  assert.equal((await getJob(a.id)).title, 'Jobb A');

  const text = await exportBackup({ appVersion: 'test', settings: {} });
  const parsed = await parseBackup(text);
  assert.deepEqual(parsed.problems, []);
  assert.equal(parsed.jobs.length, 2);
  const tampered = JSON.parse(text);
  tampered.jobs[0].title = 'Endret';
  assert.ok((await parseBackup(JSON.stringify(tampered))).problems.length > 0, 'endret fil skal avsløres');
  assert.ok((await parseBackup('tull')).problems.length > 0);

  await deleteJob(a.id);
  const r = await importJobs(parsed.jobs);
  assert.equal(r.added, 1);
  assert.equal(r.skipped, 1);
  assert.equal((await listJobs()).length, 2);
});

test('PDF: tekst deles i Helvetica og Symbol, og strukturen er gyldig', () => {
  const parts = runs('R = 7,41 Ω ≤ 4 % æøå');
  assert.deepEqual(parts.map((p) => p.font), ['H', 'S', 'H', 'S', 'H']);
  assert.equal(Math.round(textWidth('A', 1000)), 667);
  for (const line of wrap('Dette er en ganske lang tekst som må brytes over flere linjer i en smal kolonne', 100, 10)) {
    assert.ok(textWidth(line, 10) <= 100 + 1e-9, `for bred linje: ${line}`);
  }

  const job = newJob({ network: 'IT230' });
  job.title = 'Testjobb æøå';
  for (let i = 0; i < 60; i++) {
    const c = newCircuit(job);
    c.desc = `Kurs nummer ${i + 1}`;
    c.meas.riso = 200;
    c.meas.ik = 250;
    job.circuits.push(c);
  }
  for (const d of DOCS) {
    const { bytes, pages } = buildPdf(job, d.id, { version: 'test' });
    const text = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    assert.ok(text.startsWith('%PDF-1.4'), 'mangler PDF-hode');
    assert.ok(text.trimEnd().endsWith('%%EOF'), 'mangler %%EOF');
    const xrefPos = Number(text.match(/startxref\n(\d+)/)[1]);
    assert.ok(text.slice(xrefPos).startsWith('xref'), 'startxref peker feil');
    const entries = text.slice(xrefPos).split('\n').slice(3).filter((l) => /^\d{10} 00000 n $/.test(l));
    entries.forEach((e, i) => {
      const off = Number(e.slice(0, 10));
      assert.ok(text.slice(off).startsWith(`${i + 1} 0 obj`), `${d.id}: objekt ${i + 1} ligger ikke på ${off}`);
    });
    assert.ok(!/[^\x00-\xff]/.test(text), 'PDF-en skal bare inneholde byte');
    if (d.id === 'kurs' || d.id === 'maaling') assert.ok(pages.length >= 2, `${d.id}: 60 kurser skal gi flere sider`);
  }
  const empty = new PdfDoc({ title: 'Tom' });
  empty.addPage();
  assert.ok(empty.toBytes().length > 200);
});

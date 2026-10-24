// Kontroll av avskrevne tabeller for strømføringsevne. Fanger typiske avskriftsfeil:
// tall i feil rekkefølge, byttede kolonner og tall på feil rad.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataFile = fileURLToPath(new URL('../src/data/iz.js', import.meta.url));
const haveData = existsSync(dataFile);
const { IZ_TABLES } = haveData ? await import('../src/data/iz.js') : { IZ_TABLES: {} };

const METHODS = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2'];
const MAIN = ['B.52.2', 'B.52.3', 'B.52.4', 'B.52.5'];

const col = (key, mat, m) => (IZ_TABLES[key] && IZ_TABLES[key][mat] && IZ_TABLES[key][mat][m]) || [];
const at = (key, S) => IZ_TABLES[key].sizes.indexOf(S);

test('tabellene for strømføringsevne finnes og har kilde', { skip: !haveData && 'src/data/iz.js er ikke importert ennå' }, () => {
  for (const key of MAIN) {
    const t = IZ_TABLES[key];
    assert.ok(t, `mangler ${key}`);
    assert.ok(Array.isArray(t.sizes) && t.sizes.length >= 10, `${key}: mangler tverrsnitt`);
    assert.ok(Array.isArray(t.sources) && t.sources.length >= 1, `${key}: mangler kilde`);
    for (const mat of ['Cu', 'Al']) {
      for (const m of METHODS) {
        const c = col(key, mat, m);
        if (!c.length) continue;
        assert.equal(c.length, t.sizes.length, `${key} ${mat} ${m}: feil antall verdier`);
      }
    }
    for (const m of METHODS) assert.ok(col(key, 'Cu', m).length, `${key}: mangler Cu ${m}`);
  }
});

test('verdiene øker med tverrsnittet', { skip: !haveData && 'mangler data' }, () => {
  for (const key of MAIN) {
    for (const mat of ['Cu', 'Al']) {
      for (const m of METHODS) {
        const c = col(key, mat, m);
        let last = 0;
        c.forEach((val, i) => {
          if (val == null) return;
          assert.ok(val > last, `${key} ${mat} ${m}: ${IZ_TABLES[key].sizes[i]} mm² = ${val} er ikke større enn forrige (${last})`);
          last = val;
        });
      }
    }
  }
});

test('90 °C ≥ 70 °C, 2 belastede ≥ 3, Cu > Al', { skip: !haveData && 'mangler data' }, () => {
  const pairs = [['B.52.3', 'B.52.2', '90 °C mot 70 °C (2 belastede)'], ['B.52.5', 'B.52.4', '90 °C mot 70 °C (3 belastede)'],
    ['B.52.2', 'B.52.4', '2 mot 3 belastede (PVC)'], ['B.52.3', 'B.52.5', '2 mot 3 belastede (PEX)']];
  for (const [hi, lo, what] of pairs) {
    for (const mat of ['Cu', 'Al']) {
      for (const m of METHODS) {
        for (const S of IZ_TABLES[hi].sizes) {
          const a = col(hi, mat, m)[at(hi, S)];
          const iLo = at(lo, S);
          const b = iLo >= 0 ? col(lo, mat, m)[iLo] : null;
          if (a == null || b == null) continue;
          assert.ok(a >= b, `${what}, ${mat} ${m} ${S} mm²: ${a} < ${b}`);
        }
      }
    }
  }
  for (const key of MAIN) {
    for (const m of METHODS) {
      IZ_TABLES[key].sizes.forEach((S, i) => {
        const cu = col(key, 'Cu', m)[i];
        const al = col(key, 'Al', m)[i];
        if (cu != null && al != null) assert.ok(cu > al, `${key} ${m} ${S} mm²: Al (${al}) ≥ Cu (${cu})`);
      });
    }
  }
});

test('forlegningsmåtene ligger i rimelig rekkefølge', { skip: !haveData && 'mangler data' }, () => {
  // Isolert vegg (A) gir lavest Iz, klamret på vegg (C) høyere enn i rør på vegg (B1/B2).
  for (const key of MAIN) {
    IZ_TABLES[key].sizes.forEach((S, i) => {
      const v = (m) => col(key, 'Cu', m)[i];
      if (v('A1') != null && v('B1') != null) assert.ok(v('A1') <= v('B1'), `${key} ${S}: A1 > B1`);
      if (v('A2') != null && v('B2') != null) assert.ok(v('A2') <= v('B2'), `${key} ${S}: A2 > B2`);
      if (v('B2') != null && v('C') != null) assert.ok(v('B2') <= v('C'), `${key} ${S}: B2 > C`);
    });
  }
});

test('kjente kontrollverdier fra uavhengige kilder', { skip: !haveData && 'mangler data' }, () => {
  // Iz = 19,5 A for 2,5 mm² Cu, PVC, 2 belastede, metode A1 (oppgitt i fagartikkel om NEK 400 823.433,
  // og i HiØ-øving med PN-kabel). 4 mm²: 26 A.
  assert.equal(col('B.52.2', 'Cu', 'A1')[at('B.52.2', 2.5)], 19.5);
  assert.equal(col('B.52.2', 'Cu', 'A1')[at('B.52.2', 4)], 26);
});

test('korreksjonsfaktorene', { skip: !haveData && 'mangler data' }, () => {
  for (const key of ['B.52.14', 'B.52.15']) {
    const t = IZ_TABLES[key];
    assert.ok(t && t.temps.length >= 6, `mangler ${key}`);
    for (const ins of ['PVC', 'XLPE']) {
      let last = Infinity;
      t[ins].forEach((f, i) => {
        if (f == null) return;
        assert.ok(f < last, `${key} ${ins} ${t.temps[i]} °C: faktoren skal synke med temperaturen`);
        last = f;
      });
    }
    const base = key === 'B.52.14' ? 30 : 20;
    const i = t.temps.indexOf(base);
    if (i >= 0) assert.equal(t.PVC[i], 1, `${key}: faktor 1 ved ${base} °C`);
  }
  const g = IZ_TABLES['B.52.17'];
  assert.ok(g && g.arrangements.length >= 5, 'mangler B.52.17');
  for (const a of g.arrangements) {
    let last = Infinity;
    a.factors.forEach((f) => {
      if (f == null) return;
      assert.ok(f <= last + 1e-9 && f > 0 && f <= 1, `B.52.17 rad ${a.item}: faktorene skal synke`);
      last = f;
    });
  }
});

// ---------- Oppslag i lib/iz.js: bro og stige (metode E, F og G) ----------
const lib = haveData ? await import('../src/lib/iz.js') : null;
const { maxLengthForIk, shortCircuit } = await import('../src/lib/kortslutning.js');
const { NETWORKS } = await import('../src/core/settings.js');

test('metode E slår opp riktig tabell og kolonne', { skip: !haveData && 'mangler data' }, () => {
  const base = { ins: 'tp', material: 'Cu', temp: 30 };
  assert.equal(lib.tableIz({ ...base, loaded: 2, method: 'E', S: 2.5 }), 30);
  assert.equal(lib.tableIz({ ...base, loaded: 3, method: 'E', S: 16 }), 80);
  assert.equal(lib.tableKey('th', 3, 'E', 'Al'), 'B.52.13');
  assert.equal(lib.tableKey('tp', 2, 'C', 'Cu'), 'B.52.2');
  // E går bare til 300 mm², og F og G (enlederkabler) er ikke med.
  assert.match(lib.izProblem({ ...base, loaded: 3, method: 'E', S: 400, arrangement: 'e-perf', nTray: 1, trays: 1 }), /300 mm²/);
  assert.deepEqual(lib.METHODS.map((m) => m.value), ['A1', 'B2', 'C', 'D1', 'D2', 'E', 'A2', 'B1']);
});

test('valgene for samlet forlegning passer til forlegningsmåten', { skip: !haveData && 'mangler data' }, () => {
  for (const m of lib.METHODS) {
    const opts = lib.groupOptions(m.value);
    assert.ok(opts.length >= 1, `${m.value}: ingen valg`);
    for (const o of opts) {
      assert.ok(o.label && !/[A-Za-z]{3,} (on|in|or|of) /.test(o.label), `${m.value}: valget «${o.label}» er ikke på norsk`);
      const g = lib.groupFactor({ method: m.value, arrangement: o.value, n: 2, nTray: 2, trays: 1 });
      assert.ok(g.factor > 0 && g.factor <= 1, `${m.value} ${o.value}: faktor ${g.factor} ${g.problem || ''}`);
    }
  }
  assert.deepEqual(lib.groupOptions('C').map((o) => o.value), [1, 2, 3]);
  assert.ok(lib.groupOptions('E').every((o) => o.value === 1 || /^e-/.test(o.value)));
});

test('faktorer for bro og stige (B.52.20)', { skip: !haveData && 'mangler data' }, () => {
  const f = (arrangement, nTray, trays) => lib.groupFactor({ method: 'E', arrangement, nTray, trays });
  assert.equal(f('e-perf', 3, 1).factor, 0.82);
  assert.equal(f('e-perf', 5, 1).factor, 0.76, '5 kabler bruker ugunstig side (6 kabler)');
  assert.equal(f('e-stige', 1, 1).factor, 1);
  assert.equal(f('e-tett', 1, 1).factor, 0.97, 'bro uten hull reduserer også for én kabel');
  assert.equal(f('e-perf', 10, 1).factor, null, 'tabellen går bare til 9 kabler');
  assert.equal(f('e-perf-avstand', 9, 1).factor, null, 'tom celle i tabellen gir ingen verdi');
  assert.deepEqual(lib.trayCountOptions('e-perf').map((o) => o.value), [1, 2, 3, 6]);
  assert.deepEqual(lib.trayCountOptions('e-vert').map((o) => o.value), [1, 2]);
  // B.52.17 for C og for A/B (bare bunt).
  assert.equal(lib.groupFactor({ method: 'C', arrangement: 2, n: 4 }).factor, 0.75);
  assert.equal(lib.groupFactor({ method: 'A1', arrangement: 3, n: 4 }).factor, 0.65, 'A1 bruker alltid rad 1');
  assert.equal(lib.groupFactor({ method: 'D1', arrangement: 1, n: 9 }).factor, 0.52, 'jord: B.52.19, 9 kabler i rør inntil hverandre');
  // Én kurs rett under tak av tre: 0,95 (B.52.17 rad 3), ellers 1.
  assert.equal(lib.groupFactor({ method: 'C', arrangement: 3, n: 1 }).factor, 0.95);
  assert.equal(lib.groupFactor({ method: 'C', arrangement: 2, n: 1 }).factor, 1);
  // Tom celle: meldingen passer til forlegningen.
  const spaced = lib.groupFactor({ method: 'E', arrangement: 'e-perf-avstand', nTray: 9, trays: 1 });
  assert.equal(spaced.factor, null);
  assert.ok(/avstand/.test(spaced.problem), spaced.problem);
});

test('ledertemperatur ut fra strømmen', () => {
  const t = (I) => lib.conductorTemp({ I, Iz: 44, ambient: 20, thetaMax: 90 });
  assert.equal(t(0), 20);
  assert.equal(t(44), 90);
  assert.ok(Math.abs(t(22) - 37.5) < 1e-9, 'halv strøm gir en firedel av temperaturstigningen');
  // Samlet forlegning: de andre kursene på full last gir (1 − kG²) av stigningen uansett egen strøm.
  const g = (I) => lib.conductorTemp({ I, Iz: 0.65 * 27, kG: 0.65, ambient: 30, thetaMax: 70 });
  assert.ok(Math.abs(g(0) - (30 + (1 - 0.65 ** 2) * 40)) < 1e-9);
  assert.ok(Math.abs(g(0.65 * 27) - 70) < 1e-9, 'full last i hele gruppen gir høyeste temperatur');
});

test('største lengde for utkobling stemmer med kortslutningsberegningen', () => {
  for (const net of NETWORKS) {
    for (const [S, Ia, theta] of [[1.5, 100, 70], [2.5, 160, 70], [6, 160, 90], [16, 320, 20]]) {
      const p = { network: net, Ik3: 6, Ikmin: 1.2, cmax: 1.1, cmin: 0.95, theta, X: 0.08, cosNet: 0.9 };
      const L = maxLengthForIk({ ...p, material: 'Cu', S }, Ia);
      assert.ok(L > 0, `${net.id} ${S} mm²: lengde ${L}`);
      const ik = shortCircuit({ ...p, segments: [{ L, material: 'Cu', S, Spe: S }] }).points[1].ikmin * 1000;
      assert.ok(Math.abs(ik - Ia) / Ia < 1e-9, `${net.id} ${S} mm²: Ik ved ${L} m er ${ik} A, ventet ${Ia} A`);
    }
  }
  assert.equal(maxLengthForIk({ network: NETWORKS[0], Ikmin: 0.05, material: 'Cu', S: 2.5, cmin: 0.95, theta: 70, X: 0.08 }, 160), 0);
});

test('tabellene for fri luft (B.52.10–B.52.13) og bro og stige (B.52.20, B.52.21) henger sammen', { skip: !haveData && 'mangler data' }, () => {
  const AIR = ['B.52.10', 'B.52.11', 'B.52.12', 'B.52.13'];
  const cols = ['E2', 'E3', 'F2', 'F3_trefoil', 'F3_flat_touching', 'G_spaced_horizontal', 'G_spaced_vertical'];
  for (const key of AIR) {
    const t = IZ_TABLES[key];
    assert.ok(t && t.sources && t.sources.length, `${key}: mangler kilde`);
    const mat = t.Cu ? 'Cu' : 'Al';
    for (const c of cols) {
      let last = 0;
      t[mat][c].forEach((val, i) => {
        if (val == null) return;
        assert.ok(val > last, `${key} ${c}: ${t.sizes[i]} mm² = ${val} er ikke større enn forrige (${last})`);
        last = val;
      });
    }
  }
  // 90 °C ≥ 70 °C og Cu > Al for samme kolonne og tverrsnitt.
  const pairs = [['B.52.12', 'Cu', 'B.52.10', 'Cu'], ['B.52.13', 'Al', 'B.52.11', 'Al'], ['B.52.10', 'Cu', 'B.52.11', 'Al'], ['B.52.12', 'Cu', 'B.52.13', 'Al']];
  for (const [hi, mh, lo, ml] of pairs) {
    for (const c of cols) {
      IZ_TABLES[hi].sizes.forEach((S, i) => {
        const a = IZ_TABLES[hi][mh][c][i];
        const j = IZ_TABLES[lo].sizes.indexOf(S);
        const b = j >= 0 ? IZ_TABLES[lo][ml][c][j] : null;
        if (a != null && b != null) assert.ok(a > b, `${hi} ${c} ${S} mm²: ${a} er ikke større enn ${lo} (${b})`);
      });
    }
  }
  // Faktorene på bro og stige synker med antallet og ligger i (0, 1].
  for (const key of ['B.52.20', 'B.52.21']) {
    for (const r of IZ_TABLES[key].rows) {
      let last = Infinity;
      r.factors.forEach((f) => {
        if (f == null) return;
        assert.ok(f > 0 && f <= 1 && f <= last + 1e-9, `${key} ${r.system} ${r.arrangement} ${r.trays}: faktorene skal synke`);
        last = f;
      });
    }
  }
});

test('flere kurser i jord (B.52.18 og B.52.19)', { skip: !haveData && 'mangler data' }, () => {
  const g = (p) => lib.groupFactor(p);
  assert.equal(g({ method: 'D2', n: 1 }).factor, 1);
  assert.equal(g({ method: 'D2', n: 3, gap: 'touching' }).factor, 0.65);
  assert.equal(g({ method: 'D2', n: 10, gap: '0.25m' }).factor, 0.59, '10 kurser bruker ugunstig side (12)');
  assert.equal(g({ method: 'D1', n: 4, gap: '0.25m' }).factor, 0.8);
  assert.equal(g({ method: 'D2', n: 21, gap: 'touching' }).factor, null, 'tabellen går til 20 kurser');
  const mis = g({ method: 'D2', n: 16, gap: '0.5m' });
  assert.equal(mis.factor, 0.38);
  assert.equal(mis.misprint, true);
  // Avstandene passer til forlegningen.
  assert.ok(lib.groundGapOptions('D1').every((o) => g({ method: 'D1', n: 5, gap: o.value }).factor > 0));
  assert.ok(lib.groundGapOptions('D2').every((o) => g({ method: 'D2', n: 5, gap: o.value }).factor > 0));
  // Faktorene synker med antallet (unntatt den kjente trykkfeilen).
  const t18 = IZ_TABLES['B.52.18'];
  for (const [gap, col] of Object.entries(t18.factors)) {
    col.forEach((f, i) => {
      if (i === 0 || (gap === '0.5m' && t18.circuits[i] === 16) || (gap === '0.5m' && t18.circuits[i] === 20)) return;
      assert.ok(f <= col[i - 1] + 1e-9, `B.52.18 ${gap} ${t18.circuits[i]}: ${f} > ${col[i - 1]}`);
    });
  }
  for (const part of ['multiCoreSingleWayDucts', 'singleCoreSingleWayDucts']) {
    for (const [gap, col] of Object.entries(IZ_TABLES['B.52.19'][part].factors)) {
      col.forEach((f, i) => { if (i) assert.ok(f <= col[i - 1] + 1e-9, `B.52.19 ${part} ${gap}: synker ikke ved ${i}`); });
    }
  }
});

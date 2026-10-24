// Data for vern: momentan utløsning for automatsikringer og utløsestrøm for gG-sikringer.

/** Automatsikringer (NEK EN 60898): øvre grense for momentan utløsning, × In. */
export const MCB_TRIP = { B: 5, C: 10, D: 20 };

export const MCB_SOURCE = {
  source: 'NEK EN 60898-1: momentan utløsning B 3–5, C 5–10, D 10–20 · In. Øvre grense brukes som krav (I5 ≤ Ik min), slik NELFO gjør.',
  edition: 'EN 60898-1',
  transcribedBy: 'Claude, 24.10.2026',
  verifiedBy: null,
};

/**
 * gG-sikringer: strøm (A) som gir utkobling innen 5 s og 0,4 s.
 * null = ikke oppgitt i kilden (store sikringer brukes normalt ikke i sluttkurser med 0,4 s-krav).
 */
export const GG_TRIP = [
  [6, 27, 47], [10, 47, 82], [16, 65, 107], [20, 85, 145], [25, 110, 180], [32, 150, 265],
  [35, 173, 295], [40, 190, 310], [50, 260, 460], [63, 320, 550], [80, 440, null],
  [100, 580, null], [125, 715, null],
];

export const GG_SOURCE = {
  source: 'Utløsestrøm for gG etter VDE 0100-600 (elektrofachkraft.de, «Schutz durch automatische Abschaltung»); 100 og 125 A fra Metrel MI 2122-tabell. Avviker litt mellom produsenter – bruk produsentens tid/strøm-kurve når den finnes.',
  url: 'https://www.elektrofachkraft.de/files/userdata_EFK/content/grafiken/azubis-unter-strom-auf-den-punkt-gebracht/pdfs/vde-0100-600-4-schutz-durch-automatische-abschaltung.pdf',
  edition: 'VDE 0100-600 / IEC 60269',
  transcribedBy: 'Claude, 24.10.2026',
  verifiedBy: null,
};

export const DEVICE_TYPES = [
  { value: 'B', label: 'Automat B' },
  { value: 'C', label: 'Automat C' },
  { value: 'D', label: 'Automat D' },
  { value: 'gG', label: 'Sikring gG' },
];

export const MCB_SIZES = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
export const GG_SIZES = GG_TRIP.map((r) => r[0]);

/**
 * Strømmen som gir utkobling innen tiden t (s). Gir { Ia, basis } eller null hvis den ikke finnes.
 * For automatsikringer gir momentan utløsning utkobling langt under 0,4 s.
 */
export function tripCurrent(type, In, t = 0.4) {
  if (MCB_TRIP[type]) return { Ia: MCB_TRIP[type] * In, basis: `${MCB_TRIP[type]} · In (momentan utløsning, ${type})` };
  if (type === 'gG') {
    const row = GG_TRIP.find((r) => r[0] === In);
    if (!row) return null;
    const Ia = t >= 5 ? row[1] : row[2];
    return Ia == null ? null : { Ia, basis: `gG ${In} A, utkobling innen ${t >= 5 ? '5' : '0,4'} s` };
  }
  return null;
}

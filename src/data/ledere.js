// Lederresistans ved 20 °C (maks DC-resistans) etter IEC 60228.
// Brukes til spenningsfall, kortslutning og forventet ledermotstand.

export const R20_SOURCE = {
  source: 'IEC 60228:2023, Tabell 1–4 (maks DC-resistans ved 20 °C), gjengitt av myCableEngineering (BS EN IEC 60228:2024)',
  url: 'https://mycableengineering.com/conductor-resistance/',
  edition: 'IEC 60228:2023',
  transcribedBy: 'Claude, 24.10.2026',
  verifiedBy: null,
};

/** Kobber, klasse 1 og 2 (fast og flertrådet), Ω/km. Klasse 2 brukes der klassene avviker (≥ 185 mm²). */
export const R20_CU = [
  [0.5, 36.0], [0.75, 24.5], [1, 18.1], [1.5, 12.1], [2.5, 7.41], [4, 4.61], [6, 3.08],
  [10, 1.83], [16, 1.15], [25, 0.727], [35, 0.524], [50, 0.387], [70, 0.268], [95, 0.193],
  [120, 0.153], [150, 0.124], [185, 0.0991], [240, 0.0754], [300, 0.0601], [400, 0.0470],
  [500, 0.0366], [630, 0.0283],
];

/** Kobber, klasse 5 (fleksibel, blank), Ω/km. */
export const R20_CU_FLEX = [
  [0.5, 39.0], [0.75, 26.0], [1, 19.5], [1.5, 13.3], [2.5, 7.98], [4, 4.95], [6, 3.30],
  [10, 1.91], [16, 1.21], [25, 0.78], [35, 0.554], [50, 0.386], [70, 0.272], [95, 0.206],
  [120, 0.161], [150, 0.129], [185, 0.106], [240, 0.0801], [300, 0.0641],
];

/** Aluminium, klasse 2, Ω/km. */
export const R20_AL = [
  [10, 3.08], [16, 1.91], [25, 1.20], [35, 0.868], [50, 0.641], [70, 0.443], [95, 0.320],
  [120, 0.253], [150, 0.206], [185, 0.164], [240, 0.125], [300, 0.100], [400, 0.0778],
  [500, 0.0605], [630, 0.0469],
];

/** Temperaturkoeffisient ved 20 °C (IEC 60228), 1/K. */
export const ALPHA = { Cu: 0.00393, Al: 0.00403 };

/** Tverrsnitt som tilbys i kalkulatorene (mm²). */
export const SIZES = {
  Cu: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300],
  Al: [16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300],
};

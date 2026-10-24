// Alle kalkulatorene i appen. Rekkefølgen her er rekkefølgen i listene.

import { calc as spenningsfall } from './spenningsfall.js';
import { calc as ohm } from './ohm.js';
import { calc as effekt } from './effekt.js';
import { calc as strom } from './strom.js';
import { calc as kva } from './kva.js';
import { calc as kompensering } from './kompensering.js';
import { calc as motorstrom } from './motorstrom.js';
import { calc as moment } from './moment.js';
import { calc as resistans } from './resistans.js';
import { calc as kortslutning } from './kortslutning.js';
import { calc as overspenningsvern } from './overspenningsvern.js';
import { VARME } from './varme.js';
import { ENERGI } from './energi.js';
import { LYS } from './lys.js';
import { DIVERSE } from './diverse.js';
import { INSTALLASJON } from './installasjon.js';
import { MALING } from './maling.js';
import { VERN } from './vernberegning.js';
import { KABELVERKTOY } from './kabelverktoy.js';
import { dimensjoner, stromforingsevne } from './dimensjonering.js';

export const CALCS = [dimensjoner, stromforingsevne, spenningsfall, kortslutning, overspenningsvern, ohm, effekt, strom, kva, kompensering, motorstrom, moment, resistans, ...VARME, ...ENERGI, ...LYS, ...DIVERSE, ...INSTALLASJON, ...MALING, ...VERN, ...KABELVERKTOY];

// Formelsamling. Skrivemåte: X_b gir senket b, X_{ab} senker flere tegn, X^2 hever.
// vars: [symbol, forklaring, enhet]. calc: kalkulatoren som regner med formelen.

export const FORMULA_GROUPS = [
  'Grunnlag', 'Effekt', 'Motstand og ledere', 'Spenningsfall', 'Kortslutning og vern',
  'Jording og beskyttelse', 'Motor', 'Vekselstrøm og kompensering', 'Varme', 'Lys', 'Elbil, sol og batteri',
];

export const FORMULAS = [
  // ---------- Grunnlag ----------
  { id: 'ohm', group: 'Grunnlag', title: 'Ohms lov', expr: 'U = R · I', vars: [['U', 'spenning', 'V'], ['R', 'motstand', 'Ω'], ['I', 'strøm', 'A']], calc: 'ohm', keywords: ['ohm', 'u=ri'] },
  { id: 'ohm-i', group: 'Grunnlag', title: 'Strøm fra spenning og motstand', expr: 'I = U / R', vars: [['I', 'strøm', 'A'], ['U', 'spenning', 'V'], ['R', 'motstand', 'Ω']], calc: 'ohm' },
  { id: 'u-fase', group: 'Grunnlag', title: 'Hovedspenning og fasespenning', expr: 'U = √3 · U_0', vars: [['U', 'spenning mellom faser (hovedspenning)', 'V'], ['U_0', 'spenning fase–nøytral/jord', 'V']], note: 'TN 400/230 V: 400 = √3 · 230. I IT 230 V er 230 V spenningen mellom fasene.' },
  { id: 'trekant-strom', group: 'Grunnlag', title: 'Linjestrøm i trekantkobling', expr: 'I_L = √3 · I_f', vars: [['I_L', 'strøm i tilførselen', 'A'], ['I_f', 'strøm i hver gren (fase)', 'A']], note: 'I stjernekobling er linjestrøm og fasestrøm like.' },
  { id: 'energi', group: 'Grunnlag', title: 'Energi', expr: 'W = P · t', vars: [['W', 'energi', 'kWh'], ['P', 'effekt', 'kW'], ['t', 'tid', 'h']] },
  { id: 'virkningsgrad', group: 'Grunnlag', title: 'Virkningsgrad', expr: 'η = P_{ut} / P_{inn}', vars: [['η', 'virkningsgrad', '–'], ['P_{ut}', 'avgitt effekt', 'W'], ['P_{inn}', 'tilført effekt', 'W']] },
  { id: 'n-strom', group: 'Grunnlag', title: 'Strøm i nøytralleder ved skjev last', expr: 'I_N = √(I_1^2 + I_2^2 + I_3^2 − I_1·I_2 − I_2·I_3 − I_3·I_1)', vars: [['I_N', 'strøm i N', 'A'], ['I_1, I_2, I_3', 'fasestrømmer (lik cos φ)', 'A']], note: 'Gjelder grunnharmonisk strøm. Tredje harmoniske summeres i N og kan gi mer strøm i N enn i fasene.' },

  // ---------- Effekt ----------
  { id: 'p-dc', group: 'Effekt', title: 'Effekt, likestrøm og resistiv last', expr: 'P = U · I = R · I^2 = U^2 / R', vars: [['P', 'effekt', 'W'], ['U', 'spenning', 'V'], ['I', 'strøm', 'A'], ['R', 'motstand', 'Ω']], calc: 'ohm' },
  { id: 'p-1f', group: 'Effekt', title: 'Aktiv effekt, enfase', expr: 'P = U · I · cos φ', vars: [['P', 'aktiv effekt', 'W'], ['U', 'spenning (230 V)', 'V'], ['I', 'strøm', 'A'], ['cos φ', 'effektfaktor', '–']], calc: 'effekt' },
  { id: 'p-3f', group: 'Effekt', title: 'Aktiv effekt, trefase', expr: 'P = √3 · U · I · cos φ', vars: [['P', 'aktiv effekt', 'W'], ['U', 'spenning mellom faser', 'V'], ['I', 'linjestrøm', 'A'], ['cos φ', 'effektfaktor', '–']], note: 'U er 400 V i TN 400/230 V og 230 V i IT 230 V.', calc: 'effekt' },
  { id: 's-3f', group: 'Effekt', title: 'Tilsynelatende effekt', expr: 'S = U · I  (1-fase)    S = √3 · U · I  (3-fase)', vars: [['S', 'tilsynelatende effekt', 'VA'], ['U', 'spenning', 'V'], ['I', 'strøm', 'A']], calc: 'kva' },
  { id: 'q', group: 'Effekt', title: 'Reaktiv effekt', expr: 'Q = √(S^2 − P^2) = S · sin φ', vars: [['Q', 'reaktiv effekt', 'var'], ['S', 'tilsynelatende effekt', 'VA'], ['P', 'aktiv effekt', 'W']], calc: 'effekt' },
  { id: 'cosphi', group: 'Effekt', title: 'Effektfaktor', expr: 'cos φ = P / S', vars: [['cos φ', 'effektfaktor', '–'], ['P', 'aktiv effekt', 'W'], ['S', 'tilsynelatende effekt', 'VA']] },
  { id: 'i-3f', group: 'Effekt', title: 'Strøm fra effekt, trefase', expr: 'I = P / (√3 · U · cos φ · η)', vars: [['I', 'strøm', 'A'], ['P', 'avgitt effekt', 'W'], ['U', 'spenning mellom faser', 'V'], ['η', 'virkningsgrad (1 for varme)', '–']], calc: 'strom' },
  { id: 'i-1f', group: 'Effekt', title: 'Strøm fra effekt, enfase', expr: 'I = P / (U · cos φ · η)', vars: [['I', 'strøm', 'A'], ['P', 'avgitt effekt', 'W'], ['U', 'spenning (230 V)', 'V']], calc: 'strom' },

  // ---------- Motstand og ledere ----------
  { id: 'r-leder', group: 'Motstand og ledere', title: 'Lederresistans', expr: 'R = ρ · L / A', vars: [['R', 'motstand', 'Ω'], ['ρ', 'resistivitet: Cu ≈ 0,0175, Al ≈ 0,0283 ved 20 °C', 'Ω·mm²/m'], ['L', 'lengde', 'm'], ['A', 'tverrsnitt', 'mm²']], note: 'Tabellverdier for kabel (IEC 60228) er litt høyere enn ρ/A, særlig for flertrådet leder.', calc: 'resistans' },
  { id: 'r-temp', group: 'Motstand og ledere', title: 'Motstand ved temperatur', expr: 'R_θ = R_{20} · (1 + α · (θ − 20))', vars: [['R_θ', 'motstand ved θ', 'Ω'], ['R_{20}', 'motstand ved 20 °C', 'Ω'], ['α', 'Cu 0,00393, Al 0,00403', '1/K'], ['θ', 'ledertemperatur', '°C']], calc: 'resistans' },
  { id: 'serie', group: 'Motstand og ledere', title: 'Seriekobling', expr: 'R = R_1 + R_2 + R_3 + …', vars: [['R', 'total motstand', 'Ω']] },
  { id: 'parallell', group: 'Motstand og ledere', title: 'Parallellkobling', expr: '1/R = 1/R_1 + 1/R_2 + …     to stk.: R = R_1·R_2 / (R_1 + R_2)', vars: [['R', 'total motstand', 'Ω']] },
  { id: 'tap-kabel', group: 'Motstand og ledere', title: 'Effekttap i kabel', expr: 'P_{tap} = 2 · I^2 · R  (1-fase)    P_{tap} = 3 · I^2 · R  (3-fase)', vars: [['P_{tap}', 'tap', 'W'], ['I', 'strøm', 'A'], ['R', 'motstand i én leder', 'Ω']] },
  { id: 'r1r2', group: 'Motstand og ledere', title: 'Kontinuitet, fase og PE', expr: 'R_1 + R_2 = (r_1 + r_2) · L', vars: [['r_1, r_2', 'motstand per meter i fase og PE', 'Ω/m'], ['L', 'lengde', 'm']], calc: 'resistans' },

  // ---------- Spenningsfall ----------
  { id: 'du-1f', group: 'Spenningsfall', title: 'Spenningsfall, enfase', expr: 'ΔU = 2 · I · L · (R · cos φ + X · sin φ)', vars: [['ΔU', 'spenningsfall', 'V'], ['I', 'belastningsstrøm', 'A'], ['L', 'lengde én vei', 'km'], ['R, X', 'resistans og reaktans per leder', 'Ω/km']], calc: 'spenningsfall' },
  { id: 'du-3f', group: 'Spenningsfall', title: 'Spenningsfall, trefase', expr: 'ΔU = √3 · I · L · (R · cos φ + X · sin φ)', vars: [['ΔU', 'spenningsfall mellom faser', 'V'], ['I', 'linjestrøm', 'A'], ['L', 'lengde', 'km']], calc: 'spenningsfall' },
  { id: 'du-prosent', group: 'Spenningsfall', title: 'Spenningsfall i prosent', expr: 'ΔU_% = ΔU / U · 100', vars: [['U', 'nominell spenning (enfase 230 V, trefase hovedspenning)', 'V']], note: 'NEK 400 (525) anbefaler normalt maks 4 % fra forsyningspunktet til utstyret.', calc: 'spenningsfall' },
  { id: 'du-enkel', group: 'Spenningsfall', title: 'Forenklet spenningsfall (cos φ = 1, små tverrsnitt)', expr: 'ΔU = 2 · I · ρ · L / A', vars: [['ρ', 'ca. 0,0225 for Cu i drift', 'Ω·mm²/m'], ['L', 'lengde én vei', 'm'], ['A', 'tverrsnitt', 'mm²']], calc: 'spenningsfall' },
  { id: 'l-maks-du', group: 'Spenningsfall', title: 'Største lengde for spenningsfall', expr: 'L_{maks} = ΔU_{maks} / (k · I · (R · cos φ + X · sin φ))', vars: [['k', '2 for enfase, √3 for trefase', '–'], ['ΔU_{maks}', 'tillatt spenningsfall', 'V']], calc: 'spenningsfall' },

  // ---------- Kortslutning og vern ----------
  { id: 'ik3', group: 'Kortslutning og vern', title: 'Trefase kortslutningsstrøm', expr: 'I_{k3} = c · U / (√3 · Z_k)', vars: [['c', 'spenningsfaktor (c_{maks} for største, c_{min} for minste strøm)', '–'], ['U', 'spenning mellom faser', 'V'], ['Z_k', 'impedans per fase fram til feilstedet', 'Ω']] },
  { id: 'ik2', group: 'Kortslutning og vern', title: 'Topolet kortslutningsstrøm', expr: 'I_{k2} = c · U / (2 · Z_k) = (√3/2) · I_{k3}', vars: [['I_{k2}', 'kortslutning mellom to faser', 'A']], note: 'I IT-nett er dette den minste kortslutningsstrømmen som vernet må koble ut.' },
  { id: 'ik1', group: 'Kortslutning og vern', title: 'Enpolet jordslutning (TN)', expr: 'I_{k1} = c · U_0 / Z_s', vars: [['U_0', 'spenning fase–jord (230 V)', 'V'], ['Z_s', 'sløyfeimpedans fase–PE', 'Ω']], note: 'I TN-nett er dette normalt den minste feilstrømmen.' },
  { id: 'z', group: 'Kortslutning og vern', title: 'Impedans', expr: 'Z = √(R^2 + X^2)', vars: [['Z', 'impedans', 'Ω'], ['R', 'resistans', 'Ω'], ['X', 'reaktans', 'Ω']] },
  { id: 'trafo-ik', group: 'Kortslutning og vern', title: 'Kortslutningsstrøm på transformator', expr: 'I_n = S_n / (√3 · U)     I_k ≈ I_n / (u_k / 100)', vars: [['S_n', 'merkeeffekt', 'VA'], ['u_k', 'kortslutningsspenning', '%']], note: 'Gir trafoens bidrag alene. Nettet foran trafoen gjør Ik litt lavere.' },
  { id: 'overlast', group: 'Kortslutning og vern', title: 'Vern mot overbelastning', expr: 'I_b ≤ I_n ≤ I_z     og     I_2 ≤ 1,45 · I_z', vars: [['I_b', 'belastningsstrøm', 'A'], ['I_n', 'vernets merkestrøm', 'A'], ['I_z', 'kabelens strømføringsevne', 'A'], ['I_2', 'strøm som sikkert løser ut vernet innen avtalt tid', 'A']], note: 'Automatsikringer har I₂ = 1,45 · In. For smeltesikringer er I₂ høyere. NEK 400 har strengere krav for boliger, se 8-823.' },
  { id: 'termisk', group: 'Kortslutning og vern', title: 'Termisk kortslutningsfasthet', expr: 'k^2 · S^2 ≥ I^2 · t     →     t = (k · S / I)^2', vars: [['k', 'materialfaktor (Cu/PVC 115, Cu/PEX 143, Al/PVC 76, Al/PEX 94)', '–'], ['S', 'tverrsnitt', 'mm²'], ['I', 'kortslutningsstrøm', 'A'], ['t', 'utkoblingstid', 's']] },
  { id: 'pe-min', group: 'Kortslutning og vern', title: 'Minste tverrsnitt for beskyttelsesleder', expr: 'S = √(I^2 · t) / k', vars: [['S', 'tverrsnitt', 'mm²'], ['I', 'feilstrøm', 'A'], ['t', 'utkoblingstid', 's'], ['k', 'materialfaktor for PE', '–']] },
  { id: 'utkobling-tn', group: 'Kortslutning og vern', title: 'Automatisk utkobling i TN', expr: 'Z_s · I_a ≤ U_0', vars: [['Z_s', 'sløyfeimpedans', 'Ω'], ['I_a', 'strøm som gir utkobling innen kravet', 'A'], ['U_0', 'spenning fase–jord', 'V']] },
  { id: 'l-maks-ik', group: 'Kortslutning og vern', title: 'Største lengde for utkobling (TN, forenklet)', expr: 'L_{maks} ≈ c_{min} · U_0 / (I_a · (r_L + r_{PE}))', vars: [['r_L, r_{PE}', 'motstand per meter i fase og PE ved høy temperatur', 'Ω/m'], ['I_a', 'utløsestrøm', 'A']], note: 'Ser bort fra impedansen foran kursen. Bruk kortslutningskalkulatoren for riktig svar.' },
  { id: 'mcb', group: 'Kortslutning og vern', title: 'Momentan utløsning, automatsikring', expr: 'B: 3–5 · I_n     C: 5–10 · I_n     D: 10–20 · I_n', vars: [['I_n', 'merkestrøm', 'A']], note: 'For sikker momentan utkobling brukes øvre grense: 5, 10 og 20 · In.' },
  { id: 'selektivitet', group: 'Kortslutning og vern', title: 'Selektivitet mellom smeltesikringer (gG)', expr: 'I_{n,foran} ≥ 1,6 · I_{n,etter}', vars: [['I_{n,foran}', 'sikring nærmest kilden', 'A'], ['I_{n,etter}', 'sikring lenger ut', 'A']], note: 'Tommelfingerregel for gG mot gG. Mellom automatsikringer og andre vern: bruk produsentens selektivitetstabeller.' },
  { id: 'bryteevne', group: 'Kortslutning og vern', title: 'Bryteevne', expr: 'I_{cu} ≥ I_{k,maks}', vars: [['I_{cu}', 'vernets bryteevne', 'kA'], ['I_{k,maks}', 'største kortslutningsstrøm der vernet står', 'kA']] },

  // ---------- Jording og beskyttelse ----------
  { id: 'it-1feil', group: 'Jording og beskyttelse', title: 'IT-nett, første feil', expr: 'R_A · I_d ≤ 50 V', vars: [['R_A', 'jordingsmotstand for utsatte deler', 'Ω'], ['I_d', 'feilstrøm ved første feil', 'A']] },
  { id: 'tt', group: 'Jording og beskyttelse', title: 'TT-nett med jordfeilbryter', expr: 'R_A · I_{Δn} ≤ 50 V', vars: [['R_A', 'jordelektrode + beskyttelsesleder', 'Ω'], ['I_{Δn}', 'jordfeilbryterens merkeutløsestrøm', 'A']] },
  { id: 'jordspyd', group: 'Jording og beskyttelse', title: 'Jordspyd (loddrett elektrode)', expr: 'R ≈ ρ / (2π · L) · (ln(8L / d) − 1)', vars: [['ρ', 'jordresistivitet', 'Ωm'], ['L', 'lengde i jord', 'm'], ['d', 'diameter', 'm']], note: 'Dwights formel. Typisk ρ: myr 30, leire 50–100, sand 200–1000, fjell over 1000 Ωm.', calc: 'jordelektrode' },
  { id: 'jordbaand', group: 'Jording og beskyttelse', title: 'Horisontalt jordbånd', expr: 'R ≈ 2ρ / L', vars: [['ρ', 'jordresistivitet', 'Ωm'], ['L', 'lengde', 'm']], note: 'Grovt overslag for et rett bånd i jord.' },
  { id: 'beroring', group: 'Jording og beskyttelse', title: 'Berøringsspenning', expr: 'U_B = I_f · R_{PE}', vars: [['U_B', 'berøringsspenning', 'V'], ['I_f', 'feilstrøm', 'A'], ['R_{PE}', 'motstand i beskyttelseslederen', 'Ω']] },

  // ---------- Motor ----------
  { id: 'motor-in', group: 'Motor', title: 'Merkestrøm, trefasemotor', expr: 'I_n = P / (√3 · U · cos φ · η)', vars: [['P', 'akseleffekt', 'W'], ['η', 'virkningsgrad', '–']], calc: 'motorstrom' },
  { id: 'moment', group: 'Motor', title: 'Moment', expr: 'T = 9550 · P / n', vars: [['T', 'moment', 'Nm'], ['P', 'effekt', 'kW'], ['n', 'turtall', 'o/min']], calc: 'moment' },
  { id: 'synkron', group: 'Motor', title: 'Synkront turtall', expr: 'n_s = 120 · f / p', vars: [['n_s', 'synkront turtall', 'o/min'], ['f', 'frekvens', 'Hz'], ['p', 'poltall', '–']], calc: 'moment' },
  { id: 'slipp', group: 'Motor', title: 'Slipp', expr: 's = (n_s − n) / n_s', vars: [['s', 'slipp', '–'], ['n', 'virkelig turtall', 'o/min']], calc: 'moment' },
  { id: 'yd', group: 'Motor', title: 'Stjerne/trekant-start', expr: 'I_{start,Y} = I_{start,D} / 3     T_{start,Y} = T_{start,D} / 3', vars: [['I_{start}', 'startstrøm', 'A'], ['T_{start}', 'startmoment', 'Nm']], calc: 'motorstrom' },

  // ---------- Vekselstrøm og kompensering ----------
  { id: 'xl', group: 'Vekselstrøm og kompensering', title: 'Induktiv reaktans', expr: 'X_L = 2π · f · L', vars: [['X_L', 'reaktans', 'Ω'], ['f', 'frekvens', 'Hz'], ['L', 'induktans', 'H']] },
  { id: 'xc', group: 'Vekselstrøm og kompensering', title: 'Kapasitiv reaktans', expr: 'X_C = 1 / (2π · f · C)', vars: [['X_C', 'reaktans', 'Ω'], ['C', 'kapasitans', 'F']] },
  { id: 'qc', group: 'Vekselstrøm og kompensering', title: 'Kompenseringsbehov', expr: 'Q_C = P · (tan φ_1 − tan φ_2)', vars: [['Q_C', 'kondensatoreffekt', 'kvar'], ['P', 'aktiv effekt', 'kW'], ['φ_1, φ_2', 'fasevinkel før og etter', '–']], calc: 'kompensering' },
  { id: 'c-kond', group: 'Vekselstrøm og kompensering', title: 'Kondensator fra reaktiv effekt', expr: 'C = Q / (2π · f · U^2)', vars: [['C', 'kapasitans', 'F'], ['Q', 'reaktiv effekt over kondensatoren', 'var'], ['U', 'spenning over kondensatoren', 'V']], calc: 'kompensering' },
  { id: 'resonans', group: 'Vekselstrøm og kompensering', title: 'Resonansfrekvens', expr: 'f_0 = 1 / (2π · √(L · C))', vars: [['f_0', 'resonansfrekvens', 'Hz'], ['L', 'induktans', 'H'], ['C', 'kapasitans', 'F']] },

  // ---------- Varme ----------
  { id: 'varme-p', group: 'Varme', title: 'Effekt for varmekabel', expr: 'P = A · p', vars: [['P', 'effekt', 'W'], ['A', 'oppvarmet areal', 'm²'], ['p', 'effekt per areal', 'W/m²']] },
  { id: 'varme-cc', group: 'Varme', title: 'Senteravstand (c/c)', expr: 'c/c = A / L', vars: [['A', 'areal som skal dekkes', 'm²'], ['L', 'kabellengde', 'm']], note: 'Gir c/c i meter. Gang med 1000 for mm.' },
  { id: 'varme-l', group: 'Varme', title: 'Kabellengde', expr: 'L = P / p_m', vars: [['P', 'ønsket effekt', 'W'], ['p_m', 'kabelens effekt per meter', 'W/m']] },
  { id: 'varme-r', group: 'Varme', title: 'Motstand i varmekabel', expr: 'R = U^2 / P', vars: [['R', 'forventet motstand', 'Ω'], ['U', 'merkespenning', 'V'], ['P', 'merkeeffekt', 'W']], note: 'Mål før og etter legging og sammenlign med produsentens toleranse.' },
  { id: 'snosmelt-cc', group: 'Varme', title: 'c/c for snøsmelting', expr: 'c/c = p_m / p', vars: [['p_m', 'kabelens effekt', 'W/m'], ['p', 'ønsket effekt', 'W/m²']] },
  { id: 'vann', group: 'Varme', title: 'Oppvarming av vann', expr: 'W = m · c · ΔT     t = W / P', vars: [['m', 'masse (1 liter ≈ 1 kg)', 'kg'], ['c', '4,19 kJ/(kg·K) for vann', 'kJ/(kg·K)'], ['ΔT', 'temperaturøkning', 'K'], ['P', 'effekt', 'kW']] },

  // ---------- Lys ----------
  { id: 'lumen', group: 'Lys', title: 'Lumenmetoden', expr: 'N = E · A / (Φ · UF · MF)', vars: [['N', 'antall armaturer', '–'], ['E', 'ønsket belysningsstyrke', 'lx'], ['A', 'areal', 'm²'], ['Φ', 'lysfluks per armatur', 'lm'], ['UF', 'utnyttelsesfaktor', '–'], ['MF', 'vedlikeholdsfaktor', '–']] },
  { id: 'lux-punkt', group: 'Lys', title: 'Belysningsstyrke i et punkt', expr: 'E = I · cos α / d^2', vars: [['E', 'belysningsstyrke', 'lx'], ['I', 'lysstyrke mot punktet', 'cd'], ['α', 'vinkel mot flatens normal', '°'], ['d', 'avstand', 'm']] },
  { id: 'lysutbytte', group: 'Lys', title: 'Lysutbytte', expr: 'η = Φ / P', vars: [['η', 'lysutbytte', 'lm/W'], ['Φ', 'lysfluks', 'lm'], ['P', 'effekt', 'W']] },
  { id: 'lux', group: 'Lys', title: 'Lux og lumen', expr: 'E = Φ / A', vars: [['E', 'belysningsstyrke', 'lx = lm/m²'], ['Φ', 'lysfluks som treffer flaten', 'lm'], ['A', 'areal', 'm²']] },

  // ---------- Elbil, sol og batteri ----------
  { id: 'ladeeffekt', group: 'Elbil, sol og batteri', title: 'Ladeeffekt', expr: 'P = U · I  (1-fase)     P = √3 · U · I  (3-fase)', vars: [['U', 'spenning', 'V'], ['I', 'ladestrøm', 'A']], note: 'TN 400 V, 16 A, 3-fase: 11 kW. IT 230 V, 32 A, 3-fase: 12,7 kW.' },
  { id: 'ladetid', group: 'Elbil, sol og batteri', title: 'Ladetid', expr: 't = E / (P · η)', vars: [['t', 'tid', 'h'], ['E', 'energi som skal lades', 'kWh'], ['P', 'ladeeffekt', 'kW'], ['η', 'virkningsgrad (ca. 0,9)', '–']] },
  { id: 'voc-kald', group: 'Elbil, sol og batteri', title: 'Tomgangsspenning på solcelle ved lav temperatur', expr: 'U_{oc}(T) = U_{oc,STC} · (1 + β · (T − 25))', vars: [['β', 'temperaturkoeffisient for Uoc (negativ)', '%/K ÷ 100'], ['T', 'laveste celletemperatur, f.eks. −25', '°C']], note: 'Strengspenningen ved kulde må ligge under inverterens maksimale DC-spenning.' },
  { id: 'batteri', group: 'Elbil, sol og batteri', title: 'Driftstid på batteri', expr: 't = C · U · DoD · η / P', vars: [['C', 'kapasitet', 'Ah'], ['U', 'batterispenning', 'V'], ['DoD', 'utladningsdybde', '–'], ['P', 'last', 'W']] },
];

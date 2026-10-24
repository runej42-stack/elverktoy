// Strømføringsevne og korreksjonsfaktorer etter IEC 60364-5-52:2009 tillegg B
// (samme tabeller som NEK 400-5-52, tabell 52B.x). Generert av tools/import-iz.mjs
// fra avskrift av offentlig tilgjengelige gjengivelser – se «sources» i hver tabell.
// Ikke rediger for hånd. Kontroll mot NEK 400:2026 registreres i iz-verified.js.

export const IZ_TABLES = {
 "B.52.2": {
  "title": "Current-carrying capacities in amperes for methods of installation in Table B.52.1 - PVC insulation, two loaded conductors, copper or aluminium - Conductor temperature: 70 °C, ambient temperature: 30 °C in air, 20 °C in ground",
  "insulation": "PVC",
  "loaded": 2,
  "conductorTemp": 70,
  "ambientAir": 30,
  "groundTemp": 20,
  "soilResistivity": 2.5,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300
  ],
  "Cu": {
   "A1": [
    14.5,
    19.5,
    26,
    34,
    46,
    61,
    80,
    99,
    119,
    151,
    182,
    210,
    240,
    273,
    321,
    367
   ],
   "A2": [
    14,
    18.5,
    25,
    32,
    43,
    57,
    75,
    92,
    110,
    139,
    167,
    192,
    219,
    248,
    291,
    334
   ],
   "B1": [
    17.5,
    24,
    32,
    41,
    57,
    76,
    101,
    125,
    151,
    192,
    232,
    269,
    300,
    341,
    400,
    458
   ],
   "B2": [
    16.5,
    23,
    30,
    38,
    52,
    69,
    90,
    111,
    133,
    168,
    201,
    232,
    258,
    294,
    344,
    394
   ],
   "C": [
    19.5,
    27,
    36,
    46,
    63,
    85,
    112,
    138,
    168,
    213,
    258,
    299,
    344,
    392,
    461,
    530
   ],
   "D1": [
    22,
    29,
    37,
    46,
    60,
    78,
    99,
    119,
    140,
    173,
    204,
    231,
    261,
    292,
    336,
    379
   ],
   "D2": [
    22,
    28,
    38,
    48,
    64,
    83,
    110,
    132,
    156,
    192,
    230,
    261,
    293,
    331,
    382,
    427
   ]
  },
  "Al": {
   "A1": [
    null,
    15,
    20,
    26,
    36,
    48,
    63,
    77,
    93,
    118,
    142,
    164,
    189,
    215,
    252,
    289
   ],
   "A2": [
    null,
    14.5,
    19.5,
    25,
    33,
    44,
    58,
    71,
    86,
    108,
    130,
    150,
    172,
    195,
    229,
    263
   ],
   "B1": [
    null,
    18.5,
    25,
    32,
    44,
    60,
    79,
    97,
    118,
    150,
    181,
    210,
    234,
    266,
    312,
    358
   ],
   "B2": [
    null,
    17.5,
    24,
    30,
    41,
    54,
    71,
    86,
    104,
    131,
    157,
    181,
    201,
    230,
    269,
    308
   ],
   "C": [
    null,
    21,
    28,
    36,
    49,
    66,
    83,
    103,
    125,
    160,
    195,
    226,
    261,
    298,
    352,
    406
   ],
   "D1": [
    null,
    22,
    29,
    36,
    47,
    61,
    77,
    93,
    109,
    135,
    159,
    180,
    204,
    228,
    262,
    296
   ],
   "D2": [
    null,
    null,
    null,
    null,
    null,
    63,
    82,
    98,
    117,
    145,
    173,
    200,
    224,
    255,
    298,
    336
   ]
  },
  "notes": [
   "Reference conditions: ambient air 30 °C (methods A1-C), ground 20 °C and soil thermal resistivity 2.5 K·m/W at 0.7 m depth (methods D1, D2). Apply B.52.14 (air temperature), B.52.15 (ground temperature), B.52.16 (soil resistivity), B.52.17 (grouping in air), B.52.18 (grouping D2) and B.52.19 (grouping D1).",
   "Table note: In columns 3, 5, 6, 7 and 8 (i.e. methods A2, B2, C, D1, D2) circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped (sector) conductors and may safely be applied to circular conductors.",
   "Reference methods (Table B.52.1 / A.52.3): A1 = insulated conductors or single-core cables in conduit in a thermally insulated wall; A2 = multi-core cable in conduit in a thermally insulated wall; B1 = insulated conductors or single-core cables in conduit on a wooden or masonry wall; B2 = multi-core cable in conduit on a wooden or masonry wall; C = single-core or multi-core cable on (clipped to) a wooden or masonry wall; D1 = multi-core cable in ducts in the ground (installation methods 70/71); D2 = sheathed single-core or multi-core cables direct in the ground, with or without added mechanical protection (installation methods 72/73).",
   "D1 footnote (Table B.52.1, note d): cables in plastic, ceramic or metallic ducts of about 100 mm diameter in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. D2: cables in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. For D2 (cables designed to be buried directly) the standard refers to the manufacturer's instructions.",
   "Same footnote, note 2: for cables in the ground it is important to limit the sheath temperature; if the heat dries out the soil its thermal resistivity rises and the cable becomes overloaded. One way to avoid this is to use the 70 °C (PVC) tables also for cables rated 90 °C.",
   "2001 vs 2009: IEC 60364-5-52:2001 had a single method D ('multi-core cable in ducts in the ground') with different values (e.g. Cu PVC 2 loaded: 1.5 mm² 22 A, 4 mm² 38 A, 16 mm² 81 A). The 2009 edition split it into D1 (in ducts) and D2 (direct in ground) with new values. The 2001 method-D values are given under 'legacyD2001' for reference only (source: ABB handbook 2006 Table 15 and Schneider EIG Fig. G23, which agree). Caution: IEC 60364-5-52:2009 Annex C simplified table C.52.2 (reproduced by Schneider as Fig. G23 'table B.52-1', and in GOST R 50571.5.52 Table C.52.2) still carries these old values under the heading 'D1/D2'; do not mix them with the Annex B tables.",
   "Al: the tables start at 2.5 mm² for aluminium (index 0 of the Al arrays, 1.5 mm², is null). Method D2 has no aluminium values for 2.5-10 mm² (cells empty in the standard).",
   "An amended consolidated edition IEC 60364-5-52:2009+AMD1:2024 (Ed. 3.1) exists; it was NOT checked here. Values here are from the 2009 edition (as adopted in HD 60364-5-52 / GOST R 50571.5.52-2011)."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.2"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_2",
    "tableName": "Table B.52.2"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; D1/D2 columns read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.2 (PDF page 13)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (methods A-B-C), 2001 values, columns A1-C only"
   }
  ],
  "discrepancies": [
   "ABB 2006 (2001 edition) shows Al 2.5 mm² A1 as '14.5' and Al 4 mm² A2 as '20', each overprinted in the PDF text layer with '15' / '19.5'; IEC 2009 (GOST, TiSoft, Top Cable facsimile) = 15 and 19.5 -> 15 and 19.5 used.",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011 and TiSoft (every cell), ABB 2006 (all A1-C cells)."
  ],
  "legacyD2001": {
   "description": "IEC 60364-5-52:2001 method D (cables in ducts in the ground, 20 °C, 2.5 K·m/W) - superseded, reference only",
   "Cu": [
    22,
    29,
    38,
    47,
    63,
    81,
    104,
    125,
    148,
    183,
    216,
    246,
    278,
    312,
    361,
    408
   ],
   "Al": [
    null,
    22,
    29,
    36,
    48,
    62,
    80,
    96,
    113,
    140,
    166,
    189,
    213,
    240,
    277,
    313
   ],
   "sources": [
    {
     "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
     "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
     "tableName": "Table 15: Current carrying capacity of cables buried in the ground (method D)"
    },
    {
     "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
     "url": "https://www.electrical-installation.org/enwiki/Recommended_simplified_approach_for_cable_sizing",
     "tableName": "Fig. G23 (labelled 'table B.52-1', = IEC Annex C table C.52.2)"
    }
   ]
  }
 },
 "B.52.3": {
  "title": "Current-carrying capacities in amperes for methods of installation in Table B.52.1 - XLPE or EPR insulation, two loaded conductors, copper or aluminium - Conductor temperature: 90 °C, ambient temperature: 30 °C in air, 20 °C in ground",
  "insulation": "XLPE/EPR",
  "loaded": 2,
  "conductorTemp": 90,
  "ambientAir": 30,
  "groundTemp": 20,
  "soilResistivity": 2.5,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300
  ],
  "Cu": {
   "A1": [
    19,
    26,
    35,
    45,
    61,
    81,
    106,
    131,
    158,
    200,
    241,
    278,
    318,
    362,
    424,
    486
   ],
   "A2": [
    18.5,
    25,
    33,
    42,
    57,
    76,
    99,
    121,
    145,
    183,
    220,
    253,
    290,
    329,
    386,
    442
   ],
   "B1": [
    23,
    31,
    42,
    54,
    75,
    100,
    133,
    164,
    198,
    253,
    306,
    354,
    393,
    449,
    528,
    603
   ],
   "B2": [
    22,
    30,
    40,
    51,
    69,
    91,
    119,
    146,
    175,
    221,
    265,
    305,
    334,
    384,
    459,
    532
   ],
   "C": [
    24,
    33,
    45,
    58,
    80,
    107,
    138,
    171,
    209,
    269,
    328,
    382,
    441,
    506,
    599,
    693
   ],
   "D1": [
    25,
    33,
    43,
    53,
    71,
    91,
    116,
    139,
    164,
    203,
    239,
    271,
    306,
    343,
    395,
    446
   ],
   "D2": [
    27,
    35,
    46,
    58,
    77,
    100,
    129,
    155,
    183,
    225,
    270,
    306,
    343,
    387,
    448,
    502
   ]
  },
  "Al": {
   "A1": [
    null,
    20,
    27,
    35,
    48,
    64,
    84,
    103,
    125,
    158,
    191,
    220,
    253,
    288,
    338,
    387
   ],
   "A2": [
    null,
    19.5,
    26,
    33,
    45,
    60,
    78,
    96,
    115,
    145,
    175,
    201,
    230,
    262,
    307,
    352
   ],
   "B1": [
    null,
    25,
    33,
    43,
    59,
    79,
    105,
    130,
    157,
    200,
    242,
    281,
    307,
    351,
    412,
    471
   ],
   "B2": [
    null,
    23,
    31,
    40,
    54,
    72,
    94,
    115,
    138,
    175,
    210,
    242,
    261,
    300,
    358,
    415
   ],
   "C": [
    null,
    26,
    35,
    45,
    62,
    84,
    101,
    126,
    154,
    198,
    241,
    280,
    324,
    371,
    439,
    508
   ],
   "D1": [
    null,
    26,
    33,
    42,
    55,
    71,
    90,
    108,
    128,
    158,
    186,
    211,
    238,
    267,
    307,
    346
   ],
   "D2": [
    null,
    null,
    null,
    null,
    null,
    76,
    98,
    117,
    139,
    170,
    204,
    233,
    261,
    296,
    343,
    386
   ]
  },
  "notes": [
   "Reference conditions: ambient air 30 °C (methods A1-C), ground 20 °C and soil thermal resistivity 2.5 K·m/W at 0.7 m depth (methods D1, D2). Apply B.52.14 (air temperature), B.52.15 (ground temperature), B.52.16 (soil resistivity), B.52.17 (grouping in air), B.52.18 (grouping D2) and B.52.19 (grouping D1).",
   "Table note: In columns 3, 5, 6, 7 and 8 (i.e. methods A2, B2, C, D1, D2) circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped (sector) conductors and may safely be applied to circular conductors.",
   "Reference methods (Table B.52.1 / A.52.3): A1 = insulated conductors or single-core cables in conduit in a thermally insulated wall; A2 = multi-core cable in conduit in a thermally insulated wall; B1 = insulated conductors or single-core cables in conduit on a wooden or masonry wall; B2 = multi-core cable in conduit on a wooden or masonry wall; C = single-core or multi-core cable on (clipped to) a wooden or masonry wall; D1 = multi-core cable in ducts in the ground (installation methods 70/71); D2 = sheathed single-core or multi-core cables direct in the ground, with or without added mechanical protection (installation methods 72/73).",
   "D1 footnote (Table B.52.1, note d): cables in plastic, ceramic or metallic ducts of about 100 mm diameter in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. D2: cables in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. For D2 (cables designed to be buried directly) the standard refers to the manufacturer's instructions.",
   "Same footnote, note 2: for cables in the ground it is important to limit the sheath temperature; if the heat dries out the soil its thermal resistivity rises and the cable becomes overloaded. One way to avoid this is to use the 70 °C (PVC) tables also for cables rated 90 °C.",
   "2001 vs 2009: IEC 60364-5-52:2001 had a single method D ('multi-core cable in ducts in the ground') with different values (e.g. Cu PVC 2 loaded: 1.5 mm² 22 A, 4 mm² 38 A, 16 mm² 81 A). The 2009 edition split it into D1 (in ducts) and D2 (direct in ground) with new values. The 2001 method-D values are given under 'legacyD2001' for reference only (source: ABB handbook 2006 Table 15 and Schneider EIG Fig. G23, which agree). Caution: IEC 60364-5-52:2009 Annex C simplified table C.52.2 (reproduced by Schneider as Fig. G23 'table B.52-1', and in GOST R 50571.5.52 Table C.52.2) still carries these old values under the heading 'D1/D2'; do not mix them with the Annex B tables.",
   "Al: the tables start at 2.5 mm² for aluminium (index 0 of the Al arrays, 1.5 mm², is null). Method D2 has no aluminium values for 2.5-10 mm² (cells empty in the standard).",
   "An amended consolidated edition IEC 60364-5-52:2009+AMD1:2024 (Ed. 3.1) exists; it was NOT checked here. Values here are from the 2009 edition (as adopted in HD 60364-5-52 / GOST R 50571.5.52-2011)."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.3"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_3",
    "tableName": "Table B.52.3"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; D1/D2 columns read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.3 (PDF page 14)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (methods A-B-C), 2001 values, columns A1-C only"
   }
  ],
  "discrepancies": [
   "Cu 50 mm2 A1: GOST R 50571.5.52 prints 156, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 158 -> 158 used (GOST typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011 and TiSoft (every cell), ABB 2006 (all A1-C cells)."
  ],
  "legacyD2001": {
   "description": "IEC 60364-5-52:2001 method D (cables in ducts in the ground, 20 °C, 2.5 K·m/W) - superseded, reference only",
   "Cu": [
    26,
    34,
    44,
    56,
    73,
    95,
    121,
    146,
    173,
    213,
    252,
    287,
    324,
    363,
    419,
    474
   ],
   "Al": [
    null,
    26,
    34,
    42,
    56,
    73,
    93,
    112,
    132,
    163,
    193,
    220,
    249,
    279,
    322,
    364
   ],
   "sources": [
    {
     "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
     "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
     "tableName": "Table 15: Current carrying capacity of cables buried in the ground (method D)"
    },
    {
     "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
     "url": "https://www.electrical-installation.org/enwiki/Recommended_simplified_approach_for_cable_sizing",
     "tableName": "Fig. G23 (labelled 'table B.52-1', = IEC Annex C table C.52.2)"
    }
   ]
  }
 },
 "B.52.4": {
  "title": "Current-carrying capacities in amperes for methods of installation in Table B.52.1 - PVC insulation, three loaded conductors, copper or aluminium - Conductor temperature: 70 °C, ambient temperature: 30 °C in air, 20 °C in ground",
  "insulation": "PVC",
  "loaded": 3,
  "conductorTemp": 70,
  "ambientAir": 30,
  "groundTemp": 20,
  "soilResistivity": 2.5,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300
  ],
  "Cu": {
   "A1": [
    13.5,
    18,
    24,
    31,
    42,
    56,
    73,
    89,
    108,
    136,
    164,
    188,
    216,
    245,
    286,
    328
   ],
   "A2": [
    13,
    17.5,
    23,
    29,
    39,
    52,
    68,
    83,
    99,
    125,
    150,
    172,
    196,
    223,
    261,
    298
   ],
   "B1": [
    15.5,
    21,
    28,
    36,
    50,
    68,
    89,
    110,
    134,
    171,
    207,
    239,
    262,
    296,
    346,
    394
   ],
   "B2": [
    15,
    20,
    27,
    34,
    46,
    62,
    80,
    99,
    118,
    149,
    179,
    206,
    225,
    255,
    297,
    339
   ],
   "C": [
    17.5,
    24,
    32,
    41,
    57,
    76,
    96,
    119,
    144,
    184,
    223,
    259,
    299,
    341,
    403,
    464
   ],
   "D1": [
    18,
    24,
    30,
    38,
    50,
    64,
    82,
    98,
    116,
    143,
    169,
    192,
    217,
    243,
    280,
    316
   ],
   "D2": [
    19,
    24,
    33,
    41,
    54,
    70,
    92,
    110,
    130,
    162,
    193,
    220,
    246,
    278,
    320,
    359
   ]
  },
  "Al": {
   "A1": [
    null,
    14,
    18.5,
    24,
    32,
    43,
    57,
    70,
    84,
    107,
    129,
    149,
    170,
    194,
    227,
    261
   ],
   "A2": [
    null,
    13.5,
    17.5,
    23,
    31,
    41,
    53,
    65,
    78,
    98,
    118,
    135,
    155,
    176,
    207,
    237
   ],
   "B1": [
    null,
    16.5,
    22,
    28,
    39,
    53,
    70,
    86,
    104,
    133,
    161,
    186,
    204,
    230,
    269,
    306
   ],
   "B2": [
    null,
    15.5,
    21,
    27,
    36,
    48,
    62,
    77,
    92,
    116,
    139,
    160,
    176,
    199,
    232,
    265
   ],
   "C": [
    null,
    18.5,
    25,
    32,
    44,
    59,
    73,
    90,
    110,
    140,
    170,
    197,
    227,
    259,
    305,
    351
   ],
   "D1": [
    null,
    18.5,
    24,
    30,
    39,
    50,
    64,
    77,
    91,
    112,
    132,
    150,
    169,
    190,
    218,
    247
   ],
   "D2": [
    null,
    null,
    null,
    null,
    null,
    53,
    69,
    83,
    99,
    122,
    148,
    169,
    189,
    214,
    250,
    282
   ]
  },
  "notes": [
   "Reference conditions: ambient air 30 °C (methods A1-C), ground 20 °C and soil thermal resistivity 2.5 K·m/W at 0.7 m depth (methods D1, D2). Apply B.52.14 (air temperature), B.52.15 (ground temperature), B.52.16 (soil resistivity), B.52.17 (grouping in air), B.52.18 (grouping D2) and B.52.19 (grouping D1).",
   "Table note: In columns 3, 5, 6, 7 and 8 (i.e. methods A2, B2, C, D1, D2) circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped (sector) conductors and may safely be applied to circular conductors.",
   "Reference methods (Table B.52.1 / A.52.3): A1 = insulated conductors or single-core cables in conduit in a thermally insulated wall; A2 = multi-core cable in conduit in a thermally insulated wall; B1 = insulated conductors or single-core cables in conduit on a wooden or masonry wall; B2 = multi-core cable in conduit on a wooden or masonry wall; C = single-core or multi-core cable on (clipped to) a wooden or masonry wall; D1 = multi-core cable in ducts in the ground (installation methods 70/71); D2 = sheathed single-core or multi-core cables direct in the ground, with or without added mechanical protection (installation methods 72/73).",
   "D1 footnote (Table B.52.1, note d): cables in plastic, ceramic or metallic ducts of about 100 mm diameter in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. D2: cables in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. For D2 (cables designed to be buried directly) the standard refers to the manufacturer's instructions.",
   "Same footnote, note 2: for cables in the ground it is important to limit the sheath temperature; if the heat dries out the soil its thermal resistivity rises and the cable becomes overloaded. One way to avoid this is to use the 70 °C (PVC) tables also for cables rated 90 °C.",
   "2001 vs 2009: IEC 60364-5-52:2001 had a single method D ('multi-core cable in ducts in the ground') with different values (e.g. Cu PVC 2 loaded: 1.5 mm² 22 A, 4 mm² 38 A, 16 mm² 81 A). The 2009 edition split it into D1 (in ducts) and D2 (direct in ground) with new values. The 2001 method-D values are given under 'legacyD2001' for reference only (source: ABB handbook 2006 Table 15 and Schneider EIG Fig. G23, which agree). Caution: IEC 60364-5-52:2009 Annex C simplified table C.52.2 (reproduced by Schneider as Fig. G23 'table B.52-1', and in GOST R 50571.5.52 Table C.52.2) still carries these old values under the heading 'D1/D2'; do not mix them with the Annex B tables.",
   "Al: the tables start at 2.5 mm² for aluminium (index 0 of the Al arrays, 1.5 mm², is null). Method D2 has no aluminium values for 2.5-10 mm² (cells empty in the standard).",
   "An amended consolidated edition IEC 60364-5-52:2009+AMD1:2024 (Ed. 3.1) exists; it was NOT checked here. Values here are from the 2009 edition (as adopted in HD 60364-5-52 / GOST R 50571.5.52-2011)."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.4"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_4",
    "tableName": "Table B.52.4"
   },
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G20 (table B.52.4)"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; aluminium rows 2.5-25 mm2 spot-checked visually; used to settle the discrepancy)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.4 (PDF page 15)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (methods A-B-C), 2001 values, columns A1-C only"
   }
  ],
  "discrepancies": [
   "Al 2.5 mm2 C: GOST R 50571.5.52 prints 16.5, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 18.5 -> 18.5 used (GOST typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011 and TiSoft (every cell), ABB 2006 (all A1-C cells) and Schneider EIG Fig. G20 (every cell)."
  ],
  "legacyD2001": {
   "description": "IEC 60364-5-52:2001 method D (cables in ducts in the ground, 20 °C, 2.5 K·m/W) - superseded, reference only",
   "Cu": [
    18,
    24,
    31,
    39,
    52,
    67,
    86,
    103,
    122,
    151,
    179,
    203,
    230,
    258,
    297,
    336
   ],
   "Al": [
    null,
    18.5,
    24,
    30,
    40,
    52,
    66,
    80,
    94,
    117,
    138,
    157,
    178,
    200,
    230,
    260
   ],
   "sources": [
    {
     "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
     "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
     "tableName": "Table 15: Current carrying capacity of cables buried in the ground (method D)"
    },
    {
     "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
     "url": "https://www.electrical-installation.org/enwiki/Recommended_simplified_approach_for_cable_sizing",
     "tableName": "Fig. G23 (labelled 'table B.52-1', = IEC Annex C table C.52.2)"
    }
   ]
  }
 },
 "B.52.5": {
  "title": "Current-carrying capacities in amperes for methods of installation in Table B.52.1 - XLPE or EPR insulation, three loaded conductors, copper or aluminium - Conductor temperature: 90 °C, ambient temperature: 30 °C in air, 20 °C in ground",
  "insulation": "XLPE/EPR",
  "loaded": 3,
  "conductorTemp": 90,
  "ambientAir": 30,
  "groundTemp": 20,
  "soilResistivity": 2.5,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300
  ],
  "Cu": {
   "A1": [
    17,
    23,
    31,
    40,
    54,
    73,
    95,
    117,
    141,
    179,
    216,
    249,
    285,
    324,
    380,
    435
   ],
   "A2": [
    16.5,
    22,
    30,
    38,
    51,
    68,
    89,
    109,
    130,
    164,
    197,
    227,
    259,
    295,
    346,
    396
   ],
   "B1": [
    20,
    28,
    37,
    48,
    66,
    88,
    117,
    144,
    175,
    222,
    269,
    312,
    342,
    384,
    450,
    514
   ],
   "B2": [
    19.5,
    26,
    35,
    44,
    60,
    80,
    105,
    128,
    154,
    194,
    233,
    268,
    300,
    340,
    398,
    455
   ],
   "C": [
    22,
    30,
    40,
    52,
    71,
    96,
    119,
    147,
    179,
    229,
    278,
    322,
    371,
    424,
    500,
    576
   ],
   "D1": [
    21,
    28,
    36,
    44,
    58,
    75,
    96,
    115,
    135,
    167,
    197,
    223,
    251,
    281,
    324,
    365
   ],
   "D2": [
    23,
    30,
    39,
    49,
    65,
    84,
    107,
    129,
    153,
    188,
    226,
    257,
    287,
    324,
    375,
    419
   ]
  },
  "Al": {
   "A1": [
    null,
    19,
    25,
    32,
    44,
    58,
    76,
    94,
    113,
    142,
    171,
    197,
    226,
    256,
    300,
    344
   ],
   "A2": [
    null,
    18,
    24,
    31,
    41,
    55,
    71,
    87,
    104,
    131,
    157,
    180,
    206,
    233,
    273,
    313
   ],
   "B1": [
    null,
    22,
    29,
    38,
    52,
    71,
    93,
    116,
    140,
    179,
    217,
    251,
    267,
    300,
    351,
    402
   ],
   "B2": [
    null,
    21,
    28,
    35,
    48,
    64,
    84,
    103,
    124,
    156,
    188,
    216,
    240,
    272,
    318,
    364
   ],
   "C": [
    null,
    24,
    32,
    41,
    57,
    76,
    90,
    112,
    136,
    174,
    211,
    245,
    283,
    323,
    382,
    440
   ],
   "D1": [
    null,
    22,
    28,
    35,
    46,
    59,
    75,
    90,
    106,
    130,
    154,
    174,
    197,
    220,
    253,
    286
   ],
   "D2": [
    null,
    null,
    null,
    null,
    null,
    64,
    82,
    98,
    117,
    144,
    172,
    197,
    220,
    250,
    290,
    326
   ]
  },
  "notes": [
   "Reference conditions: ambient air 30 °C (methods A1-C), ground 20 °C and soil thermal resistivity 2.5 K·m/W at 0.7 m depth (methods D1, D2). Apply B.52.14 (air temperature), B.52.15 (ground temperature), B.52.16 (soil resistivity), B.52.17 (grouping in air), B.52.18 (grouping D2) and B.52.19 (grouping D1).",
   "Table note: In columns 3, 5, 6, 7 and 8 (i.e. methods A2, B2, C, D1, D2) circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped (sector) conductors and may safely be applied to circular conductors.",
   "Reference methods (Table B.52.1 / A.52.3): A1 = insulated conductors or single-core cables in conduit in a thermally insulated wall; A2 = multi-core cable in conduit in a thermally insulated wall; B1 = insulated conductors or single-core cables in conduit on a wooden or masonry wall; B2 = multi-core cable in conduit on a wooden or masonry wall; C = single-core or multi-core cable on (clipped to) a wooden or masonry wall; D1 = multi-core cable in ducts in the ground (installation methods 70/71); D2 = sheathed single-core or multi-core cables direct in the ground, with or without added mechanical protection (installation methods 72/73).",
   "D1 footnote (Table B.52.1, note d): cables in plastic, ceramic or metallic ducts of about 100 mm diameter in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. D2: cables in direct contact with soil of thermal resistivity 2.5 K·m/W at a depth of 0.7 m. For D2 (cables designed to be buried directly) the standard refers to the manufacturer's instructions.",
   "Same footnote, note 2: for cables in the ground it is important to limit the sheath temperature; if the heat dries out the soil its thermal resistivity rises and the cable becomes overloaded. One way to avoid this is to use the 70 °C (PVC) tables also for cables rated 90 °C.",
   "2001 vs 2009: IEC 60364-5-52:2001 had a single method D ('multi-core cable in ducts in the ground') with different values (e.g. Cu PVC 2 loaded: 1.5 mm² 22 A, 4 mm² 38 A, 16 mm² 81 A). The 2009 edition split it into D1 (in ducts) and D2 (direct in ground) with new values. The 2001 method-D values are given under 'legacyD2001' for reference only (source: ABB handbook 2006 Table 15 and Schneider EIG Fig. G23, which agree). Caution: IEC 60364-5-52:2009 Annex C simplified table C.52.2 (reproduced by Schneider as Fig. G23 'table B.52-1', and in GOST R 50571.5.52 Table C.52.2) still carries these old values under the heading 'D1/D2'; do not mix them with the Annex B tables.",
   "Al: the tables start at 2.5 mm² for aluminium (index 0 of the Al arrays, 1.5 mm², is null). Method D2 has no aluminium values for 2.5-10 mm² (cells empty in the standard).",
   "An amended consolidated edition IEC 60364-5-52:2009+AMD1:2024 (Ed. 3.1) exists; it was NOT checked here. Values here are from the 2009 edition (as adopted in HD 60364-5-52 / GOST R 50571.5.52-2011)."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.5"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_5",
    "tableName": "Table B.52.5"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; D1/D2 columns read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.5 (PDF page 16)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (methods A-B-C), 2001 values, columns A1-C only"
   }
  ],
  "discrepancies": [
   "Cu 35 mm2 B2: GOST R 50571.5.52 prints 126, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 128 -> 128 used (GOST typo).",
   "Al 300 mm2 D1: GOST R 50571.5.52 prints 266, TiSoft and the IEC facsimile (Top Cable) give 286 -> 286 used (GOST typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011 and TiSoft (every cell), ABB 2006 (all A1-C cells)."
  ],
  "legacyD2001": {
   "description": "IEC 60364-5-52:2001 method D (cables in ducts in the ground, 20 °C, 2.5 K·m/W) - superseded, reference only",
   "Cu": [
    22,
    29,
    37,
    46,
    61,
    79,
    101,
    122,
    144,
    178,
    211,
    240,
    271,
    304,
    351,
    396
   ],
   "Al": [
    null,
    22,
    29,
    36,
    47,
    61,
    78,
    94,
    112,
    138,
    164,
    186,
    210,
    236,
    272,
    308
   ],
   "sources": [
    {
     "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
     "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
     "tableName": "Table 15: Current carrying capacity of cables buried in the ground (method D)"
    },
    {
     "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
     "url": "https://www.electrical-installation.org/enwiki/Recommended_simplified_approach_for_cable_sizing",
     "tableName": "Fig. G23 (labelled 'table B.52-1', = IEC Annex C table C.52.2)"
    }
   ]
  }
 },
 "B.52.10": {
  "title": "Current-carrying capacities in amperes for installation methods E, F and G of Table B.52.1 - PVC insulation, copper conductors - Conductor temperature: 70 °C, reference ambient temperature: 30 °C",
  "insulation": "PVC",
  "conductor": "Cu",
  "conductorTemp": 70,
  "ambientAir": 30,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300,
   400,
   500,
   630
  ],
  "columns": [
   {
    "key": "E2",
    "method": "E",
    "cable": "multi-core",
    "loaded": 2,
    "description": "Multi-core cable in free air (clearance to wall >= 0.3 x cable diameter), two loaded conductors"
   },
   {
    "key": "E3",
    "method": "E",
    "cable": "multi-core",
    "loaded": 3,
    "description": "Multi-core cable in free air, three loaded conductors"
   },
   {
    "key": "F2",
    "method": "F",
    "cable": "single-core",
    "loaded": 2,
    "description": "Single-core cables touching in free air (clearance to wall >= one cable diameter), two loaded conductors, touching"
   },
   {
    "key": "F3_trefoil",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, trefoil"
   },
   {
    "key": "F3_flat_touching",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, touching"
   },
   {
    "key": "G_spaced_horizontal",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), horizontal"
   },
   {
    "key": "G_spaced_vertical",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), vertical"
   }
  ],
  "Cu": {
   "E2": [
    22,
    30,
    40,
    51,
    70,
    94,
    119,
    148,
    180,
    232,
    282,
    328,
    379,
    434,
    514,
    593,
    null,
    null,
    null
   ],
   "E3": [
    18.5,
    25,
    34,
    43,
    60,
    80,
    101,
    126,
    153,
    196,
    238,
    276,
    319,
    364,
    430,
    497,
    null,
    null,
    null
   ],
   "F2": [
    null,
    null,
    null,
    null,
    null,
    null,
    131,
    162,
    196,
    251,
    304,
    352,
    406,
    463,
    546,
    629,
    754,
    868,
    1005
   ],
   "F3_trefoil": [
    null,
    null,
    null,
    null,
    null,
    null,
    110,
    137,
    167,
    216,
    264,
    308,
    356,
    409,
    485,
    561,
    656,
    749,
    855
   ],
   "F3_flat_touching": [
    null,
    null,
    null,
    null,
    null,
    null,
    114,
    143,
    174,
    225,
    275,
    321,
    372,
    427,
    507,
    587,
    689,
    789,
    905
   ],
   "G_spaced_horizontal": [
    null,
    null,
    null,
    null,
    null,
    null,
    146,
    181,
    219,
    281,
    341,
    396,
    456,
    521,
    615,
    709,
    852,
    982,
    1138
   ],
   "G_spaced_vertical": [
    null,
    null,
    null,
    null,
    null,
    null,
    130,
    162,
    197,
    254,
    311,
    362,
    419,
    480,
    569,
    659,
    795,
    920,
    1070
   ]
  },
  "notes": [
   "NOTE 1: Circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped conductors and may safely be applied to circular conductors.",
   "NOTE 2: De is the external diameter of the cable.",
   "Methods F and G (single-core) are only tabulated from 25 mm²; methods E are tabulated only up to 300 mm² (null = '-' in the standard).",
   "Grouping: B.52.17 items 4-5, or B.52.20 (method E, multi-core on trays/ladders) / B.52.21 (method F, single-core); B.52.21 has no factors for method G (spaced). Ambient: B.52.14."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.10"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_10",
    "tableName": "Table B.52.10"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.10 (PDF page 21)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (method E-F-G), 2001 values"
   }
  ],
  "discrepancies": [
   "Cu 70 mm2 E3: TiSoft prints 198, GOST R 50571.5.52, ABB 2006 and the IEC facsimile (Top Cable) give 196 -> 196 used (TiSoft typo).",
   "Cu 120 mm2 E3: TiSoft prints 278, GOST R 50571.5.52, ABB 2006 and the IEC facsimile (Top Cable) give 276 -> 276 used (TiSoft typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011, TiSoft and ABB 2006."
  ]
 },
 "B.52.11": {
  "title": "Current-carrying capacities in amperes for installation methods E, F and G of Table B.52.1 - PVC insulation, aluminium conductors - Conductor temperature: 70 °C, reference ambient temperature: 30 °C",
  "insulation": "PVC",
  "conductor": "Al",
  "conductorTemp": 70,
  "ambientAir": 30,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300,
   400,
   500,
   630
  ],
  "columns": [
   {
    "key": "E2",
    "method": "E",
    "cable": "multi-core",
    "loaded": 2,
    "description": "Multi-core cable in free air (clearance to wall >= 0.3 x cable diameter), two loaded conductors"
   },
   {
    "key": "E3",
    "method": "E",
    "cable": "multi-core",
    "loaded": 3,
    "description": "Multi-core cable in free air, three loaded conductors"
   },
   {
    "key": "F2",
    "method": "F",
    "cable": "single-core",
    "loaded": 2,
    "description": "Single-core cables touching in free air (clearance to wall >= one cable diameter), two loaded conductors, touching"
   },
   {
    "key": "F3_trefoil",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, trefoil"
   },
   {
    "key": "F3_flat_touching",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, touching"
   },
   {
    "key": "G_spaced_horizontal",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), horizontal"
   },
   {
    "key": "G_spaced_vertical",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), vertical"
   }
  ],
  "Al": {
   "E2": [
    null,
    23,
    31,
    39,
    54,
    73,
    89,
    111,
    135,
    173,
    210,
    244,
    282,
    322,
    380,
    439,
    null,
    null,
    null
   ],
   "E3": [
    null,
    19.5,
    26,
    33,
    46,
    61,
    78,
    96,
    117,
    150,
    183,
    212,
    245,
    280,
    330,
    381,
    null,
    null,
    null
   ],
   "F2": [
    null,
    null,
    null,
    null,
    null,
    null,
    98,
    122,
    149,
    192,
    235,
    273,
    316,
    363,
    430,
    497,
    600,
    694,
    808
   ],
   "F3_trefoil": [
    null,
    null,
    null,
    null,
    null,
    null,
    84,
    105,
    128,
    166,
    203,
    237,
    274,
    315,
    375,
    434,
    526,
    610,
    711
   ],
   "F3_flat_touching": [
    null,
    null,
    null,
    null,
    null,
    null,
    87,
    109,
    133,
    173,
    212,
    247,
    287,
    330,
    392,
    455,
    552,
    640,
    746
   ],
   "G_spaced_horizontal": [
    null,
    null,
    null,
    null,
    null,
    null,
    112,
    139,
    169,
    217,
    265,
    308,
    356,
    407,
    482,
    557,
    671,
    775,
    900
   ],
   "G_spaced_vertical": [
    null,
    null,
    null,
    null,
    null,
    null,
    99,
    124,
    152,
    196,
    241,
    282,
    327,
    376,
    447,
    519,
    629,
    730,
    852
   ]
  },
  "notes": [
   "NOTE 1: Circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped conductors and may safely be applied to circular conductors.",
   "NOTE 2: De is the external diameter of the cable.",
   "Methods F and G (single-core) are only tabulated from 25 mm²; methods E are tabulated only up to 300 mm² (null = '-' in the standard). Aluminium starts at 2.5 mm².",
   "Grouping: B.52.17 items 4-5, or B.52.20 (method E, multi-core on trays/ladders) / B.52.21 (method F, single-core); B.52.21 has no factors for method G (spaced). Ambient: B.52.14."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.11"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_11",
    "tableName": "Table B.52.11"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.11 (PDF page 22)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (method E-F-G), 2001 values"
   }
  ],
  "discrepancies": [
   "Al 185 mm2 F2: TiSoft prints 3463, GOST R 50571.5.52, ABB 2006 and the IEC facsimile (Top Cable) give 363 -> 363 used (TiSoft typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011, TiSoft and ABB 2006."
  ]
 },
 "B.52.12": {
  "title": "Current-carrying capacities in amperes for installation methods E, F and G of Table B.52.1 - XLPE or EPR insulation, copper conductors - Conductor temperature: 90 °C, reference ambient temperature: 30 °C",
  "insulation": "XLPE/EPR",
  "conductor": "Cu",
  "conductorTemp": 90,
  "ambientAir": 30,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300,
   400,
   500,
   630
  ],
  "columns": [
   {
    "key": "E2",
    "method": "E",
    "cable": "multi-core",
    "loaded": 2,
    "description": "Multi-core cable in free air (clearance to wall >= 0.3 x cable diameter), two loaded conductors"
   },
   {
    "key": "E3",
    "method": "E",
    "cable": "multi-core",
    "loaded": 3,
    "description": "Multi-core cable in free air, three loaded conductors"
   },
   {
    "key": "F2",
    "method": "F",
    "cable": "single-core",
    "loaded": 2,
    "description": "Single-core cables touching in free air (clearance to wall >= one cable diameter), two loaded conductors, touching"
   },
   {
    "key": "F3_trefoil",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, trefoil"
   },
   {
    "key": "F3_flat_touching",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, touching"
   },
   {
    "key": "G_spaced_horizontal",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), horizontal"
   },
   {
    "key": "G_spaced_vertical",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), vertical"
   }
  ],
  "Cu": {
   "E2": [
    26,
    36,
    49,
    63,
    86,
    115,
    149,
    185,
    225,
    289,
    352,
    410,
    473,
    542,
    641,
    741,
    null,
    null,
    null
   ],
   "E3": [
    23,
    32,
    42,
    54,
    75,
    100,
    127,
    158,
    192,
    246,
    298,
    346,
    399,
    456,
    538,
    621,
    null,
    null,
    null
   ],
   "F2": [
    null,
    null,
    null,
    null,
    null,
    null,
    161,
    200,
    242,
    310,
    377,
    437,
    504,
    575,
    679,
    783,
    940,
    1083,
    1254
   ],
   "F3_trefoil": [
    null,
    null,
    null,
    null,
    null,
    null,
    135,
    169,
    207,
    268,
    328,
    383,
    444,
    510,
    607,
    703,
    823,
    946,
    1088
   ],
   "F3_flat_touching": [
    null,
    null,
    null,
    null,
    null,
    null,
    141,
    176,
    216,
    279,
    342,
    400,
    464,
    533,
    634,
    736,
    868,
    998,
    1151
   ],
   "G_spaced_horizontal": [
    null,
    null,
    null,
    null,
    null,
    null,
    182,
    226,
    275,
    353,
    430,
    500,
    577,
    661,
    781,
    902,
    1085,
    1253,
    1454
   ],
   "G_spaced_vertical": [
    null,
    null,
    null,
    null,
    null,
    null,
    161,
    201,
    246,
    318,
    389,
    454,
    527,
    605,
    719,
    833,
    1008,
    1169,
    1362
   ]
  },
  "notes": [
   "NOTE 1: Circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped conductors and may safely be applied to circular conductors.",
   "NOTE 2: De is the external diameter of the cable.",
   "Methods F and G (single-core) are only tabulated from 25 mm²; methods E are tabulated only up to 300 mm² (null = '-' in the standard).",
   "Grouping: B.52.17 items 4-5, or B.52.20 (method E, multi-core on trays/ladders) / B.52.21 (method F, single-core); B.52.21 has no factors for method G (spaced). Ambient: B.52.14."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.12"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_12",
    "tableName": "Table B.52.12"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.12 (PDF page 23)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (method E-F-G), 2001 values"
   }
  ],
  "discrepancies": [
   "Cu 50 mm2 E3: GOST R 50571.5.52 prints 102, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 192 -> 192 used (GOST typo).",
   "Cu 70 mm2 G_spaced_vertical: GOST R 50571.5.52 prints 316, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 318 -> 318 used (GOST typo).",
   "Cu 300 mm2 G_spaced_vertical: GOST R 50571.5.52 prints 633, TiSoft and ABB 2006 and the IEC facsimile (Top Cable) give 833 -> 833 used (GOST typo).",
   "Apart from the items above, all cells agree between GOST R 50571.5.52-2011, TiSoft and ABB 2006."
  ]
 },
 "B.52.13": {
  "title": "Current-carrying capacities in amperes for installation methods E, F and G of Table B.52.1 - XLPE or EPR insulation, aluminium conductors - Conductor temperature: 90 °C, reference ambient temperature: 30 °C",
  "insulation": "XLPE/EPR",
  "conductor": "Al",
  "conductorTemp": 90,
  "ambientAir": 30,
  "sizes": [
   1.5,
   2.5,
   4,
   6,
   10,
   16,
   25,
   35,
   50,
   70,
   95,
   120,
   150,
   185,
   240,
   300,
   400,
   500,
   630
  ],
  "columns": [
   {
    "key": "E2",
    "method": "E",
    "cable": "multi-core",
    "loaded": 2,
    "description": "Multi-core cable in free air (clearance to wall >= 0.3 x cable diameter), two loaded conductors"
   },
   {
    "key": "E3",
    "method": "E",
    "cable": "multi-core",
    "loaded": 3,
    "description": "Multi-core cable in free air, three loaded conductors"
   },
   {
    "key": "F2",
    "method": "F",
    "cable": "single-core",
    "loaded": 2,
    "description": "Single-core cables touching in free air (clearance to wall >= one cable diameter), two loaded conductors, touching"
   },
   {
    "key": "F3_trefoil",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, trefoil"
   },
   {
    "key": "F3_flat_touching",
    "method": "F",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, touching"
   },
   {
    "key": "G_spaced_horizontal",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), horizontal"
   },
   {
    "key": "G_spaced_vertical",
    "method": "G",
    "cable": "single-core",
    "loaded": 3,
    "description": "Single-core cables in free air, three loaded conductors, flat, spaced (at least one cable diameter De apart), vertical"
   }
  ],
  "Al": {
   "E2": [
    null,
    28,
    38,
    49,
    67,
    91,
    108,
    135,
    164,
    211,
    257,
    300,
    346,
    397,
    470,
    543,
    null,
    null,
    null
   ],
   "E3": [
    null,
    24,
    32,
    42,
    58,
    77,
    97,
    120,
    146,
    187,
    227,
    263,
    304,
    347,
    409,
    471,
    null,
    null,
    null
   ],
   "F2": [
    null,
    null,
    null,
    null,
    null,
    null,
    121,
    150,
    184,
    237,
    289,
    337,
    389,
    447,
    530,
    613,
    740,
    856,
    996
   ],
   "F3_trefoil": [
    null,
    null,
    null,
    null,
    null,
    null,
    103,
    129,
    159,
    206,
    253,
    296,
    343,
    395,
    471,
    547,
    663,
    770,
    899
   ],
   "F3_flat_touching": [
    null,
    null,
    null,
    null,
    null,
    null,
    107,
    135,
    165,
    215,
    264,
    308,
    358,
    413,
    492,
    571,
    694,
    806,
    942
   ],
   "G_spaced_horizontal": [
    null,
    null,
    null,
    null,
    null,
    null,
    138,
    172,
    210,
    271,
    332,
    387,
    448,
    515,
    611,
    708,
    856,
    991,
    1154
   ],
   "G_spaced_vertical": [
    null,
    null,
    null,
    null,
    null,
    null,
    122,
    153,
    188,
    244,
    300,
    351,
    408,
    470,
    561,
    652,
    792,
    921,
    1077
   ]
  },
  "notes": [
   "NOTE 1: Circular conductors are assumed for sizes up to and including 16 mm². Values for larger sizes relate to shaped conductors and may safely be applied to circular conductors.",
   "NOTE 2: De is the external diameter of the cable.",
   "Methods F and G (single-core) are only tabulated from 25 mm²; methods E are tabulated only up to 300 mm² (null = '-' in the standard). Aluminium starts at 2.5 mm².",
   "Grouping: B.52.17 items 4-5, or B.52.20 (method E, multi-core on trays/ladders) / B.52.21 (method F, single-core); B.52.21 has no factors for method G (spaced). Ambient: B.52.14."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.13"
   },
   {
    "name": "TiSoft ElectricalDesign help, IEC 60364-5-52 current-carrying capacity tables",
    "url": "https://www.ti-soft.com/en/support/help/electricaldesign/standards/iec-60364-5-52/current-carrying-capacity/table_b_52_13",
    "tableName": "Table B.52.13"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually; used to settle discrepancies)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.13 (PDF page 24)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 8 (method E-F-G), 2001 values"
   }
  ],
  "discrepancies": [
   "No discrepancies: all cells agree between GOST R 50571.5.52-2011, TiSoft and ABB 2006."
  ]
 },
 "B.52.14": {
  "title": "Correction factor for ambient air temperatures other than 30 °C to be applied to the current-carrying capacities for cables in the air",
  "temps": [
   10,
   15,
   20,
   25,
   30,
   35,
   40,
   45,
   50,
   55,
   60,
   65,
   70,
   75,
   80
  ],
  "PVC": [
   1.22,
   1.17,
   1.12,
   1.06,
   1,
   0.94,
   0.87,
   0.79,
   0.71,
   0.61,
   0.5,
   null,
   null,
   null,
   null
  ],
  "XLPE": [
   1.15,
   1.12,
   1.08,
   1.04,
   1,
   0.96,
   0.91,
   0.87,
   0.82,
   0.76,
   0.71,
   0.65,
   0.58,
   0.5,
   0.41
  ],
  "notes": [
   "XLPE column = 'XLPE and EPR'. Footnote a: for higher ambient temperatures, consult the manufacturer.",
   "The table also has two mineral-insulation columns (70 °C and 105 °C sheath) that are not transcribed here.",
   "Applies to methods A1, A2, B1, B2, C, E, F, G (cables in air). The 30 °C row (1.00) is printed in the IEC table; GOST omits it."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G12 (from table B.52.14)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.14"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.14 (PDF page 25)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 4"
   }
  ],
  "discrepancies": [
   "None for the PVC and XLPE columns: all four sources agree. (Only in the mineral 70 °C column, not transcribed, GOST R 50571.5.52 and ABB 2006 print 0.87 at 45 °C where the IEC facsimile prints 0.78.)"
  ]
 },
 "B.52.15": {
  "title": "Correction factors for ambient ground temperatures other than 20 °C to be applied to the current-carrying capacities for cables in ducts in the ground",
  "temps": [
   10,
   15,
   20,
   25,
   30,
   35,
   40,
   45,
   50,
   55,
   60,
   65,
   70,
   75,
   80
  ],
  "PVC": [
   1.1,
   1.05,
   1,
   0.95,
   0.89,
   0.84,
   0.77,
   0.71,
   0.63,
   0.55,
   0.45,
   null,
   null,
   null,
   null
  ],
  "XLPE": [
   1.07,
   1.04,
   1,
   0.96,
   0.93,
   0.89,
   0.85,
   0.8,
   0.76,
   0.71,
   0.65,
   0.6,
   0.53,
   0.46,
   0.38
  ],
  "notes": [
   "XLPE column = 'XLPE and EPR'. Table B.52.1 assigns this table to both D1 and D2.",
   "The 20 °C row (1.00) is printed in the IEC table and in Schneider; GOST and ABB omit it."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G13 (from table B.52.15)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.15"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.15 (PDF page 26)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 10"
   }
  ],
  "discrepancies": [
   "None: all four sources agree."
  ]
 },
 "B.52.16": {
  "title": "Correction factors for cables buried direct in the ground or in buried ducts for soil thermal resistivities other than 2.5 K·m/W to be applied to the current-carrying capacities for reference method D",
  "resistivities": [
   0.5,
   0.7,
   1,
   1.5,
   2,
   2.5,
   3
  ],
  "ducts": [
   1.28,
   1.2,
   1.18,
   1.1,
   1.05,
   1,
   0.96
  ],
  "direct": [
   1.88,
   1.62,
   1.5,
   1.28,
   1.12,
   1,
   0.9
  ],
  "notes": [
   "'ducts' = correction factor for cables in buried ducts (method D1); 'direct' = correction factor for direct buried cables (method D2). Resistivity in K·m/W.",
   "NOTE 1: The correction factors given have been averaged over the range of conductor sizes and types of installation included in Tables B.52.2 to B.52.5. The overall accuracy of correction factors is within ±5 %.",
   "NOTE 2: The correction factors are applicable to cables drawn into buried ducts; for cables laid direct in the ground the correction factors for thermal resistivities less than 2.5 K·m/W will be higher. Where more precise values are required they may be calculated by methods given in the IEC 60287 series.",
   "NOTE 3: The correction factors are applicable to ducts buried at depths of up to 0.8 m.",
   "NOTE 4: It is assumed that the soil properties are uniform. No allowance has been made for moisture migration, which can lead to a region of high thermal resistivity around the cable. If partial drying out of the soil is foreseen, the permissible current rating should be derived by the methods specified in the IEC 60287 series.",
   "The 2001 edition (ABB 2006 Table 14) only gave the duct row for 1-3 K·m/W (1.18, 1.1, 1.05, 1, 0.96)."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G14 (table B.52.16)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.16"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually, enlarged)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.16 (PDF page 26)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 14 (1-3 K·m/W, ducts only)"
   }
  ],
  "discrepancies": [
   "Ducts at 0.5 K·m/W: GOST R 50571.5.52 prints 1.26; Schneider EIG and the IEC facsimile (Top Cable) print 1.28 -> 1.28 used.",
   "All other cells agree (ABB 2006 agrees for 1-3 K·m/W)."
  ]
 },
 "B.52.17": {
  "title": "Reduction factors for one circuit or one multi-core cable or for a group of more than one circuit, or more than one multi-core cable, to be used with current-carrying capacities of Tables B.52.2 to B.52.13",
  "circuits": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   12,
   16,
   20
  ],
  "arrangements": [
   {
    "item": 1,
    "text": "Bunched in air, on a surface, embedded or enclosed",
    "factors": [
     1,
     0.8,
     0.7,
     0.65,
     0.6,
     0.57,
     0.54,
     0.52,
     0.5,
     0.45,
     0.41,
     0.38
    ],
    "useWith": "Tables B.52.2 to B.52.13, methods A to F"
   },
   {
    "item": 2,
    "text": "Single layer on wall, floor or unperforated cable tray systems",
    "factors": [
     1,
     0.85,
     0.79,
     0.75,
     0.73,
     0.72,
     0.72,
     0.71,
     0.7,
     null,
     null,
     null
    ],
    "useWith": "Tables B.52.2 to B.52.7, method C",
    "beyondNine": "No further reduction factor for more than nine circuits or multi-core cables (use the 9-circuit value)"
   },
   {
    "item": 3,
    "text": "Single layer fixed directly under a wooden ceiling",
    "factors": [
     0.95,
     0.81,
     0.72,
     0.68,
     0.66,
     0.64,
     0.63,
     0.62,
     0.61,
     null,
     null,
     null
    ],
    "useWith": "Tables B.52.2 to B.52.7, method C",
    "beyondNine": "No further reduction factor for more than nine circuits or multi-core cables (use the 9-circuit value)"
   },
   {
    "item": 4,
    "text": "Single layer on a perforated horizontal or vertical cable tray systems",
    "factors": [
     1,
     0.88,
     0.82,
     0.77,
     0.75,
     0.73,
     0.73,
     0.72,
     0.72,
     null,
     null,
     null
    ],
    "useWith": "Tables B.52.8 to B.52.13, methods E and F",
    "beyondNine": "No further reduction factor for more than nine circuits or multi-core cables (use the 9-circuit value)"
   },
   {
    "item": 5,
    "text": "Single layer on cable ladder systems or cleats etc.",
    "factors": [
     1,
     0.87,
     0.82,
     0.8,
     0.8,
     0.79,
     0.79,
     0.78,
     0.78,
     null,
     null,
     null
    ],
    "useWith": "Tables B.52.8 to B.52.13, methods E and F",
    "beyondNine": "No further reduction factor for more than nine circuits or multi-core cables (use the 9-circuit value)"
   }
  ],
  "notes": [
   "Items 2-5: cells for 12, 16 and 20 circuits are empty in the standard and carry the text 'No further reduction factor for more than nine circuits or multicore cables' (null here).",
   "NOTE 1: These factors are applicable to uniform groups of cables, equally loaded.",
   "NOTE 2: Where horizontal clearances between adjacent cables exceed twice their overall diameter, no reduction factor need be applied.",
   "NOTE 3: The same factors are applied to groups of two or three single-core cables and to multi-core cables.",
   "NOTE 4: If a system consists of both two- and three-core cables, the total number of cables is taken as the number of circuits, and the corresponding factor is applied to the tables for two loaded conductors for the two-core cables, and to the tables for three loaded conductors for the three-core cables.",
   "NOTE 5: If a group consists of n single-core cables it may either be considered as n/2 circuits of two loaded conductors or n/3 circuits of three loaded conductors.",
   "NOTE 6: The values given have been averaged over the range of conductor sizes and types of installation included in Tables B.52.2 to B.52.13; the overall accuracy of tabulated values is within 5 %.",
   "NOTE 7: For some installations and for other methods not provided for in the above table, it may be appropriate to use factors calculated for specific cases, see for example Tables B.52.20 and B.52.21.",
   "Methods D1/D2 use B.52.19/B.52.18 instead."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G16 (table B.52.17)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.17"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.17 (PDF page 27)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 5"
   }
  ],
  "discrepancies": [
   "None: all four sources agree."
  ]
 },
 "B.52.18": {
  "title": "Reduction factors for more than one circuit, cables laid directly in the ground - Installation method D2 in Tables B.52.2 to B.52.5 - Single-core or multi-core cables",
  "circuits": [
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   12,
   16,
   20
  ],
  "clearances": [
   "nil (cables touching)",
   "one cable diameter",
   "0.125 m",
   "0.25 m",
   "0.5 m"
  ],
  "factors": {
   "touching": [
    0.75,
    0.65,
    0.6,
    0.55,
    0.5,
    0.45,
    0.43,
    0.41,
    0.36,
    0.32,
    0.29
   ],
   "oneCableDiameter": [
    0.8,
    0.7,
    0.6,
    0.55,
    0.55,
    0.51,
    0.48,
    0.46,
    0.42,
    0.38,
    0.35
   ],
   "0.125m": [
    0.85,
    0.75,
    0.7,
    0.65,
    0.6,
    0.59,
    0.57,
    0.55,
    0.51,
    0.47,
    0.44
   ],
   "0.25m": [
    0.9,
    0.8,
    0.75,
    0.7,
    0.7,
    0.67,
    0.65,
    0.63,
    0.59,
    0.56,
    0.53
   ],
   "0.5m": [
    0.9,
    0.85,
    0.8,
    0.8,
    0.8,
    0.76,
    0.75,
    0.74,
    0.71,
    0.38,
    0.66
   ]
  },
  "likelyMisprint": {
   "circuits": 16,
   "clearance": "0.5m",
   "printed": 0.38,
   "probableIntended": 0.68,
   "comment": "0.38 is printed in the IEC 2009 table (Top Cable facsimile) and in Schneider EIG, but breaks the monotonic series (0.71 at 12, 0.66 at 20) and equals the 'one cable diameter' value in the same row; GOST R 50571.5.52-2011 prints 0.68. Kept as printed (conservative)."
  },
  "notes": [
   "Cable-to-cable clearance 'a': for multi-core cables between the cable surfaces; for single-core cables between the nearest surfaces of adjacent circuits (groups of two or three single-core cables).",
   "NOTE 1: Values given apply to an installation depth of 0.7 m and a soil thermal resistivity of 2.5 K·m/W. They are average values for the range of cable sizes and types quoted for Tables B.52.2 to B.52.5. The process of averaging, together with rounding off, can result in some cases in errors up to ±10 %. (Where more precise values are required they may be calculated by methods given in IEC 60287-2-1.)",
   "NOTE 2: In case of a thermal resistivity lower than 2.5 K·m/W the correction factors can, in general, be increased and can be calculated by the methods given in IEC 60287-2-1.",
   "NOTE 3: If a circuit consists of m parallel conductors per phase, then for determining the reduction factor, this circuit should be considered as m circuits.",
   "The 2001 edition (ABB 2006 Table 11) only covered 2-6 circuits; those values are unchanged."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G18 (table B.52.18)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.18"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually, enlarged)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.18 (PDF page 28)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 11 (2-6 circuits)"
   }
  ],
  "discrepancies": [
   "16 circuits, 0.5 m: IEC facsimile (Top Cable) and Schneider EIG print 0.38; GOST R 50571.5.52 prints 0.68. 0.38 kept as printed but flagged as a probable misprint in the standard (see likelyMisprint).",
   "All other cells agree between all sources."
  ]
 },
 "B.52.19": {
  "title": "Reduction factors for more than one circuit, cables laid in ducts in the ground - Installation method D1 in Tables B.52.2 to B.52.5",
  "circuits": [
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10,
   11,
   12,
   13,
   14,
   15,
   16,
   17,
   18,
   19,
   20
  ],
  "clearances": [
   "nil (ducts touching)",
   "0.25 m",
   "0.5 m",
   "1.0 m"
  ],
  "multiCoreSingleWayDucts": {
   "description": "A) Multi-core cables in single-way ducts; 'circuits' = number of cables; duct-to-duct clearance a",
   "factors": {
    "touching": [
     0.85,
     0.75,
     0.7,
     0.65,
     0.6,
     0.57,
     0.54,
     0.52,
     0.49,
     0.47,
     0.45,
     0.44,
     0.42,
     0.41,
     0.39,
     0.38,
     0.37,
     0.35,
     0.34
    ],
    "0.25m": [
     0.9,
     0.85,
     0.8,
     0.8,
     0.8,
     0.76,
     0.74,
     0.73,
     0.72,
     0.7,
     0.69,
     0.68,
     0.68,
     0.67,
     0.66,
     0.65,
     0.65,
     0.64,
     0.63
    ],
    "0.5m": [
     0.95,
     0.9,
     0.85,
     0.85,
     0.8,
     0.8,
     0.78,
     0.77,
     0.76,
     0.75,
     0.74,
     0.73,
     0.72,
     0.72,
     0.71,
     0.7,
     0.7,
     0.69,
     0.68
    ],
    "1.0m": [
     0.95,
     0.95,
     0.9,
     0.9,
     0.9,
     0.88,
     0.88,
     0.87,
     0.86,
     0.86,
     0.85,
     0.85,
     0.84,
     0.84,
     0.83,
     0.83,
     0.83,
     0.82,
     0.82
    ]
   }
  },
  "singleCoreSingleWayDucts": {
   "description": "B) Single-core cables in non-magnetic single-way ducts; 'circuits' = number of single-core circuits of two or three cables; duct-to-duct clearance a",
   "factors": {
    "touching": [
     0.8,
     0.7,
     0.65,
     0.6,
     0.6,
     0.53,
     0.5,
     0.47,
     0.45,
     0.43,
     0.41,
     0.39,
     0.37,
     0.35,
     0.34,
     0.33,
     0.31,
     0.3,
     0.29
    ],
    "0.25m": [
     0.9,
     0.8,
     0.75,
     0.7,
     0.7,
     0.66,
     0.63,
     0.61,
     0.59,
     0.57,
     0.56,
     0.54,
     0.53,
     0.52,
     0.51,
     0.5,
     0.49,
     0.48,
     0.47
    ],
    "0.5m": [
     0.9,
     0.85,
     0.8,
     0.8,
     0.8,
     0.76,
     0.74,
     0.73,
     0.72,
     0.7,
     0.69,
     0.68,
     0.68,
     0.67,
     0.66,
     0.65,
     0.65,
     0.64,
     0.63
    ],
    "1.0m": [
     0.95,
     0.9,
     0.9,
     0.9,
     0.9,
     0.87,
     0.87,
     0.86,
     0.85,
     0.85,
     0.84,
     0.84,
     0.83,
     0.83,
     0.83,
     0.82,
     0.82,
     0.82,
     0.81
    ]
   }
  },
  "notes": [
   "NOTE 1: Values given apply to an installation depth of 0.7 m and a soil thermal resistivity of 2.5 K·m/W. They are average values for the range of cable sizes and types quoted for Tables B.52.2 to B.52.5. The process of averaging, together with rounding off, can result in some cases in errors up to ±10 %. Where more precise values are required they may be calculated by methods given in IEC 60287-2-1.",
   "NOTE 2: In case of a thermal resistivity lower than 2.5 K·m/W the correction factors can, in general, be increased and can be calculated by the methods given in IEC 60287-2-1.",
   "NOTE 3: If a circuit consists of n parallel conductors per phase, then for determining the reduction factor this circuit shall be considered as n circuits.",
   "The 2001 edition (ABB 2006 Tables 12 and 13) only covered 2-6 circuits; those values are unchanged."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.19"
   },
   {
    "name": "Top Cable, 'Methods of installation and current-carrying capacities based on IEC 60364-5-52 Ed.3' (facsimile images of the IEC 2009 tables; read visually)",
    "url": "https://www.topcable.com/topmatic/data/en.pdf",
    "tableName": "Table B.52.19 (PDF page 29-30)"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Tables 12 and 13 (2-6 circuits)"
   }
  ],
  "discrepancies": [
   "None in values. GOST R 50571.5.52 labels the 18-cable row of part A as '16' (label typo only).",
   "Rows 7-20 have two sources (GOST and the IEC facsimile in the Top Cable PDF); rows 2-6 have three (plus ABB 2006). Not in the Schneider EIG wiki."
  ]
 },
 "B.52.20": {
  "title": "Reduction factors for groups of more than one multi-core cable to be applied to reference ratings for multi-core cables in free air - Method of installation E in Tables B.52.8 to B.52.13",
  "cablesPerTray": [
   1,
   2,
   3,
   4,
   6,
   9
  ],
  "rows": [
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 1,
    "factors": [
     1,
     0.88,
     0.82,
     0.79,
     0.76,
     0.73
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 2,
    "factors": [
     1,
     0.87,
     0.8,
     0.77,
     0.73,
     0.68
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 3,
    "factors": [
     1,
     0.86,
     0.79,
     0.76,
     0.71,
     0.66
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 6,
    "factors": [
     1,
     0.84,
     0.77,
     0.73,
     0.68,
     0.64
    ],
    "singleSource": true
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "spaced (De between cables)",
    "trays": 1,
    "factors": [
     1,
     1,
     0.98,
     0.95,
     0.91,
     null
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "spaced (De between cables)",
    "trays": 2,
    "factors": [
     1,
     0.99,
     0.96,
     0.92,
     0.87,
     null
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "spaced (De between cables)",
    "trays": 3,
    "factors": [
     1,
     0.98,
     0.95,
     0.91,
     0.85,
     null
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 1,
    "factors": [
     1,
     0.88,
     0.82,
     0.78,
     0.73,
     0.72
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "touching",
    "trays": 2,
    "factors": [
     1,
     0.88,
     0.81,
     0.76,
     0.71,
     0.7
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "spaced (De between cables)",
    "trays": 1,
    "factors": [
     1,
     0.91,
     0.89,
     0.88,
     0.87,
     null
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "spaced (De between cables)",
    "trays": 2,
    "factors": [
     1,
     0.91,
     0.88,
     0.87,
     0.85,
     null
    ]
   },
   {
    "system": "Unperforated cable tray systems",
    "installationMethod": 30,
    "arrangement": "touching",
    "trays": 1,
    "factors": [
     0.97,
     0.84,
     0.78,
     0.75,
     0.71,
     0.68
    ],
    "singleSource": true
   },
   {
    "system": "Unperforated cable tray systems",
    "installationMethod": 30,
    "arrangement": "touching",
    "trays": 2,
    "factors": [
     0.97,
     0.83,
     0.76,
     0.72,
     0.68,
     0.63
    ],
    "singleSource": true
   },
   {
    "system": "Unperforated cable tray systems",
    "installationMethod": 30,
    "arrangement": "touching",
    "trays": 3,
    "factors": [
     0.97,
     0.82,
     0.75,
     0.71,
     0.66,
     0.61
    ],
    "singleSource": true
   },
   {
    "system": "Unperforated cable tray systems",
    "installationMethod": 30,
    "arrangement": "touching",
    "trays": 6,
    "factors": [
     0.97,
     0.81,
     0.73,
     0.69,
     0.63,
     0.58
    ],
    "singleSource": true
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "trays": 1,
    "factors": [
     1,
     0.87,
     0.82,
     0.8,
     0.79,
     0.78
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "trays": 2,
    "factors": [
     1,
     0.86,
     0.8,
     0.78,
     0.76,
     0.73
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "trays": 3,
    "factors": [
     1,
     0.85,
     0.79,
     0.76,
     0.73,
     0.7
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "trays": 6,
    "factors": [
     1,
     0.84,
     0.77,
     0.73,
     0.68,
     0.64
    ],
    "singleSource": true
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "spaced (De between cables)",
    "trays": 1,
    "factors": [
     1,
     1,
     1,
     1,
     1,
     null
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "spaced (De between cables)",
    "trays": 2,
    "factors": [
     1,
     0.99,
     0.98,
     0.97,
     0.96,
     null
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "spaced (De between cables)",
    "trays": 3,
    "factors": [
     1,
     0.98,
     0.97,
     0.96,
     0.93,
     null
    ]
   }
  ],
  "notes": [
   "'trays' = number of trays or ladders (stacked); factors aligned with cablesPerTray. null = '-' in the table.",
   "NOTE 1: Values given are averages over the cable types and range of conductor sizes considered in Tables B.52.8 to B.52.13; overall accuracy within ±5 % (wording from the GOST translation, not verified against the English IEC text).",
   "NOTE 2: Factors apply to single layer groups of cables as shown and do not apply when cables are installed in more than one layer touching each other. Values for such installations may be significantly lower and must be determined by an appropriate method.",
   "NOTE 3: Values are given for vertical spacings between trays of 300 mm and at least 20 mm between trays and wall. For closer spacing the factors should be reduced.",
   "NOTE 4: Values are given for horizontal spacing between trays of 225 mm with trays mounted back to back. For closer spacing the factors should be reduced.",
   "Installation method numbers refer to Table A.52.3 (30 = unperforated tray, 31 = perforated tray, 32-34 = ladder/cleats). GOST prints 31 for the unperforated row; 30 used here per Table A.52.3 item numbering."
  ],
  "sources": [
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.20"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 7 (perforated trays, vertical perforated trays, ladders; 1-3 trays)"
   }
  ],
  "discrepancies": [
   "All cells present in both sources agree (GOST R 50571.5.52-2011 vs ABB 2006).",
   "Rows marked singleSource (6 trays; unperforated trays) exist only in the 2009 edition and were found in only one source (GOST R 50571.5.52-2011). Not in the Schneider EIG wiki or the Top Cable PDF."
  ]
 },
 "B.52.21": {
  "title": "Reduction factors for groups of more than one circuit of single-core cables to be applied to reference rating for one circuit of single-core cables in free air - Method of installation F in Tables B.52.8 to B.52.13",
  "circuitsPerTray": [
   1,
   2,
   3
  ],
  "rows": [
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 1,
    "factors": [
     0.98,
     0.91,
     0.87
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 2,
    "factors": [
     0.96,
     0.87,
     0.81
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 3,
    "factors": [
     0.95,
     0.85,
     0.78
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "touching",
    "formation": "three cables in vertical formation",
    "trays": 1,
    "factors": [
     0.96,
     0.86,
     null
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "touching",
    "formation": "three cables in vertical formation",
    "trays": 2,
    "factors": [
     0.95,
     0.84,
     null
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 1,
    "factors": [
     1,
     0.97,
     0.96
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 2,
    "factors": [
     0.98,
     0.93,
     0.89
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "touching",
    "formation": "three cables in horizontal formation",
    "trays": 3,
    "factors": [
     0.97,
     0.9,
     0.86
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 1,
    "factors": [
     1,
     0.98,
     0.96
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 2,
    "factors": [
     0.97,
     0.93,
     0.89
    ]
   },
   {
    "system": "Perforated cable tray systems (note 3)",
    "installationMethod": 31,
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 3,
    "factors": [
     0.96,
     0.92,
     0.86
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 1,
    "factors": [
     1,
     0.91,
     0.89
    ]
   },
   {
    "system": "Vertical perforated cable tray systems (note 4)",
    "installationMethod": 31,
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 2,
    "factors": [
     1,
     0.9,
     0.86
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 1,
    "factors": [
     1,
     1,
     1
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 2,
    "factors": [
     0.97,
     0.95,
     0.93
    ]
   },
   {
    "system": "Cable ladder systems, cleats, etc. (note 3)",
    "installationMethod": "32, 33, 34",
    "arrangement": "trefoil groups spaced 2De",
    "formation": "three cables in trefoil formation",
    "trays": 3,
    "factors": [
     0.96,
     0.94,
     0.9
    ]
   }
  ],
  "notes": [
   "'circuitsPerTray' = number of three-phase circuits per tray or ladder; 'trays' = number of trays/ladders. Use as a multiplier to the rating for the formation given (method F columns of B.52.10-B.52.13).",
   "NOTE 1: Values given are averages over the cable types and range of conductor sizes considered in Tables B.52.8 to B.52.13; overall accuracy within ±5 % (wording from the GOST translation, not verified against the English IEC text).",
   "NOTE 2: Factors are given for single layers of cables (or trefoil groups) as shown in the table and do not apply when cables are installed in more than one layer touching each other. Values for such installations may be significantly lower and must be determined by an appropriate method.",
   "NOTE 3: Values are given for vertical spacings between trays of 300 mm and at least 20 mm between trays and wall. For closer spacing the factors should be reduced.",
   "NOTE 4: Values are given for horizontal spacing between trays of 225 mm with trays mounted back to back. For closer spacing the factors should be reduced.",
   "NOTE 5: For circuits having more than one cable in parallel per phase, each three-phase set of conductors should be considered as a circuit for the purpose of this table.",
   "NOTE 6: If a circuit consists of m parallel conductors per phase, then for determining the reduction factor this circuit should be considered as m circuits."
  ],
  "sources": [
   {
    "name": "Schneider Electric, Electrical Installation Guide (wiki), chapter G",
    "url": "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
    "tableName": "Fig. G17 (table B.52.21)"
   },
   {
    "name": "GOST R 50571.5.52-2011 (Russian national standard, identical to IEC 60364-5-52:2009), full text",
    "url": "https://meganorm.ru/Data2/1/4293792/4293792410.htm",
    "tableName": "Таблица В.52.21"
   },
   {
    "name": "ABB SACE Electrical installation handbook Vol. 2 'Electrical devices', 4th ed. 2006 (1SDC010001D0204), based on IEC 60364-5-52:2001",
    "url": "https://library.e.abb.com/public/561a28a17753c444c125714f00360967/1SDC010001D0204.pdf",
    "tableName": "Table 6"
   }
  ],
  "discrepancies": [
   "All values agree between Schneider EIG, GOST R 50571.5.52-2011 and ABB 2006, except that GOST omits the 3-ladder trefoil row (0.96, 0.94, 0.90); that row is taken from Schneider and ABB, which agree."
  ]
 }
};

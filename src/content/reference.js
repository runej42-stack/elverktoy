// Oppslagssider. Egne formuleringer; kravene står i NEK 400:2026 og forskriftene.
// Blokker: { p }, { h }, { list }, { note }, { table: { columns, rows } }, { figure: id }.

export const REFERENCE_GROUPS = ['NEK 400 og regelverk', 'Tabeller og koder', 'Sikkerhet', 'Hjelp i felt'];

export const REFERENCE = [
  // ---------- NEK 400 og regelverk ----------
  {
    id: 'nytt-2026',
    group: 'NEK 400 og regelverk',
    title: 'Nytt i NEK 400:2026',
    summary: 'De viktigste endringene fra 2022-utgaven og overgangsreglene.',
    keywords: ['nek 400 2026', 'nyheter', 'endringer', 'overgang', 'cpr', 'havarisikker', 'usb-c', 'poe'],
    blocks: [
      { p: 'NEK 400:2026 (8. utgave) har gjeldt siden 1. juli 2026.' },
      { h: 'Overgangsregler (DSB)' },
      { list: [
        'NEK 400:2022 kan brukes til prosjektering ut 2026.',
        'Anlegg prosjektert etter 2022-utgaven må være ferdige innen utgangen av 2027.',
        'Hvilken utgave som er brukt, dokumenteres i samsvarserklæringen.',
      ] },
      { h: 'Endringer du merker i hverdagen' },
      { list: [
        'Kabel: minst brannklasse Dca-s2,d2,a1 (CPR). PVC-isolerte kabler og ledere kan ikke lenger brukes i nye anlegg.',
        'Betegnelsene termoplast (70 °C) og termoherd (90 °C). Regner du med 90 °C, må klemmene i utstyret tåle det – ellers gjelder 70 °C-tabellene.',
        'Overspenningsvern i IT- og TT-nett skal være havarisikre. De gamle alternativene (egen kapsling eller jordfeilbryter foran) er fjernet.',
        'Elbillading (7-722): hvert nytt ladepunkt skal ha egen kurs. Muligheten for å bruke en eksisterende kurs til frittstående garasje er fjernet. Nye avsnitt om trådløs lading og V2G.',
        'Bad (7-701): kravet om utjevningsforbindelse inne i plastavløp («Tjøme-muffe») er fjernet. Nytt veiledende tillegg om vurdering av supplerende utjevning, f.eks. nytt bad i gammelt hus.',
        'Boliger (8-823): USB-uttak skal være USB-C. USB-lading vurderes sammen med eier og er ikke påbudt.',
        'Solcelleanlegg (7-712) er revidert i sin helhet, med blant annet krav til brannsikkerhet, DC-merking og batterilagring.',
        'Ny del 7-716 om Power over Ethernet (PoE).',
      ] },
      { note: 'Oppsummeringen bygger på NEK, NHO Elektro, NITO og DSB (juni 2026). Les standarden for fullstendige krav.' },
    ],
  },
  {
    id: 'hovedkrav',
    group: 'NEK 400 og regelverk',
    title: 'Viktige krav å huske',
    summary: 'En kortversjon av krav som går igjen i de fleste installasjoner.',
    keywords: ['krav', 'nek 400', 'jordfeilvern', 'komfyrvakt', 'overspenningsvern', 'bolig', 'utkobling'],
    blocks: [
      { list: [
        'Dimensjonering (4-43, 5-52, 525): Ib ≤ In ≤ Iz, I2 ≤ 1,45 · Iz, normalt maks 4 % spenningsfall, og vernet skal koble ut ved minste kortslutningsstrøm.',
        'Boliger (8-823): for ledere til og med 4 mm² gjelder I2 ≤ Iz, så vanlige automater må ofte erstattes med vern med lav I2 eller større tverrsnitt.',
        'Automatisk utkobling (4-41): 0,4 s for sluttkurser i TN 230 V, 5 s for fordelingskurser.',
        'Jordfeilvern: på kurser med stikkontakter og i boliger på kursene etter 8-823. Type A eller bedre; elbillading krever type B eller A med RDC-DD.',
        'Komfyrvakt: påkrevd ved komfyr i boliger (8-823).',
        'Overspenningsvern (4-443 og 5-534): vurderes og installeres etter risikovurdering; i boliger påkrevd.',
        'Bad og våtrom (7-701): soner med krav til IP-grad og utstyr, jordfeilvern 30 mA.',
        'Dokumentasjon: kursfortegnelse, samsvarserklæring, risikovurdering og brukerdokumentasjon (FDV).',
      ] },
      { note: 'Kortversjon med egne ord. Kravene, unntakene og detaljene står i NEK 400:2026.' },
    ],
  },
  {
    id: 'forskrifter',
    group: 'NEK 400 og regelverk',
    title: 'Forskrifter og dokumentasjonsplikt',
    summary: 'FEL, FSE, FKE og hva som skal leveres når jobben er ferdig.',
    keywords: ['fel', 'fse', 'fke', 'fek', 'forskrift', 'samsvarserklæring', 'elsmart', 'ferdigmelding', 'dokumentasjon'],
    blocks: [
      { list: [
        'FEL – forskrift om elektriske lavspenningsanlegg: krav til prosjektering, utførelse og dokumentasjon. NEK 400 er den vanlige måten å oppfylle kravene på.',
        'FSE – forskrift om sikkerhet ved arbeid i og drift av elektriske anlegg: hvordan arbeidet skal planlegges og utføres sikkert.',
        'FKE – forskrift om krav til elektroforetak og kvalifikasjoner for elektrofagfolk: registrering og kompetanse.',
        'FEK – forskrift om elektrisk utstyr: krav til utstyret som brukes.',
      ] },
      { h: 'Når jobben er ferdig' },
      { list: [
        'Samsvarserklæring til eier (fel § 12), med henvisning til hvilken NEK 400-utgave som er brukt.',
        'Kursfortegnelse i fordelingen.',
        'Risikovurdering og eventuelle avvik fra normen, med begrunnelse.',
        'Brukerdokumentasjon og FDV for utstyret.',
        'Ferdigmelding til nettselskapet (f.eks. via Elsmart) når anlegget er meldt inn.',
      ] },
      { note: 'Se DSBs veiledninger for full ordlyd.' },
    ],
  },

  // ---------- Tabeller og koder ----------
  {
    id: 'nettsystemer',
    group: 'Tabeller og koder',
    title: 'Nettsystemer: TN, IT og TT',
    summary: 'Hvordan nettene er bygget, med figur.',
    keywords: ['tn', 'it', 'tt', 'tn-c-s', 'nettsystem', 'jording', 'pen', 'figur'],
    blocks: [
      { h: 'TN-C-S 400/230 V' },
      { figure: 'tn' },
      { p: 'Trafoens nullpunkt er jordet. Fram til inntaket er PE og N felles (PEN), i anlegget er de skilt. En jordfeil blir en kortslutning som vernet kobler ut. Enfaselast ligger mellom fase og N (230 V).' },
      { h: 'IT 230 V' },
      { figure: 'it' },
      { p: 'Nettet er isolert fra jord eller jordet via høy impedans, og har ingen N ut til anlegget. Første jordfeil gir liten strøm og kobler normalt ikke ut. Enfaselast ligger mellom to faser (230 V).' },
      { h: 'TT' },
      { figure: 'tt' },
      { p: 'Trafoen er jordet, men anlegget har egen jordelektrode. Feilstrømmen går gjennom jord og er ofte for liten for vanlige vern, så jordfeilbryter er det normale vernet.' },
    ],
  },
  {
    id: 'ip',
    group: 'Tabeller og koder',
    title: 'IP-koder',
    summary: 'Beskyttelse mot fremmedlegemer og vann (NEK EN 60529).',
    keywords: ['ip', 'ip-grad', 'kapsling', 'tetthet', 'vann', 'støv', 'ip44', 'ip65', 'ipx4'],
    blocks: [
      { p: 'IP + to sifre: første siffer er beskyttelse mot berøring og fremmedlegemer, andre siffer mot vann. X betyr at egenskapen ikke er prøvd.' },
      { table: {
        columns: ['Første siffer', 'Beskyttelse mot'],
        rows: [
          ['0', 'Ingen beskyttelse'], ['1', 'Gjenstander over 50 mm (håndbak)'], ['2', 'Gjenstander over 12,5 mm (finger)'],
          ['3', 'Gjenstander over 2,5 mm (verktøy)'], ['4', 'Gjenstander over 1 mm (tråd)'], ['5', 'Støvbeskyttet'], ['6', 'Støvtett'],
        ],
      } },
      { table: {
        columns: ['Andre siffer', 'Beskyttelse mot'],
        rows: [
          ['0', 'Ingen beskyttelse'], ['1', 'Loddrett dryppende vann'], ['2', 'Dryppende vann med kapslingen vippet inntil 15°'],
          ['3', 'Regn og spylevann inntil 60° fra loddrett'], ['4', 'Vannsprut fra alle retninger'], ['5', 'Vannstråler'],
          ['6', 'Kraftige vannstråler'], ['7', 'Midlertidig nedsenking (1 m i 30 min)'], ['8', 'Vedvarende nedsenking etter avtale med produsent'],
          ['9', 'Høytrykksspyling med varmt vann (IPX9/IPX9K)'],
        ],
      } },
      { p: 'Ekstra bokstav: A (håndbak), B (finger), C (verktøy), D (tråd) for berøringsbeskyttelse, og H, M, S, W for høyspent, bevegelse og vær.' },
    ],
  },
  {
    id: 'ik',
    group: 'Tabeller og koder',
    title: 'IK-koder',
    summary: 'Beskyttelse mot mekaniske slag (NEK EN 62262).',
    keywords: ['ik', 'slag', 'mekanisk', 'ik08', 'ik10', 'kapsling'],
    blocks: [
      { table: {
        columns: ['Kode', 'Slagenergi'],
        rows: [
          ['IK00', 'Ikke prøvd'], ['IK01', '0,14 J'], ['IK02', '0,2 J'], ['IK03', '0,35 J'], ['IK04', '0,5 J'], ['IK05', '0,7 J'],
          ['IK06', '1 J'], ['IK07', '2 J'], ['IK08', '5 J'], ['IK09', '10 J'], ['IK10', '20 J'],
        ],
      } },
      { p: 'IK10 tilsvarer et slag fra 5 kg sluppet fra 40 cm. Velg høy IK-grad i garasjer, parkeringsanlegg, idrettshaller og offentlige rom.' },
    ],
  },
  {
    id: 'lederfarger',
    group: 'Tabeller og koder',
    title: 'Lederfarger',
    summary: 'Farger for fase, nøytral og beskyttelsesleder (NEK EN 60445).',
    keywords: ['farger', 'lederfarger', 'brun', 'svart', 'grå', 'blå', 'grønn gul', 'pe', 'pen'],
    blocks: [
      { table: {
        columns: ['Leder', 'Farge'],
        rows: [
          ['Beskyttelsesleder (PE)', 'Grønn/gul'], ['Nøytralleder (N)', 'Blå'],
          ['PEN', 'Grønn/gul med blå merking i endene (eller blå med grønn/gul merking)'],
          ['Faseledere L1, L2, L3', 'Brun, svart, grå'],
        ],
      } },
      { p: 'Grønn/gul skal bare brukes til beskyttelsesledere. Blå kan brukes som faseleder bare der det ikke finnes N, og skal da merkes.' },
      { note: 'Eldre anlegg kan ha andre farger. Kontroller alltid med måling før du stoler på fargen.' },
    ],
  },
  {
    id: 'kabelbetegnelser',
    group: 'Tabeller og koder',
    title: 'Kabelbetegnelser',
    summary: 'Bokstavkoden i norske kabelnavn som PFSP, PFXP og TFXP.',
    keywords: ['kabelbetegnelse', 'kabeltype', 'pfsp', 'pfxp', 'tfxp', 'bfou', 'rfou', 'kabelnøkkel', 'typebetegnelse'],
    blocks: [
      { p: 'Norske kabelnavn har fire bokstaver for oppbygningen, så spenning og ledere: f.eks. «TFXP 1 kV 4G16». Bokstav 1 er isolasjonen, 2 er kappe/fylling, 3 er armering/skjerm og 4 er ytterkappen.' },
      { table: {
        columns: ['Type', 'Betydning'],
        rows: [
          ['PFSP', 'PVC-isolasjon, fyllkappe, konsentrisk leder (skjerm), PVC-ytterkappe'],
          ['PFXP', 'PVC-isolasjon, fyllkappe, ingen armering, PVC-ytterkappe'],
          ['TFXP', 'PEX-isolasjon (90 °C), fyllkappe, ingen armering, PVC-ytterkappe'],
          ['BFOU', 'Brannsikker bånd + isolasjon, fyllkappe, kobberflettet skjerm, EVA-ytterkappe (offshore/skip)'],
          ['RFOU', 'EP-gummi-isolasjon, fyllkappe, kobberflettet skjerm, EVA-ytterkappe (offshore/skip)'],
        ],
      } },
      { table: {
        columns: ['Bokstav 1: isolasjon', ''],
        rows: [
          ['B', 'Brannsikkert bånd + isolasjon'], ['E', 'PE eller PP'], ['G', 'Naturgummi'], ['I', 'Annen plast, f.eks. TPE'],
          ['P', 'PVC'], ['R', 'EP-gummi'], ['S', 'Silikongummi'], ['T', 'Tverrbundet PE (PEX)'], ['U', 'EVA'], ['Z', 'Fluorplast (PTFE, FEP)'],
        ],
      } },
      { table: {
        columns: ['Bokstav 2: kappe og fylling', ''],
        rows: [
          ['A', 'Aluminium'], ['E', 'PE eller PP'], ['F', 'Fyllkappe / båndering'], ['K', 'Bly'], ['L', 'Aluminiumslaminat + plastkappe'],
          ['P', 'PVC'], ['S', 'Fylling + konsentrisk leder'], ['V', 'Skjerm (ev. med PVC)'], ['X', 'Ingen kappe'],
        ],
      } },
      { table: {
        columns: ['Bokstav 3: armering og skjerm', ''],
        rows: [
          ['A', 'Armering, generelt'], ['B', 'Stålbånd'], ['C', 'Stålfletning'], ['L', 'Aluminiumslaminat'], ['O', 'Kobberfletning'],
          ['R', 'Ståltråd'], ['S', 'Konsentrisk leder'], ['T', 'Aluminiumstråd + stålbånd'], ['W', 'Bæreline'], ['X', 'Ingen armering'], ['Z', 'Kobbertråd'],
        ],
      } },
      { table: {
        columns: ['Bokstav 4: ytterkappe', ''],
        rows: [
          ['E', 'PE eller PP'], ['G', 'Naturgummi'], ['H', 'CSP eller CPE'], ['N', 'Polyuretan / polyester'], ['P', 'PVC'],
          ['R', 'EP-gummi'], ['S', 'Silikongummi'], ['T', 'PEX'], ['U', 'EVA, Vamac eller EMA'], ['Z', 'Fluorplast'],
        ],
      } },
      { p: 'Etter bokstavene kommer f.eks. MR (mangetrådet leder) eller Flex. G i lederangivelsen (3G2,5) betyr at en av lederne er grønn/gul (PE).' },
      { note: 'NEK 400:2026 krever minst brannklasse Dca-s2,d2,a1, og PVC-isolerte kabler kan ikke brukes i nye anlegg. Sjekk CPR-klassen på kabelen og i ytelseserklæringen (DoP). Noen kabler har produsentnavn som ikke følger nøkkelen.' },
      { p: 'Kilde for bokstavnøkkelen: norsk Wikipedia, «Norske typebetegnelser for kraftkabler og ledninger» (forkortet utvalg).' },
    ],
  },
  {
    id: 'baderom',
    group: 'Tabeller og koder',
    title: 'Baderom og våtrom: soner',
    summary: 'Sone 0, 1 og 2 med krav til IP-grad (NEK 400-7-701).',
    keywords: ['bad', 'baderom', 'våtrom', 'sone', 'sone 0', 'sone 1', 'sone 2', 'ip', '7-701', 'dusj'],
    blocks: [
      { figure: 'bad' },
      { list: [
        'Sone 0: inne i badekar eller dusjkar.',
        'Sone 1: over sone 0, opp til 2,25 m over gulvet. Dusj uten kar: innenfor 1,2 m fra dusjhodets feste.',
        'Sone 2: 0,6 m utenfor sone 1, opp til 2,25 m.',
      ] },
      { table: {
        columns: ['Sone', 'Minste IP-grad', 'Utstyr'],
        rows: [
          ['0', 'IPX7', 'Bare utstyr laget for sone 0, med SELV (maks 12 V AC / 30 V DC)'],
          ['1', 'IPX4 (IPX5 ved spyling)', 'Fast montert utstyr som er beregnet for sonen, f.eks. varmtvannsbereder og vifte'],
          ['2', 'IPX4 (IPX5 ved spyling)', 'Som sone 1, i tillegg bl.a. barbermaskinkontakt etter krav'],
        ],
      } },
      { list: [
        'Alle kurser til badet skal ha jordfeilvern 30 mA.',
        'Stikkontakter er ikke tillatt i sone 0, 1 og 2 (unntak: SELV og barbermaskinkontakt etter krav).',
        'NEK 400:2026: kravet om utjevningsforbindelse i plastavløp er fjernet, og et nytt tillegg beskriver vurdering av supplerende utjevning.',
      ] },
      { note: 'Kontroller detaljene i NEK 400-7-701, også nasjonale tilleggskrav og avstand til stikkontakter.' },
    ],
  },
  {
    id: 'ex',
    group: 'Tabeller og koder',
    title: 'Ex-soner og temperaturklasser',
    summary: 'Soneinndeling, utstyrskategorier, gassgrupper og T-klasser.',
    keywords: ['ex', 'atex', 'eksplosjon', 'sone 0', 'sone 1', 'sone 2', 'sone 20', 'temperaturklasse', 't4', 'gassgruppe', 'iic'],
    blocks: [
      { table: {
        columns: ['Sone', 'Eksplosiv atmosfære', 'Utstyr (kategori / EPL)'],
        rows: [
          ['0', 'Gass alltid eller lenge til stede', '1G / Ga'],
          ['1', 'Gass kan forekomme ved normal drift', '2G / Gb (eller bedre)'],
          ['2', 'Gass sjelden og kortvarig', '3G / Gc (eller bedre)'],
          ['20', 'Støv alltid eller lenge til stede', '1D / Da'],
          ['21', 'Støv kan forekomme ved normal drift', '2D / Db (eller bedre)'],
          ['22', 'Støv sjelden og kortvarig', '3D / Dc (eller bedre)'],
        ],
      } },
      { table: {
        columns: ['Temperaturklasse', 'Maks overflatetemperatur'],
        rows: [['T1', '450 °C'], ['T2', '300 °C'], ['T3', '200 °C'], ['T4', '135 °C'], ['T5', '100 °C'], ['T6', '85 °C']],
      } },
      { p: 'Gassgrupper: IIA (f.eks. propan), IIB (f.eks. etylen) og IIC (hydrogen, acetylen). Utstyr for IIC kan brukes i IIA og IIB. Støvgrupper: IIIA (fibre), IIIB (ikke-ledende støv), IIIC (ledende støv).' },
      { note: 'Arbeid i Ex-områder krever egen kompetanse og dokumentasjon av utstyr og installasjon.' },
    ],
  },

  // ---------- Sikkerhet ----------
  {
    id: 'sikkerhetsregler',
    group: 'Sikkerhet',
    title: 'De fem sikkerhetsreglene',
    summary: 'Før arbeid på frakoblet anlegg (NEK EN 50110-1 og FSE).',
    keywords: ['sikkerhet', 'fse', 'nek en 50110', 'frakoblet', 'afa', 'spenningsløs', 'låsing', 'jording', 'sja'],
    blocks: [
      { list: [
        '1. Koble fra og skill alle deler du skal arbeide på.',
        '2. Sikre mot innkobling: lås, skilt og ta ut sikringer.',
        '3. Kontroller at anlegget er spenningsløst, på arbeidsstedet, med godkjent spenningsprøver som er prøvd før og etter.',
        '4. Jord og kortslutt der det er påkrevd (alltid i høyspent, etter vurdering i lavspent).',
        '5. Beskytt mot spenningsførende deler i nærheten med avskjerming eller avstand.',
      ] },
      { h: 'Før du starter' },
      { list: [
        'Avklar hvem som er ansvarlig for arbeidet og for koblingen, slik virksomheten har bestemt etter FSE.',
        'Gjør en sikker jobbanalyse (SJA) når arbeidet er uvant, farlig eller flere er involvert.',
        'Bruk riktig verneutstyr og isolert verktøy.',
        'Arbeid under spenning krever egen opplæring, prosedyrer og utstyr.',
      ] },
    ],
  },
  {
    id: 'forstehjelp',
    group: 'Sikkerhet',
    title: 'Førstehjelp ved strømskade',
    summary: 'Hva du gjør når noen har fått strøm gjennom kroppen.',
    keywords: ['førstehjelp', 'strømulykke', 'strømskade', 'hlr', '113', 'ulykke', 'elulykke'],
    blocks: [
      { list: [
        '1. Bryt strømmen før du tar i personen. Går det ikke, bruk noe som isolerer, og hold avstand fra høyspent.',
        '2. Ring 113.',
        '3. Puster personen ikke normalt: start hjerte-lunge-redning, 30 kompresjoner og 2 innblåsninger. Bruk hjertestarter hvis den finnes.',
        '4. Legg en bevisstløs person som puster, i stabilt sideleie, og hold vedkommende varm.',
        '5. Alle som har fått strøm gjennom kroppen, bør til lege for kontroll, også når de føler seg bra.',
        '6. Meld fra til arbeidsgiver. Alvorlige ulykker skal meldes til myndighetene (DSB/eltilsynet).',
      ] },
      { note: 'Ta førstehjelpskurs jevnlig. Rådene her erstatter ikke opplæring.' },
    ],
  },

  // ---------- Hjelp i felt ----------
  {
    id: 'feilsoking',
    group: 'Hjelp i felt',
    title: 'Feilsøking steg for steg',
    summary: 'Jordfeilbryter løser ut, automat løser ut, varmekabel og motor.',
    keywords: ['feilsøking', 'jordfeil', 'løser ut', 'jordfeilbryter', 'automat', 'varmekabel', 'motor', 'ingen spenning'],
    blocks: [
      { h: 'Jordfeilbryteren løser ut' },
      { list: [
        'Løser den ut med en gang den slås på? Koble fra alle kurser bak bryteren og slå på én og én.',
        'Ved én kurs: koble fra alt utstyr på kursen og mål isolasjonsresistansen på faste ledere.',
        'Sjekk typiske kilder: utendørs koblingsbokser, varmekabler, varmtvannsbereder, komfyr og vaskemaskin.',
        'Løser den ut av og til? Tenk lekkasjestrøm fra mange apparater samtidig, fukt, og overspenning ved tordenvær.',
        'Prøv bryteren med testknapp og instrument – en defekt bryter kan også være feilen.',
      ] },
      { h: 'Automaten løser ut' },
      { list: [
        'Løser den ut momentant (smell)? Kortslutning – mål mellom lederne med utstyr frakoblet.',
        'Løser den ut etter en stund? Overlast – mål strømmen og sammenlign med vern og kabel.',
        'Motor eller stor startstrøm? Sjekk karakteristikk (B/C/D) mot startstrømmen.',
        'Kjenn etter varme klemmer i fordelingen – løse forbindelser gir varme og kan gi utløsning.',
      ] },
      { h: 'Varmekabelen varmer ikke' },
      { list: [
        'Sjekk termostat, føler og innstilling før du åpner noe.',
        'Mål motstanden i kabelen og sammenlign med R = U²/P.',
        'Brudd (uendelig motstand) eller jordfeil (lav isolasjon): finn feilstedet med feilsøkingsutstyr før du bryter opp gulvet.',
      ] },
      { h: 'Motoren starter ikke eller går varm' },
      { list: [
        'Mål spenning på alle tre faser og sjekk at ingen sikring er gått (fasebrudd).',
        'Kontroller motorvernets innstilling mot typeskiltet og om det har løst ut.',
        'Sjekk dreieretning og fasefølge, og at lasten ikke er blokkert.',
        'Mål isolasjonsresistansen på viklingene med motoren frakoblet.',
      ] },
      { h: 'Ingen spenning på uttaket' },
      { list: [
        'Sjekk vern og jordfeilbryter i fordelingen.',
        'Mål ved uttaket fase–N/fase–fase og fase–PE.',
        'Følg kursen bakover: koblingsbokser, gjennomkoblede uttak og brytere.',
      ] },
    ],
  },
  {
    id: 'ordliste',
    group: 'Hjelp i felt',
    title: 'Ordliste',
    summary: 'Forkortelser og fagbegreper som går igjen.',
    keywords: ['ordliste', 'forkortelser', 'begreper', 'ib', 'in', 'iz', 'i2', 'icu', 'zs', 'rcd', 'spd', 'afdd'],
    blocks: [
      { table: {
        columns: ['Begrep', 'Forklaring'],
        rows: [
          ['Ib', 'Belastningsstrøm – strømmen kursen skal føre'],
          ['In', 'Vernets merkestrøm'],
          ['Iz', 'Kabelens strømføringsevne ved aktuell forlegning'],
          ['I2', 'Strøm som sikkert løser ut vernet innen avtalt tid (automat 1,45 · In, gG 1,6 · In)'],
          ['Ik3, Ik2, Ik1', 'Kortslutningsstrøm: trefase, topolet og enpolet (fase–PE)'],
          ['Icu / Icn', 'Bryteevne for effektbryter / automatsikring'],
          ['IΔn', 'Jordfeilbryterens merkeutløsestrøm, f.eks. 30 mA'],
          ['Zs', 'Sløyfeimpedans fase–PE fram til feilstedet'],
          ['cos φ', 'Effektfaktor – forholdet mellom aktiv og tilsynelatende effekt'],
          ['PE / N / PEN', 'Beskyttelsesleder / nøytralleder / felles beskyttelses- og nøytralleder'],
          ['RCD / JFB', 'Jordfeilbryter (residual current device)'],
          ['RDC-DD', 'Overvåking av likestrøm i elbillader (6 mA)'],
          ['SPD / OV', 'Overspenningsvern (surge protective device)'],
          ['AFDD', 'Lysbuevern (arc fault detection device)'],
          ['MCB', 'Automatsikring (miniature circuit breaker)'],
          ['gG', 'Smeltesikring for generelt bruk'],
          ['SELV / PELV', 'Ekstra lav spenning uten / med jordforbindelse'],
          ['CPR', 'Byggevareforordningen – brannklasser for kabel'],
          ['FDV', 'Forvaltning, drift og vedlikehold – dokumentasjon til eier'],
          ['DLE', 'Det lokale eltilsyn'],
          ['Elsmart', 'System for melding om installasjonsarbeid til nettselskapet'],
          ['Komfyrvakt', 'Utstyr som kobler ut komfyren ved fare for brann'],
          ['Utjevningsforbindelse', 'Forbindelse som gir samme potensial på ledende deler'],
          ['Hovedjordskinne', 'Samlepunkt for jordelektrode, PE og utjevningsforbindelser'],
          ['Stikkledning', 'Kabelen fra nettselskapets nett til inntaket'],
        ],
      } },
    ],
  },
];

export const getReference = (id) => REFERENCE.find((r) => r.id === id) || null;

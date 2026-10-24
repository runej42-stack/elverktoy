# Retning C – Håndverksstempel (RHJ)

## Idé

Merket er et produsentstempel av den typen som er slått inn i godt verktøy: forbokstavene RHJ i en rolig ring. Bokstavene er bygd som bøyde flatskinner med samme bredde overalt og konsentriske bøyer, slik kobberskinner bøyes i et tavleskap, så det elektriske ligger i selve formen og ikke i et påklistret lyn. J-en bøyes ned og inn under H-en, et klassisk monogramgrep som binder bokstavene sammen og sparer bredde, slik at bokstavene blir store nok til å leses ved 24 px. Ringen får aksentfargen: petrol på papir (r-j.no) og messinggul på blekk (appen), som et messingstempel på stål.

## Farger

| Farge | Hex | Brukes til |
|---|---|---|
| Blekk | `#16232a` | bokstavene i `mark-color.svg` |
| Petrol | `#2b6570` | ringen i `mark-color.svg` |
| Papir | `#e8ecee` | bokstavene i ikonene |
| Gul | `#ffc83d` | ringen i ikonene |
| Ikonbakgrunn | `#1b2b33` → `#111b21` | svak loddrett gradient i blekktone (den eneste gradienten) |

Hvorfor disse fargene: Nettsiden er lys og appen er mørk, så formen er den samme og underlaget bestemmer fargen. På papir er petrol den rolige og «tegnede» aksenten fra r-j.no. På mørk flate gir den gule ringen det samme strømsignalet som appen bruker ellers, og den synes godt på hjem-skjermen. Blekk og papir er felles for begge.

`mark-color.svg` er laget for lys bakgrunn (`#e8ecee` eller `#fbfaf7`). På mørk bakgrunn bruker du `mark.svg` med `color: #e8ecee` (eller `#ffc83d`), eller ikonet.

## Slik er bokstavene bygd (rutenett 256 × 256, sentrum 128,128)

- **Ring:** ytre radius 118 og indre radius 106 (12 tykk), med 10 luft til kanten.
- **Felles for bokstavene:** Streken er 16 overalt, og versalhøyden er 96 (y 72–168). Alle buene er konsentriske par med ytre radius 26 og indre radius 10, så streken holder 16 også gjennom bøyene.
- **R** (x 53–109): Stammen er x 53–69. Bollen er en halvsirkel rundt (76,98) med en åpning på 17 × 20. Beinet går i stigning 1:2 fra stammens innerhjørne (69,124) og ned til foten (x 91–109). Høyrekanten møter bollen i (86,122), og det punktet ligger nøyaktig på buen (en 10-24-26-trekant), så skjøten er eksakt.
- **H** (x 121–171): Stammene er 16 brede, med 18 mellom dem. Tverrstreken går fra y 108 til 124, på samme linje som R-bollens nedre stav.
- **J** (x 187–203): Stammen går fra toppen og ned til en bøy rundt (177,170). Derfra går en hale (y 180–196) 12 under grunnlinjen. Halen slutter i x 155, rett under innerkanten av H-ens høyre stamme.
- **Avstander:** 12 mellom R-foten og H, 16 mellom H og J (stamme til stamme) og 12 mellom H-foten og J-halen. Til ringen er det minst 12,4, og det nærmeste er R øverst til venstre og J øverst til høyre.
- **Tekniske detaljer:** Alle koordinater er heltall. Ytre konturer går med klokka og hull mot klokka, så `evenodd` og `nonzero` gir samme fyll.
- **Ikonene:** `icon.svg` er skalert 1,625 (ringradius 191,75 av 256). `icon-maskable.svg` er skalert 1,5 (ringradius 177, innenfor den sikre sirkelen på 204).

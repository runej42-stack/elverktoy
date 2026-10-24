# ↯ Elverktøy

Kalkulatorer, oppslag og dokumentasjon for norske elektrikere, bygget på NEK 400:2026.
Laget av [Rune Johansen](https://r-j.no).

*In English: [README.md](README.md).*

**Bruk appen:** [r-j.no/elverktoy](https://r-j.no/elverktoy/)  
**Les mer:** [r-j.no/spill.php](https://r-j.no/spill.php)  
**Last ned én fil:** [Elverktoy.html](https://github.com/runej42-stack/elverktoy/releases/latest/download/Elverktoy.html) (virker uten nett på PC og Android)

## Kom i gang

Åpne [r-j.no/elverktoy](https://r-j.no/elverktoy/) på telefonen og legg appen på hjem-skjermen:

| Telefon | Slik gjør du |
|---|---|
| **iPhone og iPad** | Safari → Del-knappen → «Legg til på Hjem-skjerm» |
| **Android** | Chrome → menyen ⋮ → «Installer app» |
| **PC** | Chrome eller Edge → installer-ikonet i adressefeltet |

Appen virker uten nett når den er åpnet én gang, og sier selv fra når det finnes en ny versjon.
Ingen konto, ingen reklame, ingen sporing. Alt du skriver inn, lagres bare på enheten.

## Innhold

| Område | Hva som finnes |
|---|---|
| **Kurs og kabel** | Dimensjoner kurs (alle fem kravene på én gang), strømføringsevne, spenningsfall, maks lengde, kabeldata |
| **Kortslutning og vern** | Kortslutning gjennom flere kabelavsnitt, utkobling for B/C/D og gG, termisk fasthet, PE, selektivitet, jordfeilbryter, TT og IT |
| **Effekt og grunnlag** | Ohms lov, effekt, strøm, kVA, kompensering, transformator, effekttap |
| **Motor, varme, elbil og sol** | Motorstrøm og start, varmekabel, snøsmelting, frostsikring, elbil, effekttariff, solcellestreng |
| **Oppslag** | 68 formler, 28 fagtips, krav og nyheter i NEK 400:2026, kabelbetegnelser, IP-koder, baderomssoner |
| **Jobber** | Kurser og målinger med automatisk vurdering, sluttkontroll, risikovurdering og PDF |

Hver kalkulator viser utregningen steg for steg, med formelen, tallene dine og kilden.

«Dimensjoner kurs» finner minste tverrsnitt som holder, med forlegning i vegg, på vegg, i jord og på kabelbro eller stige,
samlet forlegning, ledertemperatur ut fra lasten og jordfeilbryter i TN, TT og IT.

## Beta og forbehold

Appen er i beta. Tabellene for strømføringsevne er skrevet av fra offentlige kilder som gjengir IEC 60364-5-52 tillegg B,
og er ikke kontrollert mot NEK 400:2026 ennå. Appen er et hjelpemiddel. Den erstatter ikke NEK 400,
prosjekteringsverktøy eller faglig vurdering. Kontroller alltid resultatene.

## For utviklere

Appen er ren HTML, CSS og JavaScript uten npm-pakker. Den trenger Node 22 eller nyere.

```bash
node tools/serve.mjs      # utviklingsserver på http://localhost:5173
node --test               # alle testene, også regneeksemplene i hver kalkulator
node tools/build.mjs      # bygger dist/web (nettside med service worker) og dist/fil (én fil)
```

På Windows kan du dobbeltklikke `Start-Elverktoy.cmd`. Mer om struktur, bygg og opplasting står i [UTVIKLING.md](UTVIKLING.md).

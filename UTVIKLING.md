# Elverktøy – for utviklere

Kalkulatorer, oppslag og dokumentasjon for norske elektrikere, laget som en nettapp (PWA). Appen kan legges på hjem-skjermen og virker uten nett på både iPhone og Android. På PC står feltene og resultatet ved siden av hverandre i kalkulatorene.

Appen har ingen npm-pakker. Alt kjøres med Node 22 eller nyere.

## Innhold

- **Kalkulatorer:** blant annet spenningsfall, kortslutning, overspenningsvern, effekt, motor, varmekabel, elbil, solceller, belysning, rørfylling, målinger og vern. Hver kalkulator viser utregningen steg for steg, forutsetninger og kilder.
- **Oppslag:**
  - formelsamling med over 60 formler
  - fagtips
  - nyhetene i NEK 400:2026 og viktige krav
  - forskrifter, nettsystemer med figurer, IP- og IK-koder, lederfarger og kabelbetegnelser
  - baderomssoner, Ex-soner, sikkerhet, førstehjelp, ordliste og feilsøking
- **Jobber:**
  - kurser med målinger som vurderes automatisk
  - sluttkontroll og risikovurdering
  - lagrede beregninger
  - PDF (kursfortegnelse, måleprotokoll, sluttkontroll, alt samlet) som deles via delingsarket
  - sikkerhetskopi

## Test på PC-en

Dobbeltklikk `Start-Elverktoy.cmd`. Appen åpnes i nettleseren på http://localhost:5180, og vinduet med serveren må stå åpent mens du tester.

Mobilvisning i Chrome eller Edge: trykk F12 og så Ctrl+Shift+M, og velg en telefon øverst.

Du kan også dobbeltklikke `dist/fil/Elverktoy-v0.2.0.html` (etter `node tools/build.mjs`). Den virker uten server.

## Kommandoer

```bash
node tools/serve.mjs
```
Starter utviklingsserveren på http://localhost:5173. Den viser Rune Johansens profil (RHJ). Legg til `?brand=noytral` i adressen for å se versjonen uten navn og logo, eller `?fil=1` for å teste én-fil-modus.

```bash
node --test
```
Kjører alle testene: formler, tabeller, regneeksemplene i hver kalkulator, jobber, PDF, bygget, service workeren og lytterne for installering.

```bash
node tools/build.mjs
```
Bygger `dist/web/` (PWA til en nettvert) og `dist/fil/` (én HTML-fil til deling) med RHJ-profilen, som er den som legges ut på r-j.no. `--brand=noytral` gir en versjon uten navn og logo.

`--out=mappe` legger bygget i en annen mappe enn `dist/`. Bygget sletter bare undermappene `web/` og `fil/` der, så `dist/preview/` og annet får stå. Prosjektmappa og mapper over den kan ikke brukes.

Tabellkontroll er skjult i bygget. Legg til `--tabellkontroll` for å ta den med (f.eks. til en egen versjon for dem som kontrollerer tabellene). En slik utgave bør ligge på et eget domene eller underdomene (f.eks. `tabell.r-j.no`), ikke i en annen mappe på r-j.no: jobber og innstillinger lagres per domene og deles derfor mellom alle utgaver på samme domene. Utviklingsserveren viser den alltid. Valget står i `src/core/features.js`, som bygget bytter ut. `beta` hentes fra samme fil.

## Legge ut på r-j.no

```bash
node tools/deploy.mjs
```
Kjører testene, bygger, laster opp `dist/web` til `www/elverktoy` med SFTP og sjekker etterpå at alle filene på https://r-j.no/elverktoy/ er like de lokale. `sw.js` lastes opp til slutt. `--forhandsvis` viser bare hva som ville blitt lastet opp, og `--bare-sjekk` sammenligner bare nettsiden med `dist/web`.

Opplastingen bruker en egen nøkkel, `~/.ssh/elverktoy_rjno` (uten passord). Den offentlige delen må ligge i `~/.ssh/authorized_keys` på webhotellet (bruker `rjno` på `linweb21.hmg9.webhuset.no`). Vertsnøkkelen til serveren lagres i `~/.ssh/known_hosts_elverktoy` første gang og sjekkes mot fingeravtrykket i skriptet. Fjernes linjen i `authorized_keys`, virker ikke nøkkelen lenger.

### Manuelt, hvis skriptet ikke kan brukes

Last opp alt i `dist/web/` til mappen `elverktoy/` hos Webhuset, så appen ligger på https://r-j.no/elverktoy/. Ta med `.htaccess`. Filen er skjult, så slå på visning av skjulte filer i FTP-programmet.

`.htaccess` sørger for at Apache
- sender manifestet med riktig type og alle tekstfiler som UTF-8 (`index.html` er standard for mappen hos Apache)
- komprimerer tekstfilene når serveren har `mod_deflate` (index.html er over 500 kB)
- ber telefonene alltid sjekke om det finnes en ny `index.html`, `sw.js`, `version.json` og `manifest.webmanifest`, så oppdateringer kommer fram
- lar ikonene ligge i nettleserens lager i en uke
- sender `nosniff` og `no-referrer` for litt ekstra sikkerhet og personvern

Bygget skriver `.htaccess` på nytt hver gang. Den er ikke med i service workerens liste.

Utviklingsverktøy som kjøres via utviklingsserveren:
- `tools/icons.html` lager app-ikonene (PNG) fra profilene. `?brand=rhj` lager bare ikonene for én profil.
- `tools/pdf-preview.html` viser et PDF-eksempel og lagrer sidene som PNG i `dist/preview/`.

### Før opplasting

Reglene i `.htaccess` i rotmappa på r-j.no arves inn i `/elverktoy/`. Les den først og se etter
- omdirigeringer (`Redirect`, `RewriteRule`) som også treffer `/elverktoy/`, `sw.js` eller `manifest.webmanifest`
- en `Content-Security-Policy`-header. Appen har skript og stil inne i `index.html` og virker ikke med en streng CSP.
- `AddHandler` eller `SetHandler` som får `.html` eller `.js` til å kjøres som PHP eller annet

Etter opplasting:

```bash
curl -sI https://r-j.no/elverktoy/
curl -sI http://r-j.no/elverktoy/
curl -sI https://r-j.no/elverktoy/sw.js
```

Forvent `200` (eller for http en omdirigering til https), `Content-Type: text/html; charset=utf-8` for appen (og en JavaScript-type for `sw.js`), `Cache-Control: no-cache` og ingen `Content-Security-Policy`. Gir den første `500`, er det sannsynligvis en linje i `.htaccess` som serveren ikke tillater.

## Struktur

- `src/core/`: kalkulatormotor, formelspråk, tallformat, innstillinger, lagring, søk, installering (`pwa.js`) og funksjonsbrytere (`features.js`)
- `src/lib/`: rene beregningsfunksjoner (kabel, kortslutning, effekt) som testes direkte
- `src/data/`: tabeller med kilde, hvem som skrev dem av og hvem som har kontrollert dem
- `src/calcs/`: kalkulatorene, med felt, beregning og regneeksempler
- `src/content/`: formelsamling, fagtips, oppslagssider og figurer
- `src/jobs/`: jobber, vurdering av målinger, lagring, PDF-skriver og dokumenter
- `src/ui/`: skjermbildene
- `src/brand/`: merkevareprofiler (navn, farger, logo, ikon). `rhj.js` er standard.
- `design/logo/`: logoforslagene med RHJ. Forslag C (`c-stempel`) er valgt og brukes i `src/brand/rhj.js`. `index.html` viser forslagene side om side via utviklingsserveren.
- `tools/`: utviklingsserver, bundler, bygg, ikoner og verktøy for tabeller

## Ny kalkulator

1. Lag kalkulatoren etter mønsteret i `src/calcs/spenningsfall.js`. Regn alltid med `ctx.step()`, så utregningen som vises er den samme som gir resultatet. Variabelnavn i formler kan ikke ha mellomrom.
2. Legg inn minst ett regneeksempel per modus i `cases`, med kilde. Regn eksemplene uavhengig av appen.
3. Registrer kalkulatoren i `src/calcs/index.js`.
4. Kjør `node --test`.

## Faglig forbehold

Appen er et hjelpemiddel. Den erstatter ikke NEK 400, prosjekteringsverktøy eller faglig vurdering. Tabeller som skrives av fra standarder, må kontrolleres mot NEK 400:2026 før de tas i bruk.

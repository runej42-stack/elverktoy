# A – Strømvei

## Idéen
RHJ er tegnet som én kretsbane på et kretskort. Strømmen går inn i loddepunktet nederst på R, opp stammen og rundt buen, ned R-beinet til foten av H, gjennom H og opp J-kroken til loddepunktet øverst på J. R-beinet og J-kroken er de samme 45°-banene som kobler bokstavene sammen, så koblingen er en del av bokstavformene og trenger ingen lynpil. Alle knekker er kuttet i 45°, slik en kretskortrouter legger baner. Inngangen nede til venstre og utgangen oppe til høyre gir merket en diagonal balanse.

## Farger
Regel: banen er nøytral, loddepunktene er alltid aksenten.

| Farge | Hex | Bruk |
|---|---|---|
| Petrol | `#2b6570` | banen i `mark-color.svg`, bakgrunn i app-ikonet (knytter merket til r-j.no) |
| Dyp petrol | `#1f4750` | bunnen av ikonets svake gradient (petrol trukket mot blekk) |
| Signalgul | `#ffc83d` | loddepunktene: gull/tinn på et kretskort og appens farge for strøm |
| Papir | `#e8ecee` | banen i app-ikonet |
| Blekk | `#16232a` | `mark.svg` på lys bakgrunn (`currentColor`), på mørk bakgrunn gul eller papir |

## Slik er bokstavene bygd (rutenett 256 × 256)
- Banen er 18 bred overalt. Diagonalene ligger mellom 45°-linjer, og alle koordinater er hele eller halve tall.
- Versalhøyden går fra y 56 til 200. R-buens underkant og H-ens tverrstrek deler senterlinjen y 124.
- **R:** stammen ligger på x 26–44, og buen går ut til x 94. Hjørnene er kuttet i 45° (18 målt på senterlinjen), og åpningen i buen er 32 × 41. Beinet går 45° fra buen ned til venstre fot på H.
- **H:** stammene ligger på x 118–136 og 168–186, med 32 mellom dem. Føttene er skåret langs skråbanene, så skjøtene blir rene V-er.
- **J:** stammen (x 212–230) går rett ned til y 147 på senterlinjen og knekker så 45° ned til høyre fot på H.
- **Loddepunkter:** radius 17,5 med hull på radius 7, plassert på stammeendene (35, 191) og (221, 65).
- Merket fyller 17,5–238,5 × 47,5–208,5 og er sentrert. Ikonene bruker samme path, skalert 1,5× (`translate(64 64)`). Punktet lengst ute ligger 195 px fra midten, innenfor sirkelen på 204 i det maskerbare ikonet.

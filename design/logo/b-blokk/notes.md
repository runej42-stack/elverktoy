# B – Kraftig monogram (RHJ)

## Idé
R, H og J er tre kraftige blokkbokstaver satt tett i ett kvadrat, og H og J deler stamme: H-ens høyre stamme går rett ned, svinger og blir J-ens krok, som bærer H-en. Merket er bygd som en liten skinne med tre ledere og fast avstand mellom dem, og H-ens tverrstrek er broen (lasken) mellom to skinner. Bare broen får aksentfarge, så det elektriske ligger i selve bokstaven og ikke i et påklistret symbol. R-ens bue og H-ens bro ligger i samme høyde og danner én linje gjennom merket. Rette strøk har rette hjørner, og bare strøk som svinger, er runde. Derfor er formen rolig og tydelig også som lite ikon.

## Farger
- Blekk `#16232a`: bokstavene i `mark-color.svg` (r-j.no, lys bunn).
- Petrol `#2b6570`: broen i `mark-color.svg`. Ikonbunnen er en svak petrolgradient `#2f6e7a` → `#24555e` (midten er omtrent `#2b6570`).
- Papir `#fbfaf7`: bokstavene i ikonene.
- Signalgult `#ffc83d`: broen i ikonene (strømfargen fra appen).

Blekk og petrol knytter merket til nettsiden, og gult knytter ikonet til appen. Gult står bare på petrol eller mørk bunn. Mot papir er kontrasten bare ca. 1,3:1, og da forsvinner H-ens tverrstrek. `mark-color.svg` er derfor laget for lys bakgrunn. På mørk bakgrunn bruker du `mark.svg` (currentColor) eller ikonet.

## Oppbygging (256-rutenett, modul 4)
Strektykkelsen er 28, rommet i bokstavene er 32, og luften mellom bokstavene er 16 overalt. Rundt merket er det 32 (12,5 %).
Kolonner: `32 R-stamme 60 | rom | 92 bue 120 | luft | 136 H-stamme 164 | rom | 196 H/J-stamme 224`.

- **R**: Stammen er 32–60 og går i full høyde (32–224). Bollen er 32–120 × 32–120. Høyre hjørner har ytre radius 40 og indre radius 12 med samme sentrum, så tykkelsen er lik rundt svingen. Telleren er 32 × 32. Beinet går skrått (1:2) fra bollens underkant ved x 68 ned til grunnlinjen ved 88–120. Det er ca. 28,6 tykt.
- **H**: Venstre stamme er 136–164 og går fra 32 til 180. Høyre stamme er 196–224. Tverrstreken (broen) ligger på 92–120, i samme høyde som understreken i R-ens bolle.
- **J**: Dette er H-ens høyre stamme, som fortsetter ned og svinger (r 40/12) inn i kroken på 196–224. Kroken går til venstre under hele H-en og slutter rett ved x 136. Mellom H-stammen og kroken er det 16 luft.

Teknisk: `mark.svg` er én path med `evenodd`. Ytterkonturene går med klokka og telleren mot klokka, så resultatet blir likt med `nonzero`. I fargefilene tegnes broen først og stikker 4 enheter inn under stammene, så det ikke blir noen lys søm. I `icon.svg` er merket skalert 1,75 (336 px, 88 px marg). I `icon-maskable.svg` er det skalert 1,375 (264 px), og det fjerneste punktet ligger 186,7 px fra midten (kravet er ≤ 204).

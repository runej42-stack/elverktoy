// Funksjoner som avhenger av hvor appen publiseres. tools/build.mjs bytter ut hele denne filen
// (som src/brand/active.js), så utviklingsserveren viser alt og den offentlige versjonen bare det som skal ut.

export const FEATURES = {
  // Tabellkontroll viser hele tabellene for strømføringsevne. Skjules i den offentlige versjonen;
  // ta den med i bygget med --tabellkontroll.
  tablecheck: true,
  // «Beta» vises til tabellene er kontrollert mot NEK 400:2026.
  beta: true,
};

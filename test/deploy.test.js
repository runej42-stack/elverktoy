// Opplastingen til r-j.no: rekkefølge og kommandoene til sftp. Kobler ikke til noe.

import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadOrder, sftpBatch, TARGET } from '../tools/deploy.mjs';

test('sw.js lastes opp til slutt', () => {
  const order = uploadOrder(['.htaccess', 'icons/icon-192.png', 'index.html', 'sw.js', 'version.json']);
  assert.equal(order[order.length - 1], 'sw.js');
  assert.equal(order.length, 5);
});

test('sftp-kommandoene lager mappene og legger filene i www/elverktoy', () => {
  const batch = sftpBatch(['.htaccess', 'icons/icon-192.png', 'index.html', 'sw.js'], 'C:\\bygg\\web', 'www/elverktoy').trim().split('\n');
  assert.equal(batch[0], '-mkdir "www/elverktoy"');
  assert.equal(batch[1], '-mkdir "www/elverktoy/icons"');
  assert.ok(batch.includes('put "C:/bygg/web/.htaccess" "www/elverktoy/.htaccess"'), batch.join('\n'));
  assert.ok(batch.includes('put "C:/bygg/web/icons/icon-192.png" "www/elverktoy/icons/icon-192.png"'));
  assert.equal(batch[batch.length - 1], 'put "C:/bygg/web/sw.js" "www/elverktoy/sw.js"');
  // Ingen kommando sletter noe på serveren.
  assert.ok(!batch.some((l) => /^-?(rm|rmdir|rename)\b/.test(l)));
});

test('opplastingen går bare til appens egen mappe', () => {
  assert.equal(TARGET.dir, 'www/elverktoy');
  assert.equal(TARGET.url, 'https://r-j.no/elverktoy/');
});

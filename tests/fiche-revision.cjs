// node tests/fiche-revision.cjs — les pages « je révise » (messagerie, Python) portent la fiche de révision
// à imprimer : le script commun est chargé APRÈS QUIZ, et la page fournit ce dont la fiche est faite.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const js = fs.readFileSync('assets/fiche-revision.js', 'utf8');
assert.match(js, /@media print/, 'la fiche a ses règles d\'impression');
assert.match(js, /body>\*:not\(#fiche-papier\)\{display:none!important\}/, 'à l\'impression, seule la fiche reste');
assert.match(js, /q\.code \?/, 'une question avec du code (Python) imprime son code sous l\'énoncé');
let pages = 0;
const PIEDS = {
  'messagerie': 'Messagerie 01', 'messagerie-2': 'Messagerie 02', 'messagerie-3': 'Messagerie 03',
  'python-je-revise': 'Python 01', 'python-02-je-revise': 'Python 02',
};
for (const [d, seq] of Object.entries(PIEDS)) {
  const page = fs.readFileSync(d + '/index.html', 'utf8');
  const appel = page.indexOf('assets/fiche-revision.js');
  assert.ok(appel > page.indexOf('const QUIZ'), d + ' : fiche-revision.js doit suivre la déclaration de QUIZ');
  assert.ok(new RegExp('data-pied="(Activités Info|Numérique|Logique et programmation) — M\\. Louviaux — ' + seq + '"').test(page), d + ' : pied de page absent');
  assert.match(page, /<ol class="resume">/, d + ' : ol.resume absent');
  assert.match(page, /class="bloc coince">[\s\S]*?<ol class="etapes">/, d + ' : les gestes de « Ça coince ? » absents');
  assert.match(page, /id="p-resume"[\s\S]*?<div class="actions">/, d + ' : pas de place pour le bouton Imprimer');
  pages++;
}
console.log('OK : ' + pages + ' pages « je révise » portent la fiche de révision à imprimer.');

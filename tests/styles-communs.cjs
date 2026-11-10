// node tests/styles-communs.cjs — les styles communs vivent dans pas-a-pas/fiche.css :
// une page de cours le charge, et ne recopie aucune de ses lignes dans son propre <style>.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const commun = new Set(fs.readFileSync('pas-a-pas/fiche.css', 'utf8').split('\n').map(l => l.trim()).filter(l => l.length > 30));
const cours = JSON.parse(fs.readFileSync('pas-a-pas/cours.json', 'utf8')).cours;
let pages = 0;
for (const c of cours) {
  const page = fs.readFileSync(c.chemin.replace(/\/?$/, '/index.html').replace(/index\.html\/index\.html$/, 'index.html'), 'utf8');
  if (!/pas-a-pas\/blocs\.js/.test(page)) continue;   // Messagerie 01 et le Rat de ville ont leur propre moteur
  pages++;
  assert.match(page, /<link rel="stylesheet" href="https:\/\/root75\.github\.io\/campin-public\/pas-a-pas\/fiche\.css/, c.id + ' : fiche.css absent');
  const propre = (page.match(/<style>([\s\S]*?)<\/style>/g) || []).join('\n').split('\n').map(l => l.trim());
  const recopie = propre.filter(l => commun.has(l));
  assert.deepEqual(recopie, [], c.id + ' recopie ' + recopie.length + ' ligne(s) de fiche.css, dont : ' + String(recopie[0]).slice(0, 80));
}
assert.ok(pages >= 5, 'au moins cinq cours sur le moteur commun');
console.log('OK : ' + pages + ' pages chargent fiche.css sans en recopier une ligne.');

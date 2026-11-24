/* Associe l'image : chaque paire a son dessin, son nom et son aide ; aucun dessin n'écrit son propre nom. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const racine = path.resolve(__dirname, '..');
const { dessin, cles } = require('../associe/icones.js');
const { jeux } = JSON.parse(fs.readFileSync(path.join(racine, 'associe/jeux.json'), 'utf8'));
const catalogue = new Set(JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/cours.json'), 'utf8')).cours.map(c => c.id));
let total = 0;
for (const [id, j] of Object.entries(jeux)) {
  assert.match(id, /^[a-z0-9\-]+$/);
  assert.ok(j.titre && j.sujet && j.niveau === 1, id + ' : titre, sujet, et pour les 1res seulement');
  if (j.cours) assert.ok(catalogue.has(j.cours), id + ' : cours ' + j.cours + ' inconnu');
  assert.ok(j.paires.length >= 6, id + ' : il faut au moins six paires pour une manche');
  const noms = new Set(), images = new Set();
  for (const p of j.paires) {
    assert.ok(cles.includes(p.image), id + ' : pas de dessin « ' + p.image + ' »');
    assert.ok(p.nom && p.aide && p.aide.length <= 80, id + ' : nom ou aide manquant pour ' + p.image);
    assert.ok(!noms.has(p.nom) && !images.has(p.image), id + ' : « ' + p.nom + ' » ou son dessin en double');
    noms.add(p.nom); images.add(p.image);
    const svg = dessin(p.image);
    assert.match(svg, /^<svg [^>]*aria-hidden="true"/, 'Le dessin se tait pour le lecteur d\'écran : son nom est la réponse');
    // Le seul texte permis dans un dessin : une lettre ou un chiffre (B, I, U, 1 2 3), jamais le nom.
    for (const t of svg.match(/>[^<>]+</g) || []) assert.ok(t.slice(1, -1).trim().length <= 1, p.image + ' : le dessin écrit « ' + t.slice(1, -1) + ' »');
    total++;
  }
}
assert.equal(dessin('inconnu'), ''); assert.equal(dessin('__proto__'), '');
const page = fs.readFileSync(path.join(racine, 'associe/index.html'), 'utf8');
assert.match(page, /Professeur : M\. Louviaux/); assert.doesNotMatch(page, /[a-z0-9.]+@arcampin\.be/i);
assert.doesNotMatch(page + fs.readFileSync(path.join(racine, 'associe/jeu.js'), 'utf8'), /photo|smartphone|téléphone/i, 'Ni photo ni téléphone dans une consigne');
console.log('Associe l\'image : ' + Object.keys(jeux).length + ' jeux, ' + total + ' paires, chaque dessin présent et muet.');

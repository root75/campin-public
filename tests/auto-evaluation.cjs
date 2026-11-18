// node tests/auto-evaluation.cjs
// L'auto-évaluation de fin de cours (Vincent, 17 et 18/11/2026) : chaque Messagerie finit par la grille « Moi »,
// une question simple par critère de la grille « Communication et collaboration », quatre phrases propres à la
// question. Le catalogue annonce le nombre de questions : c'est lui qui fait enregistrer les lettres par le serveur.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const racine = path.join(__dirname, '..');
const catalogue = JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/cours.json'), 'utf8')).cours;
const CRITERES = ['1. Choix et usage des outils de communication', '2. Respect du cadre éthique, juridique et relationnel',
  '3. Collaboration et efficacité de la communication', '4. Explicitation de la démarche numérique'];
const moteur = fs.readFileSync(path.join(racine, 'pas-a-pas/blocs.js'), 'utf8');
assert.ok(moteur.includes('if(typeof GRILLE!=="undefined") etat.moi = etat.moi || {};'), 'moteur : etat.moi existe dès qu\'une fiche porte une grille');
assert.ok(moteur.includes('if(s && s.moi && typeof GRILLE!=="undefined") etat.moi = s.moi;'), 'moteur : les lettres reviennent du serveur');
for (const [id, dossier] of [['messagerie-1', 'messagerie'], ['messagerie-2', 'messagerie-2'], ['messagerie-3', 'messagerie-3']]) {
  const { GRILLE, FIN } = require(path.join(racine, dossier, 'pas-a-pas/fiche.js'));
  assert.ok(GRILLE && FIN, id + ' : la fiche exporte GRILLE');
  const c = catalogue.find(x => x.id === id);
  assert.equal(c.criteres, GRILLE.criteres.length, id + ' : « criteres » du catalogue = nombre de questions');
  assert.equal(c.cases, undefined, id + ' : reste un cours à preuves');
  assert.deepEqual(Object.keys(GRILLE.niveaux), ['A', 'B', 'C', 'D']);
  assert.deepEqual(GRILLE.criteres.map(x => x.regarde), CRITERES.map(c => 'Critère : ' + c.slice(3)), id + ' : les quatre critères, intitulés exacts');
  assert.deepEqual(GRILLE.criteres.map(x => x.inc), [false, true, true, false], id + ' : critères 2 et 3 incontournables');
  assert.match(GRILLE.intro, /pas coté/, id + ' : l\'élève lit que ce n\'est pas coté');
  const vues = new Set();
  GRILLE.criteres.forEach(x => {
    assert.match(x.n, /^[1-4]\. .+ \?$/, id + ' : une question numérotée — ' + x.n);
    for (const k of 'ABCD') {
      assert.ok(x[k] && x[k].length <= 190, id + ' ' + x.n + ' ' + k + ' : une phrase courte');
      assert.match(x[k], /^(J|Mon|Ma|Il|Salutation)/, id + ' ' + k + ' : dit à la première personne — ' + x[k]);
      assert.ok(!vues.has(x[k]), id + ' : phrase répétée — ' + x[k]); vues.add(x[k]);
    }
  });
  const page = fs.readFileSync(path.join(racine, dossier, 'pas-a-pas/index.html'), 'utf8');
  assert.match(page, /blocs\.js\?v=moi-20261118/, id + ' charge le moteur à jour');
  assert.match(page, /fiche\.js\?v=moi-20261118/, id + ' charge la fiche à jour');
}
console.log('auto-evaluation : OK (3 cours, 12 questions, 48 phrases)');

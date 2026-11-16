// node tests/python-editeur.cjs — l'éditeur Python vit dans UN fichier, pas-a-pas/python-editeur.js :
// aucune fiche ne le recopie, et chaque page le charge avant sa fiche et avant blocs.js.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const commun = fs.readFileSync('pas-a-pas/python-editeur.js', 'utf8');
const NOMS = ['chargePython', 'executePython', 'editeur', 'ordre', 'trace', 'ligneFautive', 'montre'];
NOMS.forEach(n => assert.match(commun, new RegExp('function ' + n + '\\('), n + ' absent de python-editeur.js'));
new Function(commun);   // syntaxe
for (const cours of ['python-1', 'python-2', 'python-3', 'python-4']) {
  const fiche = fs.readFileSync(cours + '/pas-a-pas/fiche.js', 'utf8');
  NOMS.forEach(n => assert.doesNotMatch(fiche, new RegExp('function ' + n + '\\('), cours + ' recopie ' + n));
  assert.doesNotMatch(fiche, /const (MOTEUR|LANCEUR|ERREURS) =/, cours + ' redéclare le moteur Python');
  const page = fs.readFileSync(cours + '/pas-a-pas/index.html', 'utf8');
  const i = s => page.indexOf(s);
  assert.ok(i('/pas-a-pas/python-editeur.js') > 0, cours + ' : la page ne charge pas python-editeur.js');
  assert.ok(i('/pas-a-pas/python-editeur.js') < i(cours + '/pas-a-pas/fiche.js'), cours + ' : python-editeur.js avant la fiche');
  assert.ok(i('/pas-a-pas/python-editeur.js') < i('/pas-a-pas/blocs.js'), cours + ' : python-editeur.js avant blocs.js');
}
// input( ) n'est remplacé que si la fiche le demande (Python 03).
assert.match(fs.readFileSync('python-3/pas-a-pas/fiche.js', 'utf8'), /const PYTHON_INPUT = true/);
assert.match(commun, /def _lance\(code, entrees=None\)/);
// La scène (q.scene) lit la dernière ligne affichée par print( ), jamais la ligne de input( ).
const sceneEtat = new Function(commun.match(/function sceneEtat\([\s\S]*?\n}\n/)[0] + 'return sceneEtat;')();
const P = { decor: 'porte', ouvre: 'Ouvert !', ferme: 'Fermé.' }, code = 'cle = input("As-tu la clé ? ")\n';
const etat = (S, sortie, tape, i, erreur) => sceneEtat(S, { sortie, code, erreur }, tape, i).etat;
assert.equal(etat(P, 'As-tu la clé ? oui\nOuvert !\n', ['oui'], 0), 'ouvert');
assert.equal(etat(P, 'As-tu la clé ? non\nFermé.\n', ['non'], 1), 'ferme');
assert.equal(etat(P, 'As-tu la clé ? oui\n', ['oui'], 0), 'muet', 'la ligne de input( ) ne compte pas');
assert.equal(etat(P, 'As-tu la clé ? oui\nouvert\n', ['oui'], 0), 'autre');
assert.equal(etat(P, 'As-tu la clé ? oui\n', ['oui'], 0, { type: 'NameError' }), 'panne');
const S3 = { decor: 'salut', ouvre: ['Bonjour Léa', 'Bonjour Sam'] };
assert.equal(sceneEtat(S3, { sortie: 'Ton prénom ? Sam\nBonjour Sam\n', code: 'prenom = input("Ton prénom ? ")' }, ['Sam'], 1).etat, 'ouvert');
assert.equal(sceneEtat(S3, { sortie: 'Ton prénom ? Sam\nBonjour Léa\n', code: 'prenom = input("Ton prénom ? ")' }, ['Sam'], 1).etat, 'autre');
// `ouvre` et `ferme` acceptent aussi une RegExp ou une fonction (dit, x, i).
const F = { decor: 'coeurs', ouvre: (dit, x, i) => i === 0 && /2/.test(dit), ferme: /game over/i };
assert.equal(sceneEtat(F, { sortie: 'Il te reste 2 vies\n', code: '' }, ['1'], 0).etat, 'ouvert');
assert.equal(sceneEtat(F, { sortie: 'Game over\n', code: '' }, ['3'], 1).etat, 'ferme');
assert.equal(sceneEtat(F, { sortie: 'Il te reste 2 vies\n', code: '' }, ['1'], 1).etat, 'autre');
// Une scène ne se déclare que sur une question `code` avec essais, et sa page charge le style et l'éditeur à jour.
for (const [cours, n] of [['python-3', 3], ['python-4', 3]]) {
  const fiche = fs.readFileSync(cours + '/pas-a-pas/fiche.js', 'utf8');
  assert.match(fiche, /essais:\[[^\n]*scene:\{ decor/, cours + ' : la scène accompagne des essais');
  const page = fs.readFileSync(cours + '/pas-a-pas/index.html', 'utf8');
  assert.match(page, /python-missions\.css\?v=scenes?-/, cours + ' : style de la scène');
  assert.match(page, /python-editeur\.js\?v=scenes?-/, cours + ' : éditeur avec la scène');
}
console.log('OK : éditeur Python commun, chargé par les trois fiches, recopié par aucune.');

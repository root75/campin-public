// node tests/python-editeur.cjs — l'éditeur Python vit dans UN fichier, pas-a-pas/python-editeur.js :
// aucune fiche ne le recopie, et chaque page le charge avant sa fiche et avant blocs.js.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const commun = fs.readFileSync('pas-a-pas/python-editeur.js', 'utf8');
const NOMS = ['chargePython', 'executePython', 'editeur', 'ordre', 'trace', 'ligneFautive', 'montre'];
NOMS.forEach(n => assert.match(commun, new RegExp('function ' + n + '\\('), n + ' absent de python-editeur.js'));
new Function(commun);   // syntaxe
for (const cours of ['python-1', 'python-2', 'python-3']) {
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
console.log('OK : éditeur Python commun, chargé par les trois fiches, recopié par aucune.');

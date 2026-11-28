// node tests/python-revision-express.cjs — la révision express en cours collectif (pas-a-pas/sequences.json) :
// cinq votes, un programme par vote, et la bonne réponse annoncée est ce que le vrai Python fait.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const ID = 'python-revision-express';
const S = JSON.parse(fs.readFileSync('pas-a-pas/sequences.json', 'utf8'))[ID];
assert.ok(JSON.parse(fs.readFileSync('pas-a-pas/cours.json', 'utf8')).cours.some(c => c.id === ID), 'le cours est au catalogue : le tableau peut le lancer');
assert.ok(S && S.objectif && S.competences.length === 3 && S.preparation.length, 'conducteur : objectif, compétences, préparation');

const python = code => {
  const r = spawnSync('python3', ['-I', '-c', code], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : r.stderr.trim().split('\n').pop();   // la sortie, sinon la dernière ligne du message
};

const votes = S.moments.filter(m => m.type === 'vote');
assert.equal(votes.length, 5, 'cinq questions');
for (const m of votes) {
  assert.equal(m.situations.length, 1, m.titre + ' : une question à la fois');
  const s = m.situations[0];
  assert.ok(m.choix.length === 4 && new Set(m.choix).size === 4 && m.choix[s.bonne] != null, m.titre + ' : quatre choix différents, une bonne réponse');
  assert.ok(m.choix.every(c => c.length <= 20), m.titre + ' : des choix courts, lisibles à côté des barres du tableau');
  assert.ok(s.explication && m.repere, m.titre + ' : l’explication projetée à la correction, et le repère du professeur');
}
// La bonne réponse ne reste pas à la même place d'une question à l'autre.
assert.ok(new Set(votes.map(m => m.situations[0].bonne)).size >= 4, 'la bonne réponse change de place');

// Questions 1 à 3 : « Qu'affiche ce programme ? » — ce que Python affiche vraiment.
for (const m of votes.slice(0, 3)) {
  assert.equal(m.question, "Qu'affiche ce programme ?");
  assert.equal(python(m.situations[0].texte), m.choix[m.situations[0].bonne], m.titre);
}
// Question 4 : le message cité est celui de Python ; seule la bonne ligne 2 s'exécute.
{
  const m = votes[3], s = m.situations[0], [ligne1] = s.texte.split('\n');
  const message = python(s.texte).replace(/\. Did you mean.*$/, '');   // Python 3.10 et suivants ajoutent une suggestion
  assert.match(message, /^NameError: /);
  assert.ok(m.question.startsWith(message), 'le message rouge de la question est celui de Python : ' + message);
  m.choix.forEach((c, j) => assert.equal(python(ligne1 + '\n' + c) === '2', j === s.bonne, 'ligne 2 « ' + c + ' »'));
}
// Question 5 : seule la bonne ligne range le triple dans la boîte.
{
  const m = votes[4], s = m.situations[0];
  assert.equal(s.texte, 'billes ← billes × 3');
  m.choix.forEach((c, j) => assert.equal(python('billes = 5\n' + c + '\nprint(billes)') === '15', j === s.bonne, 'traduction « ' + c + ' »'));
}
// Pas de moment « fin » ni « atelier » : les postes ne retombent jamais sur la fiche pendant le cours collectif.
assert.ok(S.moments.every(m => m.type === 'ecran' || m.type === 'vote'), 'que des écrans et des votes');
console.log('Révision express en collectif : ' + votes.length + ' votes, bonnes réponses vérifiées avec le vrai Python.');

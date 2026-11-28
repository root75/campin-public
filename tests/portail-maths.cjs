/* « Un coup de pouce en maths » du portail : le fichier tient debout et chaque année arrive droit à ses cours de
   Khan Academy. La tuile ouverte dans une vraie page : outils/essai-portail-maths.cjs (travail « cours »). */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const racine = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(racine, 'portail/maths.json'), 'utf8'));
const script = fs.readFileSync(path.join(racine, 'portail/portail.js'), 'utf8');

// Le fichier : des cours de Khan Academy seulement, sans doublon ; chaque année a ses cours, tous connus.
for (const c of Object.values(t.cours)) { assert.match(c.url, /^https:\/\/fr\.khanacademy\.org\/math\/[\w-]+$/); assert.ok(c.titre); }
assert.equal(new Set(Object.values(t.cours).map(c => c.url)).size, Object.keys(t.cours).length, 'pas de cours en double');
for (const a of ['1', '2', '3']) { assert.ok(t.annees[a].length >= 1, 'année ' + a); for (const c of t.annees[a]) assert.ok(t.cours[c], 'cours connu : ' + c); }
assert.ok(t.encouragements.length >= 3);
// Pas de quiz de placement dans ce fichier : le lien vers le cours est direct (Vincent, 28/11/2026).
assert.equal(t.paliers, undefined); assert.equal(t.questions, undefined);

// Les échauffements : écrits pour le site, une suite chez Khan Academy, trois variantes par question, un indice,
// une explication ; et chaque réponse est recalculée ici, pas recopiée.
const EXP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
const fraction = s => { const [n, d] = String(s).replace('−', '-').split('/').map(Number); return [n, d === undefined ? 1 : d]; };
const egal = (a, b) => a[0] * b[1] === b[0] * a[1];
/** « 2⁻³ = ? », « (−4)⁰ = ? », « (1/2)⁻² = ? » ▸ la valeur, en fraction [numérateur, dénominateur]. */
const puissance = q => {
  const m = q.match(/^\(?(−?\d+(?:\/\d+)?)\)?(⁻?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \?$/);
  if (!m) throw new Error('question que le test ne sait pas recalculer : ' + q);
  if (m[1].startsWith('−')) assert.ok(q.startsWith('('), 'une base négative s’écrit entre parenthèses : ' + q);
  const [n, d] = fraction(m[1]), e = Number([...m[3]].map(c => EXP[c]).join(''));
  return m[2] ? [d ** e, n ** e] : [n ** e, d ** e];
};
assert.ok(egal(puissance('2⁻³ = ?'), [1, 8])); assert.ok(egal(puissance('(−2)³ = ?'), [-8, 1])); assert.ok(egal(puissance('(1/2)⁻² = ?'), [4, 1]));
for (const [annee, liste] of Object.entries(t.exercices)) {
  assert.match(annee, /^[123]$/);
  for (const e of liste) {
    assert.ok(e.id && e.titre, 'échauffement nommé');
    assert.match(e.suite, /^https:\/\/fr\.khanacademy\.org\/math\/[\w:\/-]+$/, e.id);
    assert.ok(e.questions.length >= 3 && e.questions.length <= 5, e.id + ' : un échauffement court');
    for (const q of e.questions) {
      assert.ok(q.indice, e.id + ' : un indice par question');
      assert.equal(q.variantes.length, 3, e.id + ' : trois variantes par question');
      assert.equal(new Set(q.variantes.map(x => x.q)).size, 3);
      for (const x of q.variantes) {
        assert.equal(x.choix.length, 3, x.q); assert.equal(new Set(x.choix).size, 3, x.q);
        assert.ok(x.choix.includes(x.reponse), x.q); assert.ok(x.explication, x.q);
        assert.ok(egal(fraction(x.reponse), puissance(x.q)), 'réponse juste : ' + x.q);
        assert.equal(x.choix.filter(c => egal(fraction(c), puissance(x.q))).length, 1, 'une seule bonne réponse : ' + x.q);
      }
    }
  }
}

// Les fonctions du portail.
const noeud = id => ({ id, hidden: false, textContent: '', href: '', addEventListener(){}, replaceChildren(){} });
const els = new Map(), $ = id => { if(!els.has(id)) els.set(id, noeud(id)); return els.get(id); };
const ctx = { document: { documentElement: { dataset: {} }, getElementById: $, addEventListener(){}, createElement: () => ({}), head: { append(){} } },
  location: { protocol: 'file:', search: '' }, localStorage: { getItem(){ return null; }, setItem(){} } };
ctx.window = ctx; ctx.globalThis = ctx;
vm.runInNewContext(script, ctx);
const P = ctx.PortailEssai, lu = P.mathsLues(t);

assert.equal(P.anneeDe('3F'), '3'); assert.equal(P.anneeDe('2CB'), '2'); assert.equal(P.anneeDe('1B'), '1');
assert.equal(P.anneeDe('TEST'), ''); assert.equal(P.anneeDe(''), ''); assert.equal(P.anneeDe(undefined), '');
// 1re ▸ le cours de 1re ; 2e ▸ le cours de 2e et les révisions pour le CE1D ; 3e ▸ le cours de 3e ; sans classe ▸ rien d'imposé.
const titres = a => Array.from(P.coursPour(lu, a), c => lu.cours[c].titre);
assert.deepEqual(titres('1'), ['1re année secondaire']);
assert.deepEqual(titres('2'), ['2e année secondaire', 'Révisions pour le CE1D']);
assert.deepEqual(titres('3'), ['3e année secondaire']);
assert.deepEqual(titres(''), []);
// Un fichier abîmé ne fait jamais sortir du site de Khan Academy ; un cours inconnu n'est pas montré.
assert.equal(P.mathsLues({ cours: { x: { titre: 'Ailleurs', url: 'https://exemple.be/math/' } } }), null);
assert.equal(P.mathsLues(null), null);
assert.deepEqual(Array.from(P.coursPour({ cours: lu.cours, annees: { '3': ['3', 'inconnu'] } }, '3')), ['3']);
// L'échauffement d'une année : celui du jour ; aucun pour une année sans exercice ni sans classe connue.
const jour = new Date('2026-11-30T10:00:00');
assert.equal(P.echauffementPour(lu, '3', jour).id, t.exercices['3'][0].id);
assert.equal(P.echauffementPour(lu, '1', jour), null); assert.equal(P.echauffementPour(lu, '', jour), null);
// Un passage : une question par notion, la variante du tour ; le tour suivant change tous les nombres.
const tour0 = P.questionsEchauffement(t.exercices['3'][0], 0, () => 0.5), tour1 = P.questionsEchauffement(t.exercices['3'][0], 1, () => 0.5);
assert.equal(tour0.length, 4);
for (const [i, q] of tour0.entries()) { assert.ok(q.choix.includes(q.reponse) && q.indice && q.explication); assert.notEqual(q.q, tour1[i].q); }
assert.equal(P.questionsEchauffement(t.exercices['3'][0], 3, () => 0.5)[0].q, tour0[0].q, 'après trois tours, on revient au premier');
// Un échauffement qui sortirait de Khan Academy, ou sans réponse parmi ses choix, n'est pas gardé.
const bon = t.exercices['3'][0];
assert.ok(P.echauffementValide(bon));
assert.ok(!P.echauffementValide({ ...bon, suite: 'https://exemple.be/math/x' }));
assert.ok(!P.echauffementValide({ ...bon, questions: [{ variantes: [{ q: '2² = ?', choix: ['3', '5'], reponse: '4' }] }] }));
assert.equal(P.mathsLues({ ...t, exercices: { '3': [{ ...bon, suite: 'https://exemple.be/' }] } }).exercices['3'], undefined);
module.exports = { fraction, egal, puissance };
console.log('Coup de pouce en maths : ' + Object.keys(t.cours).length + ' cours de Khan Academy, une année ▸ ses cours ; ' + Object.values(t.exercices).flat().length + ' échauffement recalculé.');

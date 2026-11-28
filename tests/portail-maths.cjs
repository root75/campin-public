/* « Un coup de pouce en maths » du portail : le fichier tient debout, les calculs sont justes, chaque année arrive au
   bon cours de Khan Academy. La tuile jouée dans une vraie page : outils/essai-portail-maths.cjs (travail « cours »). */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const racine = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(racine, 'portail/maths.json'), 'utf8'));
const script = fs.readFileSync(path.join(racine, 'portail/portail.js'), 'utf8');

// Le fichier : des cours de Khan Academy seulement, un cours par année, des paliers complets.
for (const c of Object.values(t.cours)) { assert.match(c.url, /^https:\/\/fr\.khanacademy\.org\/math\/[\w-]+$/); assert.ok(c.titre); }
assert.equal(new Set(Object.values(t.cours).map(c => c.url)).size, Object.keys(t.cours).length, 'pas de cours en double');
for (const a of ['1', '2', '3']) assert.ok(t.cours[t.annees[a]], 'le cours de l’année ' + a);
assert.ok(t.encouragements.length >= 3);
for (const p of t.paliers) {
  assert.ok(p.titre);
  for (const [annee, cours] of Object.entries(p.pour)) { assert.match(annee, /^[123]?$/); assert.ok(t.cours[cours], 'cours connu : ' + cours); }
  for (const notion of p.questions) {
    assert.equal(notion.length, 3, 'trois variantes par question : ' + p.titre);
    assert.equal(new Set(notion.map(x => x.q)).size, 3);
    for (const x of notion) { assert.equal(x.choix.length, 3, x.q); assert.equal(new Set(x.choix).size, 3, x.q); assert.ok(x.choix.includes(x.reponse), x.q); }
  }
}
// Les calculs sont justes : chaque question est recalculée ici, pas recopiée.
const nombre = s => Number(String(s).replace('−', '-'));
const calcule = q => {
  let m;
  if ((m = q.match(/^(−?\d+) ([+−×]) (\d+)(?: ([×]) (\d+))? = \?$/))) {
    const [a, op, b, op2, c] = [nombre(m[1]), m[2], Number(m[3]), m[4], Number(m[5])];
    const droite = op2 ? b * c : b;
    return op === '+' ? a + droite : op === '−' ? a - droite : a * droite;
  }
  if ((m = q.match(/^(\d+)([²³]) = \?$/))) return Number(m[1]) ** (m[2] === '²' ? 2 : 3);
  if ((m = q.match(/^(\d*)x(?: \+ (\d+))? = (\d+), donc x = \?$/))) return (Number(m[3]) - Number(m[2] || 0)) / Number(m[1] || 1);
  throw new Error('question que le test ne sait pas recalculer : ' + q);
};
for (const p of t.paliers) for (const notion of p.questions) for (const x of notion) assert.equal(nombre(x.reponse), calcule(x.q), x.q);

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
// Une 1re n'a pas de question ; une 2e en a deux, une 3e quatre ; sans classe connue, tout est posé.
const n = a => P.questionsMaths(P.paliersPour(lu, a)).length;
assert.equal(n('1'), 0); assert.equal(n('2'), 2); assert.equal(n('3'), 4); assert.equal(n(''), 4);
// Le point de départ : le cours du palier qui arrête, sinon celui de l'année ; sans année, à l'élève de choisir.
const pal = a => P.paliersPour(lu, a);
assert.equal(P.departMaths(lu, '1', null), '1');
assert.equal(P.departMaths(lu, '2', pal('2')[0]), '1'); assert.equal(P.departMaths(lu, '2', null), '2');
assert.equal(P.departMaths(lu, '3', pal('3')[0]), 'ce1d'); assert.equal(P.departMaths(lu, '3', pal('3')[1]), 'ce1d'); assert.equal(P.departMaths(lu, '3', null), '3');
assert.equal(P.departMaths(lu, '', pal('')[0]), 'ce1d'); assert.equal(P.departMaths(lu, '', null), '');
// Le tirage : une question par notion, ses trois choix tous là, la réponse parmi eux, quel que soit le hasard.
for (const h of [() => 0, () => 0.5, () => 0.999]) for (const q of P.questionsMaths(pal('3'), h)) { assert.equal(q.choix.length, 3); assert.ok(q.choix.includes(q.reponse)); }
assert.notEqual(P.questionsMaths(pal('3'), () => 0)[0].q, P.questionsMaths(pal('3'), () => 0.999)[0].q, 'les variantes tournent');
// Un fichier abîmé ne fait jamais sortir du site de Khan Academy, et un palier bancal n'est pas posé.
assert.equal(P.mathsLues({ cours: { x: { titre: 'Ailleurs', url: 'https://exemple.be/math/' } } }), null);
assert.equal(P.mathsLues(null), null);
assert.ok(!P.palierValide({ pour: { '3': '2' }, questions: [[{ q: '1 + 1 = ?', choix: ['3', '4'], reponse: '2' }]] }));
assert.equal(P.paliersPour({ paliers: [{ pour: { '3': '2' }, questions: [] }] }, '3').length, 0);


module.exports = { calcule };

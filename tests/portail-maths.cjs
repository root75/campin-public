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
// Pas de quiz ni de score dans ce fichier : le lien est direct (Vincent, 28/11/2026).
assert.equal(t.paliers, undefined); assert.equal(t.questions, undefined);

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
console.log('Coup de pouce en maths : ' + Object.keys(t.cours).length + ' cours de Khan Academy, une année ▸ ses cours.');

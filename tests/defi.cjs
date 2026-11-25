/* Le défi du jour du portail : les défis tiennent debout, le défi change chaque jour d'école, la correction est juste. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const t = JSON.parse(fs.readFileSync(require.resolve('../defi/defis.json'), 'utf8'));
const script = fs.readFileSync(require.resolve('../portail/portail.js'), 'utf8');

// Les défis : un titre, un énoncé, une réponse ; un choix contient toujours sa réponse ; identifiants uniques.
assert.ok(t.defis.length >= 20, 'une vingtaine de défis');
const ids = new Set();
for (const d of t.defis) {
  assert.ok(d.id && !ids.has(d.id), 'identifiant unique : ' + d.id); ids.add(d.id);
  assert.ok(d.titre && Array.isArray(d.enonce) && d.enonce.length && d.explication && d.indice, d.id);
  assert.ok(['nombre', 'mot', 'choix'].includes(d.type), d.id);
  if (d.type === 'choix') assert.ok(d.choix.includes(d.reponse), d.id);
  if (d.type === 'nombre') assert.ok(Number.isFinite(Number(d.reponse)), d.id);
}
// beOI : des liens vers le lab seulement, rien de recopié.
assert.ok(t.beoi.length >= 1);
for (const b of t.beoi) { assert.match(b.url, /^https:\/\/lab\.be-oi\.be\/fr\/a\/\d+;p=[\d,]+;pa=0$/); assert.ok(b.titre); }
assert.equal(new Set(t.beoi.map(b => b.url)).size, t.beoi.length, 'pas de tâche en double');

// Les fonctions du portail.
const noeud = id => ({ id, hidden: false, textContent: '', href: '', addEventListener(){}, replaceChildren(){} });
const els = new Map(), $ = id => { if(!els.has(id)) els.set(id, noeud(id)); return els.get(id); };
const ctx = { document: { documentElement: { dataset: {} }, getElementById: $, createElement: () => ({}), head: { append(){} } },
  location: { protocol: 'file:', search: '' }, localStorage: { getItem(){ return null; }, setItem(){} } };
ctx.window = ctx; ctx.globalThis = ctx;
vm.runInNewContext(script, ctx);
const P = ctx.PortailEssai;

// Le rang avance d'un par jour d'école ; le week-end garde le défi du vendredi.
const j = s => P.jourDefi(new Date(s + 'T10:00:00'));
assert.equal(j('2026-08-31').rang, 0);
assert.equal(j('2026-09-04').rang, 4);
assert.equal(j('2026-09-05').rang, 4); assert.equal(j('2026-09-06').rang, 4);
assert.equal(j('2026-09-06').cle, 'defi:20260904');
assert.equal(j('2026-09-07').rang, 5);
assert.equal(j('2026-11-25').cle, 'defi:20261125');
// Deux jours d'école qui se suivent n'ont jamais le même défi.
for (let k = 0; k < 200; k++) {
  const a = P.aTour(t.defis, k), b = P.aTour(t.defis, k + 1);
  assert.notEqual(a.id, b.id);
}
assert.equal(P.aTour([], 3), null);

// La correction.
const def = id => t.defis.find(d => d.id === id);
assert.ok(P.reponseJuste(def('robot-ligne'), ' 7 '));
assert.ok(!P.reponseJuste(def('robot-ligne'), '8'));
assert.ok(!P.reponseJuste(def('robot-ligne'), ''));
assert.ok(P.reponseJuste(def('cesar'), 'Chat'));
assert.ok(P.reponseJuste(def('cesar'), 'CHAT '));
assert.ok(P.reponseJuste(def('grille'), 'D2')); assert.ok(P.reponseJuste(def('grille'), 'd 2'));
assert.ok(P.reponseJuste(def('menteurs'), 'Bob seul'));
assert.ok(!P.reponseJuste(def('menteurs'), 'Alice seule'));
assert.equal(P.normalise('Éléphant !'), 'elephant');

// Les points : seuls les défis réussis comptent, jamais les révisions.
assert.equal(P.pointsDefis({ 'defi:20261125': 'fait', 'defi:20261124': 'fait', 'quiz:python-1': 'fait', 'defi:x': 'fait', 'defi:20261123': 'commence' }), 2);
assert.equal(P.pointsDefis(null), 0);

console.log('Défi du jour : ' + t.defis.length + ' défis, ' + t.beoi.length + ' tâches beOI, rotation et correction vérifiées.');

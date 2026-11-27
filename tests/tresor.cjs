// node tests/tresor.cjs — trésor de classe (pas-a-pas/recompense.js) : étoiles collectives reçues avec moment().
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const lis = f => fs.readFileSync(__dirname + '/../' + f, 'utf8');

/* Un DOM minuscule : juste ce que le module touche. */
function noeud(tag) {
  const n = { tag, id: '', className: '', textContent: '', enfants: [], attributs: {},
    classList: { liste: new Set(), add(...c) { c.forEach(x => this.liste.add(x)); }, remove(...c) { c.forEach(x => this.liste.delete(x)); },
      toggle(c, v) { v ? this.liste.add(c) : this.liste.delete(c); }, contains(c) { return this.liste.has(c); } },
    setAttribute(k, v) { this.attributs[k] = v; }, append(...e) { this.enfants.push(...e); }, prepend(...e) { this.enfants.unshift(...e); },
    replaceChildren(...e) { this.enfants = e; }, after(e) { n.suivant = e; }, remove() {}, querySelector() { return noeud('a'); }, offsetWidth: 0 };
  return n;
}
const qui = noeud('p'), minuteries = [];
const ctx = vm.createContext({ document: { createElement: noeud, getElementById: id => id === 'qui' ? qui : null, addEventListener(){}, head: noeud('head'), body: noeud('body') },
  window: {}, setTimeout: f => { minuteries.push(f); return minuteries.length; }, clearTimeout() {} });
vm.runInContext(lis('pas-a-pas/recompense.js') + '\nglobalThis.T = Tresor; globalThis.R = Recompense;', ctx);
const texte = () => qui.suivant ? qui.suivant.enfants.map(e => e.textContent).join(' ') : '';

assert.equal(ctx.T.prochain(0), 10); assert.equal(ctx.T.prochain(10), 25); assert.equal(ctx.T.prochain(499), 500);
assert.equal(ctx.T.prochain(500), 600, 'au-delà de la liste : un coffre toutes les 100 étoiles');
assert.equal(ctx.T.ouvert(8, 9), 0); assert.equal(ctx.T.ouvert(9, 10), 10); assert.equal(ctx.T.ouvert(9, 26), 25, 'deux coffres d\'un coup : on fête le plus grand');

ctx.R.montre(null); ctx.R.montre({ type: 'atelier', plafond: null });
assert.equal(qui.suivant, undefined, 'Sans étoile, aucune ligne sur la fiche');
ctx.R.montre({ type: 'atelier', plafond: null, tresor: 9 });
assert.equal(qui.suivant.id, 'tresor', 'La ligne du trésor se place sous « Connecté : … »');
assert.match(texte(), /^⭐ 9 étoiles dans le trésor de la classe prochain coffre à 10$/);
assert.ok(!qui.suivant.classList.contains('gagne'), 'Au chargement : pas de fête, la classe avait déjà ces étoiles');
ctx.R.montre({ tresor: 10 });
assert.match(texte(), /coffre des 10 étoiles/, 'Un coffre s\'ouvre quand la classe passe un palier');
minuteries.pop()();
assert.match(texte(), /^⭐ 10 étoiles .* prochain coffre à 25$/, 'La fête passe, le compte reste');
ctx.R.montre({ tresor: 12 });
assert.match(texte(), /\+2 · prochain coffre à 25/);
ctx.R.montre(null); ctx.R.montre({ type: 'vote' });
assert.match(texte(), /^⭐ 12/, 'Une réponse vide (réseau, fin de séance) n\'efface pas le trésor');
ctx.R.montre({ tresor: 1 }); assert.match(texte(), /^⭐ 1 étoile dans/);

/* Jamais d'étoiles individuelles ; aucun appel au serveur de plus ; chaque fiche charge la version à jour. */
const src = lis('pas-a-pas/recompense.js');
assert.ok(!/google\.script/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'recompense.js n\'appelle pas le serveur');
const fiches = fs.readdirSync(__dirname + '/..').filter(d => fs.existsSync(__dirname + '/../' + d + '/pas-a-pas/index.html')).map(d => d + '/pas-a-pas/index.html').concat('pas-a-pas/modele/index.html');
assert.ok(fiches.length >= 10);
for (const f of fiches) assert.match(lis(f), /recompense\.js\?v=tresor-20261117/, f + ' charge le trésor');
assert.match(lis('pas-a-pas/tableau.js'), /d\.tresor/, 'le tableau affiche le trésor');
assert.match(lis('pas-a-pas/tableau.js'), /t\.id = "tresor"/, 'le trésor est une tuile, avec les compteurs');
console.log('tresor : OK');

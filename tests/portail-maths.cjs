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

// Les échauffements : un par chapitre, écrits pour le site, la suite chez Khan Academy, trois variantes par question,
// un indice, une explication ; et chaque réponse est recalculée ici, pas recopiée.
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
/* Les autres questions portent leur contrôle : « verif », un calcul dont la valeur est la bonne réponse, ou « vrai »,
   une condition que seul le bon choix remplit (x = le choix essayé). Ce qui suit lit l'écriture de l'élève
   (« 2 500 m », « 3,8 », « −4 », « XIV », « 3(2x + 3) », « 4,5 × 10⁴ ») et en fait un nombre. */
const pgcd = (a, b) => b ? pgcd(b, a % b) : Math.abs(a);
const premier = n => { if (!Number.isInteger(n) || n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const ROMAINS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const enRomain = n => { let s = ''; for (const [v, c] of ROMAINS) while (n >= v) { s += c; n -= v; } return s; };
/** « XIV » ▸ 14 ; une écriture qui n'existe pas (« XIIII », « XVVI ») ▸ NaN. */
const romain = s => { const u = Object.fromEntries(ROMAINS.filter(r => r[1].length === 1).map(([v, c]) => [c, v])); let n = 0;
  [...s].forEach((c, i, l) => { n += u[c] < (u[l[i + 1]] || 0) ? -u[c] : u[c]; }); return enRomain(n) === s ? n : NaN; };
const calcule = (expr, x, permis) => { if (!permis.test(expr)) throw new Error('écriture que le test ne sait pas lire : ' + expr); return new Function('x', 'pgcd', 'premier', 'return (' + expr + ')')(x, pgcd, premier); };
const enJs = s => String(s).trim().replace(/\s*(cm³|cm²|cm|km|min|m|€|%|°)$/, '').replace(/(\d)\s(?=\d)/g, '$1')
  .replace(/−/g, '-').replace(/,/g, '.').replace(/×/g, '*').replace(/:/g, '/')
  .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, e => '**' + [...e].map(c => EXP[c]).join('')).replace(/(\d|x|\))\s*(?=x|\()/g, '$1*');
/** La valeur d'un choix tel que l'élève le lit, pour un x donné. */
const valeur = (s, x) => /^[IVXLCDM]+$/.test(s) ? romain(s) : calcule(enJs(s), x, /^[\d\s+\-*\/().x]+$/);
const proche = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9;
const VERIF = /^(?:[\d\s+\-*\/%().,x]|pgcd)+$/, VRAI = /^(?:[\d\s+\-*\/%().x<>=!&|]|premier)+$/, ESSAIS = [3, 7];
/** Les choix d'une variante qui sont de bonnes réponses, d'après son contrôle (il doit y en avoir un seul). */
const bons = x => {
  if (x.verif !== undefined) return x.choix.filter(c => ESSAIS.every(n => proche(valeur(c, n), calcule(x.verif, n, VERIF))));
  if (x.vrai !== undefined) return x.choix.filter(c => calcule(x.vrai, valeur(c), VRAI) === true);
  return x.choix.filter(c => egal(fraction(c), puissance(x.q)));
};
assert.equal(valeur('XIV'), 14); assert.ok(Number.isNaN(valeur('XIIII'))); assert.ok(Number.isNaN(valeur('XVVI'))); assert.equal(valeur('XXVI'), 26);
assert.equal(valeur('2 500 m'), 2500); assert.equal(valeur('90 min'), 90); assert.equal(valeur('15 cm²'), 15); assert.equal(valeur('−4'), -4);
assert.ok(proche(valeur('3,65'), 3.65)); assert.equal(valeur('4,5 × 10⁴'), 45000); assert.equal(valeur('2⁷'), 128); assert.equal(valeur('17,5°'), 17.5);
assert.equal(valeur('3(2x + 3)', 2), 21); assert.equal(valeur('x² − 4x + 4', 5), 9); assert.equal(valeur('(x − 3)(x + 3)', 5), 16); assert.equal(valeur('5x²', 2), 20);
assert.ok(premier(17) && !premier(21) && !premier(1)); assert.equal(pgcd(12, 18), 6);
assert.throws(() => valeur('process.exit()')); assert.throws(() => calcule('require(1)', 1, VERIF));
const lus = { verif: 0, vrai: 0, puissance: 0 };
for (const [annee, liste] of Object.entries(t.exercices)) {
  assert.match(annee, /^[123]$/);
  assert.equal(new Set(liste.map(e => e.id)).size, liste.length, 'un identifiant par échauffement');
  assert.equal(new Set(liste.map(e => e.titre)).size, liste.length, 'un titre par échauffement');
  const enonces = liste.flatMap(e => e.questions).flatMap(q => q.variantes).map(x => x.q);
  assert.equal(new Set(enonces).size, enonces.length, 'année ' + annee + ' : aucun énoncé en double');
  for (const e of liste) {
    assert.ok(e.id && e.titre, 'échauffement nommé');
    // La suite : le cours de cette année chez Khan Academy, un de ses chapitres (ou plus loin dans ce chapitre).
    assert.ok(e.suite.startsWith(t.cours[annee].url + '/'), e.id + ' : la suite est dans le cours de l’année');
    assert.match(e.suite, /^https:\/\/fr\.khanacademy\.org\/math\/[\w:\/-]+$/, e.id);
    assert.ok(e.questions.length >= 2 && e.questions.length <= 5, e.id + ' : un échauffement court');
    for (const q of e.questions) {
      assert.ok(q.indice, e.id + ' : un indice par question');
      assert.equal(q.variantes.length, 3, e.id + ' : trois variantes par question');
      for (const x of q.variantes) {
        assert.equal(x.choix.length, 3, x.q); assert.equal(new Set(x.choix).size, 3, x.q);
        assert.ok(x.choix.includes(x.reponse), x.q); assert.ok(x.explication, x.q);
        assert.ok(!(x.verif !== undefined && x.vrai !== undefined), 'un seul contrôle : ' + x.q);
        assert.deepEqual(bons(x), [x.reponse], 'une seule bonne réponse, et c’est « reponse » : ' + x.q);
        const f = x.reponse.match(/^−?(\d+)\/(\d+)$/);
        if (f) assert.equal(pgcd(Number(f[1]), Number(f[2])), 1, 'une fraction donnée en réponse est simplifiée : ' + x.q);
        lus[x.verif !== undefined ? 'verif' : x.vrai !== undefined ? 'vrai' : 'puissance']++;
      }
    }
  }
}
// Un échauffement par chapitre : 14 chapitres en 1re, 11 en 2e, 12 en 3e (plus celui des puissances, écrit le premier).
assert.deepEqual(Object.fromEntries(Object.entries(t.exercices).map(([a, l]) => [a, l.length])), { 1: 14, 2: 11, 3: 13 });
assert.ok(lus.verif > 100 && lus.vrai > 50 && lus.puissance === 12, JSON.stringify(lus));

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
// L'échauffement d'une année : un chapitre tiré au sort à chaque visite, un autre sur demande ; aucun sans classe connue.
const l3 = t.exercices['3'];
assert.equal(P.echauffementPour(lu, '3', () => 0).id, l3[0].id); assert.equal(P.echauffementPour(lu, '3', () => 0.9999).id, l3.at(-1).id);
assert.equal(P.echauffementPour(lu, '', () => 0), null); assert.equal(P.echauffementPour(null, '3', () => 0), null);
const tires = new Set(); for (let i = 0; i < 200; i++) tires.add(P.echauffementPour(lu, '1').id);
assert.ok(tires.size > 10, 'le sort passe par presque tous les chapitres : ' + tires.size);
for (let i = 0; i < 50; i++) assert.notEqual(P.echauffementPour(lu, '2', Math.random, lu.exercices['2'][3]).id, lu.exercices['2'][3].id, '« un autre chapitre » en donne un autre');
const seul = { exercices: { '3': [lu.exercices['3'][0]] } };
assert.equal(P.echauffementPour(seul, '3', () => 0.5, seul.exercices['3'][0]).id, l3[0].id, 'un seul échauffement : toujours lui');
// Un passage : une question par notion, la variante du tour ; le tour suivant change tous les nombres.
const bon = t.exercices['3'].find(e => e.id === 'puissances-exposants-entiers');
const tour0 = P.questionsEchauffement(bon, 0, () => 0.5), tour1 = P.questionsEchauffement(bon, 1, () => 0.5);
assert.equal(tour0.length, 4);
for (const [i, q] of tour0.entries()) { assert.ok(q.choix.includes(q.reponse) && q.indice && q.explication); assert.notEqual(q.q, tour1[i].q); }
assert.equal(P.questionsEchauffement(bon, 3, () => 0.5)[0].q, tour0[0].q, 'après trois tours, on revient au premier');
// Un échauffement qui sortirait de Khan Academy, ou sans réponse parmi ses choix, n'est pas gardé.
assert.ok(P.echauffementValide(bon));
assert.ok(!P.echauffementValide({ ...bon, suite: 'https://exemple.be/math/x' }));
assert.ok(!P.echauffementValide({ ...bon, questions: [{ variantes: [{ q: '2² = ?', choix: ['3', '5'], reponse: '4' }] }] }));
assert.equal(P.mathsLues({ ...t, exercices: { '3': [{ ...bon, suite: 'https://exemple.be/' }] } }).exercices['3'], undefined);
console.log('Coup de pouce en maths : ' + Object.keys(t.cours).length + ' cours de Khan Academy, une année ▸ ses cours ; ' + Object.values(t.exercices).flat().length + ' échauffements, ' + (lus.verif + lus.vrai + lus.puissance) + ' réponses recalculées.');

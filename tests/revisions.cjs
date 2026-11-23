/* Révisions : revisions.json ne renvoie qu'à des cours et à des pages qui existent ; le suivi « fait / à faire » tient debout. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const racine = path.resolve(__dirname, '..');
const lis = f => fs.readFileSync(path.join(racine, f), 'utf8');
const existe = chemin => { const f = path.join(racine, chemin.replace(/[?#].*$/, '')); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html'))); };
const { compte, cheminSur, anneeDe } = require('../revisions/revisions.js');
const d = JSON.parse(lis('revisions/revisions.json'));
const catalogue = new Set(JSON.parse(lis('pas-a-pas/cours.json')).cours.map(c => c.id));
const jeux = JSON.parse(lis('associe/jeux.json')).jeux;
const page = lis('revisions/index.html');

const suivis = new Set();
for (const [id, c] of Object.entries(d.cours)) {
  assert.ok(catalogue.has(id), id + ' : pas un cours du catalogue');
  assert.ok(c.titre && c.sujet && [1, 2, 3].includes(c.niveau), id + ' : titre, sujet ou année manquant');
  assert.ok(c.activites.length >= 2, id + ' : au moins deux activités');
  for (const a of c.activites) {
    assert.ok(a.genre && cheminSur(a.chemin) && existe(a.chemin), id + ' ▸ ' + a.chemin + ' : page introuvable ou chemin refusé');
    if (a.suivi) { assert.match(a.suivi, /^(quiz|mots-croises|associe|derriere-lecran):[a-z0-9\-]+$/); assert.ok(!suivis.has(a.suivi), a.suivi + ' : clé de suivi en double'); suivis.add(a.suivi); }
    // Sans JavaScript, la page garde un lien vers chaque activité.
    assert.ok(page.includes('href="../' + a.chemin + '"'), id + ' ▸ ' + a.chemin + ' : absent du secours sans JavaScript');
  }
}
for (const a of d.autres) {
  assert.ok(a.titre && a.sujet && cheminSur(a.chemin) && existe(a.chemin), 'autres ▸ ' + a.chemin);
  assert.ok(a.niveaux.length && a.niveaux.every(n => [1, 2, 3].includes(n)));
}
// Le quiz d'une page « je révise » note sa fin sous la clé que revisions.json attend.
for (const [id, c] of Object.entries(d.cours)) for (const a of c.activites) if (a.suivi && a.suivi.startsWith('quiz:')) {
  const f = a.chemin.replace(/#.*$/, '') + 'index.html', source = lis(f);
  assert.ok(source.includes('assets/progres.js" data-quiz="' + a.suivi + '"'), f + ' : ne note pas ' + a.suivi);
  assert.ok(/id="quiz"/.test(source) && /"score"/.test(source), f + ' : le score du quiz ne serait pas vu');
  assert.ok(source.includes('"' + a.chemin.split('#')[1] + '"') || source.includes('t-' + a.chemin.split('#')[1]), f + ' : onglet #' + a.chemin.split('#')[1] + ' inconnu');
}
// Le jeu d'images rattaché à un cours existe, pour la bonne année.
for (const [id, j] of Object.entries(jeux)) {
  if (j.cours) assert.ok(d.cours[j.cours].activites.some(a => a.chemin === 'associe/?jeu=' + id && a.suivi === 'associe:' + id), 'associe ' + id + ' : absent du cours ' + j.cours);
  else assert.ok(d.autres.some(a => a.chemin === 'associe/?jeu=' + id && a.niveaux.includes(j.niveau)), 'associe ' + id + ' : absent des autres entraînements');
}

// compte : seules les activités suivies comptent.
const etats = { 'quiz:python-1': 'fait', 'mots-croises:python-1': 'commence' };
assert.deepEqual(compte(d.cours['python-1'].activites, k => etats[k] || ''), { faits: 1, total: 2 });
assert.deepEqual(compte(undefined, () => ''), { faits: 0, total: 0 });
assert.equal(cheminSur('//ailleurs.example/'), false); assert.equal(cheminSur('../x'), false); assert.equal(cheminSur('javascript:alert(1)'), false);
assert.equal(anneeDe('?niveau=3', '1', [1, 2, 3]), 3); assert.equal(anneeDe('', '2', [1, 2, 3]), 2); assert.equal(anneeDe('?niveau=9', '', [1, 2, 3]), 1);

// progres.js : « fait » ne redevient jamais « commencé », une clé bizarre est refusée, un stockage bloqué ne casse rien.
function progres(stock) {
  const ctx = { localStorage: stock }; ctx.globalThis = ctx;
  vm.runInNewContext(lis('assets/progres.js'), ctx); return ctx.Progres;
}
const boite = new Map(), P = progres({ getItem: k => boite.get(k) || null, setItem: (k, v) => boite.set(k, v) });
P.marque('quiz:python-1', 'commence'); assert.equal(P.etat('quiz:python-1'), 'commence');
P.marque('quiz:python-1', 'fait'); P.marque('quiz:python-1', 'commence'); assert.equal(P.etat('quiz:python-1'), 'fait');
P.marque('__proto__', 'fait'); P.marque('a b', 'fait'); P.marque('quiz:x', 'gagné'); assert.equal(Object.keys(P.lit()).length, 1);
const bloque = progres({ getItem() { throw Error('bloqué'); }, setItem() { throw Error('bloqué'); } });
bloque.marque('quiz:python-1', 'fait'); assert.equal(bloque.etat('quiz:python-1'), '');
assert.doesNotMatch(page, /[a-z0-9.]+@arcampin\.be/i);
console.log('Révisions : ' + Object.keys(d.cours).length + ' cours, ' + suivis.size + ' activités suivies, pages et clés vérifiées.');

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
  // La page commune revisions/je-revise/?cours=<id> (cours créés par outils/nouveau-cours.cjs) note elle-même « quiz:<id> ».
  const commune = a.chemin.startsWith('revisions/je-revise/?cours=' + id + '#');
  const f = a.chemin.replace(/[?#].*$/, '') + 'index.html', source = lis(f);
  if (commune) assert.ok(a.suivi === 'quiz:' + id && lis('revisions/je-revise/je-revise.js').includes("Progres.marque('quiz:' + id, 'fait')"), f + ' : ne note pas ' + a.suivi);
  else assert.ok(source.includes('assets/progres.js" data-quiz="' + a.suivi + '"'), f + ' : ne note pas ' + a.suivi);
  assert.ok(/id="quiz"/.test(source) && (commune || /"score"/.test(source)), f + ' : le score du quiz ne serait pas vu');
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

// Le double sur le serveur : la page envoie ce que le serveur ignore, reprend ce qu'il sait, et ne casse rien sans lui.
{
  const stock = new Map(), scripts = [], evts = [], minuteries = [];
  const ctx = { localStorage: { getItem: k => stock.get(k) || null, setItem: (k, v) => stock.set(k, v) }, location: { protocol: 'https:' },
    document: { createElement: () => ({}), head: { append: x => scripts.push(x) }, dispatchEvent: e => evts.push(e.type), currentScript: null },
    Event: function (t) { this.type = t; }, setTimeout: f => minuteries.push(f), encodeURIComponent };
  ctx.globalThis = ctx;
  stock.set('campin-progres', JSON.stringify({ 'quiz:python-1': 'commence' }));
  vm.runInNewContext(lis('assets/progres.js'), ctx);
  // À l'ouverture : un appel, qui porte ce que le navigateur sait et que le serveur n'a pas confirmé.
  assert.equal(scripts.length, 1); assert.match(scripts[0].src, /\/exec\?vue=progres&m=quiz%3Apython-1~commence$/);
  // Le serveur répond : un quiz fini sur un autre poste arrive ici, et la page est prévenue.
  ctx.campinProgres({ 'quiz:python-1': 'fait', 'mots-croises:python-1': 'commence', '<b>': 'fait', 'quiz:x': 'gagné' });
  assert.equal(ctx.Progres.etat('quiz:python-1'), 'fait'); assert.equal(ctx.Progres.etat('mots-croises:python-1'), 'commence');
  assert.equal(Object.keys(ctx.Progres.lit()).length, 2, 'une clé ou un état bizarre venu du serveur est ignoré'); assert.deepEqual(evts, ['campin-progres']);
  // Une activité finie ici part au serveur, une seule fois, après un court délai ; ce qu'il sait déjà ne repart pas.
  assert.equal(minuteries.length, 0);
  ctx.Progres.marque('mots-croises:python-1', 'fait'); ctx.Progres.marque('associe:rat', 'commence'); assert.equal(minuteries.length, 1, 'un seul envoi groupé');
  minuteries.shift()(); assert.equal(scripts.length, 2);
  assert.equal(decodeURIComponent(scripts[1].src.split('&m=')[1]), 'mots-croises:python-1~fait,associe:rat~commence');
  assert.equal(evts.length, 3, 'chaque changement fait ici prévient la page');
  ctx.campinProgres({ 'quiz:python-1': 'fait', 'mots-croises:python-1': 'fait', 'associe:rat': 'commence' });
  assert.equal(evts.length, 3, 'rien de neuf venu du serveur : pas d\'évènement'); assert.equal(minuteries.length, 0, 'tout est su : plus d\'appel');
  // Pas un compte de l'école (null), ou script qui ne se charge pas : la mémoire du navigateur reste telle quelle.
  ctx.Progres.marque('quiz:python-2', 'commence'); minuteries.shift()(); ctx.campinProgres(null); assert.equal(ctx.Progres.etat('quiz:python-2'), 'commence');
  ctx.Progres.marque('quiz:python-2', 'fait'); minuteries.shift()(); scripts.at(-1).onerror();
  ctx.Progres.marque('quiz:python-3', 'commence'); assert.equal(minuteries.length, 1, 'après un échec, le prochain changement réessaie');
  // Plus de 40 activités en attente : par lots.
  for (let i = 0; i < 50; i++) ctx.Progres.marque('quiz:lot-' + i, 'fait');
  minuteries.shift()(); assert.equal(decodeURIComponent(scripts.at(-1).src.split('&m=')[1]).split(',').length, 40);
  // Page ouverte depuis un fichier, ou sans document : aucun appel.
  const hors = { localStorage: ctx.localStorage, location: { protocol: 'file:' }, document: { head: { append() { throw Error('appel interdit'); } } } }; hors.globalThis = hors;
  vm.runInNewContext(lis('assets/progres.js'), hors); hors.Progres.marque('quiz:python-4', 'fait');
  // Dans le portail servi par « Mes cours » : l'envoi passe par le pont de la page, pas par un script.
  (async () => { const st = new Map(), sc = [], mn = [], recus = [], tic = () => new Promise(r => setImmediate(r));
    const c2 = { localStorage: { getItem: k => st.get(k) || null, setItem: (k, v) => st.set(k, v) }, location: { protocol: 'https:' },
      document: { createElement: () => ({}), head: { append: x => sc.push(x) }, dispatchEvent() {}, currentScript: null }, Event: function () {}, setTimeout: f => mn.push(f), encodeURIComponent, Promise,
      ProgresPont: m => { recus.push(m); return Promise.resolve({ 'quiz:python-1': 'fait' }); } };
    c2.globalThis = c2; vm.runInNewContext(lis('assets/progres.js'), c2);
    await tic(); assert.deepEqual(recus, ['']); assert.equal(sc.length, 0, 'aucun script chargé'); assert.equal(c2.Progres.etat('quiz:python-1'), 'fait');
    c2.Progres.marque('mots-croises:python-1', 'fait'); mn.shift()(); assert.deepEqual(recus, ['', 'mots-croises:python-1~fait']);
    console.log('Progrès : le portail connecté passe par son pont.'); })().catch(e => { console.error(e); process.exit(1); });
  assert.ok(lis('revisions/revisions.js').includes("document.addEventListener('campin-progres', affiche)"));
  console.log('Progrès : double sur le serveur, par lots, sans rien casser quand il ne répond pas.');
}
console.log('Révisions : ' + Object.keys(d.cours).length + ' cours, ' + suivis.size + ' activités suivies, pages et clés vérifiées.');

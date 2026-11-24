/* Mots croisés : chaque grille pose tous ses mots, se rejoue à l'identique, et renvoie à un cours et à des pages qui existent. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const racine = path.resolve(__dirname, '..');
const { normalise, construit } = require('../mots-croises/grille.js');
const { grilles } = JSON.parse(fs.readFileSync(path.join(racine, 'mots-croises/grilles.json'), 'utf8'));
const catalogue = new Set(JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/cours.json'), 'utf8')).cours.map(c => c.id));
const revisions = JSON.parse(fs.readFileSync(path.join(racine, 'revisions/revisions.json'), 'utf8')).cours;
const pageRevisions = fs.readFileSync(path.join(racine, 'revisions/index.html'), 'utf8');
const existe = chemin => { const f = path.join(racine, chemin.replace(/\?.*$/, '')); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html'))); };

assert.equal(normalise('Hameçonnage'), 'HAMECONNAGE'); assert.equal(normalise('émoticônes'), 'EMOTICONES'); assert.equal(normalise('pièce jointe'), 'PIECEJOINTE');

let total = 0;
for (const [id, g] of Object.entries(grilles)) {
  assert.ok(catalogue.has(id), id + ' : pas dans pas-a-pas/cours.json');
  assert.ok([1, 2, 3].includes(g.niveau) && g.titre && g.sujet, id + ' : titre, sujet ou année manquant');
  assert.ok(existe(g.revision), id + ' : la page « je révise » ' + g.revision + ' n\'existe pas');
  assert.ok(g.mots.length >= 8, id + ' : au moins huit mots');
  const mots = g.mots.map(m => normalise(m.mot));
  assert.equal(new Set(mots).size, mots.length, id + ' : un mot en double');
  for (const m of g.mots) {
    const mot = normalise(m.mot);
    assert.ok(mot.length >= 3 && mot.length <= 13, id + ' : « ' + m.mot + ' » trop court ou trop long pour la grille');
    assert.ok(m.indice && m.indice.length <= 90, id + ' : indice absent ou trop long pour « ' + m.mot + ' »');
    // L'indice ne donne pas la réponse (ni sa forme accentuée, ni un mot de la même famille qui la contient).
    assert.ok(!normalise(m.indice).includes(mot) || mot.length <= 3, id + ' : l\'indice de « ' + m.mot + ' » contient la réponse');
  }
  const grille = construit(g.mots, id);
  assert.deepEqual(grille.oublies, [], id + ' : mots restés hors de la grille');
  assert.equal(grille.mots.length, g.mots.length);
  assert.ok(grille.largeur <= 14 && grille.hauteur <= 16, id + ' : grille trop grande (' + grille.largeur + ' × ' + grille.hauteur + ')');
  assert.deepEqual(construit(g.mots, id), grille, id + ' : la grille doit se rejouer à l\'identique');
  // Deux mots qui passent par la même case y mettent la même lettre, chaque mot en croise un autre, aucun n'en touche un autre par le côté.
  const cases = new Map();
  for (const m of grille.mots) for (let i = 0; i < m.mot.length; i++) {
    const k = (m.sens === 'h' ? m.x + i : m.x) + ',' + (m.sens === 'h' ? m.y : m.y + i);
    assert.ok(!cases.has(k) || cases.get(k).lettre === m.mot[i], id + ' : deux lettres dans la case ' + k);
    const c = cases.get(k) || { lettre: m.mot[i], n: 0 }; c.n++; cases.set(k, c);
  }
  for (const m of grille.mots) {
    let croise = 0;
    for (let i = 0; i < m.mot.length; i++) if (cases.get((m.sens === 'h' ? m.x + i : m.x) + ',' + (m.sens === 'h' ? m.y : m.y + i)).n > 1) croise++;
    assert.ok(croise >= 1, id + ' : « ' + m.mot + ' » ne croise rien');
    const avant = (m.sens === 'h' ? m.x - 1 : m.x) + ',' + (m.sens === 'h' ? m.y : m.y - 1);
    const apres = (m.sens === 'h' ? m.x + m.mot.length : m.x) + ',' + (m.sens === 'h' ? m.y : m.y + m.mot.length);
    assert.ok(!cases.has(avant) && !cases.has(apres), id + ' : « ' + m.mot + ' » est collé à une autre lettre');
  }
  // Chaque suite de lettres lue dans la grille est un mot de la liste : pas de faux mot né d'un voisinage.
  const lus = new Set(mots);
  for (const sens of ['h', 'v']) for (const k of cases.keys()) {
    const [x, y] = k.split(',').map(Number), dx = sens === 'h' ? 1 : 0, dy = 1 - dx;
    if (cases.has((x - dx) + ',' + (y - dy))) continue;
    let s = '', i = 0; while (cases.has((x + dx * i) + ',' + (y + dy * i))) s += cases.get((x + dx * i++) + ',' + (y + dy * (i - 1))).lettre;
    if (s.length > 1) assert.ok(lus.has(s), id + ' : la grille fait lire « ' + s + ' », qui n\'est pas un mot de la liste');
  }
  // La grille est annoncée partout où l'élève la cherche.
  assert.ok(pageRevisions.includes('href="../mots-croises/?cours=' + id + '"'), id + ' : absente du secours sans JavaScript de la page des révisions');
  assert.ok(((revisions[id] || {}).activites || []).some(r => r.chemin === 'mots-croises/?cours=' + id && r.jeu === 'mots-croises' && r.suivi === 'mots-croises:' + id), id + ' : absente de revisions.json (ni la page des révisions ni le portail ne la proposeront)');
  total += g.mots.length;
}
// La page : ses liens sortent du cadre, et elle ne porte aucune adresse d'élève.
const page = fs.readFileSync(path.join(racine, 'mots-croises/index.html'), 'utf8');
for (const f of ['jeu.css', 'jeu.js', 'grille.js', 'page.js']) assert.ok(page.includes(f) && existe('mots-croises/' + f), 'mots-croises/' + f + ' : absent ou non chargé');
// Le jeu se monte ailleurs que dans sa page : il ne cherche aucun élément par son id.
assert.doesNotMatch(fs.readFileSync(path.join(racine, 'mots-croises/jeu.js'), 'utf8'), /getElementById/);
assert.doesNotMatch(page, /[a-z0-9.]+@arcampin\.be/i);
assert.match(page, /Professeur : M\. Louviaux/);
console.log('Mots croisés : ' + Object.keys(grilles).length + ' grilles, ' + total + ' mots, tous posés et croisés.');

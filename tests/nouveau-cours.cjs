// node tests/nouveau-cours.cjs — la fiche de séquence (pas-a-pas/modele/sequence.json) et la commande qui en fait un cours
// (outils/nouveau-cours.cjs) : la fiche modèle est complète, le cours s'écrit dans une copie, se réécrit à l'identique,
// n'écrase rien d'écrit à la main, et une fiche qui enfreint une règle des cours est refusée avec la raison.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const racine = path.resolve(__dirname, '..');
const { controle, ecrit, MARQUE } = require('../outils/nouveau-cours.cjs');
const { construit } = require('../mots-croises/grille.js');
const source = path.join(racine, 'pas-a-pas/modele/sequence.json');
const modele = () => JSON.parse(fs.readFileSync(source, 'utf8'));

// 1. La fiche modèle est complète, et rien n'y est « à relire ».
assert.deepEqual(controle(modele()), { erreurs: [], relire: [] });

// 2. Elle s'écrit dans une copie du dépôt réduite aux fichiers que la commande touche.
const copie = fs.mkdtempSync(path.join(os.tmpdir(), 'nouveau-cours-'));
for (const f of ['pas-a-pas/cours.json', 'pas-a-pas/modele/index.html', 'revisions/revisions.json', 'revisions/index.html', 'mots-croises/grilles.json']) {
  fs.mkdirSync(path.dirname(path.join(copie, f)), { recursive: true }); fs.copyFileSync(path.join(racine, f), path.join(copie, f));
}
const lis = f => fs.readFileSync(path.join(copie, f), 'utf8'), json = f => JSON.parse(lis(f));
const F = modele(), r = ecrit(F, copie, source), d = r.dossier;
for (const f of ['index.html', 'fiche.js', 'revision.json', 'sequence.json']) assert.ok(fs.existsSync(path.join(copie, d, f)), d + f + ' écrit');
const page = lis(d + 'index.html');
assert.ok(!/À REMPLACER/.test(page) && page.includes(MARQUE) && page.includes('<h1>' + F.titre + '</h1>'), 'la page est remplie');
assert.match(page, new RegExp(d.replace(/[/.]/g, '\\$&') + 'fiche\\.js\\?v=[0-9a-f]{8}"'), 'la page charge la fiche du cours, avec sa version');
// Tout ce que le modèle charge (moteur, styles, cloche, lanceur) est gardé tel quel : la page suit le modèle.
const communs = s => (s.match(/https:\/\/root75\.github\.io\/campin-public\/(?:pas-a-pas|assets)\/[a-z-]+\.(?:js|css)[^"]*/g) || []).sort();
assert.deepEqual(communs(page), communs(lis('pas-a-pas/modele/index.html')));
const fiche = require(path.join(copie, d, 'fiche.js'));
assert.equal(fiche.COURS, F.id); assert.equal(fiche.BLOCS.length, F.etapes.length);
// Une étape à champs : toutes les questions sont alors corrigées dans la page, en trois versions, et il n'y a pas de
// fichier de preuves (avec lui, Code.gs n'accepterait pas le « juste » de l'étape à champs).
assert.deepEqual(fiche.BLOCS.map(B => B.q.type), ['enquete', 'qcm', 'saisie']);
assert.deepEqual(fiche.BLOCS.map(B => (B.variantes || []).length), [0, 2, 2]);
assert.ok(!fs.existsSync(path.join(copie, d, 'preuves.json')) && !/const PREUVES/.test(lis(d + 'fiche.js')));
fiche.BLOCS.forEach((B, i) => { assert.equal(B.veux, F.etapes[i].but); assert.ok(B.coince.length && B.gestes.length); });
assert.equal(fiche.GRILLE.criteres.length, F.moi.length); assert.match(fiche.GRILLE.intro, /pas coté/);
assert.ok(fiche.FIN.citation.auteur && fiche.FIN.revision.url.endsWith('revisions/je-revise/?cours=' + F.id));
const cat = json('pas-a-pas/cours.json').cours.find(c => c.id === F.id);
assert.deepEqual(cat, { id: F.id, titre: F.titre, chemin: d, etapes: 3, criteres: 2 });
const rev = json('revisions/revisions.json').cours[F.id];
assert.deepEqual(rev.activites.map(a => a.genre), ["L'essentiel", 'Quiz', 'Cartes', 'Mots croisés']);
assert.equal(rev.activites[1].suivi, 'quiz:' + F.id);
for (const a of rev.activites) assert.ok(lis('revisions/index.html').includes('href="../' + a.chemin + '"'), a.chemin + ' : dans le secours sans JavaScript');
const grille = json('mots-croises/grilles.json').grilles[F.id];
assert.deepEqual(construit(grille.mots, F.id).oublies, [], 'les mots croisés du modèle tiennent tous dans la grille');
const revision = json(d + 'revision.json');
assert.equal(revision.essentiel.length, F.essentiel.length); assert.equal(revision.quiz.length, F.quiz.length); assert.equal(revision.mots_croises, true);

// 3. Relancer la commande réécrit les mêmes fichiers, sans doubler une ligne.
const avant = ['index.html', 'fiche.js', 'revision.json'].map(f => lis(d + f)).concat(lis('pas-a-pas/cours.json'), lis('revisions/revisions.json'), lis('revisions/index.html'), lis('mots-croises/grilles.json'));
ecrit(modele(), copie, source);
assert.deepEqual(['index.html', 'fiche.js', 'revision.json'].map(f => lis(d + f)).concat(lis('pas-a-pas/cours.json'), lis('revisions/revisions.json'), lis('revisions/index.html'), lis('mots-croises/grilles.json')), avant);
assert.equal(lis('revisions/index.html').split('data-cours="' + F.id + '"').length, 2, 'une seule ligne de secours');

// 3 bis. Sans étape à champs, les questions partent au serveur : preuves.json, trois versions par étape, annoncé au catalogue.
const G = modele(); G.etapes.shift(); ecrit(G, copie, source);
delete require.cache[require.resolve(path.join(copie, d, 'fiche.js'))];
assert.deepEqual(require(path.join(copie, d, 'fiche.js')).BLOCS.map(B => B.q), [{ serveur: true }, { serveur: true }]);
assert.deepEqual(json(d + 'preuves.json').blocs.map(l => l.length), [3, 3]);
assert.equal(json('pas-a-pas/cours.json').cours.find(c => c.id === F.id).preuves, d + 'preuves.json');
assert.match(lis(d + 'fiche.js'), /const PREUVES = ".*preuves\.json\?v=[0-9a-f]{8}"/);
ecrit(modele(), copie, source);
assert.ok(!fs.existsSync(path.join(copie, d, 'preuves.json')), 'revenu aux champs : le fichier de preuves est retiré');

// 4. Un fichier écrit à la main n'est jamais écrasé ; un identifiant déjà pris par un autre cours est refusé.
fs.writeFileSync(path.join(copie, d, 'fiche.js'), 'const COURS = "à la main";\n');
assert.throws(() => ecrit(modele(), copie, source), /pas écrasé/);
assert.throws(() => ecrit({ ...modele(), id: 'python-1', dossier: 'ailleurs' }, copie, source), /déjà celui du cours/);

// 5. Une fiche qui enfreint une règle est refusée, et la raison le dit.
const refuse = (change, motif) => { const f = modele(); change(f); const e = controle(f).erreurs; assert.ok(e.some(m => motif.test(m)), 'attendu ' + motif + ', reçu : ' + e.join(' / ')); };
refuse(f => f.etapes[1].preuve.pop(), /trois versions/);
refuse(f => { f.etapes[1].preuve[2] = f.etapes[1].preuve[0]; }, /deux versions identiques/);
refuse(f => { f.etapes[2].preuve[1].type = 'qcm'; }, /même type/);
refuse(f => { f.etapes[1].preuve[0].p[0] = 'oui'; }, /null pour la bonne réponse/);
refuse(f => { delete f.etapes[0].preuve; }, /« preuve » manque/);
refuse(f => { f.etapes[0].coince = []; }, /Ça coince/);
refuse(f => { f.etapes[0].gestes = Array(7).fill('Clique sur <b>OK</b>.'); }, /six au plus/);
refuse(f => { f.etapes[0].gestes[0] = 'Ouvre Drive.'; }, /mot-clé en gras/);
refuse(f => { f.etapes[0].gestes[0] = 'Prends une <b>photo</b> de ton écran.'; }, /photo/);
refuse(f => { f.etapes[0].coince[0] = 'Je lève la main.'; }, /cloche/);
refuse(f => { f.moi = [f.moi[0]]; }, /auto-évaluation/);
refuse(f => { f.fin.citation = { texte: 'Sans auteur.' }; }, /citation/);
refuse(f => { f.essentiel = ['Une seule ligne.']; }, /essentiel/);
refuse(f => { f.mots_croises = f.mots_croises.slice(0, 5); }, /huit mots/);
refuse(f => { f.mots_croises[0].indice = 'Le texte en gras.'; }, /contient la réponse/);
refuse(f => { f.id = 'Mon Cours'; }, /« id »/);
const relit = (change, motif) => { const f = modele(); change(f); const c = controle(f); assert.deepEqual(c.erreurs, []); assert.ok(c.relire.some(m => motif.test(m)), 'à relire attendu : ' + motif); };
relit(f => { f.etapes[0].coince[0] = 'Appuie sur la touche Maj.'; }, /touches en anglais/);
relit(f => { f.accueil = 'Pour la classe de 2B, après le congé.'; }, /ne dépend pas de l’année/);
relit(f => { delete f.mots_croises; delete f.quiz; }, /mots croisés ont bien aidé/);

fs.rmSync(copie, { recursive: true, force: true });
console.log('nouveau-cours : OK (fiche modèle complète, cours écrit et réécrit à l’identique, ' + 19 + ' règles contrôlées)');

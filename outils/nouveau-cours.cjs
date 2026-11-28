#!/usr/bin/env node
/* Créer (ou régénérer) un cours pas à pas à partir de sa FICHE DE SÉQUENCE, sans toucher au moteur.

   node outils/nouveau-cours.cjs <dossier>/pas-a-pas/sequence.json
     --controle        contrôle la fiche et n'écrit rien
     --racine <dir>    écrit dans une autre copie du dépôt (essais)

   La fiche à remplir : pas-a-pas/modele/sequence.json. La commande écrit, dans <dossier>/pas-a-pas/ :
     index.html     la page, tirée de pas-a-pas/modele/index.html
     fiche.js       les données lues par le moteur (blocs.js)
     preuves.json   les questions corrigées par le serveur, trois versions par étape
     revision.json  l'essentiel, le quiz et les cartes de la page commune revisions/je-revise/?cours=<id>
   et inscrit le cours dans pas-a-pas/cours.json, revisions/revisions.json (avec la ligne de secours de
   revisions/index.html) et mots-croises/grilles.json.
   Relancer la commande réécrit ces fichiers : la fiche de séquence reste la seule source. Un fichier qui
   n'a pas été écrit par cette commande n'est jamais écrasé.

   Rien n'est propre à un cours ici, et rien ne change dans blocs.js ni dans Code.gs. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const SITE = 'https://root75.github.io/campin-public/';
const MARQUE = 'GÉNÉRÉ par outils/nouveau-cours.cjs';
const HORS_SUIVI = 'Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';

const texte = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sansBalises = s => String(s).replace(/<[^>]+>/g, ' ');
const empreinte = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const norme = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* ---------- Contrôle de la fiche : renvoie { erreurs, relire } ---------- */
function controle(F) {
  const erreurs = [], relire = [], E = m => erreurs.push(m), R = m => relire.push(m);
  const plein = v => typeof v === 'string' && v.trim().length > 0;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(F.id || '')) E('« id » : des minuscules, des chiffres et des tirets (exemple : tableur-1).');
  if (F.dossier !== undefined && !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(F.dossier)) E('« dossier » : un chemin simple, sans barre au début ni à la fin.');
  for (const k of ['titre', 'surtitre', 'accueil', 'sujet']) if (!plein(F[k])) E('« ' + k + ' » manque.');
  if (![1, 2, 3].includes(F.niveau)) E('« niveau » : 1, 2 ou 3 (l’année des élèves).');
  if (!Array.isArray(F.reperes) || F.reperes.length < 2 || F.reperes.some(l => !Array.isArray(l) || l.length !== F.reperes[0].length))
    E('« reperes » : un tableau court, une ligne de titres puis au moins une ligne, toutes de la même longueur.');
  if (!Array.isArray(F.etapes) || !F.etapes.length) E('« etapes » : au moins une étape.');
  (F.etapes || []).forEach((e, i) => {
    const ou = 'Étape ' + (i + 1) + ' : ';
    for (const k of ['partie', 'titre', 'but']) if (!plein(e[k])) E(ou + '« ' + k + ' » manque.');
    if (!(Number(e.min) > 0)) E(ou + '« min » : la durée indicative, en minutes.');
    if (!Array.isArray(e.coince) || !e.coince.length || !e.coince.every(plein)) E(ou + '« coince » : au moins un blocage prévisible et sa solution (« Ça coince ? »).');
    const gestes = e.gestes || [];
    if (!gestes.length) E(ou + '« gestes » : au moins un geste.');
    if (gestes.length > 6) E(ou + gestes.length + ' gestes : six au plus, sinon couper l’étape en deux.');
    gestes.forEach((g, k) => { const t = typeof g === 'string' ? g : g && g.geste;
      if (!plein(t)) return E(ou + 'geste ' + (k + 1) + ' vide.');
      if (!/<b[ >]/.test(t)) E(ou + 'geste ' + (k + 1) + ' : au moins un mot-clé en gras (<b>…</b>).'); });
    const P = e.preuve;
    if (!P) return E(ou + '« preuve » manque : des champs qui prouvent le geste, ou une question en trois versions.');
    if (Array.isArray(P)) {
      if (P.length !== 3) E(ou + 'preuve : trois versions (règle anti-recopie), ' + P.length + ' trouvée(s).');
      if (new Set(P.map(v => v && v.type)).size !== 1) E(ou + 'preuve : les trois versions sont du même type.');
      const reponses = [];
      P.forEach((v, k) => { const o = ou + 'preuve, version ' + (k + 1) + ' : ';
        if (!v || !plein(v.q)) return E(o + 'la question « q » manque.');
        if (v.type === 'qcm') {
          if (!Array.isArray(v.c) || v.c.length < 3 || v.c.length > 8) E(o + '« c » : de 3 à 8 choix, la bonne réponse en premier.');
          else if (!Array.isArray(v.p) || v.p.length !== v.c.length || v.p[0] !== null || !v.p.slice(1).every(plein)) E(o + '« p » : null pour la bonne réponse, puis une phrase par piège.');
          reponses.push(v.q + '|' + (v.c || [])[0]);
        } else if (v.type === 'saisie') {
          const r = v.regle || {};
          if (!['egal', 'exact', 'contient', 'motif'].some(c => r[c] !== undefined)) E(o + '« regle » : egal, exact, contient ou motif.');
          if (!plein(v.faux)) E(o + '« faux » : ce qu’on dit à l’élève qui se trompe.');
          reponses.push(v.q + '|' + JSON.stringify(r));
        } else if (v.type === 'trous') {
          const trous = (String(v.texte || '').match(/___/g) || []).length;
          if (!trous || !Array.isArray(v.mots) || v.mots.length !== trous) E(o + '« texte » porte un ___ par mot de « mots ».');
          if (!Array.isArray(v.pieges) || !v.pieges.length) E(o + '« pieges » : les intrus de la banque de mots.');
          reponses.push(v.texte + '|' + (v.mots || []).join(','));
        } else E(o + 'type « ' + v.type + ' » inconnu ici (qcm, saisie ou trous).');
      });
      if (reponses.length === 3 && new Set(reponses).size !== 3) E(ou + 'preuve : deux versions identiques.');
    } else {
      if (!plein(P.q)) E(ou + 'preuve à champs : la consigne « q » manque.');
      if (!Array.isArray(P.champs) || !P.champs.length) E(ou + 'preuve à champs : au moins un champ.');
      const cles = (P.champs || []).map(c => c && c.cle);
      if (new Set(cles).size !== cles.length) E(ou + 'preuve à champs : deux champs portent la même « cle ».');
      (P.champs || []).forEach((c, k) => { if (!c || !/^[A-Z0-9_]+$/.test(c.cle || '') || !plein(c.nom) || !(c.pourcent || Number(c.max) > 0))
        E(ou + 'champ ' + (k + 1) + ' : « cle » (MAJUSCULES), « nom », et « max » (caractères) ou « pourcent ».'); });
    }
  });
  if (!Array.isArray(F.moi) || F.moi.length < 2 || F.moi.length > 5) E('« moi » : l’auto-évaluation de fin, de 2 à 5 questions.');
  (F.moi || []).forEach((c, i) => { const ou = 'Auto-évaluation, question ' + (i + 1) + ' : ';
    if (!new RegExp('^' + (i + 1) + '\\. .+ \\?$').test(c.n || '')) E(ou + '« n » : une question numérotée, « ' + (i + 1) + '. Sais-tu … ? ».');
    if (!/^Critère : ./.test(c.regarde || '')) E(ou + '« regarde » : « Critère : » puis l’intitulé exact du référentiel.');
    for (const k of 'ABCD') { if (!plein(c[k])) E(ou + 'la phrase ' + k + ' manque.'); else if (c[k].length > 190) E(ou + 'phrase ' + k + ' trop longue (190 caractères au plus).'); } });
  const fin = F.fin || {};
  for (const k of ['titre', 'texte', 'plus']) if (!plein(fin[k])) E('« fin.' + k + ' » manque.');
  if (!fin.citation || !plein(fin.citation.texte) || !plein(fin.citation.auteur)) E('« fin.citation » : une citation réelle, avec son auteur.');
  if (!Array.isArray(F.essentiel) || F.essentiel.length < 3 || F.essentiel.length > 7 || !F.essentiel.every(plein)) E('« essentiel » : ce que l’élève retient, de 3 à 7 lignes.');
  if (F.quiz !== undefined) {
    if (!Array.isArray(F.quiz) || F.quiz.length < 4) E('« quiz » : au moins quatre questions (ou retirer la rubrique).');
    else F.quiz.forEach((v, k) => { const o = 'Quiz, question ' + (k + 1) + ' : ';
      if (!v || !plein(v.q)) return E(o + 'la question « q » manque.');
      if (!Array.isArray(v.c) || v.c.length < 3 || v.c.length > 4) E(o + '« c » : 3 ou 4 choix, la bonne réponse en premier.');
      else if (!Array.isArray(v.p) || v.p.length !== v.c.length || v.p[0] !== null || !v.p.slice(1).every(plein)) E(o + '« p » : null pour la bonne réponse, puis une phrase par piège.');
      if (!plein(v.e)) E(o + '« e » : la phrase à retenir, affichée après la réponse et au dos de la carte.'); });
  } else R('Pas de « quiz » : la page « je révise » n’aura que l’essentiel' + (F.mots_croises ? ' et les mots croisés.' : '.'));
  if (F.mots_croises !== undefined) {
    const M = F.mots_croises, mot = m => norme(m.mot || '').replace(/[^a-z]/g, '');
    if (!Array.isArray(M) || M.length < 8) E('« mots_croises » : au moins huit mots (ou retirer la rubrique).');
    else { if (new Set(M.map(mot)).size !== M.length) E('« mots_croises » : un mot en double.');
      M.forEach(m => { const n = mot(m); if (n.length < 3 || n.length > 13) E('Mots croisés : « ' + m.mot + ' » fait moins de 3 ou plus de 13 lettres.');
        if (!plein(m.indice) || m.indice.length > 90) E('Mots croisés : indice absent ou trop long (90 caractères) pour « ' + m.mot + ' ».');
        else if (n.length > 3 && norme(m.indice).replace(/[^a-z]/g, '').includes(n)) E('Mots croisés : l’indice de « ' + m.mot + ' » contient la réponse.'); }); }
  } else R('Pas de « mots_croises » : les mots croisés ont bien aidé les élèves, en prévoir huit mots.');

  /* Les règles d'écriture des cours, cherchées dans tout ce que l'élève lira. */
  const lu = sansBalises(JSON.stringify({ ...F, _lisezmoi: '' }));
  if (/\bphoto|smartphone|\bGSM\b/i.test(lu)) E('Jamais de consigne qui demande une photo ou un smartphone.');
  if (/l[èe]ve(?:r|z|nt)? la main/i.test(lu)) E('Jamais « je lève la main » : la cloche 🔔 « J’attends de l’aide ».');
  const touches = lu.match(/\b(?:Maj|Échap|Echap|Suppr|Verr\. ?Maj)\b|touche Entrée/g);
  if (touches) R('Noms des touches en anglais, comme sur le clavier (Shift, Esc, Delete, Enter, Caps Lock) : trouvé ' + [...new Set(touches)].join(', ') + '.');
  if (/[«"“ ]Remettre[»"” ]/.test(lu)) R('Il n’existe pas de bouton « Remettre » dans Classroom : « Rendre le devoir », ou « Marquer comme terminé » sans pièce jointe.');
  const annee = lu.match(/\b[1-6] ?[A-F]\b(?! ?[—:–.])|apr[èe]s le congé|\bséance [0-9]\b|\b20[2-9][0-9]\b/g);
  if (annee) R('Un cours ne dépend pas de l’année : pas de nom de classe, de date ni de « séance 1 » (trouvé : ' + [...new Set(annee)].join(', ') + ').');
  return { erreurs, relire };
}

/* ---------- Ce qu'on écrit ---------- */
function construit(F, modele) {
  const dossier = (F.dossier || F.id) + '/pas-a-pas/', base = SITE + dossier;
  const serveur = F.etapes.some(e => Array.isArray(e.preuve)), jeRevise = 'revisions/je-revise/?cours=' + F.id;
  const revision = JSON.stringify({ _lisezmoi: F.titre + ' — ' + MARQUE + ' depuis sequence.json : ne pas modifier ici. Lu par revisions/je-revise/.',
    titre: F.titre, surtitre: F.surtitre, essentiel: F.essentiel, quiz: F.quiz || [], mots_croises: !!F.mots_croises }, null, 1) + '\n';
  const preuves = { _lisezmoi: F.titre + ' — ' + MARQUE + ' depuis sequence.json : ne pas modifier ici. Une liste par étape ; trois versions tirées et corrigées par le serveur ; liste vide = étape à champs.',
    blocs: F.etapes.map(e => Array.isArray(e.preuve) ? e.preuve : []) };
  const preuvesJson = JSON.stringify(preuves, null, 1) + '\n';
  const blocs = F.etapes.map(e => {
    const B = { partie: e.partie, titre: e.titre, min: Number(e.min), veux: e.but };
    if (e.observe) B.avant = e.observe;
    B.gestes = e.gestes;
    if (e.vois) B.vois = e.vois;
    B.coince = e.coince;
    B.q = Array.isArray(e.preuve) ? { serveur: true } : { type: 'enquete', q: e.preuve.q, champs: e.preuve.champs };
    return B;
  });
  const grille = { intro: '<p><b>Avant de partir : où en es-tu ?</b> Pour chaque question, lis les quatre phrases, de A à D, et clique sur celle qui te ressemble le plus. Ce n’est pas coté : ta réponse t’aide à voir ce qu’il te reste à travailler, et ton professeur voit où t’aider.</p>',
    niveaux: { A: '', B: '', C: '', D: '' },
    criteres: F.moi.map(c => ({ n: c.n, inc: !!c.inc, regarde: c.regarde, A: c.A, B: c.B, C: c.C, D: c.D })) };
  const fin = { titre: F.fin.titre, bulle: F.fin.bulle || 'Fini !', texte: F.fin.texte, citation: F.fin.citation, plus: F.fin.plus,
    revision: { titre: F.titre + ' — je révise ↗', texte: ['L’essentiel en ' + F.essentiel.length + ' lignes', F.quiz ? 'un quiz et ' + F.quiz.length + ' cartes' : null, F.mots_croises ? 'les mots croisés' : null].filter(Boolean).join(', ') + '.', url: SITE + jeRevise },
    lien: '<a href="' + SITE + jeRevise + '" target="_blank" rel="noopener">la page « je révise » du cours</a>' };
  const js = v => JSON.stringify(v, null, 1);
  const fiche = '/* ' + F.titre + ' — FICHE ' + MARQUE + ' depuis sequence.json (même dossier).\n'
    + '   Ne rien modifier ici : changer sequence.json, puis relancer\n'
    + '   node outils/nouveau-cours.cjs ' + dossier + 'sequence.json */\n'
    + 'const COURS = ' + js(F.id) + ';\n'
    + 'const VERSION_PARCOURS = ' + js(F.version || 'v1') + ';\n'
    + "const PRESENTATION = 'missions';\n"
    + 'const ECRAN_LEGER = true;\n'
    + (serveur ? 'const PREUVES = ' + js(base + 'preuves.json?v=' + empreinte(preuvesJson)) + ';\n' : '')
    + 'const HORS_SUIVI = ' + js(HORS_SUIVI) + ';\n\n'
    + 'const BLOCS = ' + js(blocs) + ';\n\n'
    + 'const GRILLE = ' + js(grille) + ';\n\n'
    + 'const FIN = ' + js(fin) + ';\n\n'
    + "if(typeof module!=='undefined') module.exports = { BLOCS, FIN, GRILLE, COURS };\n";

  /* La page : le modèle, ses « À REMPLACER » remplis. Un modèle qui change de forme arrête la commande. */
  let page = modele; const remplace = (de, par) => { if (!(de instanceof RegExp ? de.test(page) : page.includes(de))) throw new Error('Le modèle pas-a-pas/modele/index.html a changé : « ' + String(de).slice(0, 60) + ' » introuvable.'); page = page.replace(de, () => par); };
  remplace(/<!-- MODÈLE DE FICHE PAS À PAS[\s\S]*?-->/, '<!-- ' + texte(F.titre) + ' — page ' + MARQUE + ' depuis sequence.json (même dossier) : ne rien modifier ici.\n     Modèle : pas-a-pas/modele/index.html ; mode d\'emploi : pas-a-pas/MOTEUR.md. -->');
  remplace(/<title>[^<]*<\/title>/, '<title>' + texte(F.titre) + ' — pas à pas</title>');
  remplace("<!-- Styles propres au cours, s'il en faut : ici, dans une balise style. -->", F.styles ? '<style>\n' + F.styles + '\n</style>' : '');
  remplace(/(id="mascotte"[^>]*>)[^<]*</, (/(id="mascotte"[^>]*>)/.exec(modele) || [])[1] + texte(F.mascotte || '🧭') + '<');
  remplace(/<div class="surtitre">[^<]*<\/div>/, '<div class="surtitre">' + texte(F.surtitre) + '</div>');
  remplace(/<h1>[^<]*<\/h1>/, '<h1>' + texte(F.titre) + '</h1>');
  remplace(/<p class="bulle" id="bulle">[^<]*<\/p>/, '<p class="bulle" id="bulle">' + texte(F.accueil) + '</p>');
  remplace(/(<button[^>]*id="memo-btn">)[^<]*</, '<button class="btn vide" type="button" id="memo-btn">📌 Les repères<');
  remplace(/<p>À REMPLACER : l'aide-mémoire[^<]*<\/p>/, '<table>' + F.reperes.map((l, i) => '<tr>' + l.map(c => (i ? '<td>' : '<th>') + c + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>');
  remplace(/pas-a-pas\/modele\/fiche\.js\?v=[^"]*/, dossier + 'fiche.js?v=' + empreinte(fiche));
  if (/À REMPLACER/.test(page)) throw new Error('Le modèle porte un « À REMPLACER » que la commande ne connaît pas.');

  const catalogue = { id: F.id, titre: F.titre, chemin: dossier, etapes: F.etapes.length };
  if (serveur) catalogue.preuves = dossier + 'preuves.json';
  catalogue.criteres = F.moi.length;
  const activites = [{ genre: 'L\'essentiel', chemin: jeRevise + '#resume' },
    ...(F.quiz ? [{ genre: 'Quiz', chemin: jeRevise + '#quiz', suivi: 'quiz:' + F.id }, { genre: 'Cartes', chemin: jeRevise + '#cartes' }] : []),
    ...(F.mots_croises ? [{ genre: 'Mots croisés', chemin: 'mots-croises/?cours=' + F.id, suivi: 'mots-croises:' + F.id, jeu: 'mots-croises' }] : [])];
  return { dossier, fichiers: { 'index.html': page, 'fiche.js': fiche, 'revision.json': revision, ...(serveur ? { 'preuves.json': preuvesJson } : {}) }, catalogue,
    revisions: { titre: F.titre, sujet: F.sujet, niveau: F.niveau, activites },
    grille: F.mots_croises ? { titre: F.titre, sujet: F.sujet, niveau: F.niveau, revision: jeRevise, mots: F.mots_croises } : null };
}

/* ---------- Écriture ---------- */
function ecrit(F, racine, source) {
  const C = construit(F, fs.readFileSync(path.join(racine, 'pas-a-pas/modele/index.html'), 'utf8'));
  const dir = path.join(racine, C.dossier), faits = [];
  for (const nom of Object.keys(C.fichiers)) { const f = path.join(dir, nom);
    if (fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes(MARQUE)) throw new Error(C.dossier + nom + ' existe et n’a pas été écrit par cette commande : il n’est pas écrasé.'); }
  const lit = f => JSON.parse(fs.readFileSync(path.join(racine, f), 'utf8')), pose = (f, v) => fs.writeFileSync(path.join(racine, f), JSON.stringify(v, null, 2) + '\n');
  const cat = lit('pas-a-pas/cours.json'), ailleurs = cat.cours.find(c => c.id === F.id && c.chemin !== C.dossier);
  if (ailleurs) throw new Error('L’identifiant « ' + F.id + ' » est déjà celui du cours ' + ailleurs.chemin + '.');
  fs.mkdirSync(dir, { recursive: true });
  for (const [nom, contenu] of Object.entries(C.fichiers)) { fs.writeFileSync(path.join(dir, nom), contenu); faits.push(C.dossier + nom); }
  if (!C.fichiers['preuves.json'] && fs.existsSync(path.join(dir, 'preuves.json'))) fs.rmSync(path.join(dir, 'preuves.json'));
  if (path.resolve(source) !== path.resolve(dir, 'sequence.json')) { fs.copyFileSync(source, path.join(dir, 'sequence.json')); faits.push(C.dossier + 'sequence.json'); }
  const i = cat.cours.findIndex(c => c.id === F.id); if (i < 0) cat.cours.push(C.catalogue); else cat.cours[i] = C.catalogue;
  pose('pas-a-pas/cours.json', cat);
  const rev = lit('revisions/revisions.json'), avant = (rev.cours[F.id] || {}).activites || [];
  /* Une activité ajoutée à la main (un autre jeu) reste ; celles de la fiche la suivent. */
  const miennes = a => a.jeu === 'mots-croises' || a.chemin.startsWith('revisions/je-revise/?cours=' + F.id);
  rev.cours[F.id] = { ...C.revisions, activites: [...C.revisions.activites, ...avant.filter(a => !miennes(a))] };
  pose('revisions/revisions.json', rev);
  /* Le secours sans JavaScript de la page des révisions : une ligne par cours, sous le titre de son année. */
  const pr = path.join(racine, 'revisions/index.html'); let secours = fs.readFileSync(pr, 'utf8');
  const ligne = '<li data-cours="' + F.id + '"><b>' + texte(F.titre) + '</b> : ' + rev.cours[F.id].activites.map(a => '<a href="../' + a.chemin + '">' + texte(a.genre) + '</a>').join(' · ') + '</li>';
  const ancienne = new RegExp('<li data-cours="' + F.id + '">.*</li>\\n?');
  secours = secours.replace(ancienne, '');
  const annee = new RegExp('(<h2>' + F.niveau + '(?:re|e) année</h2>\\s*<ul>[\\s\\S]*?)(</ul>)');
  if (!annee.test(secours)) throw new Error('revisions/index.html : la liste de secours de l’année ' + F.niveau + ' est introuvable.');
  fs.writeFileSync(pr, secours.replace(annee, (_, debut, fin) => debut + ligne + '\n' + fin));
  const g = lit('mots-croises/grilles.json');
  if (C.grille) g.grilles[F.id] = C.grille; else delete g.grilles[F.id];
  pose('mots-croises/grilles.json', g);
  return { ...C, faits: [...faits, 'pas-a-pas/cours.json', 'revisions/revisions.json', 'revisions/index.html', 'mots-croises/grilles.json'] };
}

module.exports = { controle, construit, ecrit, MARQUE };

if (require.main === module) {
  const args = process.argv.slice(2), source = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--racine');
  const racine = args.includes('--racine') ? path.resolve(args[args.indexOf('--racine') + 1]) : path.resolve(__dirname, '..');
  if (!source) { console.error('Usage : node outils/nouveau-cours.cjs <dossier>/pas-a-pas/sequence.json [--controle] [--racine <dir>]'); process.exit(2); }
  let F; try { F = JSON.parse(fs.readFileSync(source, 'utf8')); } catch (e) { console.error('Fiche illisible (' + source + ') : ' + e.message); process.exit(2); }
  const { erreurs, relire } = controle(F);
  relire.forEach(m => console.log('À relire : ' + m));
  if (erreurs.length) { console.error('La fiche n’est pas complète (' + erreurs.length + ') :\n' + erreurs.map(m => '- ' + m).join('\n')); process.exit(1); }
  if (args.includes('--controle')) { console.log('Fiche complète : ' + F.etapes.length + ' étapes, ' + F.etapes.reduce((t, e) => t + Number(e.min), 0) + ' minutes indicatives. Rien n’est écrit (--controle).'); process.exit(0); }
  try { const r = ecrit(F, racine, source);
    console.log('Cours « ' + F.id + ' » écrit : ' + F.etapes.length + ' étapes, ' + F.etapes.reduce((t, e) => t + Number(e.min), 0) + ' minutes indicatives.\n' + r.faits.map(f => '- ' + f).join('\n')
      + '\nEnsuite : node outils/verifier-cours.cjs ' + F.id + ' ; puis, une fois en ligne, tableau ▸ « Actualiser le catalogue » et cocher le cours pour la classe.');
  } catch (e) { console.error(e.message); process.exit(1); }
}

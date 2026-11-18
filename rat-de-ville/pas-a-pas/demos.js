/* Démos animées « Regarde comment faire » : une mini-maquette de Docs (ou de Drive,
   Classroom) rejoue chaque geste de l'étape. La gaufre, la vue fractionnée et le devoir Classroom sont
   communs à tous les cours (pas-a-pas/demos-communs.js). Aucune donnée élève ; rien n'est enregistré.
   Une image = un état de l'écran + l'élément que la souris va cliquer + une légende.
   Ici, seulement les maquettes et les images. Le lecteur est commun (pas-a-pas/demo-lecteur.js) ;
   quelle image va sous quelle case : champ « demos » de chaque étape, dans fiche.js. */
const Demo = (() => {
  const ICO = 'https://root75.github.io/campin-public/rat-de-ville/pas-a-pas/icones/';
  const FABLE = ['autrefois le rat de ville', 'invita le rat des champs,', 'd’une façon fort civile,', 'à des reliefs d’ortolans.'];
  const FABLE_MAJ = FABLE.map(v => v[0].toUpperCase() + v.slice(1));
  const S2 = ['Sur un tapis de Turquie', 'Le couvert se trouva mis.'];
  const TITRE = 'Le rat de ville et le rat des champs';
  const NOM = '20261104 Le rat de ville – Prénom Nom';
  const L = (t, c = '') => ({ t, c });
  const doc = (lignes, o = {}) => Object.assign({ ecran: 'docs', nom: NOM, lignes }, o);
  // La page du devoir dans Classroom : vue commune à tous les cours (pas-a-pas/demos-communs.js).
  const devoir = DemosCommuns.devoir({ titre: '03 EVAL Formatif Le rat de ville', meta: ['M. Louviaux · Date limite : vendredi'], instructions: 1, fichier: NOM, autre: 'Mon portrait chinois' });

  // Le document de départ de la période 2 : titre, une strophe, l'auteur.
  const base = (t = '', s = '', a = '') => [L(TITRE, t), L(''), ...FABLE_MAJ.map(v => L(v, s)), L(''), L('Jean de La Fontaine', a)];

  /* Les animations, par clé : une par étape (etape + ancien numéro interne de l’étape), puis celles hors étape. */
  const DEMOS = {
    etape1: { titre: 'Je crée et je nomme', images: [
      { vue: 'g-gaufre', cible: 'gaufre', legende: 'Je clique sur la gaufre, en haut à droite.' },
      { vue: 'g-gaufre', menu: 1, cible: 'app-docs', legende: 'Je choisis Docs.' },
      { ecran: 'accueil', cible: 'vierge', legende: 'Je clique sur « Document vierge ».' },
      doc([L('')], { nom: 'Document sans titre', cible: 'nom', legende: 'Je clique sur « Document sans titre ».' }),
      doc([L('')], { nom: NOM, cible: 'nom', ok: 1, legende: 'Je tape la date à l’envers, le titre, mon prénom et mon nom.' })
    ] },
    etape2: { titre: 'Je recopie la fable', images: [
      doc([L(TITRE.toLowerCase())], { cible: 'page', legende: 'Je tape le titre, puis Enter deux fois : une ligne vide.' }),
      doc([L(TITRE.toLowerCase()), L(''), L(FABLE[0])], { cible: 'page', legende: 'Un vers = une ligne.' }),
      doc([L(TITRE.toLowerCase()), L(''), L(FABLE[0]), L(FABLE[1])], { cible: 'page', legende: 'Enter au bout de chaque vers.' }),
      doc([L(TITRE.toLowerCase()), L(''), ...FABLE.map(v => L(v))], { cible: 'page', legende: 'Quatre vers : la strophe est finie.' }),
      doc([L(TITRE.toLowerCase()), L(''), ...FABLE.map(v => L(v)), L(''), L(S2[0].toLowerCase())], { cible: 'L6', ok: 1, legende: 'Enter deux fois : une ligne vide, puis la strophe suivante.' })
    ] },
    etape3: { titre: 'Je structure', images: [
      doc([L(TITRE.toLowerCase()), L(''), ...FABLE.map(v => L(v)), L(''), L(S2[0].toLowerCase())], { cible: 'L2', legende: 'Les vers commencent par une minuscule…' }),
      doc([L(TITRE), L(''), ...FABLE_MAJ.map(v => L(v, 'maj')), L(''), L(S2[0].toLowerCase())], { cible: 'L2', legende: '… je mets une majuscule au début de chaque vers.' }),
      doc([L(TITRE), L(''), ...FABLE_MAJ.map(v => L(v)), L(''), L(S2[0])], { cible: 'L6', ok: 1, legende: 'Une seule ligne vide entre deux strophes.' })
    ] },
    etape6: { titre: 'Titre, texte, auteur', images: [
      doc(base('sel'), { cible: 'L0', legende: 'Je sélectionne le titre.' }),
      doc(base('sel centre'), { cible: 'centrer', legende: 'Centrer (Ctrl + Shift + E).' }),
      doc(base('sel centre gras'), { cible: 'gras', legende: 'Gras (Ctrl + B).' }),
      doc(base('sel centre gras'), { cible: 'm-format', menu: ['Texte ▸', 'Minuscules/majuscules ▸', 'MAJUSCULES'], legende: 'Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES.' }),
      doc(base('centre gras capitales', 'sel'), { cible: 'L2', legende: 'Je sélectionne les strophes.' }),
      doc(base('centre gras capitales', 'sel centre'), { cible: 'centrer', legende: 'Centrer (Ctrl + Shift + E).' }),
      doc(base('centre gras capitales', 'centre', 'sel droite'), { cible: 'droite', legende: 'L’auteur : Aligner à droite (Ctrl + Shift + R).' }),
      doc(base('centre gras capitales', 'centre', 'sel droite italique'), { cible: 'italique', legende: 'Italique (Ctrl + I).' }),
      doc(base('centre gras capitales', 'centre', 'droite italique souligne'), { cible: 'souligne', ok: 1, legende: 'Souligner (Ctrl + U). Trois zones, trois mises en forme !' })
    ] },
    etape7: { titre: 'Une police par strophe', images: [
      doc(base('centre gras capitales', 'sel centre', 'droite italique souligne'), { cible: 'L2', legende: 'Je sélectionne SEULEMENT la strophe 1.' }),
      doc(base('centre gras capitales', 'sel centre', 'droite italique souligne'), { cible: 'item-EB Garamond', menu: { sous: 'police', items: ['Arial', 'Calibri', 'EB Garamond', 'Arial Black'], hi: 'EB Garamond' }, legende: 'Menu des polices ▸ EB Garamond.' }),
      doc(base('centre gras capitales', 'sel centre garamond', 'droite italique souligne'), { police: 'EB Garamond', cible: 'taille', legende: 'Je clique dans la case du nombre, je tape 14, Enter.' }),
      doc(base('centre gras capitales', 'centre garamond grand', 'droite italique souligne'), { police: 'EB Garamond', taille: '14', cible: 'L2', ok: 1, legende: 'Seule la strophe 1 a changé. À la suivante !' })
    ] },
    etape8: { titre: 'Mon bloc-notes : la liste à puces', images: [
      doc(base('centre gras capitales', 'centre', 'droite italique souligne'), { cible: 'L7', legende: 'Je clique à la fin de la fable, après l’auteur.' }),
      doc(base('centre gras capitales', 'centre', 'droite italique souligne'), { cible: 'item-Saut de page', menu: { sous: 'm-insertion', items: ['Image ▸', 'Tableau ▸', 'Saut ▸', 'Saut de page'], hi: 'Saut de page' }, legende: 'Insertion ▸ Saut ▸ Saut de page (Ctrl + Enter).' }),
      doc([L('Jean de La Fontaine', 'droite italique souligne'), L('', 'saut'), L('Mon bloc-notes', 'gras')], { cible: 'L2', ok: 1, legende: 'Une nouvelle page commence : j’écris « Mon bloc-notes » en haut.' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis'), L('…'), L('…')], { cible: 'L3', legende: 'Sous le titre : une chose par ligne, Enter après chacune.' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'sel'), L('…', 'sel'), L('…', 'sel')], { cible: 'L1', legende: 'Je glisse la souris sur les 3 lignes : elles deviennent bleues.' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'sel'), L('…', 'sel'), L('…', 'sel')], { cible: 'puces', legende: 'Bouton Liste à puces (Ctrl + Shift + 8).' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'puce'), L('…', 'puce'), L('…', 'puce')], { cible: 'L1', ok: 1, legende: 'Un rond noir devant chaque ligne : c’est une liste à puces.' })
    ] },
    etape10: { titre: 'Mes gestes : la liste numérotée', images: [
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'puce'), L('…', 'puce'), L('…', 'puce'), L('Mes gestes', 'gras'), L('', 'sel')], { cible: 'numeros', legende: 'Sous « Mes gestes », Enter ▸ Liste numérotée (Ctrl + Shift + 7).' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'puce'), L('…', 'puce'), L('…', 'puce'), L('Mes gestes', 'gras'), L('', 'num')], { cible: 'L5', legende: 'Le numéro 1 apparaît : j’écris mon geste 1 à côté.' }),
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'puce'), L('…', 'puce'), L('…', 'puce'), L('Mes gestes', 'gras'), L('J’ai sélectionné le titre, puis Centrer.', 'num'), L('', 'num')], { cible: 'L6', ok: 1, legende: 'Enter : le numéro 2 apparaît tout seul.' })
    ] },
    etape11: { titre: 'Ma phrase : j’explique', images: [
      doc([L('Mon bloc-notes', 'gras'), L('le tapis', 'puce'), L('…', 'puce'), L('…', 'puce'), L('Mes gestes', 'gras'), L('J’ai sélectionné le titre, puis Centrer.', 'num'), L('…', 'num'), L('Pour changer une seule strophe, je…')], { cible: 'L7', ok: 1, legende: 'Et ma phrase pour finir.' })
    ] },
    etape9: { titre: 'Je m’évalue et je remets', images: [
      doc(base('centre gras capitales', 'centre garamond', 'droite italique souligne'), { cible: 'orthographe', legende: 'Vérifier l’orthographe (Ctrl + Alt + X).' }),
      devoir({ cible: 'instructions', legende: 'Classroom ▸ ma classe ▸ Travaux et devoirs ▸ le devoir ▸ Afficher les instructions. Je relis ma grille.' }),
      devoir({ cible: 'ajouter', legende: 'À droite, dans « Vos devoirs » : + Ajouter ou créer.' }),
      devoir({ menu: 1, cible: 'gdrive', legende: 'Je choisis Google Drive.' }),
      devoir({ picker: 1, cible: 'fichier', legende: 'Je clique sur mon document : ' + NOM + '.' }),
      devoir({ picker: 2, cible: 'inserer', legende: 'Il est sélectionné : je clique sur le bouton bleu, en bas à droite.' }),
      devoir({ joint: 1, cible: 'rendre', legende: 'Mon document apparaît sous « Vos devoirs ». Joindre ne suffit pas : Rendre le devoir.' }),
      devoir({ joint: 1, confirme: 1, cible: 'confirmer', legende: '« Rendre le devoir ? » : je confirme, Rendre le devoir une deuxième fois.' }),
      devoir({ joint: 1, remis: 1, cible: 'statut', ok: 1, legende: '« Vos devoirs » affiche Remis : c’est rendu. Bravo !' })
    ] },
    fermer: { titre: 'À la sonnerie : je ferme sans remettre', images: [ // À la sonnerie : je ferme sans remettre (encadré sous chaque étape)
      doc(base(), { cible: 'enregistre', legende: 'Je regarde : « Enregistré ». Docs garde tout seul.' }),
      doc(base(), { cible: 'onglet', ok: 1, legende: 'Je ferme l’onglet. Je ne remets PAS encore.' })
    ] },
    deconnecter: { titre: 'À la sonnerie : je me déconnecte de Windows', images: [ // encadré « À la sonnerie », geste 2 (pas-a-pas/demos-communs.js, vues win-*)
      { vue: 'win-bureau', cible: 'demarrer', legende: 'J’appuie sur la touche Windows ⊞ (ou je clique sur ⊞, en bas de l’écran).' },
      { vue: 'win-bureau', demarrer: 1, compte: 'Prénom Nom', cible: 'nom', legende: 'En bas à gauche du menu, je clique sur mon nom.' },
      { vue: 'win-bureau', demarrer: 1, compte: 'Prénom Nom', panneau: 1, cible: 'deconnecter', legende: 'En haut à droite du panneau : Se déconnecter.' },
      { vue: 'win-bureau', demarrer: 1, compte: 'Prénom Nom', alim: 1, cible: 'alimentation', legende: '⚠️ Pas le bouton ⏻ : il propose Verrouiller, Arrêter, Redémarrer. Pas « Se déconnecter ».' },
      { vue: 'win-cad', hi: 'Se déconnecter', cible: 'item-Se déconnecter', ok: 1, legende: 'Autre chemin : Ctrl + Alt + Delete ▸ Se déconnecter.' }
    ] },
    retrouver: { titre: 'Je reprends : je retrouve mon document dans Drive', images: [ // Je reprends : je retrouve mon document dans Drive (encadré « Je reprends »)
      { vue: 'g-gaufre', menu: 1, cible: 'app-drive', legende: 'Gaufre ▸ Drive.' },
      { ecran: 'drive', cible: 'recents', legende: 'Je clique sur « Récents », à gauche.' },
      { ecran: 'drive', cible: 'fichier', ok: 1, legende: 'Double-clic sur mon document : il s’ouvre.' }
    ] },
    cote: DemosCommuns.vueFractionnee({ titre: 'Le cours et mon document côte à côte', cours: '🐭 Mes cours – Le rat de ville', // pas-a-pas/demos-communs.js
      coursTitre: '🐭 Le rat de ville', coursLignes: ['☐ Menu Google ▸ Docs…', '☐ Je clique sur « Document sans titre »…'],
      doc: '📄 ' + NOM, quoi: 'mon document', docLignes: FABLE_MAJ.slice(0, 3), adresse: 'root75.github.io/campin-public/…',
      fin: 'Le cours à gauche, mon document à droite. Je clique dans mon document pour écrire.' })
  };

  const { el, c } = DemoLecteur;
  const ico = (nom, id) => { const b = c(el('span', 'md-btn'), id); const i = el('img'); i.src = ICO + nom + '.png'; i.alt = ''; b.append(i); return b; };

  function ecranDocs(f) {
    const e = el('div', 'md md-docs');
    const haut = el('div', 'md-haut');
    const onglet = c(el('span', 'md-onglet', f.nom.slice(0, 18) + '…  ✕'), 'onglet');
    haut.append(el('span', 'md-logo'), c(el('span', 'md-nom', f.nom), 'nom'), c(el('span', 'md-enreg', '☁ Enregistré'), 'enregistre'));
    const menus = el('div', 'md-menus');
    ['Fichier', 'Édition', 'Affichage', 'Insertion', 'Format', 'Outils'].forEach(m => menus.append(c(el('span', null, m), 'm-' + m.toLowerCase())));
    const barre = el('div', 'md-barre');
    barre.append(ico('orthographe', 'orthographe'), c(el('span', 'md-champ md-police', (f.police || 'Arial') + ' ▾'), 'police'), c(el('span', 'md-champ', f.taille || '11'), 'taille'),
      ico('gras', 'gras'), ico('italique', 'italique'), ico('souligne', 'souligne'),
      ico('centrer', 'centrer'), ico('droite', 'droite'), ico('puces', 'puces'), ico('numeros', 'numeros'));
    const page = c(el('div', 'md-page'), 'page');
    let n = 0;
    f.lignes.forEach((l, k) => {
      const p = c(el('p', 'md-l ' + l.c, l.t || ' '), 'L' + k);
      if (/num/.test(l.c)) p.dataset.n = ++n + '.';
      page.append(p);
    });
    e.append(onglet, haut, menus, barre, page);
    if (f.menu) e.append(menu(f.menu));
    return e;
  }
  function menu(m) {
    const box = el('div', 'md-menu' + (Array.isArray(m) ? ' md-menu-format' : ''));
    const items = Array.isArray(m) ? m : m.items;
    items.forEach((t, k) => { const li = c(el('div', 'md-item', t), 'item-' + t); if (Array.isArray(m) ? k === items.length - 1 : t === m.hi) li.classList.add('hi'); box.append(li); });
    return box;
  }
  function ecranAutre(f) {
    const e = el('div', 'md md-' + f.ecran);
    if (f.ecran === 'accueil') e.append(el('div', 'md-titre', 'Docs — Créer un document'), c(el('div', 'md-vierge', '+ Document vierge'), 'vierge'));
    if (f.ecran === 'drive') {
      const g = el('div', 'md-col'); ['Mon Drive', 'Récents', 'Corbeille'].forEach(t => g.append(c(el('span', null, t), t === 'Récents' ? 'recents' : '')));
      const d = el('div', 'md-liste'); d.append(c(el('div', 'md-fichier', '📄 ' + NOM), 'fichier'), el('div', 'md-fichier autre', '📄 Mon portrait chinois'));
      e.append(g, d);
    }
    return e;
  }

  /* Le lecteur est commun (pas-a-pas/demo-lecteur.js). Ici : le menu déroulant de Docs se place
     sous son ancre (menu.sous, sinon le menu Format). */
  const ecran = f => DemosCommuns.ecran(f) || (f.ecran === 'docs' ? ecranDocs(f) : ecranAutre(f));
  const Lect = DemoLecteur.lecteur({ demos: DEMOS, ecran, place: (e, f) => {
    const m = e.querySelector('.md-menu'), ancre = m && e.querySelector('[data-c="' + (f.menu.sous || 'm-format') + '"]');
    if (ancre) DemoLecteur.sousAncre(e, m, ancre, 170);
  } });
  /* Volet « Toutes les animations » de la page : retrouver n'importe quelle animation sans changer d'étape. */
  const details = document.getElementById('tutos'), liste = document.getElementById('tutos-liste'), vue = document.getElementById('tutos-vue');
  if (details && liste && vue) DemoLecteur.volet({ details, liste, vue, titre: true, cree: Lect.cree, entrees: Object.keys(DEMOS).map(cle => [cle, DEMOS[cle].titre]) });
  return { cree: Lect.cree, cles: Lect.cles };
})();

/* Labo 07 — démos animées « Regarde comment faire » : seulement les maquettes et les images.
   Le lecteur (scène, curseur, ◀ ▶) est commun : pas-a-pas/demo-lecteur.js, chargé avant ce fichier.
   Une image = un état de l'écran maquetté + l'élément que la souris vise + une légende.
   Maquettes Windows (Gestionnaire des tâches et ses Performances, GIMP, Banc d’essai, capture, Explorateur OneDrive,
   Alt + Tab, moniteur) et Docs ; le bureau, Démarrer, Chrome, la gaufre et le devoir Classroom sont communs
   (pas-a-pas/demos-communs.js). Valeurs et noms fictifs ; rien n'est enregistré.
   Le défi final n'a pas d'animation : il reste une situation à résoudre seul. */
const Demo = (() => {
  const NOM = 'LABO07_CoulissesPC_Prenom_Nom';
  const FICHIER = '2026-10-09_OneDrive.docx';
  // Vues communes à tous les cours (pas-a-pas/demos-communs.js) : Chrome, gaufre, bureau Windows, devoir Classroom.
  const devoir = DemosCommuns.devoir({ titre: 'Labo 07 — Dans les coulisses du PC', meta: ['M. Louviaux · 10 points'], fichier: NOM, autre: 'Le document qui obéit' });
  const BUREAU = { vue: 'win-bureau', taches: [['📝', 'ico-notes']] };   // le Bloc-notes du cas d'essai, dans la barre des tâches

  /* Les animations, par clé. */
  const DEMOS = {
    rapport: { titre: 'Créer et nommer mon rapport', images: [
      { vue: 'g-gaufre', cible: 'gaufre', legende: 'Dans Chrome, compte de l’école : je clique sur la gaufre ⋮⋮⋮, en haut à droite.' },
      { vue: 'g-gaufre', menu: 1, cible: 'app-docs', legende: 'Je choisis Docs.' },
      { ecran: 'accueil', cible: 'vierge', legende: 'Je clique sur « + Document vierge ».' },
      { ecran: 'docs', nom: 'Document sans titre', lignes: [''], cible: 'nom', legende: 'Je clique sur « Document sans titre », en haut à gauche.' },
      { ecran: 'docs', lignes: [''], cible: 'nom', legende: 'Je tape LABO07_CoulissesPC_Prenom_Nom, sans accents, puis Enter.' },
      { ecran: 'docs', lignes: [''], menu: { sous: 'm-edition', items: ['Couper', 'Copier', 'Coller', 'Coller sans mise en forme'], hi: 'Coller sans mise en forme' }, cible: 'item-Coller sans mise en forme', legende: 'Trame copiée : je clique dans la page ▸ Édition ▸ Coller sans mise en forme (Ctrl + Shift + V).' },
      { ecran: 'docs', lignes: ['Dans les coulisses du PC', 'Prénom Nom · classe · date', '1 — Observer ce qui tourne', '…'], cible: 'enregistre', ok: 1, legende: 'La trame est là, sans mise en forme. « Enregistré » : Docs garde tout seul.' }
    ] },
    cote: DemosCommuns.vueFractionnee({ titre: 'Mettre le cours et mon rapport côte à côte', cours: '🔎 Mes cours – Labo 07', // pas-a-pas/demos-communs.js
      coursTitre: '🔎 Mission 1', coursLignes: ['☐ Clic droit sur ⊞ Démarrer…'],
      doc: '📄 ' + NOM, quoi: 'mon rapport', docLignes: ['1 — Observer ce qui tourne'], adresse: 'script.google.com/…',
      fin: 'Le cours à gauche, mon rapport à droite. Je clique dans le rapport pour écrire.' }),
    gestionnaire: { titre: 'Ouvrir le Gestionnaire et lire les totaux', images: [
      { ...BUREAU, droit: 1, cible: 'demarrer', legende: 'Clic droit sur l’icône ⊞ Démarrer, en bas.' },
      { ...BUREAU, clicdroit: 'Gestionnaire des tâches', cible: 'item-Gestionnaire des tâches', legende: 'Je choisis « Gestionnaire des tâches » (ou Ctrl + Shift + Esc).' },
      { ecran: 'gestion', reduit: 1, cible: 'plus', legende: 'Seulement si la fenêtre est petite, sans colonnes : « Plus de détails », en bas à gauche. Sinon, rien à faire.' },
      { ecran: 'gestion', cible: 'processus', legende: 'À gauche : Processus.' },
      { ecran: 'gestion', cible: 'tot-cpu', legende: 'Le total Processeur se lit en haut de sa colonne.' },
      { ecran: 'gestion', cible: 'tot-mem', ok: 1, legende: 'Le total Mémoire aussi. Je note les deux, ligne Avant.' }
    ] },
    performances: { titre: 'Lire les caractéristiques de mon PC', images: [
      { ecran: 'gestion', perf: 'cpu', cible: 'performances', legende: 'À gauche : 📈 Performances.' },
      { ecran: 'gestion', perf: 'cpu', cible: 'perf-info', legende: 'Processeur : son nom en haut à droite, le nombre de cœurs sous le graphique. Exemple fictif.' },
      { ecran: 'gestion', perf: 'mem', cible: 'perf-info', legende: 'Mémoire : la quantité totale, en haut à droite. Ici 16,0 Go.' },
      { ecran: 'gestion', perf: 'disque', cible: 'perf-bas', ok: 1, legende: 'Disque 0 (C:) : la Capacité, sous le graphique. Je note les quatre informations dans « Mon PC ».' }
    ] },
    gimp: { titre: 'Ouvrir GIMP et créer une grande image', images: [
      { ...BUREAU, demarrer: 1, saisie: 'gimp', resultat: ['GIMP', 'app-gimp', '🦊'], cible: 'app-gimp', legende: '⊞ Démarrer ▸ je tape GIMP ▸ je clique UNE fois sur l’application.' },
      { ...BUREAU, ecran: 'bureau', chargement: 1, cible: 'chargement', legende: 'GIMP met 5 à 20 secondes à s’ouvrir. Je ne clique pas une deuxième fois. « Bienvenue dans GIMP » : je ferme par le ×.' },
      { ecran: 'gimp', dialogue: 'nouvelle', cible: 'valider', legende: 'Fichier ▸ Nouvelle image (Ctrl + N) : Largeur 10000, Hauteur 10000, unité px ▸ Valider.' },
      { ecran: 'gimp', dialogue: 'taille', cible: 'ok', legende: '« Confirmer la taille de l’image » : environ 932 Mo, plus que la taille prévue par GIMP. Je clique sur Valider.' },
      { ecran: 'gimp', image: 1, cible: 'toile', ok: 1, legende: 'L’image grise s’affiche. Je la laisse ouverte : GIMP la garde en mémoire.' }
    ] },
    banc: { titre: 'Faire calculer le PC avec le Banc d’essai', images: [
      { ecran: 'banc', cible: 'lancer', legende: 'Le Banc d’essai s’ouvre dans un nouvel onglet : je clique sur ▶ Lancer le calcul.' },
      { ecran: 'alttab', fenetres: ['Gestionnaire des tâches', 'Banc d’essai', 'GIMP'], hi: 0, cible: 'fen-0', legende: 'Tout de suite : Alt + Tab vers le Gestionnaire.' },
      { ecran: 'gestion', gimp: 1, cpu: '98 %', mem: '46 %', cible: 'tot-cpu', legende: 'Pendant le calcul : je relis les deux totaux. Valeurs fictives : les miennes peuvent différer.' },
      { ecran: 'banc', marche: 1, cible: 'arreter', legende: 'Je reviens sur l’onglet Banc d’essai : ■ Arrêter. GIMP reste ouvert.' },
      { ecran: 'gestion', gimp: 1, cpu: '6 %', mem: '46 %', cible: 'tot-mem', ok: 1, legende: 'Après 1 minute : le processeur est redescendu, la mémoire garde l’image de GIMP.' }
    ] },
    fintache: { titre: 'Arrêter GIMP avec Terminer la tâche', images: [
      { ecran: 'gestion', gimp: 1, cpu: '6 %', mem: '46 %', choisi: 1, cible: 'ligne-gimp', legende: 'Processus : je clique UNE fois sur la ligne GNU Image Manipulation Program.' },
      { ecran: 'gestion', gimp: 1, cpu: '6 %', mem: '46 %', choisi: 1, cible: 'terminer', legende: 'Bouton ⊘ Terminer la tâche, en haut (ou touche Delete). GIMP se ferme sans rien demander : l’image est perdue.' },
      { ecran: 'gestion', cpu: '5 %', mem: '41 %', cible: 'tot-mem', ok: 1, legende: '10 secondes plus tard : GIMP a disparu, la mémoire est libérée. Ligne Après fin de tâche.' }
    ] },
    tableau: { titre: 'Insérer le tableau de mesures dans Docs', images: [
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne', ''], cible: 'L1', legende: 'Je clique sous le titre de la partie 1.' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne', ''], menu: { sous: 'm-insertion', items: ['Image ▸', 'Tableau ▸', 'Dessin ▸', 'Graphique ▸'], hi: 'Tableau ▸' }, cible: 'item-Tableau ▸', legende: 'Insertion ▸ Tableau.' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne', ''], grille: 1, menu: { sous: 'm-insertion', items: ['Image ▸', 'Tableau ▸'], hi: 'Tableau ▸' }, cible: 'g-3x5', legende: 'Je glisse sur la grille jusqu’à 3 × 5 : trois colonnes, cinq lignes.' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne'], table: 1, cible: 'table', ok: 1, legende: 'En-têtes Moment / Processeur (%) / Mémoire (%), puis Avant, Pendant le calcul, Après 1 min, Après fin de tâche.' }
    ] },
    capture: { titre: 'Capturer, coller et légender', images: [
      { ecran: 'gestion', gimp: 1, cpu: '6 %', mem: '46 %', cible: 'tot-cpu', legende: 'GIMP encore ouvert, après le relevé d’1 minute : Windows + Shift + S (ou ⊞ Démarrer ▸ Outil Capture d’écran ▸ Nouveau).' },
      { ecran: 'gestion', gimp: 1, cpu: '6 %', mem: '46 %', capture: 1, cible: 'zone', legende: 'Rectangle : je sélectionne seulement les noms utiles et les colonnes Processeur / Mémoire.' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne'], table: 1, image: 1, cible: 'image', legende: 'Dans le rapport : Édition ▸ Coller (Ctrl + V).' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne'], table: 1, image: 1, poignee: 1, cible: 'coin', legende: 'Je redimensionne par un COIN : l’image garde ses proportions.' },
      { ecran: 'docs', lignes: ['1 — Observer ce qui tourne'], table: 1, image: 1, legendeImg: 1, cible: 'legende-img', ok: 1, legende: 'Sous l’image, une légende : ce qu’elle montre, et sa limite.' }
    ] },
    onedrive: { titre: 'Retrouver mon fichier OneDrive et lire son statut', images: [
      { ...BUREAU, cible: 'explorateur', legende: 'Icône 📁 Explorateur dans la barre des tâches (ou Windows + E).' },
      { ecran: 'explo', cible: 'od', legende: 'Volet gauche : le nuage OneDrive de l’école.' },
      { ecran: 'explo', dossier: 1, cible: 'dossier', legende: 'J’ouvre le dossier de mon fichier, par exemple Documents ▸ Informatique.' },
      { ecran: 'explo', dossier: 1, choisi: 1, cible: 'fichier', legende: 'Un SEUL clic sur le fichier : je le sélectionne sans l’ouvrir.' },
      { ecran: 'explo', dossier: 1, choisi: 1, chemin: 1, cible: 'chemin', legende: 'Ctrl + L : la barre d’adresse affiche le chemin complet. Je le recopie.' },
      { ecran: 'explo', dossier: 1, choisi: 1, cible: 'statut', legende: 'Afficher ▸ Détails : la colonne Statut montre l’icône du fichier.' },
      { ecran: 'icones', cible: 'ico-nuage', ok: 1, legende: 'Nuage = en ligne seulement · coche verte bordée = disponible ici · disque vert plein = toujours conservé.' }
    ] },
    calculatrice: { titre: 'Ouvrir la Calculatrice', images: [
      { ...BUREAU, cible: 'demarrer', legende: 'Je clique sur ⊞ Démarrer, en bas de l’écran.' },
      { ...BUREAU, demarrer: 1, saisie: 'calculatrice', resultat: ['Calculatrice', 'app-calc', '🧮'], cible: 'app-calc', ok: 1, legende: 'Je tape Calculatrice ▸ je clique sur l’application.' }
    ] },
    blocnotes: { titre: 'Ouvrir Bloc-notes, puis une seconde fenêtre', images: [
      { ...BUREAU, demarrer: 1, saisie: 'bloc-notes', resultat: ['Bloc-notes', 'app-notes', '📝'], cible: 'app-notes', legende: '⊞ Démarrer ▸ je tape Bloc-notes ▸ je clique sur l’application.' },
      { ...BUREAU, ecran: 'bureau', notes: 1, cible: 'zone-notes', ok: 1, legende: 'Bloc-notes est ouvert. Pour une seconde fenêtre : Fichier ▸ Nouvelle fenêtre (Ctrl + Shift + N).' }
    ] },
    fenetres: { titre: 'Une fenêtre a disparu : la retrouver', images: [
      { ...BUREAU, ecran: 'bureau', notes: 1, cible: 'reduire', legende: 'Cas d’essai : je clique sur — Réduire. La fenêtre disparaît, le logiciel tourne encore.' },
      { ...BUREAU, cible: 'ico-notes', legende: 'Je la retrouve par son icône dans la barre des tâches…' },
      { ecran: 'alttab', fenetres: ['Bloc-notes', 'Explorateur', 'Mes cours'], hi: 0, cible: 'fen-0', legende: '… ou Alt + Tab : je garde Alt enfoncé, Tab jusqu’à la bonne fenêtre.' },
      { ...BUREAU, ecran: 'bureau', notes: 1, cible: 'zone-notes', ok: 1, legende: 'Le texte arrive dans la fenêtre ACTIVE : je clique d’abord dans la zone de texte.' }
    ] },
    moniteur: { titre: 'Écran noir : le moniteur ou le PC ?', images: [
      { ecran: 'moniteur', eteint: 1, cible: 'ecran', legende: 'Écran noir. Hypothèse : seul le moniteur est éteint, le PC tourne encore.' },
      { ecran: 'moniteur', eteint: 1, cible: 'bouton', legende: 'Test sans risque : le bouton du MONITEUR, montré par le professeur. Je ne touche pas au PC.' },
      { ecran: 'moniteur', cible: 'ecran', ok: 1, legende: 'Les mêmes fenêtres réapparaissent : le PC était resté allumé.' }
    ] },
    remise: { titre: 'Joindre mon rapport et le remettre', images: [
      { ecran: 'docs', lignes: ['Dans les coulisses du PC', '1 — Observer ce qui tourne', '…'], cible: 'enregistre', legende: 'Dans Docs : « Enregistré ». Je relis ma grille en fin de rapport.' },
      devoir({ cible: 'ajouter', legende: 'Classroom ▸ ma classe ▸ Travaux et devoirs ▸ Labo 07 ▸ + Ajouter ou créer.' }),
      devoir({ menu: 1, cible: 'gdrive', legende: 'Je choisis Google Drive.' }),
      devoir({ picker: 1, cible: 'fichier', legende: 'Je clique sur ' + NOM + '…' }),
      devoir({ picker: 2, cible: 'inserer', legende: '… puis sur le bouton bleu, en bas à droite.' }),
      devoir({ joint: 1, cible: 'rendre', legende: 'Joindre ne suffit pas : Rendre le devoir.' }),
      devoir({ joint: 1, confirme: 1, cible: 'confirmer', legende: '« Rendre le devoir ? » : je confirme, Rendre le devoir une deuxième fois.' }),
      devoir({ joint: 1, remis: 1, cible: 'statut', ok: 1, legende: '« Remis » : c’est envoyé. Remise unique, à la toute fin de l’enquête.' })
    ] }
  };
  /* Quelle image va sous quelle case : champ `demos` de chaque bloc, dans fiche.js (moteur commun blocs.js). */

  const { el, c } = DemoLecteur;
  const menu = m => {
    const box = el('div', 'md-menu'); box.dataset.sous = m.sous || '';
    m.items.forEach(t => { const li = c(el('div', 'md-item', t), 'item-' + t); if (t === m.hi) li.classList.add('hi'); box.append(li); });
    return box;
  };

  function docs(f) {
    const e = el('div', 'md md-docs');
    const haut = el('div', 'md-haut');
    haut.append(el('span', 'md-logo'), c(el('span', 'md-nom', f.nom || NOM), 'nom'), c(el('span', 'md-enreg', '☁ Enregistré'), 'enregistre'));
    const menus = el('div', 'md-menus');
    ['Fichier', 'Édition', 'Affichage', 'Insertion', 'Format', 'Outils'].forEach(m => menus.append(c(el('span', null, m), 'm-' + m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))));
    const page = c(el('div', 'md-page'), 'page');
    (f.lignes || []).forEach((t, k) => page.append(c(el('p', 'md-l' + (/^\d —/.test(t) ? ' titre' : ''), t || ' '), 'L' + k)));
    if (f.table) {
      const t = c(el('table', 'md-table'), 'table');
      [['Moment', 'Processeur (%)', 'Mémoire (%)'], ['Avant', '5', '40'], ['Pendant le calcul', '98', '46'], ['Après 1 min', '6', '46'], ['Après fin de tâche', '5', '41']]
        .forEach((r, i) => { const tr = el('tr'); r.forEach(x => tr.append(el(i ? 'td' : 'th', null, x))); t.append(tr); });
      page.append(t);
    }
    if (f.image) {
      const im = c(el('div', 'md-image' + (f.poignee ? ' poignee' : '')), 'image');
      im.append(el('span', null, 'Processus · Processeur 6 % · Mémoire 46 %'), c(el('i', 'md-coin'), 'coin'));
      page.append(im);
      if (f.legendeImg) page.append(c(el('p', 'md-l md-leg', 'Capture du Gestionnaire 1 min après le calcul : GIMP garde l’image. D’autres logiciels tournent aussi.'), 'legende-img'));
    }
    e.append(haut, menus, page);
    if (f.menu) {
      const m = menu(f.menu); e.append(m);
      if (f.grille) {
        const g = el('div', 'md-grille');
        for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) g.append(el('i', r < 5 && k < 3 ? 'on' : ''));
        g.append(c(el('b', null, '3 × 5'), 'g-3x5')); m.append(g);
      }
    }
    return e;
  }

  function fenetre(titre, corps, id) {
    const w = el('div', 'md-fen'); const t = el('div', 'md-fen-titre');
    t.append(el('span', null, titre), c(el('span', 'md-fen-btn', '—'), 'reduire'), el('span', 'md-fen-btn', '☐'), el('span', 'md-fen-btn', '✕'));
    w.append(t, corps); if (id) c(w, id); return w;
  }

  /* Le bureau commun, et ce qu'il porte ici : la fenêtre du Bloc-notes, GIMP qui démarre. */
  function bureau(f) {
    const e = DemosCommuns.bureau(f), fond = e.querySelector('.md-win-fond');
    if (f.notes) fond.append(fenetre('Sans titre – Bloc-notes', c(el('div', 'md-notes-zone', 'Mot d’essai|'), 'zone-notes')));
    if (f.chargement) fond.append(c(el('div', 'md-win-charge', '⏳ GIMP démarre…'), 'chargement'));
    return e;
  }

  function ecran(f) {
    if (f.ecran === 'bureau') return bureau(f);
    const commun = DemosCommuns.ecran(f); if (commun) return commun;
    if (f.ecran === 'docs') return docs(f);
    const e = el('div', 'md md-' + f.ecran);
    if (f.ecran === 'accueil') e.append(el('div', 'md-titre', 'Docs — Créer un document'), c(el('div', 'md-vierge', '+ Document vierge'), 'vierge'));
    if (f.ecran === 'gestion') {
      const corps = el('div', 'md-tm');
      const nav = el('div', 'md-tm-nav'); nav.append(c(el('span', f.perf ? null : 'on', '☰ Processus'), 'processus'), c(el('span', f.perf ? 'on' : null, '📈 Performances'), 'performances'), el('span', null, '🕘 Historique'));
      if (f.reduit) { corps.append(el('div', 'md-tm-petit', 'Google Chrome\nExplorateur Windows'), c(el('span', 'md-tm-plus', '⌄ Plus de détails'), 'plus')); }
      else if (f.perf) {
        const P = { cpu: ['Processeur', 'Intel(R) Core(TM) i5 (exemple)', 'Utilisation 5 % · Cœurs : 6'], mem: ['Mémoire', '16,0 Go', 'En cours d’utilisation 6,4 Go · Disponible 9,6 Go'], disque: ['Disque 0 (C:)', 'SSD (exemple)', 'Capacité : 477 Go'] };
        const v = el('div', 'md-tm-perf'), liste = el('div', 'md-tm-res'), det = el('div', 'md-tm-det');
        [['cpu', 'Processeur\n5 %'], ['mem', 'Mémoire\n6,4/16,0 Go (40 %)'], ['disque', 'Disque 0 (C:)\nSSD 1 %']].forEach(([k, x]) => liste.append(el('span', k === f.perf ? 'on' : null, x)));
        const [titre, info, bas] = P[f.perf];
        const tete = el('div', 'md-tm-det-tete'); tete.append(el('b', null, titre), c(el('span', null, info), 'perf-info'));
        det.append(tete, el('div', 'md-tm-graphe'), c(el('div', 'md-tm-bas', bas), 'perf-bas'));
        v.append(liste, det); corps.append(nav, v);
      } else {
        const outils = el('div', 'md-tm-outils'); outils.append(el('b', null, 'Processus'), c(el('span', null, '⊘ Terminer la tâche'), 'terminer'));
        const t = el('table', 'md-tm-table'); const h = el('tr');
        h.append(el('th', null, 'Nom'), c(el('th', 'md-tm-tot', (f.cpu || '5 %') + '\nProcesseur'), 'tot-cpu'), c(el('th', 'md-tm-tot', (f.mem || '40 %') + '\nMémoire'), 'tot-mem')); t.append(h);
        const lignes = [['Google Chrome', f.cpu === '98 %' ? '92 %' : '1,2 %', '780 Mo'], ['Explorateur Windows', '0,3 %', '95 Mo'], ['Microsoft OneDrive', '0,1 %', '60 Mo']];
        if (f.gimp) lignes.unshift(['GNU Image Manipulation Program', '0,1 %', '1 050 Mo']);
        lignes.forEach((r, i) => { const tr = el('tr', f.gimp && !i && f.choisi ? 'choisi' : null); r.forEach(x => tr.append(el('td', null, x))); if (f.gimp && !i) c(tr, 'ligne-gimp'); t.append(tr); });
        const d = el('div'); d.append(outils, t); corps.append(nav, d);
      }
      const w = fenetre('Gestionnaire des tâches', corps); e.append(w);
      if (f.capture) { const v = el('div', 'md-voile'); v.append(el('div', 'md-cap-barre', '▭ Rectangle  ✕')); e.append(v, c(el('div', 'md-cap-zone'), 'zone')); }
    }
    if (f.ecran === 'gimp') {
      const w = el('div', 'md-gimp-fen'), barre = el('div', 'md-gimp-menus');
      ['Fichier', 'Édition', 'Sélection', 'Affichage', 'Image', 'Calque', 'Filtres'].forEach(m => barre.append(c(el('span', null, m), 'm-' + m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))));
      w.append(el('div', 'md-gimp-titre', '🦊 GNU Image Manipulation Program'), barre, c(el('div', 'md-gimp-toile' + (f.image ? ' image' : ''), f.image ? '10000 × 10000 px' : ''), 'toile'));
      e.append(w);
      if (f.dialogue === 'nouvelle') {
        const d = el('div', 'md-gimp-dlg'); d.append(el('b', null, 'Créer une nouvelle image'));
        [['Largeur :', '10000'], ['Hauteur :', '10000']].forEach(([n, v]) => { const l = el('div', 'md-gimp-champ'); l.append(el('span', null, n), el('i', null, v), el('span', null, 'px')); d.append(l); });
        const pied = el('div', 'md-gimp-pied'); pied.append(el('span', null, 'Réinitialiser'), c(el('span', 'plein', 'Valider'), 'valider'), el('span', null, 'Annuler')); d.append(pied); e.append(d);
      }
      if (f.dialogue === 'taille') {
        const d = el('div', 'md-gimp-dlg'); d.append(el('b', null, 'Confirmer la taille de l’image'), el('p', null, '⚠ Vous essayez de créer une image avec une taille de 932,0 MB.'));
        const pied = el('div', 'md-gimp-pied'); pied.append(c(el('span', 'plein', 'Valider'), 'ok'), el('span', null, 'Annuler')); d.append(pied); e.append(d);
      }
      if (f.menu) e.append(menu(f.menu));
    }
    if (f.ecran === 'banc') {
      const pg = el('div', 'md-banc');
      pg.append(el('b', null, 'Banc d’essai'), el('span', 'md-banc-doux', 'Ce PC : 12 processeurs logiques.'), el('span', null, '1. Faire travailler le processeur'));
      const l = el('div', 'md-banc-ligne');
      l.append(c(el('span', 'md-banc-btn' + (f.marche ? '' : ' plein'), '▶ Lancer le calcul'), 'lancer'), c(el('span', 'md-banc-btn', '■ Arrêter'), 'arreter'),
        el('span', 'md-banc-etat', f.marche ? '12 processeurs logiques au travail · 8 s' : 'À l’arrêt.'));
      pg.append(l); e.append(pg);
    }
    if (f.ecran === 'alttab') {
      const r = el('div', 'md-alttab');
      f.fenetres.forEach((t, k) => r.append(c(el('div', 'md-alt-fen' + (k === f.hi ? ' hi' : ''), t), 'fen-' + k)));
      e.append(r, el('div', 'md-alt-touches', 'Alt + Tab'));
    }
    if (f.ecran === 'explo') {
      const corps = el('div', 'md-ex');
      const adr = c(el('div', 'md-ex-adresse' + (f.chemin ? ' chemin' : ''), f.chemin ? 'C:\\Users\\prenom.nom\\OneDrive - Athénée Royal Robert Campin\\Documents\\Informatique' : (f.dossier ? 'OneDrive - Athénée… › Documents › Informatique' : 'OneDrive - Athénée…')), 'chemin');
      const gauche = el('div', 'md-ex-gauche'); gauche.append(el('span', null, '🏠 Accueil'), c(el('span', 'od', '☁ OneDrive - Athénée…'), 'od'), el('span', null, '💻 Ce PC'));
      const liste = el('div', 'md-ex-liste');
      const tete = el('div', 'md-ex-ligne tete'); tete.append(el('span', null, 'Nom'), c(el('span', null, 'Statut'), 'statut'), el('span', null, 'Modifié le')); liste.append(tete);
      const lignes = f.dossier ? [[FICHIER, '✅', '09/10/2026', 'fichier'], ['Notes labo.docx', '☁', '25/09/2026', '']] : [['📁 Documents', '✅', '09/10/2026', 'dossier'], ['📁 Images', '☁', '12/09/2026', '']];
      lignes.forEach(([n, s, d, id]) => { const l = c(el('div', 'md-ex-ligne' + (f.choisi && id === 'fichier' ? ' choisi' : '')), id); l.append(el('span', null, n), el('span', 'md-ex-statut', s), el('span', null, d)); liste.append(l); });
      corps.append(adr, gauche, liste);
      e.append(fenetre('Explorateur de fichiers', corps));
    }
    if (f.ecran === 'icones') {
      const g = el('div', 'md-icones');
      [['☁', 'En ligne seulement', 'le contenu se télécharge s’il y a du réseau', 'ico-nuage'], ['✅', 'Disponible sur cet appareil', 'cercle blanc bordé de vert', 'ico-local'], ['💚', 'Toujours conserver', 'disque vert plein, coche blanche', 'ico-garde']]
        .forEach(([i, t, d, id]) => { const b = c(el('div', 'md-ico-carte'), id); b.append(el('span', 'md-ico-grand', i), el('b', null, t), el('small', null, d)); g.append(b); });
      e.append(g, el('p', 'md-ico-note', 'J’observe sans changer : ni « Libérer de l’espace », ni « Toujours conserver ».'));
    }
    if (f.ecran === 'moniteur') {
      const m = el('div', 'md-moni'); const ec = c(el('div', 'md-moni-ecran' + (f.eteint ? ' noir' : '')), 'ecran');
      if (!f.eteint) ec.append(el('span', null, '📝 Bloc-notes · 📁 Explorateur · 🌐 Mes cours'));
      m.append(ec, c(el('span', 'md-moni-bouton' + (f.eteint ? '' : ' on'), '⏻'), 'bouton'));
      e.append(m, el('div', 'md-moni-pied'), el('div', 'md-moni-pc', 'PC (unité centrale) : on n’y touche pas'));
    }
    return e;
  }

  /* Le lecteur et le volet sont communs (pas-a-pas/demo-lecteur.js). Ici : le menu déroulant de Docs
     se place sous le menu de la barre qui l'ouvre (data-sous). */
  const L = DemoLecteur.lecteur({ demos: DEMOS, ecran, pas: 2800, place: e => {
    const m = e.querySelector('.md-menu'), ancre = m && m.dataset.sous && e.querySelector('[data-c="' + m.dataset.sous + '"]');
    if (ancre) DemoLecteur.sousAncre(e, m, ancre, 190, 4);
  } });

  /* Le volet « Toutes les animations » : un bouton par animation, sans changer d'étape. */
  function volet(conteneur) {
    const liste = el('div', 'demo-liste'), vue = el('div', 'demo-vue');
    conteneur.append(liste, vue);
    DemoLecteur.volet({ details: conteneur, liste, vue, cree: L.cree, entrees: Object.keys(DEMOS).map(cle => [cle, '👀 ' + DEMOS[cle].titre]) });
  }

  return { cree: L.cree, volet, cles: L.cles };
})();
/* Le volet « Toutes les animations », dans l'en-tête de la fiche. */
(() => { const v = document.getElementById('demo-tout'); if (v) Demo.volet(v); })();

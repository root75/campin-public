/* Démos animées « Regarde comment faire » des fiches Python (python-1, python-2, python-3), sur le modèle du
   Rat de ville : une mini-maquette (Bureau Windows, Explorateur, Thonny, Chrome) rejoue chaque geste
   du bloc. Aucune donnée élève ; rien n'est enregistré.
   Les démos sont déclarées dans le fiche.js de chaque cours : const DEMOS_FICHE = { numéro de bloc
   (0 = bloc 1) : { titre, replie?, images:[…] } }. Une image = un écran + l'élément que la souris
   va cliquer (cible) + une légende. Ici, seulement les écrans : le lecteur est commun
   (pas-a-pas/demo-lecteur.js), le bureau Windows et la fenêtre de Chrome aussi (pas-a-pas/demos-communs.js).
   Chargé après fiche.js, demo-lecteur.js et demos-communs.js, avant blocs.js :
   blocs.js appelle Demo.pour(i) en mode « missions ».
   Règle : une démo ne montre jamais la réponse d'une question de preuve (code caché par des barres
   grises, nom d'erreur masqué, indice arrêté avant la solution).
   Libellés Windows 11, Thonny et Chrome relevés de mémoire : à vérifier sur un poste de la B101. */
const Demo = (() => {
  const DEMOS = typeof DEMOS_FICHE !== 'undefined' ? DEMOS_FICHE : {};
  const FICHIER_DEFAUT = '01_Les-vies_Nom.py';   // une image peut donner fichier: '…' (python-3)
  const { el, c } = DemoLecteur;

  /* ===== Les écrans ===== */
  // Le bureau Windows et la fenêtre de Chrome sont communs à tous les cours : pas-a-pas/demos-communs.js.
  const ecranBureau = f => DemosCommuns.bureau(f.demarrer ? { ...f, saisie: 'Thonny', resultat: ['Thonny', 'app-thonny', 'Th'] } : f);
  function ecranExplorateur(f) {
    const e = el('div', 'md md-explo');
    e.append(el('div', 'md-ex-titre', '📁 ' + f.lieu));
    const cmd = el('div', 'md-ex-cmd');
    cmd.append(c(el('span', 'md-ex-nouveau', '⊕ Nouveau ▾'), 'nouveau'), el('span', null, '✂'), el('span', null, '📋'), el('span', null, '⇅ Trier ▾'), el('span', null, '☰ Afficher ▾'));
    e.append(cmd, el('div', 'md-ex-adresse', f.lieu === 'Accueil' ? '⌂ › Accueil' : '› Ce PC › Documents'));
    const corps = el('div', 'md-ex-corps'), nav = el('div', 'md-ex-nav'), liste = el('div', 'md-ex-liste');
    [['⌂ Accueil', ''], ['🖥 Bureau', ''], ['⬇ Téléchargements', ''], ['📄 Documents', 'nav-documents'], ['🖼 Images', ''], ['🎵 Musique', '']]
      .forEach(([t, id]) => { const s = el('span', (f.lieu === 'Documents' && id) ? 'actif' : '', t); if (id) c(s, id); nav.append(s); });
    if (f.lieu === 'Accueil') { liste.append(el('div', 'md-ex-sec', 'Accès rapide')); ['🖥 Bureau', '⬇ Téléchargements', '📄 Documents'].forEach(t => liste.append(el('div', 'md-ex-f', t))); }
    else {
      liste.append(el('div', 'md-ex-sec', 'Nom'), el('div', 'md-ex-f', '📁 Labo'));
      if (f.neuf) { const n = c(el('div', 'md-ex-f md-ex-neuf'), 'neuf'); n.append('📁 ', el('span', f.neuf === 'Nouveau dossier' ? 'sel' : 'saisie', f.neuf)); liste.append(n); }
      if (f.python) liste.append(c(el('div', 'md-ex-f md-ex-choisi', '📁 Python'), 'dossier-python'));
    }
    corps.append(nav, liste); e.append(corps);
    if (f.menu) {
      const m = el('div', 'md-menu md-ex-menu');
      [['📁 Dossier', 'item-dossier'], ['🔗 Raccourci', ''], ['📝 Document texte', '']].forEach(([t, id]) => m.append(c(el('div', 'md-item' + (id ? ' hi' : ''), t), id || 'x')));
      e.append(m);
    }
    return e;
  }
  /* Thonny. lignes : n lignes cachées (barres grises) ; code : [[texte, classe]] où classe vaut
     'cache' (barre), 'com' (commentaire, barre verte), 'sel' (ligne en cours) ou ''. */
  function ecranThonny(f) {
    const e = el('div', 'md md-thonny');
    e.append(el('div', 'md-th-titre', 'Thonny  -  ' + (f.nom === '<sans nom>' ? f.nom : 'Documents\\Python\\' + f.nom) + '  @  1 : 1'));
    const menus = el('div', 'md-th-menus');
    ['Fichier', 'Édition', 'Affichage', 'Exécuter', 'Outils', 'Aide'].forEach((m, k) => menus.append(c(el('span', null, m), k ? 'x' : 'm-fichier')));
    const outils = el('div', 'md-th-outils');
    outils.append(el('span', 'md-th-b', '📄'), el('span', 'md-th-b', '📂'), c(el('span', 'md-th-b', '💾'), 'th-enregistrer'),
      c(el('span', 'md-th-b md-th-run', '▶'), 'th-executer'), el('span', 'md-th-b', '🐞'), el('span', 'md-th-b md-th-stop', '■'));
    const onglet = c(el('span', 'md-th-onglet', f.nom + (f.modifie ? ' *' : '')), 'th-onglet');
    const ed = c(el('div', 'md-th-editeur'), 'th-editeur');
    const code = f.code || Array.from({ length: f.lignes || 0 }, () => ['', 'cache']);
    for (let k = 0; k < Math.max(3, code.length); k++) {
      const l = c(el('div', 'md-th-l'), 'L' + k); l.append(el('span', 'md-th-num', String(k + 1)));
      const [t, cl] = code[k] || ['', 'vide'];
      if (cl === 'cache' || cl === 'com') l.append(el('span', 'md-th-code w' + (k % 3) + (cl === 'com' ? ' com' : '')));   // une ligne de TON code, cachée
      else if (cl !== 'vide') l.append(el('code', 'md-th-t ' + cl, t));
      ed.append(l);
    }
    const cons = c(el('div', 'md-th-console'), 'th-console');
    cons.append(el('div', 'md-th-ctitre', 'Console'));
    if (f.run) cons.append(el('div', 'md-th-run-l', '>>> %Run ' + f.nom));
    /* question : un input() qui attend ; tape : la réponse tapée ; resultat : ce qui s'affiche ensuite. */
    if (f.run && f.question) { const q = el('div', 'md-th-res', f.question); q.append(el('b', null, f.tape || '▌')); cons.append(q); }
    if (f.run && !f.erreur && (!f.question || f.resultat)) cons.append(el('div', 'md-th-res', '…le nombre affiché par TON programme'));
    if (f.erreur) {
      cons.append(el('div', 'md-th-err', 'Traceback (most recent call last):'), el('div', 'md-th-err', '  File "…\\' + f.nom + '", line 3'));
      const d = c(el('div', 'md-th-err md-th-der'), 'th-erreur'); d.append(el('span', 'md-th-masque', '▢▢▢▢'), 'Error: …'); cons.append(d);
    }
    if (!f.question || f.resultat) cons.append(el('div', null, '>>> '));
    e.append(menus, outils, onglet, ed, cons);
    if (f.menu) {
      const m = el('div', 'md-menu md-th-menu');
      [['Nouveau', 'Ctrl+N', 'item-nouveau'], ['Ouvrir…', 'Ctrl+O', 'item-ouvrir'], ['Enregistrer', 'Ctrl+S', ''], ['Enregistrer sous…', 'Ctrl+Shift+S', 'item-sous'], ['Quitter', 'Alt+F4', '']]
        .forEach(([t, r, id]) => { const i = c(el('div', 'md-item' + (id === f.menu ? ' hi' : '')), id || 'x'); i.append(el('span', null, t), el('small', null, r)); m.append(i); });
      e.append(m);
    }
    if (f.dialogue) e.append(dialogue(f));
    return e;
  }
  /* Fenêtre Windows « Enregistrer sous » ou « Ouvrir ». dialogue : 1 = dans Documents, 2 = dans Python. */
  function dialogue(f) {
    const ouvrir = f.ouvrir, d = el('div', 'md-dlg'), FICHIER = f.fichier || FICHIER_DEFAUT;
    d.append(el('div', 'md-dlg-titre', ouvrir ? 'Ouvrir' : 'Enregistrer sous'), el('div', 'md-ex-adresse', f.dialogue === 2 ? '› Documents › Python' : '› Documents'));
    const corps = el('div', 'md-dlg-corps'), nav = el('div', 'md-ex-nav'), liste = el('div', 'md-ex-liste');
    [['🖥 Bureau', ''], ['📄 Documents', 'dlg-documents'], ['⬇ Téléchargements', '']].forEach(([t, id]) => { const s = el('span', id ? 'actif' : '', t); if (id) c(s, id); nav.append(s); });
    if (f.dialogue === 1) liste.append(el('div', 'md-ex-f', '📁 Labo'), c(el('div', 'md-ex-f', '📁 Python'), 'dlg-python'));
    else if (ouvrir) liste.append(c(el('div', 'md-ex-f' + (f.choisi ? ' md-ex-choisi' : ''), '🐍 ' + FICHIER), 'dlg-fichier'));
    else liste.append(el('div', 'md-ex-vide', 'Aucun élément ne correspond.'));
    corps.append(nav, liste);
    const nom = el('div', 'md-dlg-ligne'); nom.append(el('span', null, 'Nom du fichier :'), c(el('span', 'md-dlg-champ', (f.dialogue === 2 && (!ouvrir || f.choisi)) ? FICHIER : ''), 'dlg-nom'));
    const type = el('div', 'md-dlg-ligne'); type.append(el('span', null, 'Type :'), el('span', 'md-dlg-champ eteint', 'Python files (*.py)'));
    const pied = el('div', 'md-dlg-pied'); pied.append(c(el('span', 'md-dlg-btn md-dlg-plein', ouvrir ? 'Ouvrir' : 'Enregistrer'), ouvrir ? 'dlg-ouvrir' : 'dlg-enregistrer'), el('span', 'md-dlg-btn', 'Annuler'));
    d.append(corps, nom, type, pied);
    return d;
  }
  /* Chrome : la fiche et la page « Python — je révise ». page : 'fiche', 'revise' ou 'quiz'. */
  function ecranChrome(f) {
    const onglets = [['🐍 ' + (f.fiche || 'Python 02 — pas à pas'), 'ch-fiche', f.page === 'fiche']];
    if (f.page !== 'fiche' || f.deux) onglets.push(['🐍 Python — je révise', 'ch-revise', f.page !== 'fiche']);
    const contenu = [];
    if (f.page === 'fiche') {
      const p = el('p', 'md-ch-texte'); p.append('Ouvre ', c(el('span', 'md-ch-lien', 'Python — je révise'), 'ch-lien'), ' : un nouvel onglet s’ouvre.');
      contenu.push(el('b', null, '1. Le quiz « Python — je révise »'), el('span', 'md-ch-barre'), p, el('span', 'md-ch-barre court'));
    } else {
      const o = el('div', 'md-ch-sous');
      [['L’essentiel', ''], ['Quiz', 'ch-quiz'], ['Cartes', '']].forEach(([t, id]) => o.append(c(el('span', (f.page === 'quiz' && id) ? 'actif' : '', t), id || 'x')));
      contenu.push(el('b', null, 'Premiers pas en Python — je révise'), o);
      if (f.page === 'quiz') contenu.push(el('p', 'md-ch-texte', '5 questions. Rien n’est coté.'), c(el('span', 'md-ch-bouton', 'Commencer le quiz'), 'ch-commencer'));
      else contenu.push(el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    }
    return DemosCommuns.chrome({ onglets, adresse: f.page === 'fiche' ? 'script.google.com/…' : 'root75.github.io/campin-public/python-je-revise/', corps: 'page', contenu });
  }
  function ecranVerres(f) {
    const e = el('div', 'md md-verres');
    [['a', f.a, 'v-a'], ['b', f.b, 'v-b'], ['temp', f.t, 'v-t']].forEach(([nom, contenu, id]) => {
      const v = el('div', 'md-verre'), verre = c(el('div', 'md-v ' + (contenu || 'vide')), id);
      verre.append(el('span', 'md-v-liquide'));
      if (f.barre === nom) verre.append(el('span', 'md-v-perdu', '✗'));
      v.append(verre, el('b', null, nom), el('small', null, contenu || 'vide'));
      e.append(v);
    });
    return e;
  }
  const ECRANS = { bureau: ecranBureau, explorateur: ecranExplorateur, thonny: ecranThonny, chrome: ecranChrome, verres: ecranVerres };

  /* ===== Le lecteur, commun à tous les cours : pas-a-pas/demo-lecteur.js ===== */
  const L = DemoLecteur.lecteur({ demos: DEMOS, ecran: f => ECRANS[f.ecran](f) });

  /* Volet « Toutes les animations » : retrouver n'importe quel tuto sans changer de bloc. */
  addEventListener('DOMContentLoaded', () => {
    const volet = document.getElementById('tutos'), liste = document.getElementById('tutos-liste'), vue = document.getElementById('tutos-vue');
    if (!volet || !liste) return;
    DemoLecteur.volet({ details: volet, liste, vue, titre: true, cree: (i, auto) => L.cree(+i, auto),
      entrees: Object.keys(DEMOS).filter(i => DEMOS[i].volet !== false).map(i => [i, (+i + 1) + '. ' + DEMOS[i].titre]) });
  });

  return { cree: L.cree, pour: L.pour, blocs: Object.keys(DEMOS).map(Number) };
})();

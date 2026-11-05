/* Démos animées « Regarde comment faire » des fiches Python (python-1, python-2), sur le modèle du
   Rat de ville : une mini-maquette (Bureau Windows, Explorateur, Thonny, Chrome) rejoue chaque geste
   du bloc. Aucune donnée élève ; rien n'est enregistré.
   Les démos sont déclarées dans le fiche.js de chaque cours : const DEMOS_FICHE = { numéro de bloc
   (0 = bloc 1) : { titre, replie?, images:[…] } }. Une image = un écran + l'élément que la souris
   va cliquer (cible) + une légende. Chargé après fiche.js, avant blocs.js : blocs.js appelle
   Demo.pour(i) en mode « missions ».
   Règle : une démo ne montre jamais la réponse d'une question de preuve (code caché par des barres
   grises, nom d'erreur masqué, indice arrêté avant la solution).
   Libellés Windows 11, Thonny et Chrome relevés de mémoire : à vérifier sur un poste de la B101. */
const Demo = (() => {
  const DEMOS = typeof DEMOS_FICHE !== 'undefined' ? DEMOS_FICHE : {};
  const FICHIER = '01_Les-vies_Nom.py';
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const c = (n, id) => { n.dataset.c = id; return n; };

  /* ===== Les écrans ===== */
  function ecranBureau(f) {
    const e = el('div', 'md md-bureau');
    const barre = el('div', 'md-taches');
    barre.append(c(el('span', 'md-tache md-win', '⊞'), 'demarrer'), el('span', 'md-tache md-cherche', '🔍 Rechercher'),
      c(el('span', 'md-tache md-jaune', '📁'), 'dossier-jaune'), el('span', 'md-tache', '🌐'));
    e.append(barre);
    if (f.demarrer) {
      const m = el('div', 'md-demarrer');
      m.append(el('div', 'md-dm-champ', '🔍 Thonny'), el('div', 'md-dm-titre', 'Meilleur résultat'));
      const r = c(el('div', 'md-dm-app'), 'app-thonny'); r.append(el('span', 'md-dm-ico', 'Th'), el('span', null, 'Thonny'), el('small', null, 'Application'));
      m.append(r); e.append(m);
    }
    return e;
  }
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
    if (f.run && !f.erreur) cons.append(el('div', 'md-th-res', '…le nombre affiché par TON programme'));
    if (f.erreur) {
      cons.append(el('div', 'md-th-err', 'Traceback (most recent call last):'), el('div', 'md-th-err', '  File "…\\' + f.nom + '", line 3'));
      const d = c(el('div', 'md-th-err md-th-der'), 'th-erreur'); d.append(el('span', 'md-th-masque', '▢▢▢▢'), 'Error: …'); cons.append(d);
    }
    cons.append(el('div', null, '>>> '));
    e.append(menus, outils, onglet, ed, cons);
    if (f.menu) {
      const m = el('div', 'md-menu md-th-menu');
      [['Nouveau', 'Ctrl+N', ''], ['Ouvrir…', 'Ctrl+O', 'item-ouvrir'], ['Enregistrer', 'Ctrl+S', ''], ['Enregistrer sous…', 'Ctrl+Maj+S', 'item-sous'], ['Quitter', 'Alt+F4', '']]
        .forEach(([t, r, id]) => { const i = c(el('div', 'md-item' + (id === f.menu ? ' hi' : '')), id || 'x'); i.append(el('span', null, t), el('small', null, r)); m.append(i); });
      e.append(m);
    }
    if (f.dialogue) e.append(dialogue(f));
    return e;
  }
  /* Fenêtre Windows « Enregistrer sous » ou « Ouvrir ». dialogue : 1 = dans Documents, 2 = dans Python. */
  function dialogue(f) {
    const ouvrir = f.ouvrir, d = el('div', 'md-dlg');
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
    const e = el('div', 'md md-chrome');
    const ong = el('div', 'md-ch-onglets');
    ong.append(c(el('span', 'md-ch-onglet' + (f.page === 'fiche' ? ' actif' : ''), '🐍 ' + (f.fiche || 'Python 02 — pas à pas')), 'ch-fiche'));
    if (f.page !== 'fiche' || f.deux) ong.append(c(el('span', 'md-ch-onglet' + (f.page !== 'fiche' ? ' actif' : ''), '🐍 Python — je révise'), 'ch-revise'));
    ong.append(el('span', 'md-ch-plus', '+'));
    e.append(ong, el('div', 'md-ch-adresse', f.page === 'fiche' ? 'script.google.com/…' : 'root75.github.io/campin-public/python-je-revise/'));
    const corps = el('div', 'md-ch-page');
    if (f.page === 'fiche') {
      corps.append(el('b', null, '1. Le quiz « Python — je révise »'), el('span', 'md-ch-barre'));
      const p = el('p', 'md-ch-texte'); p.append('Ouvre ', c(el('span', 'md-ch-lien', 'Python — je révise'), 'ch-lien'), ' : un nouvel onglet s’ouvre.'); corps.append(p);
      corps.append(el('span', 'md-ch-barre court'));
    } else {
      corps.append(el('b', null, 'Premiers pas en Python — je révise'));
      const o = el('div', 'md-ch-sous');
      [['L’essentiel', ''], ['Quiz', 'ch-quiz'], ['Cartes', '']].forEach(([t, id]) => o.append(c(el('span', (f.page === 'quiz' && id) ? 'actif' : '', t), id || 'x')));
      corps.append(o);
      if (f.page === 'quiz') corps.append(el('p', 'md-ch-texte', '5 questions. Rien n’est coté.'), c(el('span', 'md-ch-bouton', 'Commencer le quiz'), 'ch-commencer'));
      else corps.append(el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    }
    e.append(corps);
    return e;
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

  /* ===== Le lecteur (même fonctionnement que le Rat de ville) ===== */
  function cree(i, auto = true) {
    const d = DEMOS[i]; if (!d) return null;
    const frames = d.images;
    const box = el('div', 'demo'); box.setAttribute('role', 'img');
    const scene = el('div', 'demo-scene'), curseur = el('div', 'demo-curseur'), legende = el('p', 'demo-legende');
    curseur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 2l16 11-7 1.5L9.5 21z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const ctrl = el('div', 'demo-ctrl'), prec = el('button', 'demo-b', '◀'), jouer = el('button', 'demo-b demo-jouer', '▶ Revoir'), suiv = el('button', 'demo-b', '▶');
    [prec, jouer, suiv].forEach(b => { b.type = 'button'; });
    prec.setAttribute('aria-label', 'Image précédente'); suiv.setAttribute('aria-label', 'Image suivante');
    const points = el('span', 'demo-points');
    ctrl.append(prec, points, suiv, jouer);
    scene.append(curseur);
    box.append(scene, legende, ctrl);
    let k = 0, minuteur = null;
    const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function montre(n) {
      k = (n + frames.length) % frames.length; const f = frames[k];
      scene.querySelectorAll('.md').forEach(x => x.remove());
      const e = ECRANS[f.ecran](f); scene.prepend(e);
      legende.textContent = (k + 1) + '. ' + f.legende; box.setAttribute('aria-label', 'Démonstration : ' + frames.map(x => x.legende).join(' '));
      points.replaceChildren(...frames.map((_, j) => el('span', j === k ? 'on' : '')));
      box.classList.toggle('demo-ok', !!f.ok);
      const cible = f.cible && e.querySelector('[data-c="' + f.cible + '"]');
      requestAnimationFrame(() => {
        if (!cible) return;
        const a = scene.getBoundingClientRect(), b = cible.getBoundingClientRect();
        curseur.style.transform = 'translate(' + (b.left - a.left + Math.min(b.width / 2, 40)) + 'px,' + (b.top - a.top + b.height / 2) + 'px)';
        cible.classList.add('md-vise');
        setTimeout(() => cible.classList.add('md-clic'), calme ? 0 : 700);
      });
    }
    function stop() { clearTimeout(minuteur); minuteur = null; jouer.textContent = '▶ Revoir'; }
    function joue(depuis = 0) {
      stop(); jouer.textContent = '⏸ Pause'; montre(depuis);
      const suite = () => { if (k >= frames.length - 1) { stop(); return; } minuteur = setTimeout(() => { montre(k + 1); suite(); }, 2600); };
      suite();
    }
    prec.addEventListener('click', () => { stop(); montre(k - 1); });
    suiv.addEventListener('click', () => { stop(); montre(k + 1); });
    jouer.addEventListener('click', () => { minuteur ? stop() : joue(k >= frames.length - 1 ? 0 : k); });
    // Lancée seulement une fois visible ; immobile si l'élève a demandé moins d'animations.
    setTimeout(() => { montre(0); if (!calme && auto) joue(0); }, 60);
    box.stop = stop; box.joue = () => { if (!calme) joue(0); else montre(0); };
    return box;
  }

  /* La démo du bloc, emballée pour la fiche. Gardée d'un affichage à l'autre ; une seule joue à la fois. */
  const vues = {}; let enCours = null;
  function pour(i) {
    const d = DEMOS[i]; if (!d) return null;
    if (enCours !== null && enCours !== i && vues[enCours]) vues[enCours].demo.stop();
    enCours = i;
    if (vues[i]) { if (!d.replie) setTimeout(() => vues[i].demo.joue(), 80); return vues[i].emballe; }
    const demo = cree(i, !d.replie);
    let emballe;
    if (d.replie) {
      emballe = el('details', 'demo-cote'); emballe.append(el('summary', null, '💡 ' + d.titre), demo);
      emballe.addEventListener('toggle', () => { if (emballe.open) demo.joue(); else demo.stop(); });
    } else { emballe = el('section', 'demo-bloc'); emballe.append(el('p', 'demo-titre', '👀 Regarde comment faire'), demo); }
    vues[i] = { demo, emballe };
    return emballe;
  }

  /* Volet « Toutes les animations » : retrouver n'importe quel tuto sans changer de bloc. */
  addEventListener('DOMContentLoaded', () => {
    const volet = document.getElementById('tutos'), liste = document.getElementById('tutos-liste'), vue = document.getElementById('tutos-vue');
    if (!volet || !liste) return;
    if (!Object.keys(DEMOS).length) { volet.hidden = true; return; }
    let joue = null;
    Object.keys(DEMOS).filter(i => DEMOS[i].volet !== false).forEach(i => {
      const titre = (+i + 1) + '. ' + DEMOS[i].titre;
      const b = el('button', 'btn vide', titre); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (joue) joue.stop();
        liste.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        joue = cree(+i, false); vue.replaceChildren(el('p', 'demo-titre', '👀 ' + titre), joue); setTimeout(() => joue.joue(), 80);
      });
      liste.append(b);
    });
    volet.addEventListener('toggle', () => { if (!volet.open && joue) joue.stop(); });
  });

  return { cree, pour, blocs: Object.keys(DEMOS).map(Number) };
})();

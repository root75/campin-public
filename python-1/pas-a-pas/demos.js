/* Démos animées « Regarde comment faire » de Python 01, sur le modèle du Rat de ville :
   une mini-maquette (Explorateur de fichiers, Thonny, Bureau Windows) rejoue chaque geste du bloc.
   Aucune donnée élève ; rien n'est enregistré. Une image = un état de l'écran + l'élément que la
   souris va cliquer + une légende.
   blocs.js appelle Demo.pour(i) en mode « missions » : la démo du bloc i (0 = bloc 1), ou null.
   Les démos ne montrent jamais une réponse de preuve : le code de « Les vies » est remplacé par
   des barres grises, et l'indice de l'échange s'arrête avant la solution.
   Libellés Windows 11 et Thonny relevés de mémoire : à vérifier sur un poste de la B101. */
const Demo = (() => {
  const FICHIER = '01_Les-vies_Nom.py';
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const c = (n, id) => { n.dataset.c = id; return n; };

  /* Les démos, par numéro de bloc (0 = bloc 1). replie : dans un volet à ouvrir (un indice). */
  const DEMOS = {
    7: { titre: 'Une image pour comprendre : les deux verres', replie: true, images: [
      { ecran: 'verres', a: 'jus', b: 'lait', t: '', legende: 'Du jus dans le verre a, du lait dans le verre b. On veut les échanger.' },
      { ecran: 'verres', a: 'jus', b: 'lait', t: '', barre: 'a', cible: 'v-a', legende: 'Verser tout de suite le lait dans a ? Le jus serait perdu.' },
      { ecran: 'verres', a: '', b: 'lait', t: 'jus', cible: 'v-t', legende: 'Un troisième verre, temp : on y met d’abord le jus à l’abri.' },
      { ecran: 'verres', a: '', b: 'lait', t: 'jus', cible: 'v-a', ok: 1, legende: 'Le verre a est libre. Quels deux gestes restent ? À toi de les écrire en Python.' }
    ] },
    8: { titre: 'Créer le dossier Python', images: [
      { ecran: 'bureau', cible: 'dossier-jaune', legende: 'Clique sur le dossier jaune de la barre des tâches (ou Windows + E).' },
      { ecran: 'explorateur', lieu: 'Accueil', cible: 'nav-documents', legende: 'Dans la colonne de gauche, clique sur Documents.' },
      { ecran: 'explorateur', lieu: 'Documents', cible: 'nouveau', legende: 'En haut à gauche, clique sur ⊕ Nouveau.' },
      { ecran: 'explorateur', lieu: 'Documents', menu: 1, cible: 'item-dossier', legende: 'Choisis Dossier (ou Ctrl + Maj + N).' },
      { ecran: 'explorateur', lieu: 'Documents', neuf: 'Nouveau dossier', cible: 'neuf', legende: '« Nouveau dossier » est déjà sélectionné : tape directement Python.' },
      { ecran: 'explorateur', lieu: 'Documents', neuf: 'Python', cible: 'neuf', legende: 'Appuie sur Entrée.' },
      { ecran: 'explorateur', lieu: 'Documents', python: 1, cible: 'dossier-python', ok: 1, legende: 'Le dossier Python est dans Documents.' }
    ] },
    9: { titre: 'Ouvrir Thonny et enregistrer à mon nom', images: [
      { ecran: 'bureau', cible: 'demarrer', legende: 'Appuie sur la touche Windows ⊞ (ou clique sur Démarrer).' },
      { ecran: 'bureau', demarrer: 1, cible: 'app-thonny', legende: 'Tape Thonny, puis Entrée.' },
      { ecran: 'thonny', nom: '<sans nom>', cible: 'm-fichier', legende: 'Thonny est ouvert. Clique sur le menu Fichier.' },
      { ecran: 'thonny', nom: '<sans nom>', menu: 1, cible: 'item-sous', legende: 'Enregistrer sous… (ou Ctrl + Maj + S).' },
      { ecran: 'thonny', nom: '<sans nom>', dialogue: 1, cible: 'dlg-documents', legende: 'À gauche, clique sur Documents.' },
      { ecran: 'thonny', nom: '<sans nom>', dialogue: 1, cible: 'dlg-python', legende: 'Double-clic sur le dossier Python.' },
      { ecran: 'thonny', nom: '<sans nom>', dialogue: 2, cible: 'dlg-nom', legende: 'Nom du fichier : 01_Les-vies_ puis TON nom, puis .py.' },
      { ecran: 'thonny', nom: '<sans nom>', dialogue: 2, cible: 'dlg-enregistrer', legende: 'Clique sur Enregistrer.' },
      { ecran: 'thonny', nom: FICHIER, cible: 'th-onglet', ok: 1, legende: 'L’onglet affiche le nom de ton fichier.' }
    ] },
    10: { titre: 'Écrire dans Thonny et enregistrer', images: [
      { ecran: 'thonny', nom: FICHIER, cible: 'th-editeur', legende: 'Clique dans la grande zone du haut, pas dans la console du bas.' },
      { ecran: 'thonny', nom: FICHIER, lignes: 1, modifie: 1, cible: 'th-editeur', legende: 'Une ligne par forme du logigramme…' },
      { ecran: 'thonny', nom: FICHIER, lignes: 3, modifie: 1, cible: 'th-editeur', legende: '… trois lignes en tout. L’étoile * de l’onglet : pas encore enregistré.' },
      { ecran: 'thonny', nom: FICHIER, lignes: 3, modifie: 1, cible: 'th-enregistrer', legende: 'Disquette « Enregistrer » (ou Ctrl + S).' },
      { ecran: 'thonny', nom: FICHIER, lignes: 3, cible: 'th-onglet', ok: 1, legende: 'L’étoile a disparu : c’est enregistré. Prédis avant d’exécuter !' }
    ] },
    11: { titre: 'Exécuter dans Thonny', images: [
      { ecran: 'thonny', nom: FICHIER, lignes: 3, cible: 'th-executer', legende: 'Icône ▶ verte « Exécuter le script courant » (ou F5).' },
      { ecran: 'thonny', nom: FICHIER, lignes: 3, run: 1, cible: 'th-console', ok: 1, legende: 'Le résultat s’affiche dans la console du bas. Compare avec ta prédiction.' }
    ] }
  };

  /* ===== Les écrans ===== */
  function ecranBureau(f) {
    const e = el('div', 'md md-bureau');
    e.append(el('div', 'md-fond'));
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
    const n = Math.max(3, f.lignes || 0);
    for (let k = 0; k < n; k++) {
      const l = el('div', 'md-th-l'); l.append(el('span', 'md-th-num', String(k + 1)));
      if (k < (f.lignes || 0)) l.append(el('span', 'md-th-code w' + (k % 3)));   // une ligne de TON code, cachée
      ed.append(l);
    }
    const cons = c(el('div', 'md-th-console'), 'th-console');
    cons.append(el('div', 'md-th-ctitre', 'Console'));
    if (f.run) { cons.append(el('div', 'md-th-run-l', '>>> %Run ' + f.nom), el('div', 'md-th-res', '…le nombre affiché par TON programme')); }
    cons.append(el('div', null, '>>> '));
    e.append(menus, outils, onglet, ed, cons);
    if (f.menu) {
      const m = el('div', 'md-menu md-th-menu');
      [['Nouveau', 'Ctrl+N', ''], ['Ouvrir…', 'Ctrl+O', ''], ['Enregistrer', 'Ctrl+S', ''], ['Enregistrer sous…', 'Ctrl+Maj+S', 'item-sous'], ['Quitter', 'Alt+F4', '']]
        .forEach(([t, r, id]) => { const i = c(el('div', 'md-item' + (id ? ' hi' : '')), id || 'x'); i.append(el('span', null, t), el('small', null, r)); m.append(i); });
      e.append(m);
    }
    if (f.dialogue) {
      const d = el('div', 'md-dlg');
      d.append(el('div', 'md-dlg-titre', 'Enregistrer sous'), el('div', 'md-ex-adresse', f.dialogue === 2 ? '› Documents › Python' : '› Documents'));
      const corps = el('div', 'md-dlg-corps'), nav = el('div', 'md-ex-nav'), liste = el('div', 'md-ex-liste');
      [['🖥 Bureau', ''], ['📄 Documents', 'dlg-documents'], ['⬇ Téléchargements', '']].forEach(([t, id]) => { const s = el('span', id ? 'actif' : '', t); if (id) c(s, id); nav.append(s); });
      if (f.dialogue === 1) liste.append(el('div', 'md-ex-f', '📁 Labo'), c(el('div', 'md-ex-f', '📁 Python'), 'dlg-python'));
      else liste.append(el('div', 'md-ex-vide', 'Aucun élément ne correspond.'));
      corps.append(nav, liste);
      const nom = el('div', 'md-dlg-ligne'); nom.append(el('span', null, 'Nom du fichier :'), c(el('span', 'md-dlg-champ', f.dialogue === 2 ? FICHIER : ''), 'dlg-nom'));
      const type = el('div', 'md-dlg-ligne'); type.append(el('span', null, 'Type :'), el('span', 'md-dlg-champ eteint', 'Python files (*.py)'));
      const pied = el('div', 'md-dlg-pied'); pied.append(c(el('span', 'md-dlg-btn md-dlg-plein', 'Enregistrer'), 'dlg-enregistrer'), el('span', 'md-dlg-btn', 'Annuler'));
      d.append(corps, nom, type, pied); e.append(d);
    }
    return e;
  }
  function ecranVerres(f) {
    const e = el('div', 'md md-verres');
    [['a', f.a, 'v-a'], ['b', f.b, 'v-b'], ['temp', f.t, 'v-t']].forEach(([nom, contenu, id]) => {
      const v = el('div', 'md-verre'), verre = c(el('div', 'md-v ' + (contenu || 'vide')), id);
      verre.append(el('span', 'md-v-liquide'));
      if (f.barre === nom) verre.append(el('span', 'md-v-perdu', '✗'));
      v.append(verre, el('b', null, nom), el('small', null, contenu === 'jus' ? 'jus' : contenu === 'lait' ? 'lait' : 'vide'));
      e.append(v);
    });
    return e;
  }
  const ECRANS = { bureau: ecranBureau, explorateur: ecranExplorateur, thonny: ecranThonny, verres: ecranVerres };

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
    if (enCours && enCours !== i && vues[enCours]) vues[enCours].demo.stop();
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
    let joue = null;
    Object.keys(DEMOS).forEach(i => {
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

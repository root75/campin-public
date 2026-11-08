/* Me connecter et rendre un devoir — animations « 👀 Regarde comment faire ».
   Le lecteur (scène, curseur, ◀ ▶) est commun : pas-a-pas/demo-lecteur.js, chargé avant ce fichier.
   Une image = un état de l'écran maquetté + l'élément que la souris vise + une légende.
   Maquettes : bureau Windows, Chrome (profil), écrans de connexion Google et Microsoft, clavier AZERTY
   belge, gaufre Google, Classroom. Nom d'élève fictif ; rien n'est enregistré.
   Chaque animation se place dans l'élément [data-animation="clé"] de la page et démarre quand elle devient
   visible (une seule joue à la fois). */
(() => {
  const { el, c } = DemoLecteur;
  const ADRESSE = 'chloe.remy@arcampin.be';
  // Le nom du fichier suit la règle AAAAMMJJ Titre – Prénom Nom, avec la date du jour : l'exemple ne vieillit pas.
  const d = new Date(), z = n => String(n).padStart(2, '0');
  const FICHIER = `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())} Mon portrait chinois – Chloé Rémy`;
  const DEVOIR = 'Mon portrait chinois';

  const DEMOS = {
    chrome: { images: [
      { ecran: 'bureau', cible: 'ico-chrome', legende: 'En bas, dans la barre des tâches : le rond bleu, rouge, jaune et vert. C’est Chrome.' },
      { ecran: 'bureau', cible: 'ico-edge', legende: 'Pas la vague bleue et verte : c’est Edge, un autre navigateur.' },
      { ecran: 'bureau', cible: 'ico-chrome', legende: 'Un clic sur Chrome.' },
      { ecran: 'chrome', cible: 'profil', ok: 1, legende: 'Chrome est ouvert. En haut à droite : le rond du profil.' }
    ] },
    profil: { images: [
      { ecran: 'chrome', cible: 'profil', legende: 'Clique sur le rond du profil, en haut à droite.' },
      { ecran: 'chrome', menu: 1, cible: 'p-ecole', legende: 'Ton profil de l’école est dans la liste ? Clique dessus : c’est fini.' },
      { ecran: 'chrome', menu: 1, cible: 'p-ajouter', legende: 'Sinon : Ajouter, tout en bas du menu.' },
      { ecran: 'nouveau', cible: 'se-connecter', legende: 'Se connecter.' },
      { ecran: 'connexion', saisie: 'chloe.remy@arcampin', cible: 'champ', legende: 'Tape ton adresse de l’école…' },
      { ecran: 'connexion', saisie: ADRESSE, cible: 'suivant', legende: '… en entier, puis Suivant.' },
      { ecran: 'microsoft', cible: 'champ', legende: 'L’écran Microsoft s’ouvre : tape ton mot de passe (celui de ton journal de classe).' },
      { ecran: 'microsoft', points: 1, cible: 'se-connecter', legende: 'Verr Maj éteint ? Alors Se connecter.' },
      { ecran: 'chrome', connecte: 1, cible: 'profil', ok: 1, legende: 'Ton profil de l’école : la première lettre de ton prénom dans le rond.' }
    ] },
    clavier: { images: [
      { ecran: 'touches', saisie: 'chloe', cible: 'maj', tenue: 'maj', legende: 'Après le prénom : garde Maj ⇧ enfoncé…' },
      { ecran: 'touches', saisie: 'chloe.', cible: 'pv', tenue: 'maj', frappe: 'pv', legende: '… et appuie sur ; : le point arrive.' },
      { ecran: 'touches', saisie: 'chloe.remy', cible: 'altgr', tenue: 'altgr', legende: 'Après le nom : garde AltGr enfoncé…' },
      { ecran: 'touches', saisie: 'chloe.remy@', cible: 'e2', tenue: 'altgr', frappe: 'e2', legende: '… et appuie sur é : l’arobase arrive.' },
      { ecran: 'touches', saisie: ADRESSE, cible: 'champ', ok: 1, legende: 'Termine par arcampin.be. Relis : un point, pas d’accent, .be.' }
    ] },
    classroom: { images: [
      { ecran: 'gaufre', cible: 'gaufre', legende: 'Page Google : clique sur les 9 points, en haut à droite.' },
      { ecran: 'gaufre', menu: 1, cible: 'app-classroom', legende: 'Classroom.' },
      { ecran: 'cr-accueil', cible: 'classe', legende: 'Clique sur ta classe.' },
      { ecran: 'cr-classe', cible: 'onglet', legende: 'L’onglet Travaux et devoirs, en haut.' },
      { ecran: 'cr-travaux', cible: 'afficher', legende: 'Afficher votre devoir.' },
      { ecran: 'cr-travaux', liste: 1, cible: 'date', ok: 1, legende: 'La date limite est à droite. Clique sur le devoir pour l’ouvrir.' }
    ] },
    remise: { images: [
      { ecran: 'devoir', cible: 'ajouter', legende: 'Devoir ouvert. À droite, dans Votre travail : + Ajouter ou créer.' },
      { ecran: 'devoir', menu: 1, cible: 'gdrive', legende: 'Google Drive.' },
      { ecran: 'devoir', picker: 1, cible: 'fichier', legende: 'Clique sur ton fichier…' },
      { ecran: 'devoir', picker: 1, cible: 'inserer', legende: '… puis Ajouter.' },
      { ecran: 'devoir', joint: 1, cible: 'piece', legende: 'Le nom de ton fichier apparaît sous Votre travail.' },
      { ecran: 'devoir', joint: 1, cible: 'remettre', legende: 'Joindre ne suffit pas : Remettre.' },
      { ecran: 'devoir', joint: 1, confirme: 1, cible: 'confirmer', legende: 'Remettre une deuxième fois, pour confirmer.' },
      { ecran: 'devoir', joint: 1, remis: 1, cible: 'statut', ok: 1, legende: 'Votre travail affiche Remis : c’est envoyé.' }
    ] }
  };

  /* Petites pièces réutilisées. */
  const logoChrome = () => el('span', 'md-logo-chrome');
  const logoEdge = () => el('span', 'md-logo-edge');
  function chrome(f) {
    const e = el('div', 'md md-chrome');
    const ong = el('div', 'md-ch-onglets'); ong.append(el('span', 'md-ch-onglet actif', 'Nouvel onglet'));
    const barre = el('div', 'md-ch-barre');
    const rond = c(el('span', 'md-profil' + (f.connecte ? ' ecole' : ''), f.connecte ? 'C' : '👤'), 'profil');
    barre.append(el('span', 'md-ch-adresse', 'Rechercher sur Google ou saisir une URL'), rond);
    const corps = el('div', 'md-ch-corps'); corps.append(el('div', 'md-google', 'Google'), el('div', 'md-recherche'));
    e.append(ong, barre, corps);
    if (f.menu) {
      const m = el('div', 'md-pmenu');
      m.append(el('div', 'md-pmenu-titre', 'Profils Chrome'),
        c(el('div', 'md-item', '🟢 Chloé (école)'), 'p-ecole'),
        el('div', 'md-item', '👤 Invité'),
        c(el('div', 'md-item hi', '➕ Ajouter'), 'p-ajouter'));
      e.append(m);
    }
    return e;
  }
  function champ(texte, id, cache) {
    const s = c(el('div', 'md-champ'), id || 'champ');
    s.textContent = cache ? '••••••••••' : (texte || '');
    if (!texte && !cache) s.classList.add('vide');
    return s;
  }
  function touche(t, id, f, large) {
    const k = el('span', 'md-k' + (large ? ' ' + large : '')); k.innerHTML = t;
    if (id) { c(k, id); if (f.tenue === id) k.classList.add('tenue'); if (f.frappe === id) k.classList.add('frappe'); }
    return k;
  }

  function ecran(f) {
    if (f.ecran === 'chrome') return chrome(f);
    const e = el('div', 'md md-' + f.ecran);
    if (f.ecran === 'bureau') {
      const fond = el('div', 'md-win-fond');
      const b = el('div', 'md-win-barre');
      const ch = c(el('span', 'md-win-ico'), 'ico-chrome'); ch.append(logoChrome()); ch.title = 'Google Chrome';
      const ed = c(el('span', 'md-win-ico'), 'ico-edge'); ed.append(logoEdge()); ed.title = 'Microsoft Edge';
      b.append(el('span', 'md-win-ico md-win-start', '⊞'), el('span', 'md-win-ico', '📁'), ed, ch);
      e.append(fond, b);
    }
    if (f.ecran === 'nouveau') {
      const boite = el('div', 'md-boite');
      boite.append(logoChrome(), el('b', null, 'Configurer votre nouveau profil Chrome'),
        el('p', null, 'Connectez-vous pour retrouver vos favoris et vos mots de passe.'),
        c(el('span', 'md-bouton', 'Se connecter'), 'se-connecter'));
      e.append(boite);
    }
    if (f.ecran === 'connexion') {
      const boite = el('div', 'md-boite');
      const pied = el('div', 'md-pied'); pied.append(c(el('span', 'md-bouton', 'Suivant'), 'suivant'));
      boite.append(el('div', 'md-g', 'Google'), el('b', null, 'Connexion'), champ(f.saisie), pied);
      e.append(boite);
    }
    if (f.ecran === 'microsoft') {
      const boite = el('div', 'md-boite md-ms');
      const pied = el('div', 'md-pied'); pied.append(c(el('span', 'md-bouton ms', 'Se connecter'), 'se-connecter'));
      boite.append(el('div', 'md-ms-logo'), el('small', null, '← ' + ADRESSE), el('b', null, 'Entrez le mot de passe'), champ('', 'champ', f.points), pied);
      e.append(boite);
    }
    if (f.ecran === 'touches') {
      e.append(champ(f.saisie));
      const k = el('div', 'md-clavier');
      const r1 = el('div', 'md-rang'); r1.append(touche('²', null, f), touche('<small>1</small>&amp;', null, f), touche('<small>2 @</small>é', 'e2', f), touche('<small>3 #</small>"', null, f), touche('<small>4</small>\'', null, f));
      const r2 = el('div', 'md-rang'); r2.append(touche('Maj ⇧', 'maj', f, 'l2'), touche('W', null, f), touche('X', null, f), touche('C', null, f), touche('V', null, f), touche('B', null, f), touche('N', null, f), touche('<small>?</small>,', null, f), touche('<small>.</small>;', 'pv', f));
      const r3 = el('div', 'md-rang'); r3.append(touche('Ctrl', null, f, 'l1'), touche('Alt', null, f, 'l1'), touche('', null, f, 'espace'), touche('AltGr', 'altgr', f, 'l1'));
      k.append(r1, r2, r3);
      e.append(k, el('p', 'md-note', 'Ce qu’on obtient avec Maj ou AltGr est écrit en haut de la touche.'));
    }
    if (f.ecran === 'gaufre') {
      e.append(el('div', 'md-google', 'Google'), c(el('span', 'md-gaufre-ico', '⋮⋮⋮'), 'gaufre'));
      if (f.menu) {
        const g = el('div', 'md-apps');
        [['Drive', 'app-drive'], ['Docs', 'app-docs'], ['Classroom', 'app-classroom'], ['Agenda', 'app-agenda']]
          .forEach(([t, id]) => g.append(c(el('span', 'md-app md-app-' + t.toLowerCase(), t), id)));
        e.append(g);
      }
    }
    if (f.ecran === 'cr-accueil') {
      e.append(el('div', 'md-cr-haut', '☰  Google Classroom'));
      const g = el('div', 'md-cr-cours');
      [['Informatique', 'M. Louviaux', '#1e8e3e', 'classe'], ['Français', '', '#1967d2', ''], ['Sciences', '', '#e37400', '']]
        .forEach(([t, p, col, id]) => { const k = c(el('div', 'md-cr-cours-carte'), id); const h = el('div', 'md-cr-cours-tete', t); h.style.background = col; k.append(h, el('small', null, p)); g.append(k); });
      e.append(g);
    }
    if (f.ecran === 'cr-classe' || f.ecran === 'cr-travaux') {
      const h = el('div', 'md-cr-haut'); h.append(el('span', null, '☰  Informatique'));
      const t = el('div', 'md-cr-onglets');
      t.append(el('span', f.ecran === 'cr-classe' ? 'on' : '', 'Flux'), c(el('span', f.ecran === 'cr-travaux' ? 'on' : '', 'Travaux et devoirs'), 'onglet'), el('span', null, 'Personnes'));
      e.append(h, t);
      if (f.ecran === 'cr-classe') {
        const b = el('div', 'md-cr-banniere', 'Informatique'); e.append(b, el('div', 'md-cr-flux', 'Annoncez quelque chose à votre classe'));
      } else {
        const corps = el('div', 'md-cr-liste');
        if (f.liste) {
          corps.append(el('b', null, 'Attribués'));
          const l = el('div', 'md-cr-ligne'); l.append(el('span', null, '📋 ' + DEVOIR), c(el('span', 'md-cr-date', 'Date limite : vendredi'), 'date'));
          const l2 = el('div', 'md-cr-ligne autre'); l2.append(el('span', null, '📋 Je range mon Drive'), el('span', 'md-cr-date', 'Aucune date limite'));
          corps.append(l, l2);
        } else {
          corps.append(c(el('span', 'md-cr-lien', '📋 Afficher votre devoir'), 'afficher'),
            el('div', 'md-cr-ligne autre', '📋 ' + DEVOIR), el('div', 'md-cr-ligne autre', '📋 Je range mon Drive'));
        }
        e.append(corps);
      }
    }
    if (f.ecran === 'devoir') {
      const sujet = el('div', 'md-cr-sujet');
      sujet.append(el('div', 'md-cr-icone', '📋'), el('div', 'md-cr-titre', DEVOIR), el('div', 'md-cr-meta', 'M. Louviaux · Date limite : vendredi'), el('div', 'md-cr-consigne'));
      const carte = el('div', 'md-cr-carte'), tete = el('div', 'md-cr-tete');
      tete.append(el('b', null, 'Votre travail'), c(el('span', 'md-cr-statut' + (f.remis ? ' remis' : ''), f.remis ? 'Remis' : 'Attribué'), 'statut'));
      carte.append(tete);
      if (f.joint) carte.append(c(el('div', 'md-cr-piece', '📄 ' + FICHIER), 'piece'));
      else carte.append(c(el('span', 'md-cr-ajouter', '+ Ajouter ou créer'), 'ajouter'));
      if (f.menu) {
        const m = el('div', 'md-cr-menu');
        [['🟢 Google Drive', 'gdrive'], ['🔗 Lien', ''], ['📎 Fichier', '']].forEach(([t, id]) => m.append(c(el('div', 'md-item' + (id ? ' hi' : ''), t), id)));
        carte.append(m);
      }
      carte.append(f.remis ? el('span', 'md-cr-btn', 'Annuler l’envoi') : c(el('span', 'md-cr-btn md-cr-plein', f.joint ? 'Remettre' : 'Marquer comme terminé'), 'remettre'));
      e.append(sujet, carte);
      if (f.picker) {
        const p = el('div', 'md-cr-picker'), liste = el('div', 'md-cr-fichiers');
        p.append(el('div', 'md-cr-ptitre', 'Insérer des fichiers à l’aide de Google Drive'));
        liste.append(c(el('div', 'md-cr-f choisi', '📄 ' + FICHIER), 'fichier'), el('div', 'md-cr-f autre', '📄 Mes notes'));
        const pied = el('div', 'md-cr-ppied'); pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein', 'Ajouter'), 'inserer'));
        p.append(liste, pied); e.append(p);
      }
      if (f.confirme) {
        const dlg = el('div', 'md-cr-dialogue');
        dlg.append(el('b', null, 'Remettre votre devoir ?'), el('div', 'md-cr-piece', '📄 ' + FICHIER));
        const pied = el('div', 'md-cr-ppied'); pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein', 'Remettre'), 'confirmer'));
        dlg.append(pied); e.append(dlg);
      }
    }
    return e;
  }

  /* Placement : chaque [data-animation] reçoit son animation, lancée quand elle devient visible. */
  const L = DemoLecteur.lecteur({ demos: DEMOS, ecran, pas: 2600 });
  let enCours = null;
  const vues = [];
  document.querySelectorAll('[data-animation]').forEach(place => {
    const demo = L.cree(place.dataset.animation, false); if (!demo) return;
    place.append(el('p', 'demo-titre', '👀 Regarde comment faire'), demo);
    vues.push({ place, demo, vue: false });
  });
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entrees => {
    entrees.forEach(x => {
      const v = vues.find(y => y.place === x.target); if (!v) return;
      if (x.isIntersecting && !v.vue) {
        v.vue = true;
        if (enCours && enCours !== v.demo) enCours.stop();
        enCours = v.demo; v.demo.joue();
      }
    });
  }, { threshold: 0.6 });
  vues.forEach(v => obs.observe(v.place));
})();

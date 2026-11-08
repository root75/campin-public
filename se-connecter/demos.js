/* Me connecter et rendre un devoir — animations « 👀 Regarde comment faire ».
   Le lecteur (scène, curseur, ◀ ▶) est commun : pas-a-pas/demo-lecteur.js, chargé avant ce fichier.
   Une image = un état de l'écran maquetté + l'élément que la souris vise + une légende.
   Libellés relevés à l'écran avec un compte élève de test (Windows 11, Chrome, Classroom en français) :
   Démarrer ▸ « chrome » ▸ Google Chrome ; « Ajouter un profil Chrome » ; « Configurez votre nouveau profil
   Chrome » ; « Sélectionnez votre moteur de recherche » ; Microsoft « Entrez le mot de passe » ; « Rester
   connecté ? » ; « Confirmez qu'il s'agit bien de vous » ; « Ce profil sera géré » ; « Tapez moins et gagnez
   du temps » ; Classroom « Choisir votre rôle », « Rejoindre le cours », panneau « Vos devoirs »,
   « Marquer comme terminé » / « Rendre le devoir », « Rendre le devoir ? », « Remis », « Annuler l'envoi ».
   Non relevé : le bouton du bas de l'écran « Bienvenue » et le bouton du sélecteur Google Drive.
   Nom d'élève fictif ; rien n'est enregistré.
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
      { ecran: 'bureau', cible: 'demarrer', legende: 'Clique sur ⊞ Démarrer, en bas de l’écran (ou touche ⊞ Windows).' },
      { ecran: 'demarrer', saisie: 'chr', cible: 'recherche', legende: 'Tape chrome.' },
      { ecran: 'demarrer', saisie: 'chrome', resultat: 1, cible: 'res-chrome', legende: 'Meilleure correspondance : Google Chrome, le rond bleu, rouge, jaune et vert. Clique dessus.' },
      { ecran: 'chrome', cible: 'profil', ok: 1, legende: 'Chrome est ouvert. En haut à droite : le rond du profil.' },
      { ecran: 'bureau', cible: 'ico-chrome', legende: 'Plus rapide : si l’icône Chrome est dans la barre des tâches, un clic suffit.' }
    ] },
    profil: { images: [
      { ecran: 'chrome', cible: 'profil', legende: 'Clique sur le rond du profil, en haut à droite.' },
      { ecran: 'chrome', menu: 1, cible: 'p-ajouter', legende: 'Ton profil n’est pas sous « Autres profils Chrome » : Ajouter un profil Chrome.' },
      { ecran: 'nouveau', cible: 'se-connecter', legende: '« Configurez votre nouveau profil Chrome » : Se connecter.' },
      { ecran: 'connexion', saisie: 'chloe.remy@arcampin', cible: 'champ', legende: 'Tape ton adresse de l’école…' },
      { ecran: 'connexion', saisie: ADRESSE, cible: 'suivant', legende: '… en entier, puis Suivant.' },
      { ecran: 'moteur', cible: 'm-google', legende: 'Choix du moteur de recherche : coche Google. L’ordre change à chaque fois.' },
      { ecran: 'moteur', choisi: 1, cible: 'definir', legende: 'Puis Définir par défaut.' },
      { ecran: 'microsoft', cible: 'champ', legende: 'Écran Microsoft : tape ton mot de passe (celui de ton journal de classe).' },
      { ecran: 'microsoft', points: 1, cible: 'se-connecter', ok: 1, legende: 'Verr Maj éteint ? Alors Se connecter.' }
    ] },
    'profil-fin': { images: [
      { ecran: 'dialogue', titre: 'Rester connecté ?', texte: 'Cela vous permet de réduire le nombre de fois où vous êtes invité à vous connecter.', boutons: ['Non', 'Oui'], ms: 1, cible: 'b-Oui', legende: '« Rester connecté ? » : Oui.' },
      { ecran: 'dialogue', titre: 'Enregistrer le mot de passe ?', texte: 'Chrome le propose en haut à droite.', boutons: ['Jamais', 'Non, merci'], cible: 'b-Non, merci', legende: '« Enregistrer le mot de passe ? » : Non, merci. Ton mot de passe reste dans ta tête et ton journal de classe.' },
      { ecran: 'dialogue', titre: 'Confirmez qu’il s’agit bien de vous', texte: 'Si vous reconnaissez ce compte, appuyez sur « Continuer ».', boutons: ['Je ne reconnais pas ce compte', 'Continuer'], cible: 'b-Continuer', legende: '« Confirmez qu’il s’agit bien de vous » : Continuer.' },
      { ecran: 'dialogue', titre: 'Bienvenue', texte: 'Bienvenue dans votre nouveau compte Google Workspace for Education.', fleche: 1, cible: 'fleche', legende: '« Bienvenue » : descends avec la flèche ↓, puis clique sur le bouton bleu, en bas.' },
      { ecran: 'dialogue', titre: 'Ce profil sera géré', texte: 'Votre organisation (arcampin.be) exige un profil géré.', boutons: ['Déconnexion', 'Continuer'], cible: 'b-Continuer', legende: '« Ce profil sera géré » : Continuer.' },
      { ecran: 'dialogue', titre: 'Tapez moins et gagnez du temps', texte: 'Synchronisez votre historique et vos onglets.', boutons: ['Non, merci', 'Oui, j’accepte'], cible: 'b-Oui, j’accepte', legende: '« Tapez moins et gagnez du temps » : Oui, j’accepte.' },
      { ecran: 'chrome', connecte: 1, cible: 'profil', ok: 1, legende: 'Le rond du profil montre la première lettre de ton prénom : c’est ton profil de l’école.' }
    ] },
    'classroom-debut': { images: [
      { ecran: 'dialogue', titre: 'Google Classroom', texte: 'Élève · ' + ADRESSE, boutons: ['Continuer'], cible: 'b-Continuer', legende: 'Ton adresse de l’école est bien affichée ? Continuer.' },
      { ecran: 'role', cible: 'eleve', legende: '« Choisir votre rôle » : Je suis un élève.' },
      { ecran: 'invitation', cible: 'rejoindre', legende: 'Sur la carte du cours de M. Louviaux : Rejoindre le cours.' },
      { ecran: 'dialogue', titre: 'Rejoindre le cours ?', texte: 'Si vous acceptez, vos coordonnées seront partagées avec les membres du cours.', boutons: ['Annuler', 'Rejoindre le cours'], cible: 'b-Rejoindre le cours', ok: 1, legende: 'Confirme : Rejoindre le cours, une deuxième fois.' }
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
      { ecran: 'cr-travaux', cible: 'ligne', legende: 'Clique sur la ligne du devoir. La date limite est à droite de la ligne.' },
      { ecran: 'cr-travaux', deplie: 1, cible: 'instructions', ok: 1, legende: 'La ligne s’ouvre : Afficher les instructions ouvre le devoir.' }
    ] },
    remise: { images: [
      { ecran: 'devoir', cible: 'ajouter', legende: 'Devoir ouvert. À droite, dans Vos devoirs : + Ajouter ou créer.' },
      { ecran: 'devoir', menu: 1, cible: 'gdrive', legende: 'Google Drive (ou Fichier si ton fichier est sur l’ordinateur).' },
      { ecran: 'devoir', picker: 1, cible: 'fichier', legende: 'Clique sur ton fichier…' },
      { ecran: 'devoir', picker: 1, cible: 'inserer', legende: '… puis sur le bouton bleu, en bas à droite.' },
      { ecran: 'devoir', joint: 1, cible: 'piece', legende: 'Ton fichier apparaît dans Vos devoirs.' },
      { ecran: 'devoir', joint: 1, cible: 'rendre', legende: 'Joindre ne suffit pas : Rendre le devoir.' },
      { ecran: 'devoir', joint: 1, confirme: 1, cible: 'confirmer', legende: '« Rendre le devoir ? » : encore Rendre le devoir, pour confirmer.' },
      { ecran: 'devoir', joint: 1, remis: 1, cible: 'statut', ok: 1, legende: 'Remis, en vert : c’est envoyé. Ne touche pas à « Annuler l’envoi ».' }
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
    barre.append(el('span', 'md-ch-adresse', 'Demandez à Google ou saisissez une URL'), rond, el('span', 'md-ch-points', '⋮'));
    const corps = el('div', 'md-ch-corps'); corps.append(el('div', 'md-google', 'Google'), el('div', 'md-recherche'));
    e.append(ong, barre, corps);
    if (f.menu) {
      const m = el('div', 'md-pmenu');
      m.append(el('div', 'md-pmenu-carte', 'Connectez-vous pour accéder à vos mots de passe, vos favoris et plus'),
        el('div', 'md-pmenu-titre', 'Autres profils Chrome'),
        el('div', 'md-item', '👤 Personne 1'),
        el('div', 'md-pmenu-sep'),
        c(el('div', 'md-item hi', '➕ Ajouter un profil Chrome'), 'p-ajouter'),
        el('div', 'md-item', 'Ouvrir le profil invité'),
        el('div', 'md-item', 'Gérer les profils Chrome'));
      e.append(m);
    }
    return e;
  }
  function champ(texte, id, cache, vide) {
    const s = c(el('div', 'md-champ'), id || 'champ');
    s.textContent = cache ? '••••••••••' : (texte || '');
    if (!texte && !cache) { s.classList.add('vide'); s.dataset.vide = vide || 'Adresse e-mail ou téléphone'; }
    return s;
  }
  function touche(t, id, f, large) {
    const k = el('span', 'md-k' + (large ? ' ' + large : '')); k.innerHTML = t;
    if (id) { c(k, id); if (f.tenue === id) k.classList.add('tenue'); if (f.frappe === id) k.classList.add('frappe'); }
    return k;
  }
  function boutons(liste) {
    const pied = el('div', 'md-pied');
    liste.forEach((t, k) => pied.append(c(el('span', 'md-bouton' + (k === liste.length - 1 ? '' : ' discret'), t), 'b-' + t)));
    return pied;
  }

  function ecran(f) {
    if (f.ecran === 'chrome') return chrome(f);
    const e = el('div', 'md md-' + f.ecran);
    if (f.ecran === 'bureau' || f.ecran === 'demarrer') {
      const b = el('div', 'md-win-barre');
      const ch = c(el('span', 'md-win-ico'), 'ico-chrome'); ch.append(logoChrome()); ch.title = 'Google Chrome';
      b.append(c(el('span', 'md-win-ico md-win-start', '⊞'), 'demarrer'), el('span', 'md-win-cherche', '🔍 Rechercher'), el('span', 'md-win-ico', '📁'), ch);
      e.append(el('div', 'md-win-fond'), b);
      if (f.ecran === 'demarrer') {
        const m = el('div', 'md-win-start-menu');
        m.append(c(el('div', 'md-win-recherche', '🔍 ' + (f.saisie || '')), 'recherche'));
        if (f.resultat) {
          m.append(el('div', 'md-win-meilleur', 'Meilleure correspondance'));
          const r = c(el('div', 'md-win-res'), 'res-chrome'); const t = el('span'); t.append(el('b', null, 'Google Chrome'), el('small', null, 'Application'));
          r.append(logoChrome(), t); m.append(r);
        } else {
          m.append(el('div', 'md-win-meilleur', 'Épinglé'));
          const g = el('div', 'md-win-epingles'); const ed = el('span'); ed.append(logoEdge(), el('small', null, 'Edge')); g.append(ed);
          ['Word', 'Excel', 'Outlook'].forEach(t => g.append(el('span', null, t))); m.append(g);
        }
        e.append(m);
      }
    }
    if (f.ecran === 'nouveau') {
      const boite = el('div', 'md-boite');
      const pied = el('div', 'md-pied'); pied.append(el('span', 'md-bouton discret', 'Rester déconnecté'), c(el('span', 'md-bouton', 'Se connecter'), 'se-connecter'));
      boite.append(logoChrome(), el('b', null, 'Configurez votre nouveau profil Chrome'),
        el('p', null, 'Connectez-vous pour accéder à vos mots de passe, vos favoris et plus sur tous vos appareils'), pied);
      e.append(boite);
    }
    if (f.ecran === 'connexion') {
      const boite = el('div', 'md-boite');
      const pied = el('div', 'md-pied'); pied.append(el('span', 'md-bouton discret', 'Créer un compte'), c(el('span', 'md-bouton', 'Suivant'), 'suivant'));
      boite.append(el('div', 'md-g', 'Google'), el('b', null, 'Se connecter à Chrome'), el('p', null, 'Utilisez votre compte Google'), champ(f.saisie), pied);
      e.append(boite);
    }
    if (f.ecran === 'moteur') {
      const boite = el('div', 'md-boite');
      boite.append(el('b', null, 'Sélectionnez votre moteur de recherche'), el('p', null, 'Ceux-ci s’affichent dans un ordre aléatoire.'));
      const l = el('div', 'md-radios');
      ['Qwant', 'Ecosia', 'Google', 'DuckDuckGo', 'Microsoft Bing'].forEach(t => {
        const r = el('span', 'md-radio' + (f.choisi && t === 'Google' ? ' on' : ''), t); if (t === 'Google') c(r, 'm-google'); l.append(r);
      });
      const pied = el('div', 'md-pied'); pied.append(c(el('span', 'md-bouton' + (f.choisi ? '' : ' gris'), 'Définir par défaut'), 'definir'));
      boite.append(l, pied); e.append(boite);
    }
    if (f.ecran === 'microsoft') {
      const boite = el('div', 'md-boite md-ms');
      const pied = el('div', 'md-pied'); pied.append(c(el('span', 'md-bouton ms', 'Se connecter'), 'se-connecter'));
      boite.append(el('div', 'md-ms-logo'), el('small', null, ADRESSE), el('b', null, 'Entrez le mot de passe'), champ('', 'champ', f.points, 'Mot de passe'), pied);
      e.append(boite);
    }
    if (f.ecran === 'dialogue') {
      const boite = el('div', 'md-boite' + (f.ms ? ' md-ms' : ''));
      if (f.ms) boite.append(el('div', 'md-ms-logo'));
      boite.append(el('b', null, f.titre), el('p', null, f.texte));
      if (f.fleche) boite.append(c(el('span', 'md-fleche', '↓'), 'fleche'));
      if (f.boutons) boite.append(boutons(f.boutons));
      e.append(boite);
    }
    if (f.ecran === 'role') {
      const boite = el('div', 'md-boite');
      const l = el('div', 'md-roles');
      l.append(c(el('span', 'md-role', '🎒 Je suis un élève'), 'eleve'), el('span', 'md-role', '🧑‍🏫 Je suis enseignant'));
      boite.append(el('b', null, 'Choisir votre rôle'), l); e.append(boite);
    }
    if (f.ecran === 'invitation') {
      e.append(el('div', 'md-cr-haut', '☰  Classroom'));
      const k = el('div', 'md-cr-invit'), h = el('div', 'md-cr-cours-tete', 'Informatique'); h.style.background = '#1e8e3e';
      const pied = el('div', 'md-pied'); pied.append(el('span', 'md-bouton discret', 'Refuser'), c(el('span', 'md-bouton', 'Rejoindre le cours'), 'rejoindre'));
      k.append(h, el('small', null, 'M. Louviaux'), el('p', null, 'Vous avez été invité à rejoindre le cours de M. Louviaux'), pied);
      e.append(k);
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
      e.append(el('div', 'md-cr-haut', '☰  Classroom'));
      const g = el('div', 'md-cr-cours');
      [['Informatique', 'M. Louviaux', '#1e8e3e', 'classe'], ['Français', '', '#1967d2', ''], ['Sciences', '', '#e37400', '']]
        .forEach(([t, p, col, id]) => { const k = c(el('div', 'md-cr-cours-carte'), id); const h = el('div', 'md-cr-cours-tete', t); h.style.background = col; k.append(h, el('small', null, p)); g.append(k); });
      e.append(g);
    }
    if (f.ecran === 'cr-classe' || f.ecran === 'cr-travaux') {
      const h = el('div', 'md-cr-haut'); h.append(el('span', null, '☰  Classroom › Informatique'));
      const t = el('div', 'md-cr-onglets');
      t.append(el('span', f.ecran === 'cr-classe' ? 'on' : '', 'Flux'), c(el('span', f.ecran === 'cr-travaux' ? 'on' : '', 'Travaux et devoirs'), 'onglet'), el('span', null, 'Personnes'));
      e.append(h, t);
      if (f.ecran === 'cr-classe') {
        e.append(el('div', 'md-cr-banniere', 'Informatique'), el('div', 'md-cr-flux', 'Annonces de M. Louviaux'));
      } else {
        const corps = el('div', 'md-cr-liste');
        const l = c(el('div', 'md-cr-ligne'), 'ligne'); l.append(el('span', null, '📋 ' + DEVOIR), c(el('span', 'md-cr-date', 'Date limite : vendredi'), 'date'));
        corps.append(l);
        if (f.deplie) {
          const det = el('div', 'md-cr-detail');
          det.append(el('small', null, 'Attribué'), el('div', 'md-cr-consigne'), c(el('span', 'md-cr-lien', 'Afficher les instructions'), 'instructions'));
          corps.append(det);
        }
        const l2 = el('div', 'md-cr-ligne autre'); l2.append(el('span', null, '📋 Je range mon Drive'), el('span', 'md-cr-date', 'Aucune date limite'));
        corps.append(l2);
        e.append(corps);
      }
    }
    if (f.ecran === 'devoir') {
      const sujet = el('div', 'md-cr-sujet');
      sujet.append(el('div', 'md-cr-icone', '📋'), el('div', 'md-cr-titre', DEVOIR), el('div', 'md-cr-meta', 'M. Louviaux · Date limite : vendredi'), el('div', 'md-cr-consigne'),
        el('div', 'md-cr-meta', '👥 Commentaires ajoutés au cours'));
      const carte = el('div', 'md-cr-carte'), tete = el('div', 'md-cr-tete');
      tete.append(el('b', null, 'Vos devoirs'), c(el('span', 'md-cr-statut' + (f.remis ? ' remis' : ''), f.remis ? 'Remis' : 'Attribué'), 'statut'));
      carte.append(tete);
      if (f.joint) carte.append(c(el('div', 'md-cr-piece', '📄 ' + FICHIER), 'piece'));
      if (!f.remis) carte.append(c(el('span', 'md-cr-ajouter', '+ Ajouter ou créer'), 'ajouter'));
      if (f.menu) {
        const m = el('div', 'md-cr-menu');
        [['🟢 Google Drive', 'gdrive'], ['🔗 Lien', ''], ['📎 Fichier', '']].forEach(([t, id]) => m.append(c(el('div', 'md-item' + (id ? ' hi' : ''), t), id)));
        m.append(el('div', 'md-item md-cr-sous', 'Créer'));
        ['Docs', 'Slides', 'Sheets', 'Drawings', 'Vids'].forEach(t => m.append(el('div', 'md-item', t)));
        carte.append(m);
      }
      carte.append(f.remis ? el('span', 'md-cr-btn', 'Annuler l’envoi') : c(el('span', 'md-cr-btn md-cr-plein', f.joint ? 'Rendre le devoir' : 'Marquer comme terminé'), 'rendre'));
      const prive = el('div', 'md-cr-carte md-cr-prive'); prive.append(el('b', null, 'Commentaires privés'), el('small', null, 'Ajouter un commentaire pour…'));
      const droite = el('div', 'md-cr-droite'); droite.append(carte, prive);
      e.append(sujet, droite);
      if (f.picker) {
        const p = el('div', 'md-cr-picker'), liste = el('div', 'md-cr-fichiers');
        p.append(el('div', 'md-cr-ptitre', 'Google Drive'));
        liste.append(c(el('div', 'md-cr-f choisi', '📄 ' + FICHIER), 'fichier'), el('div', 'md-cr-f autre', '📄 Mes notes'));
        const pied = el('div', 'md-cr-ppied'); pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein md-cr-sans', '\u00a0'), 'inserer'));
        p.append(liste, pied); e.append(p);
      }
      if (f.confirme) {
        const dlg = el('div', 'md-cr-dialogue');
        dlg.append(el('b', null, 'Rendre le devoir ?'), el('small', null, '1 pièce jointe sera envoyée pour « ' + DEVOIR + ' ».'), el('div', 'md-cr-piece', '📄 ' + FICHIER));
        const pied = el('div', 'md-cr-ppied'); pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein', 'Rendre le devoir'), 'confirmer'));
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

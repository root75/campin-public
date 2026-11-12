/* Messagerie 03 — démos animées « Regarde comment faire » : la maquette d'Outlook et les images.
   Le lecteur (scène, curseur, ◀ ▶) est commun : pas-a-pas/demo-lecteur.js, chargé avant ce fichier.
   Le clic droit est montré à part (image `droit`) : une souris dont le bouton DE DROITE s'allume, parce que
   beaucoup d'élèves confondent les deux boutons. Menu du clic droit relevé à l'écran le 12/11/2026
   (Outlook web de l'école, capture du professeur). Messages fictifs ; rien n'est enregistré. */
const Demo = (() => {
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const c = (n, id) => { n.dataset.c = id; return n; };

  const DEMOS = {
    nonlu: { titre: 'Marquer un message comme non lu', images: [
      { cible: 'msg-1', legende: 'Je pointe un message déjà lu : il n’est pas en gras.' },
      { droit: 1, cible: 'msg-1', legende: 'J’appuie sur le bouton DROIT de la souris : celui de droite, sous mon majeur.' },
      { droit: 1, menu: 1, hi: 'Marquer comme non lu', cible: 'item-Marquer comme non lu', legende: 'Un menu s’ouvre à côté du pointeur. Je clique, avec le bouton gauche cette fois, sur « Marquer comme non lu ».' },
      { nonlu: 1, cible: 'msg-1', ok: 1, legende: 'Le message repasse en gras, avec une barre bleue à gauche : il est non lu.' }
    ] },
    signaler: { titre: 'Signaler un message douteux', images: [
      { cible: 'msg-2', legende: 'Un message douteux dans ma Boîte de réception : je ne l’ouvre pas.' },
      { droit: 1, cible: 'msg-2', legende: 'Clic DROIT dessus : le bouton de droite de la souris.' },
      { droit: 1, menu: 1, hi: 'Signaler du courrier indésirable', cible: 'item-Signaler du courrier indésirable', legende: 'En bas du menu : « Signaler du courrier indésirable ». Un message qui veut mon mot de passe : « Signaler un hameçonnage », juste en dessous.' },
      { parti: 1, cible: 'dos-indesirable', ok: 1, legende: 'Le message quitte ma Boîte de réception : il est rangé dans Courrier indésirable.' }
    ] }
  };

  const MESSAGES = [
    { de: 'Secrétariat Campin', objet: 'Horaire de la semaine', nonlu: true },
    { de: 'Ton professeur', objet: 'Ta fiche à compléter' },
    { de: 'Super Cadeaux', objet: 'Tu as gagné une tablette !!!' }
  ];
  const MENU = ['Répondre', 'Répondre à tous', 'Transférer', '—', 'Supprimer', 'Archiver', '—', 'Marquer comme non lu', 'Épingler', '—', 'Signaler du courrier indésirable', 'Signaler un hameçonnage', 'Bloquer'];
  const SOURIS = '<svg viewBox="0 0 60 90" width="54" height="81" aria-hidden="true"><rect x="3" y="3" width="54" height="84" rx="27" fill="#fff" stroke="#1f1f1f" stroke-width="4"/><path d="M30 3v34H3V30A27 27 0 0 1 30 3z" fill="#fff"/><path d="M30 3a27 27 0 0 1 27 27v7H30z" fill="#e8590c"/><line x1="30" y1="3" x2="30" y2="37" stroke="#1f1f1f" stroke-width="4"/><line x1="3" y1="37" x2="57" y2="37" stroke="#1f1f1f" stroke-width="4"/></svg>';

  function ecran(f) {
    const e = el('div', 'md md-outlook');
    const dossiers = el('div', 'md-dossiers');
    [['dos-reception', 'Boîte de réception'], ['dos-envoyes', 'Éléments envoyés'], ['dos-brouillons', 'Brouillons'], ['dos-indesirable', 'Courrier indésirable']]
      .forEach(([id, t], k) => dossiers.append(c(el('div', 'md-dossier' + (k === 0 ? ' on' : ''), t), id)));
    const liste = el('div', 'md-liste');
    MESSAGES.forEach((m, k) => {
      if (f.parti && k === 2) return;
      const nonlu = m.nonlu || (f.nonlu && k === 1);
      const ligne = c(el('div', 'md-msg' + (nonlu ? ' nonlu' : '')), 'msg-' + k);
      ligne.append(el('b', 'md-de', m.de), el('span', 'md-objet', m.objet));
      liste.append(ligne);
    });
    e.append(dossiers, liste);
    if (f.menu) {
      const menu = el('div', 'md-menu');
      MENU.forEach(t => menu.append(t === '—' ? el('hr') : c(el('div', 'md-item' + (t === f.hi ? ' hi' : ''), t), 'item-' + t)));
      e.append(menu);
    }
    if (f.droit) {
      const s = el('div', 'md-souris'); s.innerHTML = SOURIS; s.append(el('b', null, 'DROIT'));
      e.append(s);
    }
    return e;
  }

  return DemoLecteur.lecteur({ demos: DEMOS, ecran, pas: 3200 });
})();

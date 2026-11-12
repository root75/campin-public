/* Messagerie 03 — démos animées « Regarde comment faire » : seulement les listes d'images.
   Les vues (Outlook, Chrome, la souris dont le bouton DROIT s'allume) sont communes à tous les cours :
   pas-a-pas/demos-communs.js, chargé avant ce fichier avec le lecteur pas-a-pas/demo-lecteur.js.
   Messages fictifs ; rien n'est enregistré. */
const Demo = (() => {
  const BOITE = { vue: 'ol-liste', messages: [
    { de: 'Secrétariat Campin', objet: 'Horaire de la semaine', nonlu: true },
    { de: 'Ton professeur', objet: 'Ta fiche à compléter' },
    { de: 'Super Cadeaux', objet: 'Tu as gagné une tablette !!!' }
  ] };
  const NOUVEAU = { vue: 'ol-redac', a: ['Ton nom'] };

  const DEMOS = {
    nonlu: { titre: 'Marquer un message comme non lu', images: [
      { ...BOITE, cible: 'msg-1', legende: 'Je pointe un message déjà lu : il n’est pas en gras.' },
      { ...BOITE, droit: 1, cible: 'msg-1', legende: 'J’appuie sur le bouton DROIT de la souris : celui de droite, sous mon majeur.' },
      { ...BOITE, droit: 1, menu: 1, hi: 'Marquer comme non lu', cible: 'item-Marquer comme non lu', legende: 'Un menu s’ouvre à côté du pointeur. Je clique, avec le bouton gauche cette fois, sur « Marquer comme non lu ».' },
      { ...BOITE, nonlu: 1, cible: 'msg-1', ok: 1, legende: 'Le message repasse en gras, avec une barre bleue à gauche : il est non lu.' }
    ] },
    signaler: { titre: 'Signaler un message douteux', images: [
      { ...BOITE, cible: 'msg-2', legende: 'Un message douteux dans ma Boîte de réception : je ne l’ouvre pas.' },
      { ...BOITE, droit: 1, cible: 'msg-2', legende: 'Clic DROIT dessus : le bouton de droite de la souris.' },
      { ...BOITE, droit: 1, menu: 1, hi: 'Signaler du courrier indésirable', cible: 'item-Signaler du courrier indésirable', legende: 'En bas du menu : « Signaler du courrier indésirable ». Un message qui veut mon mot de passe : « Signaler un hameçonnage », juste en dessous.' },
      { ...BOITE, parti: 2, cible: 'dos-indesirable', ok: 1, legende: 'Le message quitte ma Boîte de réception : il est rangé dans Courrier indésirable.' }
    ] },
    cci: { titre: 'Ajouter la ligne Cci', images: [
      { ...NOUVEAU, cible: 'ligne-a', legende: 'Mon nom est dans la ligne À. Je regarde tout au bout de cette ligne, à droite.' },
      { ...NOUVEAU, cible: 'cci', legende: 'Je clique sur le mot « Cci », tout à droite de la ligne À.' },
      { ...NOUVEAU, cci: [], cible: 'ligne-cci', legende: 'Une nouvelle ligne « Cci » apparaît. Je clique dedans et je tape le nom d’un camarade.' },
      { ...NOUVEAU, cci: [], tape: 'Ana', props: [['Ana Dubois · ana.dubois@arcampin.be', 'prop-be', 1], ['Ana Dubois · Externe']], cible: 'prop-be', legende: 'Outlook propose plusieurs lignes : je clique sur celle qui finit par @arcampin.be.' },
      { ...NOUVEAU, cci: ['Ana Dubois', 'Lucas Martin'], cible: 'ligne-cci', ok: 1, legende: 'Mes deux camarades sont dans Cci : chacun reçoit le message, aucun ne voit l’adresse de l’autre.' }
    ] },
    cote: DemosCommuns.vueFractionnee({ titre: 'Mettre le cours et Courrier côte à côte', cours: '🛡️ Mes cours – Messagerie 03',
      coursTitre: '🛡️ Écrire un message en copie cachée', coursLignes: ['☐ Clique sur le bouton bleu Nouveau message…'],
      doc: '✉️ Courrier - Outlook', quoi: 'Courrier', docLignes: ['Boîte de réception', 'Éléments envoyés'], adresse: 'outlook.cloud.microsoft/mail/',
      fin: 'Le cours à gauche, Courrier à droite, dans la même fenêtre. Je clique dans Courrier pour y travailler.' })
  };

  return DemoLecteur.lecteur({ demos: DEMOS, ecran: DemosCommuns.ecran, pas: 3200 });
})();

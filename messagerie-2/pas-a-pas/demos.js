/* Messagerie 02 — démos animées « Regarde comment faire » : seulement les listes d'images.
   Les vues (Outlook, Chrome) sont communes à tous les cours : pas-a-pas/demos-communs.js, chargé avant ce fichier
   avec le lecteur pas-a-pas/demo-lecteur.js. Fichiers et messages fictifs ; rien n'est enregistré. */
const Demo = (() => {
  const FICHE = 'Ma fiche a completer.docx';
  const LU = { vue: 'ol-lu', objet: 'Ta fiche à compléter', de: 'Ton professeur <prof@arcampin.be>', fichier: FICHE, texte: 'Bonjour, complète cette fiche et renvoie-la-moi en pièce jointe.' };
  const REPONSE = { vue: 'ol-redac', ruban: 1, a: ['Ton professeur'], objet: 'RE: Ta fiche à compléter' };
  const ONEDRIVE = { vue: 'ol-selecteur', fichier: FICHE };

  const DEMOS = {
    carte: { titre: 'Ouvrir la pièce jointe dans Word', images: [
      { ...LU, cible: 'carte', legende: 'Je passe la souris sur la carte du fichier, sous l’objet du message.' },
      { ...LU, survol: 1, cible: 'fleche', legende: 'Une petite flèche ▾ apparaît à droite de la carte : je clique dessus.' },
      { ...LU, survol: 1, menu: 1, hi: 'Modifier dans le navigateur', cible: 'item-Modifier dans le navigateur', legende: 'Un menu s’ouvre : je clique sur « Modifier dans le navigateur ».' },
      { vue: 'ch-onglets', onglets: [['✉️ Courrier - Outlook'], ['W ' + FICHE, 'onglet-word', 1]], titre: 'Ma fiche à compléter', bord: 'word', cible: 'onglet-word', ok: 1, legende: 'Un nouvel onglet s’ouvre : Word, avec ma fiche. Word enregistre tout seul.' }
    ] },
    joindre: { titre: 'Joindre un fichier depuis OneDrive', images: [
      { ...REPONSE, cible: 'onglet-message', legende: 'Dans ma réponse, je clique sur l’onglet « Message » du ruban, en haut.' },
      { ...REPONSE, cible: 'joindre', legende: 'Je clique sur le trombone « Joindre un fichier ».' },
      { ...REPONSE, menu: 'joindre', hi: 'OneDrive', cible: 'item-OneDrive', legende: 'Un menu s’ouvre : je clique sur « OneDrive ».' },
      { ...ONEDRIVE, cible: 'fichier', legende: 'Le sélecteur s’ouvre sur « Récents » : je coche ma fiche.' },
      { ...ONEDRIVE, coche: 1, cible: 'fleche-partager', legende: 'En bas, je clique sur la petite flèche ▾ à côté de « Partager le lien ».' },
      { ...ONEDRIVE, coche: 1, menu: 1, hi: 'Joindre', cible: 'item-Joindre', legende: 'Je clique sur « Joindre ».' },
      { ...REPONSE, jointe: FICHE, cible: 'piece', ok: 1, legende: 'Ma fiche est jointe à ma réponse : sa carte apparaît sous l’objet.' }
    ] }
  };

  return DemoLecteur.lecteur({ demos: DEMOS, ecran: DemosCommuns.ecran, pas: 3200 });
})();

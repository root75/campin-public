/* Messagerie 01 — démos animées « Regarde comment faire » : seulement les listes d'images.
   Les vues sont communes à tous les cours : pas-a-pas/demos-communs.js, chargé avant ce fichier avec le lecteur
   pas-a-pas/demo-lecteur.js. Le volet sous la case : DemoLecteur.sousCases, appelé par fiche.js (DEMOS_ETAPES). */
const Demo = (() => {
  const DEMOS = {
    ruban: { titre: 'Agrandir le ruban', images: [
      { vue: 'ol-accueil', cible: 'ruban', legende: 'Le ruban, en haut d’Outlook, tient sur une seule ligne : ses boutons n’ont pas de nom.' },
      { vue: 'ol-accueil', bulle: 1, cible: 'fleche-ruban', legende: 'Tout en bas à droite du ruban, une petite flèche ˅ : « Changer de disposition ». Je clique dessus.' },
      { vue: 'ol-accueil', grand: 1, cible: 'ruban', ok: 1, legende: 'Le ruban s’agrandit : chaque bouton a son nom dessous.' }
    ] }
  };
  return DemoLecteur.lecteur({ demos: DEMOS, ecran: DemosCommuns.ecran, pas: 3200 });
})();

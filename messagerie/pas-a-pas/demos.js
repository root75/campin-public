/* Messagerie 01 — démos animées « Regarde comment faire » : seulement les listes d'images.
   Les vues sont communes à tous les cours : pas-a-pas/demos-communs.js, chargé avant ce fichier avec le lecteur
   pas-a-pas/demo-lecteur.js. Le volet sous la case : DemoLecteur.sousCases, appelé par fiche.js (DEMOS_ETAPES). */
const Demo = (() => {
  const NOUVEAU = { vue: 'ol-redac' };
  const CAMARADE = 'Lucas Martin', PROF = 'M. Dupont';
  const DEMOS = {
    nouveau: { titre: 'Écrire à un camarade, le professeur en Cc', images: [
      { vue: 'ol-accueil', cible: 'nouveau', legende: 'Onglet Accueil : je clique sur le bouton bleu « Nouveau message » (touche N).' },
      { ...NOUVEAU, cible: 'ligne-a', legende: 'Un nouveau message s’ouvre. Je clique dans la ligne À.' },
      { ...NOUVEAU, dans: 'a', tape: 'lucas', props: [[CAMARADE + ' · lucas.martin@arcampin.be', 'prop-a', 1]], cible: 'prop-a', legende: 'Je tape le début du nom de mon camarade. Outlook propose son adresse : je clique dessus.' },
      { ...NOUVEAU, a: [CAMARADE], cible: 'ligne-cc', legende: 'Mon camarade est dans À. Je clique dans la ligne Cc, juste en dessous.' },
      { ...NOUVEAU, a: [CAMARADE], dans: 'cc', tape: 'Dupont', props: [[PROF + ' · dupont@arcampin.be', 'prop-cc', 1], [PROF + ' · Externe'], ['dupont@arcampin.com']], cible: 'prop-cc', legende: 'Je tape le nom de mon professeur. Je clique sur la ligne qui finit par @arcampin.be : pas « Externe », pas @arcampin.com.' },
      { ...NOUVEAU, a: [CAMARADE], cc: [PROF], cible: 'objet', legende: 'Mon professeur est en Cc. Je clique dans « Ajouter un objet ».' },
      { ...NOUVEAU, a: [CAMARADE], cc: [PROF], objet: 'Une question pour toi', cible: 'objet', ok: 1, legende: 'J’écris un titre court. Ensuite le corps du message. ⚠️ Je n’envoie pas encore : je relis d’abord.' }
    ] },
    ruban: { titre: 'Agrandir le ruban', images: [
      { vue: 'ol-accueil', cible: 'ruban', legende: 'Le ruban, en haut d’Outlook, tient sur une seule ligne : ses boutons n’ont pas de nom.' },
      { vue: 'ol-accueil', bulle: 1, cible: 'fleche-ruban', legende: 'Tout en bas à droite du ruban, une petite flèche ˅ : « Changer de disposition ». Je clique dessus.' },
      { vue: 'ol-accueil', grand: 1, cible: 'ruban', ok: 1, legende: 'Le ruban s’agrandit : chaque bouton a son nom dessous.' }
    ] }
  };
  return DemoLecteur.lecteur({ demos: DEMOS, ecran: DemosCommuns.ecran, pas: 3200 });
})();

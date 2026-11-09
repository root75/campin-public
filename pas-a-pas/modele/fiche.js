/* FICHE EXEMPLE du moteur pas à pas — à copier dans <dossier>/pas-a-pas/fiche.js, puis remplacer.
   Une fiche ne contient que des DONNÉES ; tout le reste est fait par pas-a-pas/blocs.js.
   Mode d'emploi complet : pas-a-pas/MOTEUR.md. */
const COURS = 'modele';                 // = l'id du cours dans pas-a-pas/cours.json
const VERSION_PARCOURS = 'v1';          // change-le si l'ordre des blocs change (l'avancement local repart à zéro)
const PRESENTATION = 'missions';        // le but, des cases à cocher, « À vérifier », la cloche 🔔
const HORS_SUIVI = 'Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';
/* Questions de preuve tirées et corrigées par le SERVEUR (règle anti-recopie : 3 variantes par bloc) :
   décommente, crée preuves.json, et mets q:{serveur:true} dans les blocs concernés.
const PREUVES = 'https://root75.github.io/campin-public/<dossier>/pas-a-pas/preuves.json?v=AAAAMMJJ'; */

const BLOCS = [
 { partie:'A — Je découvre', titre:'Un QCM corrigé dans la page', min:5,
   veux:'Le but du bloc, en une phrase.',
   gestes:['Une action par ligne, à l’impératif.','Toujours le chemin de clics : bouton Nouveau ▸ Nouveau dossier.','L’icône ET le raccourci : 📋 Copier (Ctrl+C).'],
   vois:'Ce que l’élève doit voir à l’écran quand c’est fait.',
   coince:['Le blocage prévisible n° 1 et sa solution.','Le blocage prévisible n° 2 et sa solution.'],
   q:{type:'qcm', q:'La question ?', c:['La bonne réponse (toujours en premier)','Un piège','Un autre piège'],
      p:[null,'Ce qu’on dit à qui choisit ce piège.','Ce qu’on dit à qui choisit cet autre piège.']},
   variantes:[   // versions 2 et 3, tirées par élève dans la page (sans PREUVES)
     {q:{type:'qcm', q:'La question, version 2 ?', c:['Bonne réponse v2','Piège','Piège'], p:[null,'Pourquoi non.','Pourquoi non.']}},
     {q:{type:'qcm', q:'La question, version 3 ?', c:['Bonne réponse v3','Piège','Piège'], p:[null,'Pourquoi non.','Pourquoi non.']}}
   ]},
 { partie:'A — Je découvre', titre:'Une saisie avec une règle', min:5,
   veux:'Recopier une information trouvée à l’écran.',
   gestes:['Ouvre la page.','Repère l’information.','Recopie-la dans la case.'],
   vois:'L’information est recopiée exactement.', stop:true,
   coince:['Je ne trouve pas l’information : elle est en haut, sous le titre.'],
   // regle : egal, exact, contient, motif (expression régulière sur la réponse sans accents ni majuscules), sauf
   q:{type:'saisie', q:'Recopie le mot « exemple ».', regle:{egal:['exemple']}, faux:'Recopie exactement : exemple.'}},
 { partie:'B — Je rédige', titre:'Une rédaction contrôlée, à copier ailleurs', min:10,
   veux:'Préparer un court texte ici, puis le coller dans Docs ou Outlook.',
   gestes:['Écris ton texte en suivant le modèle.','Clique sur Vérifier.','Clique sur 📋 Copier mon texte, puis colle-le : Ctrl+V.'],
   vois:'Mon texte est collé à sa place.',
   coince:['Le bouton Copier ne marche pas : sélectionne le texte, puis Ctrl+C.'],
   q:{type:'redaction', q:'Mon texte, prêt à coller.', copier:true,
      modele:'Bonjour,\n[Une phrase.]\n[Prénom Nom], [classe]',
      champs:[{cle:'nom', nom:'Ton prénom et ton nom', aide:'Pour vérifier ta signature.'}],
      zone:{nom:'Mon texte', lignes:5},
      // renvoie la liste des erreurs, vide si tout va bien ; ctx.classe = la classe de l'élève (suivi)
      controle:(texte, v) => /^Bonjour/.test(texte.trim()) ? [] : ['Commence par « Bonjour ».']}}
];

const FIN = {
  titre:'Bravo, c’est terminé',
  bulle:'Fini !',
  texte:'Ce que l’élève a réussi, en une phrase.',
  citation:{texte:'Une citation réelle.', auteur:'Son auteur', source:'L’œuvre (date)', lien:'Le lien avec ce qu’on vient de faire.'},
  plus:'Ce qu’il fait s’il a fini avant les autres.',
  lien:'<a href="https://root75.github.io/campin-public/revisions/" target="_blank" rel="noopener">la page de révision</a>'
};

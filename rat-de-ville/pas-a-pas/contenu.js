/* Transcription du formatif Drive ; papier conservé.
   Une case = une action. « icones » : index de l'action → icône(s) de icones/ affichée(s) devant.
   Nombre de cases par étape : doit rester égal à CASES_RAT dans Code.gs. */
const ETAPES_RAT = [
  {
    "titre": "Je crée et je nomme",
    "min": 5,
    "periode": 1,
    "actions": [
      "Menu Google (la gaufre) ▸ Docs ▸ Créer un document ▸ Vierge.",
      "Je clique sur « Document sans titre » et je tape : AAAAMMJJ Le rat de ville – Prénom Nom. AAAAMMJJ : année, mois, jour de la date d’aujourd’hui."
    ]
  },
  {
    "titre": "Je recopie la fable",
    "min": 30,
    "periode": 1,
    "consigne": "Un vers = une ligne : touche Entrée au bout de chaque vers. Les sept repères servent à retrouver ma place pendant la copie ; je sépare les strophes à l’étape 3.",
    "actions": [
      "Je tape le titre.",
      "Je recopie les vers 1 à 4 (repère de strophe 1).",
      "Je recopie les vers 5 à 8 (repère de strophe 2).",
      "Je recopie les vers 9 à 12 (repère de strophe 3).",
      "Je recopie les vers 13 à 16 (repère de strophe 4).",
      "Je recopie les vers 17 à 20 (repère de strophe 5).",
      "Je recopie les vers 21 à 24 (repère de strophe 6).",
      "Je recopie les vers 25 à 28 (repère de strophe 7).",
      "Je tape l’auteur : Jean de La Fontaine."
    ]
  },
  {
    "titre": "Je structure",
    "min": 10,
    "periode": 1,
    "actions": [
      "Je mets une majuscule à la première lettre de chaque vers.",
      "Je laisse une ligne vide tous les 4 vers : j’obtiens 7 strophes."
    ]
  },
  {
    "titre": "Je ferme sans remettre",
    "min": 2,
    "periode": 1,
    "actions": [
      "Je ferme l’onglet du document. Je ne remets PAS encore : mon document est enregistré tout seul."
    ]
  },
  {
    "titre": "Je retrouve mon document",
    "min": 3,
    "periode": 2,
    "actions": [
      "Menu Google (la gaufre) ▸ Drive ▸ Récents ▸ double-clic sur mon document."
    ]
  },
  {
    "titre": "Titre, texte, auteur",
    "min": 10,
    "periode": 2,
    "actions": [
      "Je sélectionne le titre. Je clique sur Centrer (Ctrl + Maj + E).",
      "Le titre toujours sélectionné, je clique sur Gras (Ctrl + B).",
      "Le titre toujours sélectionné : Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES.",
      "Je sélectionne les 7 strophes. Je clique sur Centrer (Ctrl + Maj + E).",
      "Je sélectionne l’auteur. Je clique sur Aligner à droite (Ctrl + Maj + R).",
      "L’auteur toujours sélectionné, je clique sur Italique (Ctrl + I).",
      "L’auteur toujours sélectionné, je clique sur Souligner (Ctrl + U)."
    ],
    "icones": { "0": ["centrer"], "1": ["gras"], "3": ["centrer"], "4": ["droite"], "5": ["italique"], "6": ["souligne"] }
  },
  {
    "titre": "Une police par strophe",
    "min": 12,
    "periode": 2,
    "consigne": "Pour chaque strophe : je la sélectionne seule, je choisis la police dans le menu des polices, puis je tape la taille dans la case du nombre.",
    "actions": [
      "Je sélectionne seulement la strophe 1 : Garamond, taille 14.",
      "Je sélectionne seulement la strophe 2 : Garamond, taille 14.",
      "Je sélectionne seulement la strophe 3 : Arial, taille 12.",
      "Je sélectionne seulement la strophe 4 : Arial, taille 12.",
      "Je sélectionne seulement la strophe 5 : Calibri, taille 10.",
      "Je sélectionne seulement la strophe 6 : Arial Black, taille 8.",
      "Je sélectionne seulement la strophe 7 : Arial Black, taille 8."
    ],
    "icones": { "0": ["police","taille"], "1": ["police","taille"], "2": ["police","taille"], "3": ["police","taille"], "4": ["police","taille"], "5": ["police","taille"], "6": ["police","taille"] }
  },
  {
    "titre": "Mon bloc-notes",
    "min": 12,
    "periode": 2,
    "actions": [
      "Sous la fable, je laisse deux lignes vides et j’écris : Mon bloc-notes. Puis, dans l’ordre :",
      "Trois choses que l’on trouve au festin du rat de ville, en liste à puces (Ctrl + Maj + 8).",
      "J’écris : Mes gestes. Puis, en liste numérotée (Ctrl + Maj + 7) : chaque geste de mise en forme, dans l’ordre, avec le bouton, le menu ou le raccourci utilisé. Au moins six gestes.",
      "J’écris une phrase qui répond à : Comment je change la police d’une seule strophe sans toucher aux autres ?"
    ],
    "icones": { "1": ["puces"], "2": ["numeros"] },
    "aides": {
      "1": {
        "titre": "Qu’écrire dans la liste à puces ?",
        "explication": "Je choisis trois choses présentes au festin dans la fable. Dans mon document Docs, j’écris une chose par ligne, je sélectionne ces trois lignes, puis je clique sur le bouton Liste à puces (Ctrl + Maj + 8).",
        "exemple": "Exemple d’un élément possible : le tapis.",
        "rappel": "Je trouve les autres éléments dans la fable. Trois éléments sont attendus au total."
      },
      "2": {
        "titre": "Que signifie « Mes gestes » ?",
        "explication": "Je raconte comment j’ai mis mon document en forme. Pour chaque geste, je précise ce que j’ai sélectionné et le bouton, le menu ou le raccourci utilisé. Sous « Mes gestes », j’écris un geste par ligne, je sélectionne les lignes, puis je clique sur Liste numérotée (Ctrl + Maj + 7).",
        "exemple": "Exemple d’un geste : « J’ai sélectionné le titre, puis cliqué sur le bouton Centrer (Ctrl + Maj + E). »",
        "rappel": "J’écris au moins six gestes que j’ai réellement faits, dans l’ordre où je les ai faits. Ma liste doit correspondre à mon document."
      },
      "3": {
        "titre": "Qu’expliquer dans ma phrase ?",
        "explication": "Je réponds avec mes mots à la question : « Comment je change la police d’une seule strophe sans toucher aux autres ? » J’explique ce que je sélectionne et ce que je modifie. J’utilise les mots sélectionner, police et taille.",
        "exemple": "Début possible à compléter : « Pour changer une seule strophe, je… »",
        "rappel": "J’écris ma phrase dans le document Docs, sous la liste de mes gestes."
      }
    }
  },
  {
    "titre": "Je m’évalue et je remets",
    "min": 10,
    "periode": 2,
    "consigne": "Je vérifie une chose par case, dans mon document. Si une chose manque, je la corrige avant de cocher.",
    "actions": [
      "Je clique sur Vérifier l’orthographe (Ctrl + Alt + X) et je corrige.",
      "Je vérifie le nom : AAAAMMJJ Le rat de ville – Prénom Nom.",
      "Je vérifie que la fable est complète : titre, 28 vers, auteur.",
      "Je vérifie qu’il y a une majuscule au début de chaque vers.",
      "Je vérifie qu’il y a 7 strophes, séparées par une ligne vide.",
      "Je vérifie le titre : centré, gras, en MAJUSCULES.",
      "Je vérifie que les 7 strophes sont centrées.",
      "Je vérifie l’auteur : à droite, en italique, souligné.",
      "Je vérifie que chaque strophe a sa police et sa taille.",
      "Je vérifie mon bloc-notes : une vraie liste à puces, une vraie liste numérotée d’au moins six gestes, ma phrase.",
      "Je remplis la colonne « Moi » de la grille : A, B, C ou D pour chaque critère.",
      "Je montre mon document à mon voisin. Il le compare aux cases 2 à 10 et me montre un écart, sans toucher la souris. Je corrige.",
      "Classroom ▸ le devoir ▸ Votre travail ▸ Ajouter ou créer ▸ Google Drive ▸ mon document ▸ Insérer ▸ Remettre."
    ],
    "icones": { "0": ["orthographe"] }
  }
];
const GRILLE_RAT = [
  { n: "1. Choix de l'outil et des fonctions", inc: false,
    regarde: "Chaque mise en forme est faite avec la bonne fonction : alignements avec le bouton (aucun espace tapé), gras, italique, souligné, vraie liste à puces, vraie liste numérotée, une seule ligne vide entre les strophes.",
    A: "Tout est fait avec la bonne fonction, sans exception.", B: "Une seule mise en forme faite « à la main ».",
    C: "Deux ou trois mises en forme faites à la main.", D: "La plupart des mises en forme faites à la main, ou absentes." },
  { n: "2. Qualité de la production", inc: true,
    regarde: "Document nommé « AAAAMMJJ Le rat de ville – Prénom Nom ». Fable complète et exacte, une majuscule à chaque vers, 7 strophes séparées. Titre centré, gras, en majuscules ; texte centré ; auteur à droite, italique, souligné. La bonne police et la bonne taille pour chaque strophe.",
    A: "Tout est conforme et la copie est sans faute.", B: "Conforme, avec au plus deux écarts légers (1 à 3 fautes, une taille, une strophe).",
    C: "Plusieurs éléments manquent ou sont faux (une police sur plusieurs strophes, l'auteur mal placé, des vers oubliés…).", D: "Production inachevée : fable incomplète, mise en forme absente, ou rien de remis." },
  { n: "3. Démarche de création", inc: true,
    regarde: "La liste numérotée « Mes gestes » : les gestes de mise en forme, dans l'ordre où je les ai faits, chacun avec le bouton, le menu ou le raccourci utilisé. Le document correspond à ce que j'annonce.",
    A: "Au moins six gestes, dans l'ordre, chacun avec son bouton ou menu, tous visibles dans le document.", B: "Cinq gestes dans un ordre cohérent ; le bouton n'est pas toujours nommé.",
    C: "Deux à quatre gestes, ou une liste qui ne correspond pas au document.", D: "Pas de liste des gestes, ou sans rapport avec la mise en forme." },
  { n: "4. Communication et justification", inc: false,
    regarde: "La phrase qui répond à : « Comment je change la police d'une seule strophe sans toucher aux autres ? », avec les mots du cours (sélectionner, police, taille).",
    A: "Démarche juste et précise : je sélectionne seulement la strophe, puis je choisis la police et la taille.", B: "Démarche juste, dite simplement.",
    C: "Réponse vague : « je change la police », « je clique dessus ».", D: "Pas de phrase, ou une démarche fausse." }
];

/* Repères pédagogiques du 4 novembre : aucune nouvelle case ni donnée élève. */
const REPERES_RAT = [
  {observe: "Je repère le nom du document en haut à gauche dans Docs.", verifie: "Le nom contient la date d’aujourd’hui, Le rat de ville, mon prénom et mon nom.", encouragement: "Un nom précis me permettra de retrouver mon travail à la prochaine période."},
  {observe: "J’ouvre l’image de la fiche. Je repère le titre, les vers et l’auteur avant de recopier.", verifie: "Je compare ma dernière ligne à l’image avant de passer au groupe suivant. Je dois retrouver 28 vers.", encouragement: "Les petits groupes de quatre vers m’aident à garder ma place."},
  {observe: "Une strophe regroupe quatre vers. Une ligne vide sépare deux strophes.", verifie: "Je compte sept groupes de quatre vers et je regarde la première lettre de chaque vers.", encouragement: "Les strophes sont maintenant plus faciles à repérer."},
  {observe: "Je vérifie dans Docs que l’enregistrement est terminé avant de fermer l’onglet.", verifie: "Je ferme le document ; je ne clique pas encore sur Remettre dans Classroom.", encouragement: "Je reprendrai le même document à la période suivante."},
  {observe: "Dans Drive, j’utilise le nom et la date pour reconnaître mon document.", verifie: "Je l’ouvre : est-ce que je retrouve ma fable et les sept strophes ? Sinon, je retourne dans Récents avant de continuer.", encouragement: "Retrouver mon travail fait aussi partie de la démarche."},
  {observe: "Je compare les trois zones du modèle : le titre, les strophes et l’auteur.", verifie: "Le titre est centré, gras et en majuscules ; le texte est centré ; l’auteur est à droite, italique et souligné. J’utilise les boutons d’alignement, sans taper d’espaces.", encouragement: "Sélectionner la bonne zone me permet de modifier seulement ce que je veux."},
  {observe: "Je repère le numéro de la strophe avant de choisir sa police et sa taille.", verifie: "Je clique dans chaque strophe et je lis la police et la taille dans la barre d’outils. Si les autres strophes ont changé aussi : Ctrl + Z, puis je sélectionne uniquement la strophe voulue.", encouragement: "Changer une strophe sans toucher aux autres montre que je maîtrise la sélection."},
  {observe: "Des puces pour les choses du festin ; des numéros pour raconter mes gestes dans l’ordre.", verifie: "Dans Docs : trois éléments du festin, au moins six gestes réellement faits et une phrase avec sélectionner, police et taille.", encouragement: "Nommer le bouton utilisé permet à quelqu’un d’autre de comprendre ma méthode."},
  {observe: "J’ouvre la grille : les critères avec une étoile sont incontournables.", verifie: "Je compare mon fichier aux critères avant de choisir mes lettres Moi. Après la remise, je vérifie dans Classroom que le devoir est bien indiqué comme remis.", encouragement: "Repérer et corriger un écart fait partie du travail : je peux encore améliorer mon document avant de le remettre."}
];

/* Transcription du formatif Drive ; papier conservé.
   « id » : numéro interne de l'étape, celui des clés de cases (« 6.1 ») et du Journal. Il ne change
   jamais, même si l'étape est déplacée ou renumérotée à l'écran (étapes 4 et 5 retirées le 6/11 :
   les ids 4 et 5 restent libres). Le numéro affiché est la place dans ETAPES_RAT.
   Le serveur lit les cases dans pas-a-pas/cours.json (« cases ») : les garder égales à ce fichier
   (essai-rat.js le vérifie).
   Une case = une action. « icones » : index de l'action → icône(s) de icones/ affichée(s) devant.
   « demos » : même format que le moteur commun blocs.js — "N" (N-ième case, à partir de 1) :
   [clé de l'animation dans demos.js, numéros des images à montrer sous cette case].
   Une image absente de toutes les cases reste visible dans « Toutes les animations ».
 */
const ETAPES_RAT = [
  {
    "id": 1,
    "titre": "Je crée et je nomme",
    "min": 5,
    "periode": 1,
    "demos": {
      "1": ["etape1", [0, 1, 2]],
      "2": ["etape1", [3, 4]],
      "3": ["cote", [0, 1, 2, 3]]
    },
    "actions": [
      "Menu Google (la gaufre) ▸ Docs ▸ Créer un document ▸ Vierge.",
      "Je clique sur « Document sans titre » et je tape : [[AAAAMMJJ Le rat de ville – Prénom Nom]] AAAAMMJJ : année, mois, jour de la date d’aujourd’hui.",
      "Je place mon document à côté du cours : je clique sur l’onglet du cours, puis clic droit sur l’onglet de mon document ▸ Ajouter l’onglet à une nouvelle vue fractionnée. Le cours et mon document s’affichent côte à côte dans la même fenêtre."
    ]
  },
  {
    "id": 2,
    "titre": "Je recopie la fable",
    "min": 30,
    "periode": 1,
    "consigne": "Un vers = une ligne : touche Enter au bout de chaque vers. Je ne laisse PAS de ligne vide : les 28 vers se suivent. Je séparerai les strophes à l’étape 3.",
    "demos": {
      "1": ["etape2", [0]],
      "2": ["etape2", [1, 2, 3]]
    },
    "actions": [
      "Je tape le titre.",
      "Je recopie les vers 1 à 4.",
      "Je recopie les vers 5 à 8.",
      "Je recopie les vers 9 à 12.",
      "Je recopie les vers 13 à 16.",
      "Je recopie les vers 17 à 20.",
      "Je recopie les vers 21 à 24.",
      "Je recopie les vers 25 à 28.",
      "Je tape l’auteur : [[Jean de La Fontaine]]"
    ],
    "images": { "0": "fable/titre.png", "1": "fable/strophe-1.png", "2": "fable/strophe-2.png", "3": "fable/strophe-3.png", "4": "fable/strophe-4.png", "5": "fable/strophe-5.png", "6": "fable/strophe-6.png", "7": "fable/strophe-7.png", "8": "fable/auteur.png" },
    "aides": {
      "1": {
        "titre": "Comment taper ç et à ?",
        "explication": "Sur le clavier belge : ç est sur la touche 9, à sur la touche 0. Je tape la touche seule, sans Shift.",
        "exemple": "façon · à des reliefs",
        "rappel": "Avec Shift, ces touches donnent 9 et 0. Je me suis trompé ? ↶ Annuler (Ctrl + Z)."
      },
      "3": {
        "titre": "Comment taper ê (accent circonflexe) ?",
        "explication": "Je tape d’abord la touche ^, à droite du P : rien ne s’affiche, c’est normal. Puis je tape e : ê apparaît.",
        "exemple": "honnête · fête",
        "rappel": "^ puis la voyelle : ^ + o donne ô, ^ + a donne â."
      },
      "5": {
        "titre": "Comment taper ô et les guillemets « » ?",
        "explication": "ô : je tape la touche ^, à droite du P (rien ne s’affiche, c’est normal), puis o. Guillemets : j’utilise les guillemets américains \" : la touche 3, sans Shift, avant et après les mots.",
        "exemple": "aussitôt · rôt · \"achevons tout notre rôt.\"",
        "rappel": "Le ^ apparaît seul ? Je l’efface et je recommence : ^, puis o, sans espace. Les guillemets « » de l’image ne sont pas sur le clavier : \" les remplace."
      }
    }
  },
  {
    "id": 3,
    "titre": "Je structure",
    "min": 10,
    "periode": 1,
    "demos": {
      "1": ["etape3", [0, 1]],
      "2": ["etape3", [2]]
    },
    "actions": [
      "Je mets une majuscule à la première lettre de chaque vers.",
      "Je clique à la fin du vers 4 et j’appuie sur Enter : une ligne vide apparaît. Je fais pareil après les vers 8, 12, 16, 20 et 24 : j’obtiens 7 strophes."
    ],
    "aides": {
      "0": {
        "titre": "Comment mettre à en majuscule (À) ?",
        "explication": "Je double-clique sur le à pour le sélectionner, seul. Puis Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES.",
        "exemple": "à la porte de la salle → À la porte de la salle",
        "rappel": "Deux vers commencent par à : le vers 4 et le vers 13. Pour les autres lettres, j’efface la minuscule et je tape la majuscule avec Shift.",
        "image": "capture-majuscules.png"
      }
    }
  },
  {
    "id": 6,
    "titre": "Titre, texte, auteur",
    "min": 10,
    "periode": 2,
    "demos": {
      "1": ["etape6", [0, 1]],
      "2": ["etape6", [2]],
      "3": ["etape6", [3]],
      "4": ["etape6", [4, 5]],
      "5": ["etape6", [6]],
      "6": ["etape6", [7]],
      "7": ["etape6", [8]]
    },
    "actions": [
      "Je sélectionne le titre. Je clique sur Centrer (Ctrl + Shift + E).",
      "Le titre toujours sélectionné, je clique sur Gras (Ctrl + B).",
      "Le titre toujours sélectionné : Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES.",
      "Je sélectionne les 7 strophes. Je clique sur Centrer (Ctrl + Shift + E).",
      "Je sélectionne l’auteur. Je clique sur Aligner à droite (Ctrl + Shift + R).",
      "L’auteur toujours sélectionné, je clique sur Italique (Ctrl + I).",
      "L’auteur toujours sélectionné, je clique sur Souligner (Ctrl + U)."
    ],
    "icones": { "0": ["centrer"], "1": ["gras"], "3": ["centrer"], "4": ["droite"], "5": ["italique"], "6": ["souligne"] }
  },
  {
    "id": 7,
    "titre": "Une police par strophe",
    "min": 12,
    "periode": 2,
    "consigne": "Pour chaque strophe : je la sélectionne seule, je choisis la police dans le menu des polices, puis je tape la taille dans la case du nombre.",
    "demos": {
      "1": ["etape7", [0, 1, 2, 3]]
    },
    "actions": [
      "Je sélectionne seulement la strophe 1 : EB Garamond, taille 14.",
      "Je sélectionne seulement la strophe 2 : EB Garamond, taille 14.",
      "Je sélectionne seulement la strophe 3 : Arial, taille 12.",
      "Je sélectionne seulement la strophe 4 : Arial, taille 12.",
      "Je sélectionne seulement la strophe 5 : Calibri, taille 10.",
      "Je sélectionne seulement la strophe 6 : Arial Black, taille 8.",
      "Je sélectionne seulement la strophe 7 : Arial Black, taille 8."
    ],
    "icones": { "0": ["police","taille"], "1": ["police","taille"], "2": ["police","taille"], "3": ["police","taille"], "4": ["police","taille"], "5": ["police","taille"], "6": ["police","taille"] }
  },
  {
    "id": 8,
    "titre": "Mon bloc-notes : la liste à puces",
    "min": 5,
    "periode": 2,
    "demos": {
      "2": [
        "etape8",
        [
          0
        ]
      ]
    },
    "actions": [
      "Sous la fable, je laisse deux lignes vides et j’écris : [[Mon bloc-notes]]",
      "Trois choses que l’on trouve au festin du rat de ville, en liste à puces (Ctrl + Shift + 8)."
    ],
    "icones": {
      "1": [
        "puces"
      ]
    },
    "aides": {
      "1": {
        "titre": "Qu’écrire dans la liste à puces ?",
        "explication": "Je choisis trois choses présentes au festin dans la fable. Dans mon document Docs, j’écris une chose par ligne, je sélectionne ces trois lignes, puis je clique sur le bouton Liste à puces (Ctrl + Shift + 8).",
        "exemple": "Exemple d’un élément possible : le tapis.",
        "rappel": "Je trouve les autres éléments dans la fable. Trois éléments sont attendus au total."
      }
    }
  },
  {
    "id": 10,
    "titre": "Mes gestes : la liste numérotée",
    "min": 10,
    "periode": 2,
    "consigne": "Je raconte six gestes de mise en forme, un par un. Un geste complet dit deux choses : ce que j’ai sélectionné, puis le bouton ou le menu utilisé.",
    "demos": {
      "8": ["etape10", [0]]
    },
    "actions": [
      "Sous mes puces, sur une nouvelle ligne, j’écris : [[Mes gestes]]",
      "Geste 1 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Geste 2 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Geste 3 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Geste 4 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Geste 5 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Geste 6 : je complète la phrase, puis je l’écris dans Docs, sur une nouvelle ligne.",
      "Je sélectionne mes six lignes. Je clique sur Liste numérotée (Ctrl + Shift + 7)."
    ],
    "icones": {
      "7": [
        "numeros"
      ]
    },
    "trous": {
      "1": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "J’ai ___ le titre, puis j’ai cliqué sur ___ .",
            "mots": [
              "sélectionné",
              "Centrer"
            ],
            "pieges": [
              "recopié",
              "la barre d’espace"
            ]
          }
        ]
      },
      "2": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "J’ai gardé le titre ___ , puis j’ai cliqué sur ___ .",
            "mots": [
              "sélectionné",
              "Gras"
            ],
            "pieges": [
              "centré",
              "Italique"
            ]
          }
        ]
      },
      "3": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "Pour mettre le titre en majuscules, j’ai ouvert le menu ___ ▸ Texte ▸ Minuscules/majuscules ▸ ___ .",
            "mots": [
              "Format",
              "MAJUSCULES"
            ],
            "pieges": [
              "Insertion",
              "Caps Lock"
            ]
          }
        ]
      },
      "4": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "J’ai sélectionné les 7 ___ , puis j’ai cliqué sur ___ .",
            "mots": [
              "strophes",
              "Centrer"
            ],
            "pieges": [
              "titres",
              "Aligner à droite"
            ]
          }
        ]
      },
      "5": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "J’ai sélectionné ___ , puis j’ai cliqué sur ___ .",
            "mots": [
              "l’auteur",
              "Aligner à droite"
            ],
            "pieges": [
              "le titre",
              "la barre d’espace"
            ]
          }
        ]
      },
      "6": {
        "bravo": "Juste ! J’écris cette phrase dans Docs, sur une nouvelle ligne.",
        "variantes": [
          {
            "texte": "J’ai sélectionné la strophe 1, puis j’ai choisi la ___ EB Garamond et la ___ 14.",
            "mots": [
              "police",
              "taille"
            ],
            "pieges": [
              "couleur",
              "marge"
            ]
          }
        ]
      }
    },
    "aides": {
      "0": {
        "titre": "Que signifie « Mes gestes » ?",
        "explication": "Je raconte comment j’ai mis mon document en forme. Pour chaque geste, je précise ce que j’ai sélectionné et le bouton, le menu ou le raccourci utilisé. J’écris un geste par ligne. À la fin, je sélectionne les six lignes, puis je clique sur Liste numérotée (Ctrl + Shift + 7).",
        "exemple": "Exemple d’un geste : « J’ai sélectionné le titre, puis j’ai cliqué sur Centrer. »",
        "rappel": "« J’ai écrit le texte » ou « J’ai mis l’auteur » ne sont pas des gestes de mise en forme : il manque ce que j’ai sélectionné et le bouton."
      }
    }
  },
  {
    "id": 11,
    "titre": "Ma phrase : j’explique",
    "min": 5,
    "periode": 2,
    "demos": {
      "2": ["etape11", [0]]
    },
    "actions": [
      "Je complète l’explication ci-dessous.",
      "Dans Docs, sous ma liste, j’écris une phrase avec mes mots qui répond à : Comment je change la police d’une seule strophe sans toucher aux autres ?"
    ],
    "icones": {},
    "trous": {
      "0": {
        "titre": "Pourquoi sélectionner d’abord ?",
        "intro": "Je complète l’explication avec les mots de la banque.",
        "bravo": "Juste ! Maintenant, la case suivante : ma phrase à moi, dans Docs.",
        "variantes": [
          {
            "texte": "Docs modifie seulement le texte ___ . Donc je sélectionne d’abord ___ , puis je choisis la ___ .",
            "mots": [
              "sélectionné",
              "la strophe",
              "police"
            ],
            "pieges": [
              "recopié",
              "tout le document",
              "marge"
            ]
          },
          {
            "texte": "Si je sélectionne ___ avec Ctrl + A, toutes les strophes changent. Pour en changer une seule, je sélectionne ___ cette strophe, puis je choisis la police et la ___ .",
            "mots": [
              "tout le texte",
              "seulement",
              "taille"
            ],
            "pieges": [
              "le titre",
              "aussi",
              "couleur"
            ]
          },
          {
            "texte": "Avant d’ouvrir le menu des polices, je ___ la strophe. Les autres strophes ne changent pas, parce qu’elles ne sont pas ___ . Si elles ont changé quand même : ___ .",
            "mots": [
              "sélectionne",
              "sélectionnées",
              "Ctrl + Z"
            ],
            "pieges": [
              "recopie",
              "centrées",
              "Ctrl + S"
            ]
          }
        ]
      }
    },
    "aides": {
      "1": {
        "titre": "Qu’expliquer dans ma phrase ?",
        "explication": "Je réponds avec mes mots à la question : « Comment je change la police d’une seule strophe sans toucher aux autres ? » J’explique ce que je sélectionne et ce que je modifie. J’utilise les mots sélectionner, police et taille.",
        "exemple": "Début possible à compléter : « Pour changer une seule strophe, je… »",
        "rappel": "J’écris ma phrase dans le document Docs, sous la liste de mes gestes. Je ne recopie pas le texte à trous : je le dis à ma façon."
      }
    }
  },
  {
    "id": 9,
    "titre": "Je m’évalue et je remets",
    "min": 10,
    "periode": 2,
    "consigne": "Je vérifie une chose par case, dans mon document. Si une chose manque, je la corrige avant de cocher.",
    "demos": {
      "1": ["etape9", [0]],
      "13": ["etape9", [1, 2, 3, 4, 5, 6, 7, 8]]
    },
    "actions": [
      "Je clique sur Vérifier l’orthographe (Ctrl + Alt + X) et je corrige.",
      "Je vérifie le nom : [[AAAAMMJJ Le rat de ville – Prénom Nom]]",
      "Je vérifie que la fable est complète : titre, 28 vers, auteur.",
      "Je vérifie qu’il y a une majuscule au début de chaque vers.",
      "Je vérifie qu’il y a 7 strophes, séparées par une ligne vide.",
      "Je vérifie le titre : centré, gras, en MAJUSCULES.",
      "Je vérifie que les 7 strophes sont centrées.",
      "Je vérifie l’auteur : à droite, en italique, souligné.",
      "Je vérifie que chaque strophe a sa police et sa taille.",
      "Je vérifie mon bloc-notes : une vraie liste à puces, une vraie liste numérotée de six gestes, ma phrase.",
      "J’ouvre ma grille (bouton 📋, après l’étape 9) et je remplis la colonne « Moi » : A, B, C ou D pour chaque critère.",
      "Je montre mon document à mon voisin. Il le compare aux cases 2 à 10 et me montre un écart, sans toucher la souris. Je corrige.",
      "Classroom ▸ le devoir ▸ Vos devoirs ▸ Ajouter ou créer ▸ Google Drive ▸ mon document ▸ bouton bleu ▸ Rendre le devoir ▸ Rendre le devoir."
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
  {observe: "Je compare les trois zones du modèle : le titre, les strophes et l’auteur.", verifie: "Le titre est centré, gras et en majuscules ; le texte est centré ; l’auteur est à droite, italique et souligné. J’utilise les boutons d’alignement, sans taper d’espaces.", encouragement: "Sélectionner la bonne zone me permet de modifier seulement ce que je veux."},
  {observe: "Je repère le numéro de la strophe avant de choisir sa police et sa taille.", verifie: "Je clique dans chaque strophe et je lis la police et la taille dans la barre d’outils. Si les autres strophes ont changé aussi : Ctrl + Z, puis je sélectionne uniquement la strophe voulue.", encouragement: "Changer une strophe sans toucher aux autres montre que je maîtrise la sélection."},
  {observe: "Des puces quand l’ordre ne compte pas : les choses du festin.", verifie: "Dans Docs : « Mon bloc-notes », puis trois éléments du festin, chacun sur sa ligne, avec sa puce.", encouragement: "Une vraie liste à puces se fait avec le bouton, jamais avec un tiret tapé."},
  {observe: "Des numéros quand l’ordre compte : je raconte mes gestes dans l’ordre où je les ai faits.", verifie: "Dans Docs : six lignes numérotées de 1 à 6. Chacune dit ce que j’ai sélectionné et le bouton ou le menu utilisé.", encouragement: "Nommer le bouton utilisé permet à quelqu’un d’autre de comprendre ma méthode."},
  {observe: "Docs modifie seulement le texte sélectionné.", verifie: "Dans Docs : une phrase sous ma liste, écrite avec mes mots, avec sélectionner, police et taille.", encouragement: "Expliquer pourquoi, c’est montrer que j’ai compris, pas seulement que j’ai fini."},
  {observe: "J’ouvre la grille : les critères avec une étoile sont incontournables.", verifie: "Je compare mon fichier aux critères avant de choisir mes lettres Moi. Après la remise, je vérifie dans Classroom que le devoir est bien indiqué comme remis.", encouragement: "Repérer et corriger un écart fait partie du travail : je peux encore améliorer mon document avant de le remettre."}
];

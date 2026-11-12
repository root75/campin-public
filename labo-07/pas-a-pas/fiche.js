/* Préparer le rapport, trois missions, un défi final, remettre le rapport. Onze étapes internes réutilisent le suivi existant.
 * Trois hypothèses sur le site ; tableau/capture et écrits courts dans le rapport ; entraide guidée et contrôle individuel final par le professeur. */
const COURS = 'labo-07';
const VERSION_PARCOURS = 'missions-6';   // 12/11/2026 (soir) : relevés en deux blocs (11 blocs), hypothèses sous leur question ; 12/11 : cases regroupées en gestes (les cases gardées sur le poste repartent de zéro) ; 06/11 : « Préparer » et « Remettre », mission 1 en trois étapes
const PRESENTATION = 'missions';   // blocs.js : cloche en haut à droite, bulle, bravo, sans « Je veux / Je fais / Je vois »
const HORS_SUIVI = 'Essai local : aucune réponse envoyée. En classe, ouvre Mes cours avec ton compte scolaire.';
let EMAIL = '';
const VIES_V = [{}]; let LV = {};
/* hache et tirage : utilisés par blocs.js (blocVu) ; sans variantes, chaque élève a la version 1. */
const hache = s => {   // FNV-1a brassé, comme hache_() dans Code.gs
  let h = 2166136261;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
};
const tirage = (cle, n) => n<2 || !EMAIL ? 1 : 1 + hache(EMAIL.toLowerCase()+"|"+cle) % n;
/* Rappels (blocs.js, data-rappel) : le nom exact du rapport, tiré de l'adresse scolaire prenom.nom@…, déjà sans accents.
   Sans adresse (essai local, aperçu), le texte de la fiche reste : LABO07_CoulissesPC_Prenom_Nom. */
const RAPPELS = {
  rapport: () => {
    const m = /^([a-z-]+)\.([a-z-]+)@/i.exec(EMAIL || '');
    if(!m) return '';
    const maj = t => t.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('-');
    return 'LABO07_CoulissesPC_' + maj(m[1]) + '_' + maj(m[2]);
  }
};
const PARCOURS = [
 {titre:'Préparer mon rapport', court:'Rapport', rond:'📄', debut:0, fin:1, bulle:'Avant l’enquête : ton carnet d’enquêteur. Un seul document pour tout le labo.'},
 {titre:'Mission 1 — Observer ce qui tourne', court:'Mission 1', rond:'1', debut:1, fin:5, bulle:'Première mission : que fait le PC quand une application s’ouvre ?'},
 {titre:'Mission 2 — Retrouver ses données', court:'Mission 2', rond:'2', debut:5, fin:7, bulle:'Bien joué ! Maintenant, où vit ton fichier ?'},
 {titre:'Mission 3 — Dépanner', court:'Mission 3', rond:'3', debut:7, fin:8, bulle:'Quatre petites pannes à élucider, à deux.'},
 {titre:'Défi final individuel', court:'Défi', rond:'⭐', bouton:'Défi final →', debut:8, fin:10, bulle:'Dernier défi, seul : montre ta méthode d’enquêteur.'},
 {titre:'Remettre mon rapport', court:'Remise', rond:'📤', bouton:'Remettre mon rapport →', debut:10, fin:11, bulle:'Dernier geste : remettre ton rapport, une seule fois.'}
];
const BLOCS = [
  {
    "partie": "Avant de commencer — Mon rapport",
    "titre": "Créer mon rapport et le placer à côté du cours",
    "min": 8,
    "veux": "Préparer le document où j’écrirai mes preuves, avant toute mesure.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Dans Chrome, clique sur la gaufre ⋮⋮⋮, en haut à droite ▸ Docs ▸ + Document vierge. Ou ouvre <a href=\"https://docs.google.com/\" target=\"_blank\" rel=\"noopener\">Google Docs</a>. Compte de l’école.</span></label></li><li><label><input type=\"checkbox\"><span>Clique sur « Document sans titre », en haut à gauche ▸ tape <b><span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span></b> (ton prénom et ton nom, sans accents) ▸ Enter.</span></label></li><li><label><input type=\"checkbox\"><span>Reviens sur l’onglet du cours ▸ clique sur le bouton 📋 Copier la trame, juste en dessous ▸ dans ton document, clique dans la page ▸ Édition ▸ Coller sans mise en forme (Ctrl + Shift + V).</span></label></li></ol><p class=\"outil-trame\"><button class=\"btn plein\" type=\"button\" data-copier-trame>📋 Copier la trame</button> <span class=\"note trame-statut\" role=\"status\"></span><a class=\"note\" href=\"https://root75.github.io/campin-public/labo-07/pas-a-pas/trame-rapport.txt\" target=\"_blank\" rel=\"noopener\">Trame en texte brut</a></p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Complète ton prénom, ton nom, ta classe et la date, en haut du document ▸ vérifie l’indication « Enregistré dans Drive », en haut.</span></label></li><li><label><input type=\"checkbox\"><span>Mets la trame en page, comme au Labo 03 : la première ligne en titre (centré, en gras, plus grand) ; les quatre parties, de « 1. Observer ce qui tourne » à « 4. Défi final », dans le même style Titre 1 (liste « Normal » de la barre d’outils ▸ Titre 1, ou Ctrl + Alt + 1). Le geste t’échappe ? Bouton « Mon rapport » ▸ Un geste à retrouver.</span></label></li><li><label><input type=\"checkbox\"><span>Joins ton rapport au devoir, sans le rendre : ouvre <a href=\"https://classroom.google.com/\" target=\"_blank\" rel=\"noopener\">Classroom</a> avec ton compte scolaire ▸ le cours d’informatique de ta classe ▸ Travaux et devoirs ▸ Labo 07 — Dans les coulisses du PC ▸ Afficher les instructions ▸ dans « Vos devoirs », Ajouter ou créer ▸ Google Drive ▸ <b><span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span></b> ▸ le bouton bleu, en bas à droite.</span></label><p class=\"attention\">⚠️ Ne clique pas sur « Rendre le devoir » : tu le rendras une seule fois, à la fin du labo.</p></li><li><label><input type=\"checkbox\"><span>Reviens sur l’onglet du rapport ▸ clic droit sur cet onglet ▸ Ajouter l’onglet à une nouvelle vue fractionnée. Le cours à gauche, le rapport à droite.</span></label></li></ol>",
    "vois": "Mon document s’appelle LABO07_CoulissesPC_Prenom_Nom, contient la trame mise en page (titre, quatre parties en Titre 1) et mon identification, est joint au devoir Labo 07 (encore « Attribué », pas rendu) et s’affiche à côté du cours.",
    "coince": [
      "La copie ne marche pas ? Clique sur le lien « Trame en texte brut » ▸ Ctrl + A ▸ Ctrl + C. Puis, dans ton document : Ctrl + Shift + V.",
      "Pas de « vue fractionnée » dans le menu ? Garde deux onglets et passe de l’un à l’autre en cliquant sur leur titre. Docs ouvre un autre compte ? Clique sur la photo ronde, en haut à droite ▸ choisis ton compte de l’école. Le devoir Labo 07 n’apparaît pas dans Classroom ? Il n’est peut-être pas encore publié : continue, et joins ton rapport dès qu’il apparaît."
    ],
    "demos": {
      "1": [
        "rapport",
        [
          0,
          1,
          2
        ]
      ],
      "2": [
        "rapport",
        [
          3,
          4
        ]
      ],
      "3": [
        "rapport",
        [
          5
        ]
      ],
      "4": [
        "rapport",
        [
          6
        ]
      ],
      "6": [
        "joindre",
        [
          0,
          1,
          2,
          3,
          4
        ]
      ],
      "7": [
        "cote",
        [
          0,
          1,
          2,
          3
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Ton document est créé, nommé, avec la trame et ton identification.",
      "confirmation": "J’ai créé mon rapport LABO07_CoulissesPC_Prenom_Nom, collé la trame et complété mon identification.",
      "trace": "rapport:0 — Préparer mon rapport",
      "juste": "Ton rapport est prêt. Garde-le ouvert : tu y écriras à chaque mission.",
      "liste": [
        "Mon document porte le nom demandé : LABO07_CoulissesPC_, puis mon prénom et mon nom.",
        "La trame est collée, mon identification complétée, et Docs indique « Enregistré ».",
        "Mon rapport est joint au devoir Labo 07, qui affiche encore « Attribué » : je ne l’ai pas rendu.",
        "Le titre du document est mis en forme et les quatre parties ont le même style Titre 1.",
          "Le rapport s’affiche à côté du cours."
      ]
    },
    "extra": "<p class=\"attention\">⚠️ Un seul document pour tout le labo. Au cours suivant, ne crée pas de deuxième document : rouvre <b><span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span></b> par Classroom ▸ Labo 07 ▸ Vos devoirs, où il est joint (ou par la gaufre ⋮⋮⋮ ▸ Docs).</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Défi : une application ouverte, qu’est-ce qui change ?",
    "min": 12,
    "veux": "Relever les caractéristiques de mon PC, puis prévoir ce que feront le processeur et la mémoire pendant un gros calcul, avec une grande image ouverte dans GIMP, et quand j’arrêterai GIMP.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre le Gestionnaire des tâches : clic droit sur l’icône ⊞ Démarrer ▸ Gestionnaire des tâches (ou Ctrl + Shift + Esc).</span></label></li><li><label><input type=\"checkbox\"><span>Petite fenêtre, sans colonnes ? Clique sur ⌄ Plus de détails, en bas à gauche. Les colonnes et le menu de gauche sont déjà là : coche, rien à faire.</span></label></li><li><label><input type=\"checkbox\"><span>À gauche, 📈 Performances ▸ clique tour à tour sur Processeur (son nom en haut à droite, le nombre de Cœurs sous le graphique), sur Mémoire (le total, en haut à droite) et sur Disque 0 (C:) (sa Capacité, sous le graphique).</span></label></li><li><label><input type=\"checkbox\"><span>Dans ton rapport, partie 1, complète la ligne « Mon PC » avec ces quatre informations.</span></label></li></ol>",
    "vois": "Mon rapport indique le processeur, les cœurs, la mémoire et le disque de mon PC ; mon hypothèse annonce un changement possible et ce qui me permettrait de le constater.",
    "coince": [
      "Pas de noms à gauche du Gestionnaire ? Clique sur ☰, en haut à gauche, ou agrandis la fenêtre. Tes valeurs diffèrent de celles du voisin ? Normal : chaque PC a les siennes. Une hypothèse est une idée à tester, pas une définition.",
      "Commence par « Pendant un gros calcul, je pense que… ». Indique ce que tu comparerais avant, pendant le calcul et après l’arrêt. Ton rapport n’est plus ouvert ? Gaufre ⋮⋮⋮ ▸ Docs ▸ ton rapport, dans la liste. Pas encore de rapport ? Clique sur la pastille 📄."
    ],
    "demos": {
      "1": [
        "gestionnaire",
        [
          0,
          1
        ]
      ],
      "2": [
        "gestionnaire",
        [
          2
        ]
      ],
      "3": [
        "performances",
        [
          0,
          1,
          2,
          3
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Tu vas observer deux choses : le processeur (il calcule) et la mémoire (elle garde ce que les logiciels ouverts utilisent). À ton avis, que feront-ils pendant un gros calcul ? Quand GIMP gardera une grande image ouverte ? Et quand tu arrêteras GIMP ?",
      "champs": [
        {
          "cle": "H",
          "nom": "Mon hypothèse",
          "max": 125
        }
      ],
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
      "etiquette": "Mon hypothèse",
      "colle": true
    },
    "extra": "<p class=\"attention\">⚠️ GIMP reste fermé tant que ton hypothèse n’est pas enregistrée : la prévision vient avant l’observation.</p><p class=\"attention\">⚠️ Ici, on observe seulement : ne termine aucune tâche et ne change aucun réglage.</p><p class=\"note\">Chacun manipule son propre PC. Première réponse seul ; comparaison à deux ensuite.</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Relever la mémoire : avant, puis avec une grande image dans GIMP",
    "min": 10,
    "veux": "Préparer le tableau, relever les deux totaux avant toute chose, puis ouvrir dans GIMP une grande image qui occupera la mémoire.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Dans ton rapport, partie 1, clique sur la ligne « [Insérer un vrai tableau…] » ▸ menu Insertion ▸ Tableau ▸ glisse sur la grille jusqu’à 3 × 5. Tape les en-têtes Moment, Processeur (%), Mémoire (%), puis Avant, Pendant le calcul, Après 1 min, Après fin de tâche dans la première colonne. Efface la ligne entre crochets.</span></label><p class=\"attention\">⚠️ Ne fais pas les colonnes avec des espaces : un vrai tableau, par Insertion ▸ Tableau.</p></li><li><label><input type=\"checkbox\"><span>Reviens au Gestionnaire des tâches par son icône dans la barre des tâches (ou Alt + Tab) ▸ à gauche, ☰ Processus ▸ repère deux applications dont tu reconnais le nom ▸ écris-les dans ton rapport, ligne « Deux applications identifiées ».</span></label></li><li><label><input type=\"checkbox\"><span>Lis les deux totaux, Processeur et Mémoire, en % en haut de leur colonne ▸ écris-les dans la ligne Avant du tableau.</span></label></li><li><label><input type=\"checkbox\"><span>Ouvre GIMP : ⊞ Démarrer ▸ tape GIMP ▸ clique sur l’application GIMP. Elle met 5 à 20 secondes à s’ouvrir. La fenêtre « Bienvenue dans GIMP » s’affiche : ferme-la par le ×, en haut à droite.</span></label><p class=\"attention\">⚠️ Ne clique pas une deuxième fois sur GIMP pendant qu’il s’ouvre : tu en lancerais deux.</p></li><li><label><input type=\"checkbox\"><span>Dans GIMP : Fichier ▸ Nouvelle image (ou Ctrl + N) ▸ 10000 en Largeur, 10000 en Hauteur, unité px ▸ Valider ▸ « Confirmer la taille de l’image » (plus de 900 Mo) ▸ Valider. Attends que l’image grise apparaisse.</span></label><p class=\"attention\">⚠️ Ne prends pas une image plus grande que 10000 × 10000 : le PC serait saturé.</p></li></ol>",
    "vois": "Mon tableau est prêt et sa ligne Avant est remplie. GIMP garde ouverte une image grise de 10000 × 10000 : je le laisse ouvert.",
    "coince": [
      "Compare la même grandeur : le total Processeur avec le total Processeur, pas avec une ligne d’application. La mémoire en % n’est pas celle d’un seul logiciel en Mo.",
      "GIMP refuse 10000 ? Vérifie que l’unité est px. GIMP ne s’ouvre pas, ou l’accès est bloqué ? Note « accès refusé » et clique sur « J’attends de l’aide » : ne contourne pas la restriction."
    ],
    "demos": {
      "1": [
        "tableau",
        [
          0,
          1,
          2,
          3
        ]
      ],
      "2": [
        "gestionnaire",
        [
          3
        ]
      ],
      "3": [
        "gestionnaire",
        [
          4,
          5
        ]
      ],
      "4": [
        "gimp",
        [
          0,
          1
        ]
      ],
      "5": [
        "gimp",
        [
          2,
          3,
          4
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Ton tableau est prêt, GIMP garde la grande image. Pas de phrase à écrire ici.",
      "confirmation": "J’ai préparé mon tableau, rempli la ligne Avant et ouvert la grande image dans GIMP.",
      "trace": "rapport:1 — Relevé Avant, GIMP ouvert",
      "juste": "GIMP reste ouvert : l’étape suivante fait calculer le PC.",
      "liste": [
        "La ligne « Deux applications identifiées » est complétée.",
        "Mon tableau a ses en-têtes, et sa ligne Avant est remplie.",
        "GIMP est ouvert, avec l’image grise de 10000 × 10000."
      ]
    }
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Faire calculer le PC, puis arrêter GIMP",
    "min": 10,
    "veux": "Relever le processeur et la mémoire pendant un gros calcul, 1 minute après, puis après avoir arrêté GIMP.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre le <a href=\"https://root75.github.io/campin-public/labo-07/essai-charge.html\" target=\"_blank\" rel=\"noopener\">Banc d’essai</a> : il s’ouvre dans un nouvel onglet ▸ ▶ Lancer le calcul.</span></label></li><li><label><input type=\"checkbox\"><span>Tout de suite, Alt + Tab vers le Gestionnaire ▸ lis les deux totaux pendant le calcul ▸ écris-les dans la ligne Pendant le calcul.</span></label></li><li><label><input type=\"checkbox\"><span>Onglet Banc d’essai ▸ ■ Arrêter. Laisse GIMP ouvert sans rien y faire, attends environ 1 minute ▸ lis les deux totaux ▸ ligne Après 1 min.</span></label></li><li><label><input type=\"checkbox\"><span>GIMP encore ouvert, prends ta capture : Windows + Shift + S (ou ⊞ Démarrer ▸ Outil Capture d’écran ▸ Nouveau) ▸ rectangle autour des noms utiles et des colonnes Processeur / Mémoire. Tu la colleras à l’étape suivante.</span></label></li><li><label><input type=\"checkbox\"><span>Processus ▸ clique une fois sur la ligne GNU Image Manipulation Program ▸ bouton ⊘ Terminer la tâche, en haut (ou touche Delete). GIMP se ferme sans rien demander : l’image n’est pas enregistrée.</span></label><p class=\"attention\">⚠️ Termine seulement GIMP, et seulement ici. Terminer la tâche ferme de force : ce qui n’est pas enregistré est perdu. Ailleurs, on ne s’en sert que si le × ne répond plus.</p></li><li><label><input type=\"checkbox\"><span>Attends 10 secondes ▸ lis les deux totaux ▸ ligne Après fin de tâche.</span></label></li></ol>",
    "vois": "Mon tableau contient les quatre relevés : Avant, Pendant le calcul, Après 1 min, Après fin de tâche. Ma capture attend d’être collée.",
    "coince": [
      "Le total Processeur ne monte pas ? Sur le Banc d’essai, vérifie que l’état affiche « … au travail ». Compare toujours le total avec le total, pas avec une ligne d’application.",
      "GIMP a été fermé trop tôt ? Rouvre-le et recrée l’image (étape précédente, cases 4 et 5), puis reprends au Banc d’essai."
    ],
    "demos": {
      "1": [
        "banc",
        [
          0
        ]
      ],
      "2": [
        "banc",
        [
          1,
          2
        ]
      ],
      "3": [
        "banc",
        [
          3,
          4
        ]
      ],
      "4": [
        "capture",
        [
          0,
          1
        ]
      ],
      "5": [
        "fintache",
        [
          0,
          1
        ]
      ],
      "6": [
        "fintache",
        [
          2
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Tes quatre relevés sont dans le tableau du rapport. Pas de phrase à écrire ici.",
      "confirmation": "J’ai relevé les deux totaux quatre fois, pris ma capture et complété le tableau de mon rapport.",
      "trace": "rapport:1 — Relevés pendant et après",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise.",
      "liste": [
        "Mon tableau a ses quatre relevés : Avant, Pendant le calcul, Après 1 min, Après fin de tâche.",
        "Ma capture est prise, GIMP encore ouvert : je la colle à l’étape suivante."
      ]
    },
    "extra": "<p class=\"attention\">⚠️ Sur le Banc d’essai, seulement ▶ Lancer le calcul et ■ Arrêter : ne clique sur aucun autre bouton pendant les relevés.</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Capturer et conclure",
    "min": 8,
    "veux": "Montrer mes relevés par la capture, puis conclure prudemment.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Reviens dans ton rapport, sous le tableau ▸ Édition ▸ Coller (Ctrl + V) : ta capture apparaît.</span></label></li><li><label><input type=\"checkbox\"><span>Redimensionne l’image par un coin, pour garder ses proportions et rester dans la page.</span></label><p class=\"attention\">⚠️ N’étire pas l’image par un côté : elle serait déformée.</p></li><li><label><input type=\"checkbox\"><span>Sous l’image, écris une légende : ce qu’elle montre, et sa limite.</span></label></li><li><label><input type=\"checkbox\"><span>Dans le rapport, écris une conclusion de deux phrases : ce qui change dans tes relevés, et si ton hypothèse de départ (rappelée au-dessus) est confirmée ; puis une autre cause possible ou une limite.</span></label></li><li><label><input type=\"checkbox\"><span>Après ta réponse personnelle, compare tes observations avec un voisin.</span></label></li><li><label><input type=\"checkbox\"><span>Participe à la mise en commun. Le professeur affiche ensuite la synthèse : compare-la à ce que tu as écrit dans ton rapport, et corrige-le toi-même si besoin. Relis aussi ta mise en page : titre de la partie en Titre 1, plus aucune ligne entre crochets.</span></label></li></ol>",
    "vois": "Mon rapport contient les caractéristiques de mon PC, les quatre relevés et une capture légendée ; ma conclusion distingue ce qui monte puis redescend, ce qui reste, et ce que la fin de tâche libère.",
    "coince": [
      "Le collage ne donne rien ? Windows a aussi enregistré ta capture : Docs ▸ Insertion ▸ Image ▸ Importer depuis l’ordinateur ▸ dossier Images ▸ Captures d’écran. Ta capture montre seulement les noms et les colonnes Processeur / Mémoire.",
      "Une conclusion prudente : « Pendant le calcul, le processeur… ; tant que GIMP garde l’image, la mémoire… ; après la fin de tâche, … ». Puis une limite : une autre tâche a pu travailler en même temps."
    ],
    "demos": {
      "1": [
        "capture",
        [
          2
        ]
      ],
      "2": [
        "capture",
        [
          3
        ]
      ],
      "3": [
        "capture",
        [
          4
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "mixte",
      "q": "Après tes observations : choisis une conclusion défendable, puis confirme ce que tu as fait dans le rapport.",
      "activite": {
        "type": "qcm",
        "q": "Cas fictif, sur un PC de 16 Go : le processeur passe de 5 % à 98 % pendant le calcul du Banc d’essai, puis redescend à 6 % ; la mémoire passe de 40 % à 46 % avec l’image de GIMP, y reste, puis revient à 41 % après la fin de tâche. Que peut-on affirmer ?",
        "c": [
          "Le processeur a surtout travaillé pendant le calcul ; la mémoire a gardé l’image tant que GIMP était ouvert, puis l’a libérée à la fin de tâche. Ces seuls relevés ne prouvent pas une cause unique.",
          "Toute la hausse de la mémoire vient forcément de GIMP, et de rien d’autre.",
          "Le PC est en panne parce que le processeur est monté à 98 %.",
          "Terminer la tâche a fermé GIMP proprement : l’image est enregistrée."
        ],
        "p": [
          null,
          "GIMP est très probablement en cause, mais deux événements qui se suivent ne suffisent pas à l’isoler. Quelles autres tâches peuvent travailler en même temps ?",
          "Un processeur peut travailler fort pendant un calcul sans être en panne : il est redescendu ensuite. Observe avant de diagnostiquer.",
          "Terminer la tâche ferme de force, sans proposer d’enregistrer : l’image est perdue. C’est un dernier recours, quand le × ne répond plus."
        ],
        "juste": "Tu relies une observation à une conclusion prudente. Explique à l’oral ce qu’il faudrait encore vérifier."
      },
      "validation": {
        "type": "rapport",
        "q": "Un tableau, une capture légendée et deux phrases de conclusion. Aucune recopie des hypothèses du site.",
        "confirmation": "J’ai réalisé les manipulations demandées et complété « 1 — Observer ce qui tourne » dans mon rapport.",
        "trace": "rapport:1 — Observer ce qui tourne",
        "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise.",
        "liste": [
          "La capture est collée sous le tableau, proportionnée, dans la page.",
          "Sa légende est juste dessous.",
          "Ma conclusion tient en deux phrases : ce qui change, puis une autre cause ou une limite."
        ]
      }
    },
    "rappel": [
      {
        "de": "2:H",
        "titre": "Ton hypothèse de départ"
      }
    ]
  },
  {
    "partie": "2 — Retrouver ses données",
    "titre": "Défi : mon fichier OneDrive est-il disponible sur ce PC ?",
    "min": 10,
    "veux": "Retrouver un fichier dans le dossier OneDrive scolaire de l’Explorateur et prévoir sa disponibilité sans changer son état.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Choisis un fichier que tu as déjà enregistré dans OneDrive, par exemple celui du Labo 06.</span></label></li></ol>",
    "vois": "Je sépare ma prévision de la preuve que je vais chercher. Le nom du fichier revient tout seul aux étapes suivantes.",
    "coince": [
      "« Dans Word » donne une application, pas un emplacement. Cherche le dossier dans lequel le fichier avait été rangé.",
      "Sur ces PC Windows, les fichiers synchronisés se cherchent dans OneDrive, via le volet gauche de l’Explorateur. Ton ancien fichier peut être dans Documents ▸ Informatique. Observe le vrai chemin et le statut sur ton poste."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Écris le nom du fichier, puis où tu penses le retrouver et s’il serait lisible sans réseau.",
      "champs": [
        {
          "cle": "F",
          "nom": "Le fichier que je choisis (son nom)",
          "max": 60
        },
        {
          "cle": "H",
          "nom": "Où je pense le retrouver, et s’il serait lisible sans réseau",
          "max": 120
        }
      ],
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
      "etiquette": "Ma prévision",
      "colle": true
    },
    "extra": "<p class=\"attention\">⚠️ Ne cherche pas le fichier avant d’avoir enregistré ta réponse : la prévision vient avant la preuve.</p>"
  },
  {
    "partie": "2 — Retrouver ses données",
    "titre": "Retrouver, lire le statut et conclure",
    "min": 20,
    "veux": "Produire une preuve sur mon propre fichier, sans le supprimer ni modifier la synchronisation.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre l’Explorateur : icône 📁 dans la barre des tâches (ou Windows + E) ▸ dans le volet gauche, le nuage OneDrive scolaire (ton compte ou le nom de l’école) ▸ le dossier de ton fichier, par exemple Documents ▸ Informatique.</span></label></li><li><label><input type=\"checkbox\"><span>Clique une seule fois sur <span data-rappel=\"6:F\">ton fichier de la mission 2</span> pour le sélectionner.</span></label><p class=\"attention\">⚠️ Ne l’ouvre pas (pas de double-clic) : l’ouvrir peut le télécharger et changer son statut.</p></li><li><label><input type=\"checkbox\"><span>Clique dans la barre d’adresse (ou Ctrl + L) ▸ lis le chemin complet ▸ dans ton rapport, partie 2, relève ce chemin et le nom du fichier. Tu peux remplacer ton nom personnel par [moi].</span></label></li><li><label><input type=\"checkbox\"><span>Si la colonne Statut n’est pas là : Afficher ▸ Détails (et si elle manque encore : clic droit sur un en-tête de colonne ▸ Statut) ▸ relève dans le rapport le symbole ou le message exact, ou « statut non affiché ».</span></label></li><li><label><input type=\"checkbox\"><span>Dans le rapport, écris une seule phrase : serait-il disponible sans réseau, et quel indice le justifie ? Compare avec ta prévision, rappelée au-dessus. Si tu ne peux pas conclure, dis ce qui manque.</span></label></li><li><label><input type=\"checkbox\"><span>Après ta réponse personnelle, compare les statuts avec un voisin ▸ participe à la mise en commun. Le professeur affiche ensuite la synthèse : compare-la à ce que tu as écrit dans ton rapport, et corrige-le toi-même si besoin. Relis aussi ta mise en page : titre de la partie en Titre 1, plus aucune ligne entre crochets.</span></label></li></ol>",
    "vois": "Mon relevé décrit ce poste : chemin, nom et statut. Une absence de statut reste une observation.",
    "coince": [
      "Le chemin permet de vérifier si le dossier se trouve dans OneDrive. Documents ne prouve pas à lui seul qu’il est synchronisé.",
      "Fichier introuvable : regarde le dossier scolaire OneDrive ▸ Documents ▸ Informatique. Après deux minutes, note ce que tu as essayé et clique sur « J'attends de l'aide ». Le professeur fournit un fichier de démonstration à observer personnellement ; précise « démo »."
    ],
    "demos": {
      "1": [
        "onedrive",
        [
          0,
          1,
          2
        ]
      ],
      "2": [
        "onedrive",
        [
          3
        ]
      ],
      "3": [
        "onedrive",
        [
          4
        ]
      ],
      "4": [
        "onedrive",
        [
          5,
          6
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Le nom du fichier, son chemin, son statut et une seule phrase de justification.",
      "confirmation": "J’ai réalisé les manipulations demandées et complété « 2 — Retrouver ses données » dans mon rapport.",
      "trace": "rapport:2 — Retrouver ses données",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise.",
      "liste": [
        "Partie 2 : le nom du fichier et son chemin.",
        "Le statut exact, ou « statut non affiché ».",
        "Une phrase : disponible sans réseau ? et l’indice qui le justifie."
      ]
    },
    "extra": "<p class=\"attention\">⚠️ Ne clique ni sur Libérer de l’espace, ni sur Toujours conserver, et ne change aucun réglage OneDrive : tu changerais le statut que tu observes.</p>",
    "rappel": [
      {
        "de": "6:F",
        "titre": "Le fichier que tu as choisi"
      },
      {
        "de": "6:H",
        "titre": "Ta prévision"
      }
    ]
  },
  {
    "partie": "3 — Dépanner",
    "titre": "Quatre incidents à tester, un seul à rédiger",
    "min": 12,
    "veux": "Dépanner personnellement quatre incidents ; écrire un seul cas et vérifier les trois autres à deux, chacun à son tour.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Choisis l’incident que tu expliqueras dans le rapport.</span></label></li><li><label><input type=\"checkbox\"><span>Ouvre les quatre cartes ci-dessous. Pour chacune, formule ton hypothèse et choisis ton test avant d’agir, puis fais l’essai toi-même.</span></label></li><li><label><input type=\"checkbox\"><span>Incident choisi : écris dans le rapport l’hypothèse, le test, l’observation et la solution justifiée, quatre lignes courtes.</span></label></li><li><label><input type=\"checkbox\"><span>Les trois autres : explique ton hypothèse et ton test au binôme, montre ton geste et justifie ta conclusion ; puis inversez les rôles. Rien de plus dans le rapport.</span></label><p class=\"attention\">⚠️ Le binôme ne touche ni ta souris ni ton clavier : il observe et il explique.</p></li><li><label><input type=\"checkbox\"><span>Écoute le retour du binôme, et refais toi-même le geste à corriger si nécessaire.</span></label></li><li><label><input type=\"checkbox\"><span>Participe à la mise en commun : quel test départageait deux explications ? Le professeur affiche ensuite la synthèse : compare-la à ce que tu as écrit dans ton rapport, et corrige-le toi-même si besoin. Relis aussi ta mise en page : titre de la partie en Titre 1, plus aucune ligne entre crochets.</span></label></li></ol>",
    "vois": "J’ai manipulé personnellement les quatre incidents. Un seul est rédigé ; pour les autres, nous avons alterné acteur et observateur, avec un retour oral précis.",
    "coince": [
      "Pour le cas écrit : hypothèse et test avant d’agir ; observation et solution après. Pour les autres, prépare les mêmes éléments à l’oral.",
      "Ouvre les indices de chaque carte, puis demande au binôme de montrer le critère qui bloque. Si le désaccord ou le blocage persiste, clique sur « J'attends de l'aide » et poursuis un autre essai possible. Un avis du binôme ne remplace pas la note du professeur."
    ],
    "demos": {
      "incident 1.1": [
        "calculatrice",
        [
          0,
          1
        ]
      ],
      "incident 1.2": [
        "fenetres",
        [
          0
        ]
      ],
      "incident 1.4": [
        "fenetres",
        [
          1,
          2
        ]
      ],
      "incident 2.1": [
        "blocnotes",
        [
          0,
          1
        ]
      ],
      "incident 2.3": [
        "fenetres",
        [
          3
        ]
      ],
      "incident 3.1": [
        "onedrive",
        [
          0,
          1,
          2,
          3
        ]
      ],
      "incident 4.2": [
        "moniteur",
        [
          0
        ]
      ],
      "incident 4.3": [
        "moniteur",
        [
          1
        ]
      ],
      "incident 4.5": [
        "moniteur",
        [
          2
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "mixte",
      "q": "Après les quatre essais : remets la démarche en ordre, puis confirme le cas écrit. Aucun paragraphe supplémentaire.",
      "activite": {
        "type": "ordre-gestes",
        "q": "Reconstruis une démarche de dépannage : quel ordre évite de cliquer au hasard ?",
        "cartes": [
          "Formuler une hypothèse",
          "Choisir un test réversible",
          "Manipuler et relever un indice",
          "Justifier la conclusion"
        ],
        "juste": "Refais mentalement cet ordre pour un de tes essais. Quel indice t’a fait garder ou changer ton hypothèse ?"
      },
      "validation": {
        "type": "rapport",
        "q": "Quatre essais personnels, un seul incident écrit. Les trois autres sont vérifiés à deux, puis chacun corrige son propre geste. Le professeur intervient si le blocage ou le désaccord persiste ; le défi final reste individuel.",
        "confirmation": "J’ai réalisé les manipulations demandées et complété « 3 — Un incident rédigé » dans mon rapport.",
        "trace": "rapport:3 — Un incident rédigé",
        "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise.",
        "liste": [
          "Les quatre incidents, manipulés moi-même.",
          "Un seul incident écrit dans le rapport, en quatre lignes.",
          "Les trois autres expliqués au binôme, puis les rôles inversés."
        ]
      }
    },
    "extra": "<details id=\"verification-pairs\"><summary>À deux — vérifier un geste sans le faire à la place</summary><ol class=\"etapes\"><li>Acteur : formule ta première hypothèse et choisis un test avant de demander de l’aide.</li><li>Observateur : écoute cette proposition, puis vérifie « test sans risque », « manipulation personnelle » et « conclusion appuyée sur un indice ».</li><li>Donne un retour oral précis : « Je vois… » pour un point réussi ; « Tu pourrais… » pour une correction.</li><li>L’acteur corrige lui-même ou refait le test. L’observateur ne touche ni sa souris ni son clavier.</li><li>Inversez les rôles : chacun manipule sur son propre poste. Si vous hésitez encore après les indices, cliquez sur « J'attends de l'aide » et poursuivez ce qui reste possible.</li></ol><p>Cette vérification aide à progresser ; elle ne donne pas de note et n’est pas collectée par le site.</p></details><div class=\"incidents\"><details class=\"incident\"><summary>Incident 1 : la fenêtre a disparu</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre la Calculatrice : ⊞ Démarrer ▸ tape Calculatrice ▸ clique sur l’application.</label></li><li><label><input type=\"checkbox\">Clique sur — Réduire, en haut à droite de la fenêtre.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test pour retrouver la fenêtre.</label></li><li><label><input type=\"checkbox\">Explique ce qui prouve qu’elle était fermée ou seulement masquée.</label></li></ol><details><summary>Indice 1</summary><p>Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?</p></details><details><summary>Indice 2</summary><p>Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice.</p></details></details><details class=\"incident\"><summary>Incident 2 : je tape dans la mauvaise fenêtre</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre Bloc-notes : ⊞ Démarrer ▸ tape Bloc-notes ▸ clique sur l’application ▸ dans Bloc-notes, Fichier ▸ Nouvelle fenêtre (ou Ctrl + Shift + N, si disponible).</label></li><li><label><input type=\"checkbox\">Place les deux fenêtres côte à côte en les déplaçant par leur barre de titre.</label></li><li><label><input type=\"checkbox\">Clique dans la seconde fenêtre : comment écrire dans la première ?</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test avec le seul mot « test » dans ces fenêtres d’essai.</label></li><li><label><input type=\"checkbox\">Explique quel indice montre où le texte est arrivé.</label></li></ol><details><summary>Indice 1</summary><p>Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.</p></details><details><summary>Indice 2</summary><p>Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît. Si Nouvelle fenêtre manque, utilise l’Explorateur comme autre fenêtre et reviens au Bloc-notes.</p></details></details><details class=\"incident\"><summary>Incident 3 : le fichier serait-il « dans » l’application ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Repère <span data-rappel=\"6:F\">ton fichier de la mission 2</span> dans son dossier OneDrive scolaire, dans l’Explorateur.</span></label><p class=\"attention\">⚠️ Ne l’ouvre pas : un double-clic peut le télécharger et changer son statut.</p></li><li><label><input type=\"checkbox\">Formule ton hypothèse : fermer l’application fera-t-il disparaître le fichier ?</label></li><li><label><input type=\"checkbox\">Choisis le test qui te permettra de vérifier, avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Ferme seulement une fenêtre Bloc-notes d’essai par × ; si elle contient le seul mot « test », choisis Ne pas enregistrer.</label></li><li><label><input type=\"checkbox\">Retrouve ton fichier dans son dossier.</label><p class=\"attention\">⚠️ Ne déplace pas ton fichier, ne le renomme pas.</p></li><li><label><input type=\"checkbox\">Explique la différence entre le fichier et l’application.</label></li></ol><details><summary>Indice 1</summary><p>L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.</p></details><details><summary>Indice 2</summary><p>Le bouton × ferme une fenêtre. Reviens au dossier OneDrive choisi dans la mission 2 et vérifie si ton fichier est toujours là. Si c’est une démonstration, indique-le.</p></details></details><details class=\"incident\"><summary>Incident 4 : écran noir, PC arrêté ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Repère le bouton ⏻ du moniteur externe montré au groupe par le professeur, distinct de celui du PC. Si aucun bouton n’a été identifié, utilise le cas simulé.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de toucher au bouton.</label><p class=\"attention\">⚠️ Ne touche jamais au bouton ⏻ du PC : seulement à celui de l’écran externe, montré par le professeur.</p></li><li><label><input type=\"checkbox\">Sur un écran externe dont le bouton a été identifié pour le groupe, éteins seulement cet écran avec ce bouton.</label></li><li><label><input type=\"checkbox\">Rallume seulement l’écran avec le même bouton.</label></li><li><label><input type=\"checkbox\">Explique ce que le retour de la session et des fenêtres permet de conclure.</label></li><li><label><input type=\"checkbox\">Sur portable ou tout-en-un, utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et précise que le cas est simulé.</label></li></ol><details><summary>Indice 1</summary><p>Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.</p></details><details><summary>Indice 2</summary><p>Le seul test autorisé ici est le bouton de l’écran externe identifié par le professeur. Sur portable ou tout-en-un, utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et explique le test que tu choisirais.</p></details></details></div>"
  },
  {
    "partie": "Final — Situation individuelle nouvelle",
    "titre": "Le dossier de secours",
    "min": 8,
    "veux": "Résoudre seul une situation nouvelle : après un changement de poste, peut-on lire le document sans réseau ?",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Lis la situation : tu prépares une présentation sur un autre PC de l’école. L’Explorateur y montre le nom du document avec un nuage bleu. Une autre fenêtre recouvre l’Explorateur. Un camarade dit : « Le fichier est là, il marchera sans réseau ; ferme Windows pour le retrouver. »</label></li></ol>",
    "vois": "Mon hypothèse et mon test sont conservés avant l’observation.",
    "coince": [
      "Le scénario combine deux problèmes : retrouver une fenêtre et juger la disponibilité d’un contenu. Propose un test qui ne change pas l’état du fichier.",
      "Tu peux revenir à l’Explorateur par son icône 📁 dans la barre des tâches ou Alt + Tab, puis lire le chemin et le statut sans ouvrir le fichier. Il n’est pas nécessaire d’arrêter Windows."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Seul : écris ton hypothèse sur la disponibilité du contenu, puis le test sans risque que tu choisis pour retrouver la fenêtre et vérifier l’indice. Enregistre avant de tester.",
      "champs": [
        {
          "cle": "H",
          "nom": "Mon hypothèse",
          "max": 75
        },
        {
          "cle": "T",
          "nom": "Le test que je choisis",
          "max": 105
        }
      ],
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
      "etiquette": "Mon hypothèse et mon test",
      "colle": true
    },
    "extra": "<p class=\"attention\">⚠️ Ne coupe pas le réseau et ne ferme pas Windows : ce ne sont pas des tests sans risque.</p><p class=\"encart\">Proposition de travail quotidien /20 : enquête /14 (hypothèse 2, test 4, preuve 2, conclusion 4, distinction 2) · document et remise /6 (identification et nom 2, mise en page et tableau 2, capture légendée et remise vérifiée 2). Les aides restent accessibles ; leur utilisation n’est pas une pénalité de vitesse.</p>"
  },
  {
    "partie": "Final — Situation individuelle nouvelle",
    "titre": "Montrer ma preuve et justifier ma décision",
    "min": 10,
    "veux": "Résoudre seul la nouvelle situation et justifier une décision en peu de mots.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Réalise sur ton poste le test que tu as choisi (rappelé au-dessus) : l’Explorateur recouvert par une fenêtre d’essai, retrouve-le.</span></label></li><li><label><input type=\"checkbox\"><span>Lis le chemin et le statut de <span data-rappel=\"6:F\">ton fichier de la mission 2</span>.</span></label><p class=\"attention\">⚠️ Ne l’ouvre pas : l’ouvrir peut le télécharger et changer son statut.</p></li><li><label><input type=\"checkbox\"><span>Dans le rapport, note en une ligne l’indice observé ; distingue ton poste réel du nuage donné dans le scénario.</span></label></li><li><label><input type=\"checkbox\"><span>Dans le rapport, réponds au camarade en deux phrases au plus : ta décision, et ce qui la justifie.</span></label></li><li><label><input type=\"checkbox\"><span>Prépare ton geste et ton indice pour le contrôle individuel du professeur, en circulation ; explique-lui machine, Windows, application et fichier. En attendant, relis ta mise en page.</span></label></li><li><label><input type=\"checkbox\"><span>Participe à la synthèse finale. La remise du rapport est l’étape suivante.</span></label></li></ol>",
    "vois": "Une preuve en une ligne, une conclusion courte et une manipulation personnelle expliquée au professeur. La case du site ne remet pas le document.",
    "coince": [
      "Un nom de fichier visible ne suffit pas à prouver que son contenu est déjà téléchargé.",
      "Justifie séparément la disponibilité du fichier et l’utilité de fermer Windows. Relie l’écran et le PC au matériel, Windows au système, l’Explorateur ou Bloc-notes à un logiciel, le document à un fichier."
    ],
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Seul : une ligne de preuve, deux phrases de décision justifiée et une manipulation expliquée oralement au professeur.",
      "confirmation": "J’ai réalisé les manipulations demandées et complété « 4 — Défi final » dans mon rapport.",
      "trace": "rapport:4 — Défi final",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise.",
      "liste": [
        "Une ligne : l’indice observé, mon poste réel distingué du nuage du scénario.",
        "Deux phrases au plus : ma décision et ce qui la justifie.",
        "Mon geste est prêt pour le contrôle du professeur."
      ]
    },
    "rappel": [
      {
        "de": "9:H",
        "titre": "Ton hypothèse"
      },
      {
        "de": "9:T",
        "titre": "Le test que tu as choisi"
      }
    ]
  },
  {
    "partie": "Remise — Mon rapport",
    "titre": "Remettre mon rapport dans Classroom",
    "min": 5,
    "veux": "Remettre une seule fois mon rapport terminé, puis vérifier qu’il est bien arrivé.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Relis ton rapport : remplace chaque « [à compléter] » et efface les indications entre crochets.</span></label></li><li><label><input type=\"checkbox\"><span>Vérifie les trois exigences (/6) : prénom, nom, classe et date, fichier nommé <b><span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span></b> ; titre du document centré, en gras, plus grand, les quatre parties en Titre 1 et un vrai tableau de 3 colonnes et 5 lignes, avec % dans les en-têtes ; capture ciblée, lisible, pas étirée, légende juste dessous.</span></label></li><li><label><input type=\"checkbox\"><span>Ouvre <a href=\"https://classroom.google.com/\" target=\"_blank\" rel=\"noopener\">Classroom</a> avec ton compte scolaire ▸ le cours d’informatique de ta classe ▸ Travaux et devoirs ▸ Labo 07 — Dans les coulisses du PC ▸ Afficher les instructions.</span></label><p class=\"attention\">⚠️ Ne poste pas ton rapport dans le flux du cours : il est joint au devoir, dans « Vos devoirs ».</p></li><li><label><input type=\"checkbox\"><span>Dans « Vos devoirs », ton rapport est déjà joint depuis l’étape 1 : clique dessus pour vérifier que c’est le bon, et qu’il est complet. Pas joint ? Ajouter ou créer ▸ Google Drive ▸ <b><span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span></b> ▸ le bouton bleu.</span></label></li><li><label><input type=\"checkbox\"><span>Clique sur Rendre le devoir ▸ confirme : Rendre le devoir.</span></label></li><li><label><input type=\"checkbox\"><span>Vérifie que le devoir affiche « Remis ».</span></label></li></ol>",
    "vois": "Dans Classroom, le devoir affiche « Remis » et la pièce jointe est mon rapport complet.",
    "coince": [
      "Le devoir n’apparaît pas ? Le professeur ne l’a peut-être pas encore publié. Ne crée pas de deuxième document, ne poste rien dans le flux : sonne la cloche 🔔 et attends.",
      "Ton rapport n’est pas dans la liste Google Drive ? Tape LABO07_CoulissesPC dans la barre de recherche de la fenêtre. Mauvais fichier joint ? Clique sur la croix ✕ à droite de la pièce jointe, puis recommence Ajouter ou créer ▸ Google Drive."
    ],
    "demos": {
      "1": [
        "remise",
        [
          0
        ]
      ],
      "3": [
        "remise",
        [
          1
        ]
      ],
      "4": [
        "remise",
        [
          8
        ]
      ],
      "5": [
        "remise",
        [
          5,
          6
        ]
      ],
      "6": [
        "remise",
        [
          7
        ]
      ]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Seul Classroom confirme la remise : ce site ne la voit pas.",
      "confirmation": "J’ai remis mon rapport dans Classroom et j’y vois « Remis ».",
      "trace": "rapport:5 — Remettre mon rapport",
      "juste": "Cette case est un aide-mémoire. Le professeur vérifie la remise dans Classroom.",
      "liste": [
        "La pièce jointe est mon rapport complet.",
        "Le devoir affiche « Remis »."
      ]
    },
    "extra": "<p class=\"note\">Ces trois vérifications valent 6 points sur 20 : identification et nom /2, mise en page et tableau /2, capture et remise /2.</p>"
  }
];

/* Une seule version du QCM (étape 4) et de l'ordre (étape 7) depuis le 06/11/2026 : exercices non cotés,
   les trois variantes étaient presque identiques. Exception voulue à la règle des trois variantes. */

const FIN = {
 titre:'Mon enquête est terminée',
 bulle:'Enquête bouclée : bravo, détective !',
 revision:{titre:'Je retiens — préparer le bilan',texte:'Trois situations à résoudre sans aide, puis une synthèse pour te corriger. Rien à ajouter au rapport.',url:'https://root75.github.io/campin-public/labo-07/je-retiens.html'},
 citation:{texte:'Car ce n’est pas assez d’avoir l’esprit bon, mais le principal est de l’appliquer bien.',auteur:'René Descartes',source:'Discours de la méthode, première partie (1637)',lien:'Mon hypothèse m’a donné une piste ; c’est mon test et ma preuve qui m’ont permis de la discuter.'},
 texte:'Le rapport contient les preuves utiles. Les incidents non rédigés sont vérifiés à deux ; le défi final reste à expliquer individuellement au professeur. Les déclarations du site ne valident ni les gestes ni la remise du document.',
 plus:'Reprends une de tes hypothèses et explique à l’oral ce qui te ferait changer d’avis.',
 lien:'le « Je retiens » de cette enquête'
};

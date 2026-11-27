/* Une tâche à la fois (Vincent, 27/11/2026) : mission 1 guidée, une manipulation puis sa preuve dans les champs du site ;
 * le rapport d'une page, rédigé et remis en une seule étape avec ces notes ; missions 2, 3 et défi en autonomie, réponses dans les champs. */
const COURS = 'labo-07';
const DECOUVERTES = [["🖥️", "Mon PC identifié"], ["💡", "Hypothèse posée"], ["🔬", "Première mesure"], ["📊", "Calcul observé"], ["⏹️", "GIMP arrêté"], ["📦", "Rapport remis"], ["☁️", "Piste du nuage"], ["📁", "Fichier retrouvé"], ["🔧", "Panne prévue"], ["🛠️", "Panne résolue"], ["🧭", "Test choisi"], ["🔍", "Décision expliquée"]];
const VERSION_PARCOURS = 'une-tache-1';   // 27/11/2026 : refonte « une tâche à la fois », 12 blocs, rapport après la mission 1 (avant : missions-6, 11 blocs)
const PRESENTATION = 'missions';
const ECRAN_LEGER = true;   // blocs.js : une tâche à la fois, la question en retrait tant qu'il reste des gestes (Vincent, 26/11/2026)   // blocs.js : cloche en haut à droite, bulle, bravo, sans « Je veux / Je fais / Je vois »
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
 {titre:'Mission 1 — Observer ce qui tourne', court:'Mission 1', rond:'1', debut:0, fin:5, bulle:'Première mission : que fait le PC quand une application s’ouvre ? Une manipulation à la fois, et tu notes ce que tu lis.'},
 {titre:'Je rédige mon rapport', court:'Rapport', rond:'📄', bouton:'Je rédige mon rapport →', debut:5, fin:6, bulle:'Avec tes notes de la mission 1 : un rapport d’une page, puis tu le remets.'},
 {titre:'Mission 2 — Retrouver ses données', court:'Mission 2', rond:'2', debut:6, fin:8, bulle:'Bien joué ! Maintenant, où vit ton fichier ?'},
 {titre:'Mission 3 — Dépanner', court:'Mission 3', rond:'3', debut:8, fin:10, bulle:'Une panne à élucider seul : hypothèse, test, observation, solution.'},
 {titre:'Défi final individuel', court:'Défi', rond:'⭐', bouton:'Défi final →', debut:10, fin:12, bulle:'Dernier défi, seul : montre ta méthode d’enquêteur.'}
];
const BLOCS = [
 {
  "partie": "1 — Observer ce qui tourne",
  "titre": "Ouvrir le Gestionnaire des tâches",
  "court": "Mon PC",
  "min": 6,
  "veux": "Trouver les caractéristiques de mon PC dans le Gestionnaire des tâches.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre le <b>Gestionnaire des tâches</b> : clic droit sur l’icône ⊞ Démarrer ▸ Gestionnaire des tâches (ou Ctrl + Shift + Esc).</span></label></li><li><label><input type=\"checkbox\"><span>À gauche, 📈 <b>Performance</b> ▸ clique tour à tour sur Processeur (son nom en haut à droite, le nombre de Cœurs sous le graphique), sur Mémoire (le total, en haut à droite) et sur Disque 0 (C:) (sa Capacité, sous le graphique).</span></label></li></ol>",
  "vois": "Je connais le processeur, ses cœurs, la mémoire totale et la capacité du disque de mon PC.",
  "coince": [
   "Le Gestionnaire s’ouvre en petite fenêtre, sans colonnes ? Clique sur ⌄ Plus de détails, en bas à gauche. Pas de noms à gauche ? Clique sur ☰, en haut à gauche, ou agrandis la fenêtre.",
   "Tes valeurs diffèrent de celles du voisin ? Normal : chaque PC a les siennes. Pas de « Disque 0 (C:) » ? Prends le premier disque de la liste."
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
   "q": "Recopie ce que tu lis dans Performance.",
   "champs": [
    {
     "cle": "PROC",
     "nom": "Nom du processeur",
     "max": 70
    },
    {
     "cle": "COEURS",
     "nom": "Nombre de cœurs, avec le mot (6 cœurs)",
     "max": 12,
     "exemple": "6 cœurs"
    },
    {
     "cle": "MEMT",
     "nom": "Mémoire totale, avec l’unité (16 Go)",
     "max": 12,
     "exemple": "16 Go"
    },
    {
     "cle": "DISQ",
     "nom": "Capacité du disque C:, avec l’unité (476 Go)",
     "max": 12,
     "exemple": "476 Go"
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Mon PC",
   "colle": true
  },
  "extra": "<p class=\"attention\">⚠️ Ici, on observe seulement : ne termine aucune tâche et ne change aucun réglage.</p>"
 },
 {
  "partie": "1 — Observer ce qui tourne",
  "titre": "Mon hypothèse, puis les totaux avant",
  "court": "Avant",
  "min": 6,
  "veux": "Relever les totaux avant toute chose, et prévoir ce qui va changer.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Dans le Gestionnaire, à gauche, ☰ <b>Processus</b> ▸ lis les deux <b>totaux en %</b>, en haut des colonnes Processeur et Mémoire.</span></label></li></ol>",
  "vois": "J’ai relevé les deux totaux avant d’ouvrir GIMP, et écrit ma prévision.",
  "coince": [
   "Le total est le pourcentage écrit en haut de la colonne, au-dessus des noms. Ce n’est pas la ligne d’une application.",
   "Commence ton hypothèse par « Avec une grande image dans GIMP, je pense que la mémoire… ; pendant le calcul, le processeur… »."
  ],
  "demos": {
   "1": [
    "gestionnaire",
    [
     2,
     3,
     4
    ]
   ]
  },
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Recopie les deux totaux. À ton avis, que feront le processeur (il calcule) et la mémoire (elle garde ce que les logiciels ouverts utilisent) quand GIMP gardera une très grande image ouverte, pendant un gros calcul, et quand tu arrêteras GIMP ?",
   "champs": [
    {
     "cle": "CPU0",
     "nom": "Processeur avant (%)",
     "max": 8,
     "pourcent": true
    },
    {
     "cle": "MEM0",
     "nom": "Mémoire avant (%)",
     "max": 8,
     "pourcent": true
    },
    {
     "cle": "H",
     "nom": "Mon hypothèse",
     "max": 160
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Avant, et mon hypothèse",
   "colle": true
  },
  "extra": "<p class=\"attention\">⚠️ GIMP reste fermé tant que ton hypothèse n’est pas enregistrée : la prévision vient avant l’observation.</p>"
 },
 {
  "partie": "1 — Observer ce qui tourne",
  "titre": "Une très grande image dans GIMP",
  "court": "GIMP",
  "min": 8,
  "veux": "Occuper la mémoire avec une très grande image, puis relever les totaux.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre <b>GIMP</b> : ⊞ Démarrer ▸ tape GIMP ▸ clique sur l’application GIMP. Elle met 5 à 20 secondes à s’ouvrir. La fenêtre « Bienvenue dans GIMP » s’affiche : ferme-la par le ×, en haut à droite.</span></label></li><li><label><input type=\"checkbox\"><span>Dans GIMP : Fichier ▸ <b>Nouvelle image</b> (ou Ctrl + N) ▸ 10000 en Largeur, 10000 en Hauteur, puis touche Tab (sinon GIMP garde l’ancienne hauteur), unité px ▸ Valider ▸ « Confirmer la taille de l’image » ▸ Valider. Attends que l’image grise apparaisse.</span></label></li><li><label><input type=\"checkbox\"><span>Reviens au <b>Gestionnaire</b> par son icône dans la barre des tâches (ou Alt + Tab) ▸ Processus ▸ lis les deux totaux.</span></label><p class=\"attention\">⚠️ Laisse GIMP ouvert, sans rien y faire : tu l’arrêteras plus tard.</p></li></ol>",
  "vois": "GIMP garde ouverte une image grise de 10000 × 10000, et j’ai relevé les deux totaux.",
  "coince": [
   "GIMP refuse 10000 ? Vérifie que l’unité est px. GIMP ne s’ouvre pas, ou l’accès est bloqué ? Écris « accès refusé » dans les champs et sonne la cloche 🔔 : ne contourne pas la restriction.",
   "La hauteur reste à 1080 ? Après avoir tapé 10000, appuie sur Tab avant de valider."
  ],
  "demos": {
   "1": [
    "gimp",
    [
     0,
     1
    ]
   ],
   "2": [
    "gimp",
    [
     2,
     3,
     4
    ]
   ],
   "3": [
    "gestionnaire",
    [
     2
    ]
   ]
  },
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Recopie les deux totaux, GIMP ouvert avec sa grande image.",
   "champs": [
    {
     "cle": "CPU1",
     "nom": "Processeur avec GIMP (%)",
     "max": 8,
     "pourcent": true
    },
    {
     "cle": "MEM1",
     "nom": "Mémoire avec GIMP (%)",
     "max": 8,
     "pourcent": true
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Avec GIMP",
   "colle": true
  }
 },
 {
  "partie": "1 — Observer ce qui tourne",
  "titre": "Faire calculer le PC",
  "court": "Calcul",
  "min": 6,
  "veux": "Faire travailler le processeur et relever les totaux pendant le calcul.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre le <a href=\"https://root75.github.io/campin-public/labo-07/essai-charge.html\" target=\"_blank\" rel=\"noopener\">Banc d’essai</a> : il s’ouvre dans un nouvel onglet ▸ ▶ <b>Lancer le calcul</b>.</span></label></li><li><label><input type=\"checkbox\"><span>Tout de suite, Alt + Tab vers le Gestionnaire ▸ lis les deux <b>totaux pendant le calcul</b>.</span></label></li><li><label><input type=\"checkbox\"><span>Onglet Banc d’essai ▸ <b>■ Arrêter</b>.</span></label></li></ol>",
  "vois": "J’ai relevé les totaux pendant le calcul, puis arrêté le calcul.",
  "coince": [
   "Le total Processeur ne monte pas ? Sur le Banc d’essai, vérifie que l’état affiche « … au travail ». Compare toujours le total avec le total, pas avec une ligne d’application.",
   "Tu as arrêté trop tôt ? Relance le calcul, relis les totaux, puis arrête."
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
   ]
  },
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Recopie les deux totaux lus pendant le calcul.",
   "champs": [
    {
     "cle": "CPU2",
     "nom": "Processeur pendant le calcul (%)",
     "max": 8,
     "pourcent": true
    },
    {
     "cle": "MEM2",
     "nom": "Mémoire pendant le calcul (%)",
     "max": 8,
     "pourcent": true
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Pendant le calcul",
   "colle": true
  },
  "extra": "<p class=\"attention\">⚠️ Sur le Banc d’essai, seulement ▶ Lancer le calcul et ■ Arrêter : ne clique sur aucun autre bouton pendant les relevés.</p>"
 },
 {
  "partie": "1 — Observer ce qui tourne",
  "titre": "Arrêter GIMP",
  "court": "Fin de tâche",
  "min": 5,
  "veux": "Arrêter GIMP de force, puis relever les totaux une dernière fois.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Processus ▸ clique une fois sur la ligne GNU Image Manipulation Program ▸ bouton ⊘ <b>Terminer la tâche</b>, en haut (ou touche Delete). GIMP se ferme sans rien demander : l’image n’est pas enregistrée.</span></label><p class=\"attention\">⚠️ Termine seulement GIMP, et seulement ici. Terminer la tâche ferme de force : ce qui n’est pas enregistré est perdu. Ailleurs, on ne s’en sert que si le × ne répond plus.</p></li><li><label><input type=\"checkbox\"><span>Attends 10 secondes ▸ lis les deux <b>totaux</b>.</span></label></li></ol>",
  "vois": "GIMP est fermé et j’ai mes quatre relevés : avant, avec GIMP, pendant le calcul, après la fin de tâche.",
  "coince": [
   "GIMP a déjà été fermé ? Note quand même les totaux maintenant, et signale-le dans ta conclusion.",
   "La ligne GNU Image Manipulation Program n’apparaît pas ? Cherche-la dans Applications, en haut de la liste Processus."
  ],
  "demos": {
   "1": [
    "fintache",
    [
     0,
     1
    ]
   ],
   "2": [
    "fintache",
    [
     2
    ]
   ]
  },
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Recopie les deux totaux, après la fin de tâche. Ta mission 1 est terminée : ensuite, tu rédigeras ton rapport avec ces notes.",
   "champs": [
    {
     "cle": "CPU3",
     "nom": "Processeur après la fin de tâche (%)",
     "max": 8,
     "pourcent": true
    },
    {
     "cle": "MEM3",
     "nom": "Mémoire après la fin de tâche (%)",
     "max": 8,
     "pourcent": true
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Après la fin de tâche",
   "colle": true
  }
 },
 {
  "partie": "Je rédige mon rapport",
  "titre": "Je rédige mon rapport, puis je le remets",
  "court": "Rapport",
  "min": 35,
  "veux": "Écrire un rapport d’une page avec ce que j’ai noté pendant la mission 1, puis le remettre dans Classroom.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Crée ton document : gaufre ⋮⋮⋮, en haut à droite de Chrome ▸ Docs ▸ <b>+ Document vierge</b> (compte de l’école) ▸ clique sur « Document sans titre », en haut à gauche ▸ tape <span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span> ▸ Enter.</span></label></li><li><label><input type=\"checkbox\"><span>Reviens sur l’onglet du cours ▸ clique sur le bouton 📋 <b>Copier la trame</b>, juste en dessous ▸ dans ton document, Édition ▸ Coller sans mise en forme (Ctrl + Shift + V) ▸ complète ton prénom, ton nom, ta classe et la date.</span></label></li></ol><p class=\"outil-trame\"><button class=\"btn plein\" type=\"button\" data-copier-trame>📋 Copier la trame</button> <span class=\"note trame-statut\" role=\"status\"></span><a class=\"note\" href=\"https://root75.github.io/campin-public/labo-07/pas-a-pas/trame-rapport.txt\" target=\"_blank\" rel=\"noopener\">Trame en texte brut</a></p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Mets la trame en page <b>avec les styles</b> : clique dans la ligne ▸ liste « Normal », à gauche de la barre d’outils ▸ le style ▸ Appliquer le style.</span></label><ul class=\"styles\"><li>« Dans les coulisses du PC » : style <b>Titre</b>, puis centré (icône Aligner ▸ Aligner au centre, ou Ctrl + Shift + E).</li><li>« Mon rapport d’enquête » : style <b>Sous-titre</b>, centré aussi.</li><li>Les quatre parties, de « 1. Mon PC » à « 4. Ma conclusion » : style <b>Titre 1</b> (ou Ctrl + Alt + 1).</li></ul></li><li><label><input type=\"checkbox\"><span>Partie 2 : clique sur la ligne « [Insérer un vrai tableau…] » ▸ Insertion ▸ <b>Tableau</b> ▸ glisse jusqu’à 3 × 5 ▸ recopie tes relevés, rappelés ci-dessous. Partie 1 : recopie ton PC.</span></label><div class=\"sous-case\"><p class=\"note\">📋 <b>Tes notes de la mission 1</b>, telles que tu les as écrites dans ce site (sur un autre poste, rouvre les pastilles 1 à 5 de la mission 1) :</p><table class=\"notes-m1\"><tr><th>Moment</th><th>Processeur (%)</th><th>Mémoire (%)</th></tr><tr><td>Avant</td><td><span data-rappel=\"2:CPU0\">pastille 2</span></td><td><span data-rappel=\"2:MEM0\">pastille 2</span></td></tr><tr><td>Avec GIMP</td><td><span data-rappel=\"3:CPU1\">pastille 3</span></td><td><span data-rappel=\"3:MEM1\">pastille 3</span></td></tr><tr><td>Pendant le calcul</td><td><span data-rappel=\"4:CPU2\">pastille 4</span></td><td><span data-rappel=\"4:MEM2\">pastille 4</span></td></tr><tr><td>Après fin de tâche</td><td><span data-rappel=\"5:CPU3\">pastille 5</span></td><td><span data-rappel=\"5:MEM3\">pastille 5</span></td></tr></table><p class=\"note\">Mon PC : <span data-rappel=\"1:PROC\">…</span> · <span data-rappel=\"1:COEURS\">…</span> · <span data-rappel=\"1:MEMT\">…</span> de mémoire · disque <span data-rappel=\"1:DISQ\">…</span> (pastille 1).</p></div></li><li><label><input type=\"checkbox\"><span>Partie 3, ta <b>capture</b> : Gestionnaire ▸ Performance ▸ Mémoire ▸ Windows + Shift + S ▸ trace un rectangle autour du graphique et du total ▸ dans le rapport, clique sous le titre de la partie ▸ Ctrl + V ▸ redimensionne par un coin ▸ écris une légende juste dessous.</span></label></li><li><label><input type=\"checkbox\"><span>Partie 4, ta <b>conclusion</b>, en deux ou trois phrases : ce qui a changé dans tes relevés, si ton hypothèse (rappelée au-dessus) est confirmée, et une limite.</span></label></li><li><label><input type=\"checkbox\"><span><b>Remets</b> ton rapport : ouvre <a href=\"https://classroom.google.com/\" target=\"_blank\" rel=\"noopener\">Classroom</a> ▸ ta classe, à gauche ▸ onglet Travaux et devoirs ▸ Afficher votre devoir ▸ Labo 07 — Dans les coulisses du PC ▸ dans « Vos devoirs », Ajouter ou créer ▸ Google Drive ▸ <span data-rappel=\"rapport\">LABO07_CoulissesPC_Prenom_Nom</span> ▸ le bouton bleu ▸ Rendre le devoir ▸ Rendre le devoir. Vérifie que le devoir affiche « Remis ».</span></label></li></ol>",
  "vois": "Mon rapport d’une page est mis en page, contient mon tableau, ma capture légendée et ma conclusion, et Classroom affiche « Remis ».",
  "coince": [
   "La copie de la trame ne marche pas ? Clique sur « Trame en texte brut » ▸ Ctrl + A ▸ Ctrl + C, puis dans ton document : Ctrl + Shift + V.",
   "Le tableau ci-dessus affiche « pastille 2 » au lieu d’un nombre ? Tu as changé de poste : clique sur la pastille indiquée de la mission 1, relis ta réponse, puis reviens ici. Le collage de la capture ne donne rien ? Docs ▸ Insertion ▸ Image ▸ Importer depuis l’ordinateur ▸ dossier Images ▸ Captures d’écran."
  ],
  "demos": {
   "1": [
    "rapport",
    [
     0,
     1,
     2,
     3,
     4
    ]
   ],
   "2": [
    "rapport",
    [
     5,
     6
    ]
   ],
   "3": [
    "styles",
    [
     0,
     1,
     2,
     3,
     4,
     5,
     6
    ]
   ],
   "4": [
    "tableau",
    [
     0,
     1,
     2,
     3
    ]
   ],
   "5": [
    "capture",
    [
     0,
     1,
     2,
     3,
     4
    ]
   ],
   "7": [
    "joindre",
    [
     0,
     1,
     2,
     3,
     4,
     5,
     6,
     7,
     8
    ]
   ]
  },
  "indices": true,
  "rappel": [
   {
    "de": "2:H",
    "titre": "Ton hypothèse de départ"
   }
  ],
  "q": {
   "type": "rapport",
   "q": "Avant de quitter l’étape : relis ton rapport avec la grille, sur 10.",
   "confirmation": "J’ai remis mon rapport dans Classroom et j’y vois « Remis ».",
   "trace": "rapport:Mon rapport",
   "juste": "Cette case est un aide-mémoire. Le professeur corrige le rapport remis dans Classroom.",
   "liste": [
    "Mon document s’appelle LABO07_CoulissesPC_Prenom_Nom et porte prénom, nom, classe et date.",
    "Titre et sous-titre centrés ; les quatre parties en Titre 1.",
    "Un vrai tableau de 3 colonnes et 5 lignes, avec mes relevés.",
    "Une capture lisible, pas étirée, avec sa légende juste dessous.",
    "Deux ou trois phrases de conclusion : ce qui change, mon hypothèse, une limite.",
    "Le devoir affiche « Remis » dans Classroom."
   ]
  },
  "extra": "<p class=\"note\">Rapport sur 10 : contenu /6 (tableau /2, capture légendée /2, conclusion /2) ; mise en page /4 (titre et sous-titre /1, parties en Titre 1 /1, vrai tableau /1, nom du fichier et identification /1).</p><p class=\"attention\">⚠️ Pas de copier-coller du voisin. Un rapport copié sur un autre élève, c’est 0 sur 10, pour les deux rapports.</p>"
 },
 {
  "partie": "2 — Retrouver ses données",
  "titre": "Défi : mon fichier OneDrive est-il disponible sur ce PC ?",
  "min": 10,
  "veux": "Retrouver un fichier dans le dossier OneDrive scolaire de l’Explorateur et prévoir sa disponibilité sans changer son état.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Choisis un fichier que tu as déjà enregistré dans <b>OneDrive</b>, par exemple celui du Labo 06.</span></label></li></ol>",
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
  "court": "Retrouver et conclure",
  "min": 20,
  "veux": "Produire une preuve sur mon propre fichier, sans le supprimer ni modifier la synchronisation.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Ouvre l’<b>Explorateur</b> : icône 📁 dans la barre des tâches (ou Windows + E) ▸ dans le volet gauche, le nuage OneDrive scolaire (ton compte ou le nom de l’école) ▸ le dossier de ton fichier, par exemple Documents ▸ Informatique.</span></label></li><li><label><input type=\"checkbox\"><span>Clique <b>une seule fois</b> sur <span data-rappel=\"7:F\">ton fichier de la mission 2</span> pour le sélectionner.</span></label><p class=\"attention\">⚠️ Ne l’ouvre pas (pas de double-clic) : l’ouvrir peut le télécharger et changer son statut.</p></li><li><label><input type=\"checkbox\"><span>Clique dans la barre d’adresse (ou Ctrl + L) ▸ lis le <b>chemin complet</b>.</span></label></li><li><label><input type=\"checkbox\"><span>Si la <b>colonne Statut</b> n’est pas là : Afficher ▸ Détails (et si elle manque encore : clic droit sur un en-tête de colonne ▸ Statut) ▸ repère le symbole ou le message exact.</span></label></li></ol>",
  "vois": "Je connais le chemin et le statut de mon fichier, et je sais dire s’il serait lisible sans réseau.",
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
   "type": "enquete",
   "q": "Recopie le chemin et le statut. Puis : ton fichier serait-il disponible sans réseau, et quel indice le justifie ? Compare avec ta prévision, rappelée au-dessus. Si tu ne peux pas conclure, dis ce qui manque.",
   "champs": [
    {
     "cle": "CHEMIN",
     "nom": "Le chemin, à partir du nuage OneDrive",
     "max": 88
    },
    {
     "cle": "STATUT",
     "nom": "Le statut : symbole ou message exact",
     "max": 25
    },
    {
     "cle": "CONCL",
     "nom": "Disponible sans réseau ? L’indice qui le prouve",
     "max": 60
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Ma preuve",
   "colle": true
  },
  "extra": "<p class=\"attention\">⚠️ Ne clique ni sur Libérer de l’espace, ni sur Toujours conserver, et ne change aucun réglage OneDrive : tu changerais le statut que tu observes.</p>",
  "rappel": [
   {
    "de": "7:F",
    "titre": "Le fichier que tu as choisi"
   },
   {
    "de": "7:H",
    "titre": "Ta prévision"
   }
  ]
 },
 {
  "partie": "3 — Dépanner",
  "titre": "Mon incident : préparer et prévoir",
  "court": "Prévoir",
  "min": 8,
  "cle": "labo-07|incident",
  "veux": "Préparer la panne de mon incident, puis écrire mon hypothèse et mon test AVANT d’agir.",
  "vois": "Ma panne est prête, mon hypothèse et mon test sont écrits avant d’agir.",
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Avant de toucher à quoi que ce soit : à ton avis, que se passe-t-il ? Et quel test sans risque vas-tu faire pour le vérifier ?",
   "champs": [
    {
     "cle": "H",
     "nom": "Mon hypothèse",
     "max": 95
    },
    {
     "cle": "T",
     "nom": "Le test que je vais faire",
     "max": 95
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Mon hypothèse et mon test",
   "colle": true
  },
  "variantes": [
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 2 — je tape dans la mauvaise fenêtre</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ Comment choisir la fenêtre où arrive ce que je tape ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Prépare la panne</b> : ⊞ Démarrer ▸ tape Bloc-notes ▸ clique sur l’application ▸ Fichier ▸ <b>Nouvelle fenêtre</b> (ou Ctrl + Shift + N) ▸ place les deux fenêtres côte à côte par leur barre de titre ▸ clique dans la seconde.</span></label></li></ol>",
    "coince": [
     "Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.",
     "Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît."
    ],
    "demos": {
     "1": [
      "blocnotes",
      [
       0,
       1
      ]
     ]
    }
   },
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 3 — le fichier serait-il « dans » l’application ?</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ Si je ferme l’application, mon fichier disparaît-il ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Prépare la panne</b> : dans l’Explorateur (Windows + E), repère <span data-rappel=\"7:F\">ton fichier de la mission 2</span> dans son dossier OneDrive scolaire ▸ ouvre aussi Bloc-notes (⊞ Démarrer ▸ tape Bloc-notes).</span></label><p class=\"attention\">⚠️ Ne double-clique pas sur ton fichier : l’ouvrir peut le télécharger et changer son statut.</p></li></ol>",
    "coince": [
     "L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.",
     "Le bouton × ferme une fenêtre. Reviens au dossier OneDrive de la mission 2 et vérifie si ton fichier est toujours là."
    ],
    "demos": {
     "1": [
      "onedrive",
      [
       0,
       1,
       2,
       3
      ]
     ]
    }
   },
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 4 — écran noir, PC arrêté ?</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ L’écran noir veut-il dire que le PC est arrêté ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Repère le bouton ⏻ de l’écran</b> que le professeur a montré, distinct de celui du PC. Sur un portable ou un tout-en-un, prends le cas simulé : « écran éteint, puis mêmes fenêtres retrouvées ».</span></label><p class=\"attention\">⚠️ Ne touche jamais au bouton ⏻ du PC : seulement à celui de l’écran.</p></li></ol>",
    "coince": [
     "Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.",
     "Le seul test autorisé est le bouton de l’écran montré par le professeur. Si tes fenêtres reviennent telles quelles, qu’est-ce qui ne s’est jamais arrêté ?"
    ],
    "demos": {
     "1": [
      "moniteur",
      [
       0
      ]
     ]
    }
   }
  ],
  "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 1 — la fenêtre a disparu</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ La Calculatrice est-elle fermée, ou seulement cachée ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Prépare la panne</b> : ⊞ Démarrer ▸ tape Calculatrice ▸ clique sur l’application ▸ clique sur — <b>Réduire</b>, en haut à droite de sa fenêtre. La fenêtre disparaît.</span></label></li></ol>",
  "coince": [
   "Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?",
   "Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice."
  ],
  "demos": {
   "1": [
    "calculatrice",
    [
     0,
     1
    ]
   ]
  }
 },
 {
  "partie": "3 — Dépanner",
  "titre": "Mon incident : tester et conclure",
  "court": "Tester",
  "min": 10,
  "cle": "labo-07|incident",
  "veux": "Faire mon test, puis écrire ce que j’ai observé et la solution.",
  "vois": "J’ai testé, observé, et je sais expliquer la solution en trente secondes à la mise en commun.",
  "indices": true,
  "rappel": [
   {
    "de": "9:H",
    "titre": "Ton hypothèse"
   },
   {
    "de": "9:T",
    "titre": "Ton test"
   }
  ],
  "q": {
   "type": "enquete",
   "q": "Après ton test : qu’as-tu observé ? Quelle est la solution, et qu’est-ce qui la justifie ? À la mise en commun, tu l’expliqueras en trente secondes.",
   "champs": [
    {
     "cle": "O",
     "nom": "Ce que j’ai observé",
     "max": 95
    },
    {
     "cle": "S",
     "nom": "La solution, et ce qui la justifie",
     "max": 95
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Mon observation et la solution",
   "colle": true
  },
  "variantes": [
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 2 — je tape dans la mauvaise fenêtre</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ Comment choisir la fenêtre où arrive ce que je tape ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Fais ton test</b> : écris le seul mot « test » dans la <b>première</b> fenêtre.</span></label><p class=\"attention\">⚠️ N’enregistre rien : ce sont des fenêtres d’essai.</p></li></ol>",
    "coince": [
     "Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.",
     "Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît."
    ],
    "demos": {
     "1": [
      "fenetres",
      [
       3
      ]
     ]
    }
   },
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 3 — le fichier serait-il « dans » l’application ?</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ Si je ferme l’application, mon fichier disparaît-il ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Fais ton test</b> : ferme Bloc-notes par le × (Ne pas enregistrer) ▸ retourne dans le dossier de ton fichier.</span></label><p class=\"attention\">⚠️ Ne déplace pas ton fichier, ne le renomme pas.</p></li></ol>",
    "coince": [
     "L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.",
     "Le bouton × ferme une fenêtre. Reviens au dossier OneDrive de la mission 2 et vérifie si ton fichier est toujours là."
    ],
    "demos": {}
   },
   {
    "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 4 — écran noir, PC arrêté ?</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ L’écran noir veut-il dire que le PC est arrêté ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Fais ton test</b> : éteins l’écran avec son bouton ▸ rallume-le avec le même bouton ▸ regarde si tes fenêtres sont toujours là.</span></label></li></ol>",
    "coince": [
     "Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.",
     "Le seul test autorisé est le bouton de l’écran montré par le professeur. Si tes fenêtres reviennent telles quelles, qu’est-ce qui ne s’est jamais arrêté ?"
    ],
    "demos": {
     "1": [
      "moniteur",
      [
       1,
       2
      ]
     ]
    }
   }
  ],
  "fais": "<p class=\"mon-incident\">🔧 <b>Ton incident : n° 1 — la fenêtre a disparu</b><br>Le site en donne un seul par élève : ton voisin a peut-être un autre incident.<br>❓ La Calculatrice est-elle fermée, ou seulement cachée ?</p><ol class=\"etapes\"><li><label><input type=\"checkbox\"><span><b>Fais ton test</b> pour retrouver la fenêtre de la Calculatrice.</span></label></li></ol>",
  "coince": [
   "Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?",
   "Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice."
  ],
  "demos": {
   "1": [
    "fenetres",
    [
     1,
     2
    ]
   ]
  }
 },
 {
  "partie": "Final — Situation individuelle nouvelle",
  "titre": "Le dossier de secours",
  "min": 8,
  "veux": "Résoudre seul une situation nouvelle : après un changement de poste, peut-on lire le document sans réseau ?",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><b>Lis la situation</b> : tu prépares une présentation sur un autre PC de l’école. L’Explorateur y montre le nom du document avec un nuage bleu. Une autre fenêtre recouvre l’Explorateur. Un camarade dit : « Le fichier est là, il marchera sans réseau ; ferme Windows pour le retrouver. »</label></li></ol>",
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
  "extra": "<p class=\"attention\">⚠️ Ne coupe pas le réseau et ne ferme pas Windows : ce ne sont pas des tests sans risque.</p>"
 },
 {
  "partie": "Final — Situation individuelle nouvelle",
  "titre": "Montrer ma preuve et justifier ma décision",
  "min": 10,
  "veux": "Résoudre seul la nouvelle situation et justifier une décision en peu de mots.",
  "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Réalise sur ton poste <b>le test que tu as choisi</b> (rappelé au-dessus) : l’Explorateur recouvert par une fenêtre d’essai, retrouve-le.</span></label></li><li><label><input type=\"checkbox\"><span>Lis le <b>chemin et le statut</b> de <span data-rappel=\"7:F\">ton fichier de la mission 2</span>.</span></label><p class=\"attention\">⚠️ Ne l’ouvre pas : l’ouvrir peut le télécharger et changer son statut.</p></li><li><label><input type=\"checkbox\"><span>Prépare ton geste et ton indice pour le <b>contrôle individuel</b> du professeur, en circulation ; explique-lui machine, Windows, application et fichier. </span></label></li></ol>",
  "vois": "Une preuve en une ligne, une conclusion courte et une manipulation personnelle expliquée au professeur. La case du site ne remet pas le document.",
  "coince": [
   "Un nom de fichier visible ne suffit pas à prouver que son contenu est déjà téléchargé.",
   "Justifie séparément la disponibilité du fichier et l’utilité de fermer Windows. Relie l’écran et le PC au matériel, Windows au système, l’Explorateur ou Bloc-notes à un logiciel, le document à un fichier."
  ],
  "indices": true,
  "q": {
   "type": "enquete",
   "q": "Seul : note le statut que tu lis sur ton poste (le nuage bleu est sur l’autre PC du scénario, pas sur le tien). Puis réponds au camarade en deux phrases au plus : ta décision, et ce qui la justifie.",
   "champs": [
    {
     "cle": "STATUT",
     "nom": "Le statut lu sur mon poste",
     "max": 60
    },
    {
     "cle": "DEC",
     "nom": "Ma décision et ce qui la justifie (deux phrases)",
     "max": 125
    }
   ],
   "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.",
   "etiquette": "Ma preuve et ma décision",
   "colle": true
  },
  "rappel": [
   {
    "de": "11:H",
    "titre": "Ton hypothèse"
   },
   {
    "de": "11:T",
    "titre": "Le test que tu as choisi"
   }
  ]
 }
];

/* Sous chaque étape (blocs.js, basEtape) : fermer et rouvrir ne sont pas des étapes, chacun le fait à la sonnerie,
   où qu'il en soit. Mêmes encadrés que dans Le rat de ville. */
const BAS_ETAPE = [
 {classe:'sonnerie',titre:'🔔 À la sonnerie, où que j’en sois',gestes:[
  {texte:'<b>Je ferme les onglets</b> de mon rapport et du Banc d’essai, s’ils sont ouverts. Docs enregistre tout seul.',note:'⚠️ Je ne remets mon rapport que lorsqu’il est terminé, à l’étape « Je rédige mon rapport ».',demo:'fermer'},
  {texte:'<b>Je me déconnecte de Windows :</b> touche Windows ⊞ ▸ clic sur <b>mon nom</b>, en bas à gauche du menu ▸ <b>Se déconnecter</b> (ou <b>Ctrl + Alt + Delete</b> ▸ <b>Se déconnecter</b>). Sinon, l’élève suivant arrive dans <b>ma</b> session : mon Drive, mes documents, en mon nom.',note:'Le bouton ⏻ du menu propose Verrouiller, Arrêter, Redémarrer : pas « Se déconnecter ». Je n’éteins pas l’ordinateur.',demo:'deconnecter'}
 ]},
 {classe:'reprise',titre:'▶ Je reprends mon cours',gestes:[
  {texte:'<b>Je reprends à ma pastille :</b> mes réponses sont gardées par le site. Si j’étais en train d’écrire mon rapport : menu Google (la gaufre) ▸ <b>Drive</b> ▸ <b>Récents</b> ▸ double-clic sur mon rapport.',demo:'retrouver'}
 ]}
];

const FIN = {
 titre:'Mon enquête est terminée',
 bulle:'Enquête bouclée : bravo, détective !',
 revision:{titre:'Je retiens — préparer le bilan',texte:'Trois situations à résoudre sans aide, une synthèse, puis les mots croisés et le quiz.',url:'https://root75.github.io/campin-public/labo-07/je-retiens.html'},
 citation:{texte:'Car ce n’est pas assez d’avoir l’esprit bon, mais le principal est de l’appliquer bien.',auteur:'René Descartes',source:'Discours de la méthode, première partie (1637)',lien:'Mon hypothèse m’a donné une piste ; c’est mon test et ma preuve qui m’ont permis de la discuter.'},
 texte:'Ton rapport de la mission 1 est remis. Tes réponses des missions 2 et 3 et du défi restent dans le site : le professeur les voit. Le défi final s’explique aussi à l’oral.',
 plus:'Reprends une de tes hypothèses et explique à l’oral ce qui te ferait changer d’avis.',
 lien:'le « Je retiens » de cette enquête'
};

/* Auto-évaluation de fin (grille « Moi », non cotée) : une carte par mission (Vincent, 27/11/2026 : « je l'ai bien fait,
   j'ai bien compris, je n'ai pas compris, comment je peux voir »). C dit toujours comment vérifier. */
const GRILLE = {
  intro: '<p><b>Avant de partir : où en es-tu ?</b> Une carte par mission. Lis les quatre phrases et clique sur celle qui te ressemble le plus. Ce n’est pas coté : ta réponse t’aide à voir quoi réviser, et ton professeur voit où t’aider.</p>',
  niveaux: { A:'', B:'', C:'', D:'' },
  criteres: [
    { n:'1. Sais-tu lire ce qui tourne dans ton PC ?', inc:false, regarde:'S3M4.1 « Différencier système d’exploitation et machine »',
      A:'Je retrouve seul processeur, mémoire et totaux, et j’explique à un voisin pourquoi la mémoire monte avec GIMP.',
      B:'Je retrouve seul les totaux dans le Gestionnaire et je sais ce qu’ils montrent.',
      C:'Je l’ai fait avec le pas à pas, sans être sûr de pouvoir le refaire. Pour vérifier : je rouvre la mission 1 et je refais un relevé sans lire les cases.',
      D:'Je n’ai pas compris ce que montrent les totaux.' },
    { n:'2. Sais-tu dire si un fichier OneDrive est disponible sans réseau ?', inc:true, regarde:'S3M4.4 « Utiliser l’interface du système d’exploitation et les périphériques »',
      A:'Je lis le chemin et le statut seul, et j’explique la différence entre nuage bleu et coche verte avec un exemple.',
      B:'Je lis le chemin et le statut seul, et je sais conclure.',
      C:'J’ai trouvé le statut, mais je ne saurais pas encore conclure seul. Pour vérifier : la partie 3 du « Je retiens », puis la situation 2.',
      D:'Je ne sais pas encore où lire le statut d’un fichier.' },
    { n:'3. Sais-tu dépanner en suivant la méthode ?', inc:true, regarde:'S3M4.4 « Utiliser l’interface du système d’exploitation et les périphériques »',
      A:'Hypothèse, test sans risque, observation, solution : je l’ai fait seul, et je sais expliquer les trois autres incidents.',
      B:'Hypothèse, test, observation, solution : je l’ai fait seul pour mon incident.',
      C:'J’ai testé, mais mon hypothèse ou ma solution reste floue. Pour vérifier : la situation 3 du « Je retiens », sans ouvrir la correction.',
      D:'Je n’ai pas compris ce qu’est un test sans risque.' },
    { n:'4. Sais-tu distinguer machine, Windows, application et fichier ?', inc:true, regarde:'S3M4.1 « Différencier système d’exploitation et machine »',
      A:'Je classe les quatre dans une situation nouvelle et je justifie chaque choix.',
      B:'Je classe les quatre dans la situation du défi.',
      C:'Je confonds encore parfois deux d’entre eux. Pour vérifier : les mots croisés et le quiz du « Je retiens ».',
      D:'Je ne vois pas encore la différence.' }
  ]
};

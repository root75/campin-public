/* Préparer le rapport, trois missions, un défi final, remettre le rapport. Dix étapes internes réutilisent le suivi existant.
 * Trois hypothèses sur le site ; tableau/capture et écrits courts dans le rapport ; entraide guidée et contrôle individuel final par le professeur. */
const COURS = 'labo-07';
const VERSION_PARCOURS = 'missions-4';   // 06/11/2026 : « Préparer » et « Remettre mon rapport » ajoutées, mission 1 en trois étapes
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
const PARCOURS = [
 {titre:'Préparer mon rapport', court:'Rapport', debut:0, fin:1, bulle:'Avant l’enquête : ton carnet d’enquêteur. Un seul document pour tout le labo.'},
 {titre:'Mission 1 — Observer ce qui tourne', court:'Mission 1', debut:1, fin:4, bulle:'Première mission : que fait le PC quand une application s’ouvre ?'},
 {titre:'Mission 2 — Retrouver ses données', court:'Mission 2', debut:4, fin:6, bulle:'Bien joué ! Maintenant, où vit ton fichier ?'},
 {titre:'Mission 3 — Dépanner', court:'Mission 3', debut:6, fin:7, bulle:'Quatre petites pannes à élucider, à deux.'},
 {titre:'Défi final individuel', court:'Défi', bouton:'Défi final →', debut:7, fin:9, bulle:'Dernier défi, seul : montre ta méthode d’enquêteur.'},
 {titre:'Remettre mon rapport', court:'Remise', bouton:'Remettre mon rapport →', debut:9, fin:10, bulle:'Dernier geste : remettre ton rapport, une seule fois.'}
];
const BLOCS = [
  {
    "partie": "Avant de commencer — Mon rapport",
    "titre": "Créer mon rapport et le placer à côté du cours",
    "min": 8,
    "veux": "Préparer le document où j’écrirai mes preuves, avant toute mesure.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\"><span>Dans Chrome, clique sur la gaufre ⋮⋮⋮, en haut à droite ▸ Docs. Ou ouvre <a href=\"https://docs.google.com/\" target=\"_blank\" rel=\"noopener\">Google Docs</a>. Compte de l’école.</span></label></li><li><label><input type=\"checkbox\">Clique sur + Document vierge.</label></li><li><label><input type=\"checkbox\">Clique sur « Document sans titre », en haut à gauche.</label></li><li><label><input type=\"checkbox\"><span>Tape <b>07_CoulissesPC_Prenom_Nom</b>, avec ton prénom et ton nom sans accents, puis Entrée.</span></label></li><li><label><input type=\"checkbox\">Reviens sur l’onglet du cours. Clique sur le bouton 📋 Copier la trame, juste en dessous.</label></li></ol><p class=\"outil-trame\"><button class=\"btn plein\" type=\"button\" data-copier-trame>📋 Copier la trame</button> <span class=\"note trame-statut\" role=\"status\"></span><a class=\"note\" href=\"https://root75.github.io/campin-public/labo-07/pas-a-pas/trame-rapport.txt\" target=\"_blank\" rel=\"noopener\">Trame en texte brut</a></p><ol class=\"etapes\"><li><label><input type=\"checkbox\">Dans ton document, clique dans la page ▸ Édition ▸ Coller sans mise en forme (Ctrl + Maj + V).</label></li><li><label><input type=\"checkbox\">Complète ton prénom, ton nom et la date en haut du document.</label></li><li><label><input type=\"checkbox\">Clic droit sur l’onglet du rapport ▸ Ajouter l’onglet à une nouvelle vue fractionnée. Le cours à gauche, le rapport à droite.</label></li><li><label><input type=\"checkbox\">Vérifie en haut du document l’indication « Enregistré dans Drive ».</label></li></ol>",
    "vois": "Mon document s’appelle 07_CoulissesPC_Prenom_Nom, contient la trame et mon identification, et s’affiche à côté du cours.",
    "coince": [
      "La copie ne marche pas ? Clique sur le lien « Trame en texte brut » ▸ Ctrl + A ▸ Ctrl + C. Puis, dans ton document : Ctrl + Maj + V.",
      "Pas de « vue fractionnée » dans le menu ? Garde deux onglets et passe de l’un à l’autre en cliquant sur leur titre. Docs ouvre un autre compte ? Clique sur la photo ronde, en haut à droite ▸ choisis ton compte de l’école."
    ],
    "demos": {
      "1": ["rapport", [0, 1]],
      "2": ["rapport", [2]],
      "3": ["rapport", [3]],
      "4": ["rapport", [4]],
      "6": ["rapport", [5]],
      "8": ["cote", [0, 1, 2, 3]],
      "9": ["rapport", [6]]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Ton document est créé, nommé, avec la trame et ton identification.",
      "confirmation": "J’ai créé mon rapport 07_CoulissesPC_Prenom_Nom, collé la trame et complété mon identification.",
      "trace": "rapport:0 — Préparer mon rapport",
      "juste": "Ton rapport est prêt. Garde-le ouvert : tu y écriras à chaque mission."
    },
    "extra": "<p class=\"stop\">Un seul document pour tout le labo. Au cours suivant, ne crée pas de deuxième document : rouvre celui-ci depuis ton Drive scolaire.</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Défi : une application ouverte, qu’est-ce qui change ?",
    "min": 8,
    "veux": "Prévoir ce qui changera pour le processeur et la mémoire du PC quand j’ouvrirai GIMP, un logiciel de retouche d’images.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Vérifie que ton rapport est ouvert à droite du cours.</label></li><li><label><input type=\"checkbox\">Tu vas observer deux choses : le processeur (il calcule) et la mémoire (elle garde ce que les logiciels ouverts utilisent).</label></li><li><label><input type=\"checkbox\">À ton avis, quand GIMP s’ouvrira, que feront le processeur et la mémoire ? Ils montent, ils baissent, ils restent pareils ?</label></li><li><label><input type=\"checkbox\">Écris ta réponse dans « Mon hypothèse », sous les cases. GIMP reste fermé tant que ce n’est pas écrit.</label></li></ol>",
    "vois": "Mon hypothèse annonce un changement possible et ce qui me permettrait de le constater.",
    "coince": [
      "Une hypothèse est une idée à tester, pas une définition. Un résultat stable peut aussi être intéressant.",
      "Commence par « Si j’ouvre GIMP, je pense que… ». Indique ce que tu comparerais avant, pendant son ouverture et une fois ouvert. Pas encore de rapport ? Clique sur ← Étape précédente."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "GIMP encore fermé : écris ce que tu prévois.",
      "champs": [
        {
          "cle": "H",
          "nom": "Mon hypothèse sur le processeur et la mémoire",
          "max": 125
        }
      ],
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note."
    },
    "extra": "<p class=\"stop\">Chacun manipule son propre PC. Première réponse seul ; comparaison à deux ensuite. Aucune fin de tâche, aucune suppression, aucun réglage.</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Relever les mesures avant et après GIMP",
    "min": 12,
    "veux": "Relever le processeur et la mémoire avant l’ouverture de GIMP, 10 secondes après, puis 1 minute après.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Fais un clic droit sur l’icône ⊞ Démarrer ▸ Gestionnaire des tâches (ou Ctrl + Maj + Échap).</label></li><li><label><input type=\"checkbox\">Si nécessaire, clique sur Plus de détails.</label></li><li><label><input type=\"checkbox\">Clique sur Processus : repère deux applications dont tu reconnais le nom.</label></li><li><label><input type=\"checkbox\">Lis le total Processeur en % en haut de la colonne.</label></li><li><label><input type=\"checkbox\">Lis le total Mémoire en % en haut de la colonne.</label></li><li><label><input type=\"checkbox\">Dans ton rapport, partie 1, saisis ces valeurs dans la ligne Avant du tableau.</label></li><li><label><input type=\"checkbox\">Clique sur ⊞ Démarrer ▸ tape GIMP ▸ clique sur l’application GIMP. Elle met 5 à 20 secondes à s’ouvrir : ne clique pas une deuxième fois.</label></li><li><label><input type=\"checkbox\">Reviens tout de suite au Gestionnaire par son icône dans la barre des tâches (ou Alt + Tab).</label></li><li><label><input type=\"checkbox\">Environ 10 secondes après le clic sur GIMP, lis les deux mêmes totaux.</label></li><li><label><input type=\"checkbox\">Dans le tableau du rapport, complète la ligne Après 10 s.</label></li><li><label><input type=\"checkbox\">Laisse GIMP ouvert sans rien y faire et attends environ 1 minute.</label></li><li><label><input type=\"checkbox\">Dans le tableau du rapport, complète la ligne Après 1 min avec les deux mêmes totaux.</label></li></ol>",
    "vois": "Mon tableau contient deux noms d’applications et les trois relevés : Avant, Après 10 s, Après 1 min.",
    "coince": [
      "Compare la même grandeur : le total CPU avec le total CPU, pas le total avec une ligne d’application. La mémoire en % n’est pas celle d’un seul logiciel en Mo.",
      "GIMP met 5 à 20 secondes à s’ouvrir : c’est normal, ne relance pas. Relève quand même à 10 s, même si la fenêtre n’est pas encore là. Les totaux se lisent dans les en-têtes Processeur et Mémoire de Processus. Si l’accès est bloqué, note « accès refusé » et clique sur « J'attends de l'aide » : ne contourne pas la restriction."
    ],
    "demos": {
      "1": ["gestionnaire", [0, 1]],
      "2": ["gestionnaire", [2]],
      "3": ["gestionnaire", [3]],
      "4": ["gestionnaire", [4]],
      "5": ["gestionnaire", [5]],
      "6": ["tableau", [0, 1, 2, 3]],
      "7": ["gimp", [0, 1]],
      "8": ["gimp", [2]],
      "9": ["gimp", [3]],
      "12": ["gimp", [4]]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Tes trois relevés sont dans le tableau du rapport. Pas de phrase à écrire ici.",
      "confirmation": "J’ai relevé les deux totaux trois fois et complété le tableau de mon rapport.",
      "trace": "rapport:1 — Relevés de mesures",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
    },
    "extra": "<p class=\"stop\">Observation seulement : ne termine aucune tâche dans le Gestionnaire, ne change aucun réglage.</p>"
  },
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Capturer et conclure",
    "min": 10,
    "veux": "Montrer mes relevés par une capture, puis conclure prudemment.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Après le dernier relevé, prends une capture ciblée : ⊞ Démarrer ▸ Outil Capture d’écran ▸ Nouveau (ou Windows + Maj + S).</label></li><li><label><input type=\"checkbox\">Sélectionne seulement les noms utiles et les colonnes Processeur / Mémoire, sans autre travail visible.</label></li><li><label><input type=\"checkbox\">Reviens dans le rapport et colle la capture avec Édition ▸ Coller (Ctrl + V).</label></li><li><label><input type=\"checkbox\">Redimensionne par un coin pour garder les proportions et rester dans la page.</label></li><li><label><input type=\"checkbox\">Sous l’image, écris une légende qui explique ce qu’elle montre et sa limite.</label></li><li><label><input type=\"checkbox\">Dans le rapport, écris une conclusion de deux phrases : ce qui change dans tes relevés, puis une autre cause possible ou une limite.</label></li><li><label><input type=\"checkbox\">Après ta réponse personnelle, compare les observations avec un voisin.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun. Ensuite, le professeur affiche la synthèse sur ton écran.</label></li></ol>",
    "vois": "Mon rapport contient deux noms d’applications, les trois relevés et une capture légendée ; ma conclusion distingue ce qui monte puis redescend de ce qui reste.",
    "coince": [
      "Ta capture montre seulement les noms et les colonnes Processeur / Mémoire. Le collage échoue ? Enregistre la capture dans l’Outil Capture d’écran, puis Docs ▸ Insertion ▸ Image ▸ Importer depuis l’ordinateur.",
      "Une conclusion prudente : « Pendant l’ouverture, le processeur… ; une fois GIMP ouvert, la mémoire… ». Puis une limite : une autre tâche a pu travailler en même temps."
    ],
    "demos": {
      "1": ["capture", [0]],
      "2": ["capture", [1]],
      "3": ["capture", [2]],
      "4": ["capture", [3]],
      "5": ["capture", [4]]
    },
    "indices": true,
    "q": {
      "type": "mixte",
      "q": "Après tes observations : choisis une conclusion défendable, puis confirme ce que tu as fait dans le rapport.",
      "activite": {
        "type": "qcm",
        "q": "Cas fictif : le processeur passe de 5 % à 45 % pendant l’ouverture de GIMP, puis redescend à 7 % ; la mémoire passe de 40 % à 46 % et y reste. Que peut-on affirmer ?",
        "c": [
          "Le processeur a surtout travaillé pendant l’ouverture ; la mémoire reste occupée tant que GIMP est ouvert. Ces seuls relevés ne prouvent pas une cause unique.",
          "Toute la hausse vient forcément de GIMP, et de rien d’autre.",
          "Le PC est en panne parce que le processeur est monté à 45 %.",
          "La hausse du processeur prouve que le disque est plein."
        ],
        "p": [
          null,
          "GIMP est très probablement en cause, mais deux événements qui se suivent ne suffisent pas à l’isoler. Quelles autres tâches peuvent travailler en même temps ?",
          "Un processeur peut travailler fort quelques secondes sans panne : il est redescendu ensuite. Observe avant de diagnostiquer.",
          "Le travail du processeur et la place des fichiers sur le disque sont deux observations différentes."
        ],
        "juste": "Tu relies une observation à une conclusion prudente. Explique à l’oral ce qu’il faudrait encore vérifier."
      },
      "validation": {
        "type": "rapport",
        "q": "Un tableau, une capture légendée et deux phrases de conclusion. Aucune recopie des hypothèses du site.",
        "confirmation": "J’ai réalisé les manipulations demandées et complété « 1 — Observer ce qui tourne » dans mon rapport.",
        "trace": "rapport:1 — Observer ce qui tourne",
        "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
      }
    },
    "extra": "<details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Ferme GIMP par le × en haut à droite de sa fenêtre, puis relis les deux totaux après 10 secondes. Lequel redescend ? Propose une manière de rendre la comparaison plus fiable. L’observation des ressources est un prolongement, sans nouvelle compétence de 3e attribuée.</p></details>"
  },
  {
    "partie": "2 — Retrouver ses données",
    "titre": "Défi : mon fichier OneDrive est-il disponible sur ce PC ?",
    "min": 10,
    "veux": "Retrouver un fichier dans le dossier OneDrive scolaire de l’Explorateur et prévoir sa disponibilité sans changer son état.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Choisis un fichier que tu as déjà enregistré dans OneDrive, par exemple celui du Labo 06. Écris où tu penses le retrouver et s’il serait lisible sans réseau.</label></li><li><label><input type=\"checkbox\">Enregistre cette première réponse avant de chercher.</label></li></ol>",
    "vois": "Je sépare ma prévision de la preuve que je vais chercher.",
    "coince": [
      "« Dans Word » donne une application, pas un emplacement. Cherche le dossier dans lequel le fichier avait été rangé.",
      "Sur ces PC Windows, les fichiers synchronisés se cherchent dans OneDrive, via le volet gauche de l’Explorateur. Ton ancien fichier peut être dans Documents ▸ Informatique. Observe le vrai chemin et le statut sur ton poste."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Avant de chercher, formule ton hypothèse.",
      "champs": [
        {
          "cle": "H",
          "nom": "Emplacement supposé et disponibilité sans réseau",
          "max": 150
        }
      ],
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note."
    },
    "extra": ""
  },
  {
    "partie": "2 — Retrouver ses données",
    "titre": "Retrouver, lire le statut et conclure",
    "min": 20,
    "veux": "Produire une preuve sur mon propre fichier, sans le supprimer ni modifier la synchronisation.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Clique sur l’icône 📁 Explorateur dans la barre des tâches (ou Windows + E).</label></li><li><label><input type=\"checkbox\">Dans le volet gauche, clique sur le nuage OneDrive scolaire, nommé avec ton compte ou le nom de l’école.</label></li><li><label><input type=\"checkbox\">Ouvre le dossier où tu avais enregistré ton fichier, par exemple Documents ▸ Informatique.</label></li><li><label><input type=\"checkbox\">Sélectionne une fois le fichier choisi, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Clique dans la barre d’adresse pour lire le chemin complet (ou Ctrl + L).</label></li><li><label><input type=\"checkbox\">Dans ton rapport, partie 2, relève le chemin OneDrive et le nom du fichier ; tu peux remplacer ton nom personnel par [moi].</label></li><li><label><input type=\"checkbox\">Si nécessaire, clique sur Afficher ▸ Détails.</label></li><li><label><input type=\"checkbox\">Lis la colonne Statut ; si elle manque, clic droit sur un en-tête de colonne ▸ Statut, si proposé.</label></li><li><label><input type=\"checkbox\">Dans le rapport, relève le symbole ou le message exact ; si rien n’apparaît, écris « statut non affiché ».</label></li><li><label><input type=\"checkbox\">Dans le rapport, écris une seule phrase : serait-il disponible sans réseau, et quel indice le justifie ? Si tu ne peux pas conclure, dis ce qui manque.</label></li><li><label><input type=\"checkbox\">Après ta réponse personnelle, compare les statuts avec un voisin.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun. Ensuite, le professeur affiche la synthèse sur ton écran.</label></li></ol>",
    "vois": "Mon relevé décrit ce poste : chemin, nom et statut. Une absence de statut reste une observation.",
    "coince": [
      "Le chemin permet de vérifier si le dossier se trouve dans OneDrive. Documents ne prouve pas à lui seul qu’il est synchronisé.",
      "Fichier introuvable : regarde le dossier scolaire OneDrive ▸ Documents ▸ Informatique. Après deux minutes, note ce que tu as essayé et clique sur « J'attends de l'aide ». Le professeur fournit un fichier de démonstration à observer personnellement ; précise « démo »."
    ],
    "demos": {
      "1": ["onedrive", [0]],
      "2": ["onedrive", [1]],
      "3": ["onedrive", [2]],
      "4": ["onedrive", [3]],
      "5": ["onedrive", [4]],
      "7": ["onedrive", [5]],
      "8": ["onedrive", [6]]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Le nom du fichier, son chemin, son statut et une seule phrase de justification.",
      "confirmation": "J’ai réalisé les manipulations demandées et complété « 2 — Retrouver ses données » dans mon rapport.",
      "trace": "rapport:2 — Retrouver ses données",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
    },
    "extra": "<details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Sans ouvrir les fichiers, cherche dans le même dossier un autre statut. Explique ce qui pourrait différer sans réseau. S’il n’y en a pas, compare les cas fictifs « nuage » et « coche verte ». Ne clique ni sur Libérer de l’espace, ni sur Toujours conserver ; ne touche pas aux réglages OneDrive.</p></details>"
  },
  {
    "partie": "3 — Dépanner",
    "titre": "Quatre incidents à tester, un seul à rédiger",
    "min": 12,
    "veux": "Dépanner personnellement quatre incidents ; écrire un seul cas et vérifier les trois autres à deux, chacun à son tour.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Choisis l’incident que tu expliqueras dans le rapport.</label></li><li><label><input type=\"checkbox\">Ouvre les quatre cartes ci-dessous et effectue personnellement chaque essai.</label></li><li><label><input type=\"checkbox\">Avant chaque test, formule ton hypothèse et choisis ton test : dans le rapport pour l’incident choisi, à l’oral pour les trois autres.</label></li><li><label><input type=\"checkbox\">Pour l’incident choisi, complète ensuite l’observation et la solution justifiée dans le rapport : quatre lignes courtes suffisent.</label></li><li><label><input type=\"checkbox\">Pour les trois autres incidents, explique ta propre hypothèse et ton test au binôme, puis montre ton geste et justifie ta conclusion. Il t’observe sans toucher ta souris ; inversez ensuite les rôles. Aucun texte supplémentaire dans le rapport.</label></li><li><label><input type=\"checkbox\">Après ta première proposition personnelle, écoute le retour du binôme et refais toi-même le geste à corriger si nécessaire.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun : quel test départageait deux explications ? Ensuite, le professeur affiche la synthèse sur ton écran.</label></li></ol>",
    "vois": "J’ai manipulé personnellement les quatre incidents. Un seul est rédigé ; pour les autres, nous avons alterné acteur et observateur, avec un retour oral précis.",
    "coince": [
      "Pour le cas écrit : hypothèse et test avant d’agir ; observation et solution après. Pour les autres, prépare les mêmes éléments à l’oral.",
      "Ouvre les indices de chaque carte, puis demande au binôme de montrer le critère qui bloque. Si le désaccord ou le blocage persiste, clique sur « J'attends de l'aide » et poursuis un autre essai possible. Un avis du binôme ne remplace pas la note du professeur."
    ],
    "demos": {
      "incident 1.2": ["fenetres", [0]],
      "incident 1.4": ["fenetres", [1, 2]],
      "incident 2.4": ["fenetres", [3]],
      "incident 4.2": ["moniteur", [0]],
      "incident 4.3": ["moniteur", [1]],
      "incident 4.5": ["moniteur", [2]]
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
        "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
      }
    },
    "extra": "<details id=\"verification-pairs\"><summary>À deux — vérifier un geste sans le faire à la place</summary><ol class=\"etapes\"><li>Acteur : formule ta première hypothèse et choisis un test avant de demander de l’aide.</li><li>Observateur : écoute cette proposition, puis vérifie « test sans risque », « manipulation personnelle » et « conclusion appuyée sur un indice ».</li><li>Donne un retour oral précis : « Je vois… » pour un point réussi ; « Tu pourrais… » pour une correction.</li><li>L’acteur corrige lui-même ou refait le test. L’observateur ne touche ni sa souris ni son clavier.</li><li>Inversez les rôles : chacun manipule sur son propre poste. Si vous hésitez encore après les indices, cliquez sur « J'attends de l'aide » et poursuivez ce qui reste possible.</li></ol><p>Cette vérification aide à progresser ; elle ne donne pas de note et n’est pas collectée par le site.</p></details><div class=\"incidents\"><details class=\"incident\"><summary>Incident 1 : la fenêtre a disparu</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre la Calculatrice par ⊞ Démarrer ▸ Calculatrice.</label></li><li><label><input type=\"checkbox\">Clique sur — Réduire, en haut à droite de la fenêtre.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test pour retrouver la fenêtre.</label></li><li><label><input type=\"checkbox\">Explique ce qui prouve qu’elle était fermée ou seulement masquée.</label></li></ol><details><summary>Indice 1</summary><p>Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?</p></details><details><summary>Indice 2</summary><p>Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice.</p></details></details><details class=\"incident\"><summary>Incident 2 : je tape dans la mauvaise fenêtre</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre Bloc-notes par ⊞ Démarrer ▸ Bloc-notes.</label></li><li><label><input type=\"checkbox\">Ouvre une seconde fenêtre par Fichier ▸ Nouvelle fenêtre (ou Ctrl + Maj + N, si disponible).</label></li><li><label><input type=\"checkbox\">Place les deux fenêtres côte à côte en les déplaçant par leur barre de titre.</label></li><li><label><input type=\"checkbox\">Clique dans la seconde fenêtre : comment écrire dans la première ?</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test avec le seul mot « test » dans ces fenêtres d’essai.</label></li><li><label><input type=\"checkbox\">Explique quel indice montre où le texte est arrivé.</label></li></ol><details><summary>Indice 1</summary><p>Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.</p></details><details><summary>Indice 2</summary><p>Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît. Si Nouvelle fenêtre manque, utilise l’Explorateur comme autre fenêtre et reviens au Bloc-notes.</p></details></details><details class=\"incident\"><summary>Incident 3 : le fichier serait-il « dans » l’application ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Repère le fichier choisi dans la mission 2, dans le dossier OneDrive scolaire de l’Explorateur, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Formule ton hypothèse : fermer l’application fera-t-il disparaître le fichier ?</label></li><li><label><input type=\"checkbox\">Choisis le test qui te permettra de vérifier, avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Ferme seulement une fenêtre Bloc-notes d’essai par × ; si elle contient le seul mot « test », choisis Ne pas enregistrer.</label></li><li><label><input type=\"checkbox\">Retrouve ton fichier dans son dossier, sans le déplacer.</label></li><li><label><input type=\"checkbox\">Explique la différence entre le fichier et l’application.</label></li></ol><details><summary>Indice 1</summary><p>L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.</p></details><details><summary>Indice 2</summary><p>Le bouton × ferme une fenêtre. Reviens au dossier OneDrive choisi dans la mission 2 et vérifie si ton fichier est toujours là. Si c’est une démonstration, indique-le.</p></details></details><details class=\"incident\"><summary>Incident 4 : écran noir, PC arrêté ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Repère le bouton ⏻ du moniteur externe montré au groupe par le professeur, distinct de celui du PC. Si aucun bouton n’a été identifié, utilise le cas simulé.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de toucher au bouton.</label></li><li><label><input type=\"checkbox\">Sur un écran externe dont le bouton a été identifié pour le groupe, éteins seulement cet écran avec ce bouton.</label></li><li><label><input type=\"checkbox\">Rallume seulement l’écran avec le même bouton.</label></li><li><label><input type=\"checkbox\">Explique ce que le retour de la session et des fenêtres permet de conclure.</label></li><li><label><input type=\"checkbox\">Sur portable ou tout-en-un, utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et précise que le cas est simulé.</label></li></ol><details><summary>Indice 1</summary><p>Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.</p></details><details><summary>Indice 2</summary><p>Le seul test autorisé ici est le bouton de l’écran externe identifié par le professeur. Sur portable ou tout-en-un, ne touche pas à ⏻ : utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et explique le test que tu choisirais.</p></details></details></div><details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Invente un incident sans risque combinant deux fenêtres d’essai. Écris deux hypothèses et un test qui les départage. Fais-le lire au professeur avant toute mise en scène. Aucune manipulation sur le travail d’un voisin.</p></details>"
  },
  {
    "partie": "Final — Situation individuelle nouvelle",
    "titre": "Le dossier de secours",
    "min": 8,
    "veux": "Résoudre seul une situation nouvelle : après un changement de poste, peut-on lire le document sans réseau ?",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Lis la situation : tu prépares une présentation sur un autre PC de l’école. L’Explorateur y montre le nom du document avec un nuage bleu. Une autre fenêtre recouvre l’Explorateur. Un camarade dit : « Le fichier est là, il marchera sans réseau ; ferme Windows pour le retrouver. »</label></li><li><label><input type=\"checkbox\">Écris ton hypothèse personnelle sur la disponibilité du contenu.</label></li><li><label><input type=\"checkbox\">Choisis un test sans risque pour retrouver la fenêtre et vérifier l’indice de disponibilité.</label></li><li><label><input type=\"checkbox\">Enregistre avant de tester. Ne coupe pas le réseau.</label></li></ol>",
    "vois": "Mon hypothèse et mon test sont conservés avant l’observation.",
    "coince": [
      "Le scénario combine deux problèmes : retrouver une fenêtre et juger la disponibilité d’un contenu. Propose un test qui ne change pas l’état du fichier.",
      "Tu peux revenir à l’Explorateur par son icône 📁 dans la barre des tâches ou Alt + Tab, puis lire le chemin et le statut sans ouvrir le fichier. Il n’est pas nécessaire d’arrêter Windows."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Situation finale, seul : hypothèse puis test choisi.",
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
      "juste": "Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note."
    },
    "extra": "<p class=\"encart\">Proposition de travail quotidien /10 : enquête /7 (hypothèse 1, test 2, preuve 1, conclusion 2, distinction 1) · document et remise /3 (identification et nom 1, styles et tableau 1, capture légendée et remise vérifiée 1). Les aides restent accessibles ; leur utilisation n’est pas une pénalité de vitesse.</p>"
  },
  {
    "partie": "Final — Situation individuelle nouvelle",
    "titre": "Montrer ma preuve et justifier ma décision",
    "min": 10,
    "veux": "Résoudre seul la nouvelle situation et justifier une décision en peu de mots.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Réalise le test de fenêtre sur ton poste, avec l’Explorateur recouvert par une fenêtre d’essai.</label></li><li><label><input type=\"checkbox\">Lis le chemin et le statut du fichier choisi, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Dans le rapport, note en une ligne l’indice observé ; distingue ton poste réel du nuage donné dans le scénario.</label></li><li><label><input type=\"checkbox\">Dans le rapport, réponds au camarade en deux phrases maximum : ta décision et ce qui la justifie.</label></li><li><label><input type=\"checkbox\">Prépare ton geste et ton indice pour le contrôle individuel du professeur en circulation ; explique-lui machine, Windows, application et fichier. Tu peux relire et vérifier ta mise en page pendant l’attente.</label></li><li><label><input type=\"checkbox\">Participe à la synthèse finale. La remise du rapport est l’étape suivante.</label></li></ol>",
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
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
    },
    "extra": "<details class=\"encart\"><summary>Prolongement après passage du professeur</summary><p>Dans le même scénario, remplace le nuage par une coche verte : quelle partie de ton raisonnement change ? Quelle conclusion sur une panne matérielle resterait impossible avec ces seuls indices ?</p></details>"
  },
  {
    "partie": "Remise — Mon rapport",
    "titre": "Remettre mon rapport dans Classroom",
    "min": 5,
    "veux": "Remettre une seule fois mon rapport terminé, puis vérifier qu’il est bien arrivé.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Relis ton rapport : remplace chaque « [à compléter] » et efface les indications entre crochets.</label></li><li><label><input type=\"checkbox\"><span>Vérifie l’identification : titre visible, prénom, nom, classe, date ; fichier nommé <b>07_CoulissesPC_Prenom_Nom</b>.</span></label></li><li><label><input type=\"checkbox\">Vérifie les titres et le tableau : même style pour les quatre titres de partie ; vrai tableau de trois colonnes et quatre lignes, avec % dans les en-têtes.</label></li><li><label><input type=\"checkbox\">Vérifie la capture : ciblée, lisible, pas étirée, avec sa légende juste dessous.</label></li><li><label><input type=\"checkbox\"><span>Ouvre <a href=\"https://classroom.google.com/\" target=\"_blank\" rel=\"noopener\">Classroom</a> avec ton compte scolaire ▸ Informatique — 3F ▸ Travaux et devoirs ▸ Labo 07 — Dans les coulisses du PC ▸ Afficher les instructions.</span></label></li><li><label><input type=\"checkbox\">Dans « Votre travail », clique sur Ajouter ou créer ▸ Google Drive.</label></li><li><label><input type=\"checkbox\"><span>Sélectionne <b>07_CoulissesPC_Prenom_Nom</b> ▸ Ajouter.</span></label></li><li><label><input type=\"checkbox\">Clique sur la pièce jointe pour vérifier que c’est ton rapport complet.</label></li><li><label><input type=\"checkbox\">Clique sur Remettre ▸ confirme Remettre.</label></li><li><label><input type=\"checkbox\">Vérifie que le devoir affiche « Remis ».</label></li></ol>",
    "vois": "Dans Classroom, le devoir affiche « Remis » et la pièce jointe est mon rapport complet.",
    "coince": [
      "Le devoir n’apparaît pas ? Le professeur ne l’a peut-être pas encore publié. Ne crée pas de deuxième document, ne poste rien dans le flux : sonne la cloche 🔔 et attends.",
      "Ton rapport n’est pas dans la liste Google Drive ? Tape 07_CoulissesPC dans la barre de recherche de la fenêtre. Mauvais fichier joint ? Clique sur la croix ✕ à droite de la pièce jointe, puis recommence Ajouter ou créer ▸ Google Drive."
    ],
    "demos": {
      "1": ["remise", [0]],
      "5": ["remise", [1]],
      "6": ["remise", [2]],
      "7": ["remise", [3]],
      "9": ["remise", [4, 5]],
      "10": ["remise", [6]]
    },
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Seul Classroom confirme la remise : ce site ne la voit pas.",
      "confirmation": "J’ai remis mon rapport dans Classroom et j’y vois « Remis ».",
      "trace": "rapport:5 — Remettre mon rapport",
      "juste": "Cette case est un aide-mémoire. Le professeur vérifie la remise dans Classroom."
    },
    "extra": "<p class=\"note\">Ces trois vérifications valent 3 points sur 10 : identification et nom /1, titres et tableau /1, capture et remise /1.</p>"
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

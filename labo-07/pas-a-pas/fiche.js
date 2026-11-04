/* Trois missions et un défi final. Sept étapes internes réutilisent le suivi existant.
 * Trois hypothèses sur le site ; tableau/capture et écrits courts dans le rapport ; entraide guidée et contrôle individuel final par le professeur. */
const COURS = 'labo-07';
const VERSION_PARCOURS = 'missions-2';
const PRESENTATION = 'missions';   // blocs.js : cloche en haut à droite, bulle, bravo, sans « Je veux / Je fais / Je vois »
const HORS_SUIVI = 'Essai local : aucune réponse envoyée. En classe, ouvre Mes cours avec ton compte scolaire.';
let EMAIL = '';
const VIES_V = [{}]; let LV = {};
const tirage = () => 1;
const PARCOURS = [
 {titre:'Mission 1 — Observer ce qui tourne', court:'Mission 1', debut:0, fin:2, bulle:'Première mission : que fait le PC quand une application s’ouvre ?'},
 {titre:'Mission 2 — Retrouver ses données', court:'Mission 2', debut:2, fin:4, bulle:'Bien joué ! Maintenant, où vit ton fichier ?'},
 {titre:'Mission 3 — Dépanner', court:'Mission 3', debut:4, fin:5, bulle:'Quatre petites pannes à élucider, à deux.'},
 {titre:'Défi final individuel', court:'Défi', debut:5, fin:7, bulle:'Dernier défi, seul : montre ta méthode d’enquêteur.'}
];
const BLOCS = [
  {
    "partie": "1 — Observer ce qui tourne",
    "titre": "Défi : une application ouverte, qu’est-ce qui change ?",
    "min": 8,
    "veux": "Prévoir ce que le PC fera si j’ouvre la Calculatrice. Une fenêtre invisible veut-elle dire qu’aucun logiciel ne tourne ?",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre « Mon rapport et ma remise », en haut de la fiche.</label></li><li><label><input type=\"checkbox\">Crée ton document personnel et prépare sa partie 1 avant les mesures.</label></li><li><label><input type=\"checkbox\">Lis le défi.</label></li><li><label><input type=\"checkbox\">Choisis ce que tu observeras : processeur et mémoire du PC.</label></li><li><label><input type=\"checkbox\">Écris ton hypothèse ci-dessous avant d’ouvrir la Calculatrice.</label></li></ol>",
    "vois": "Mon hypothèse annonce un changement possible et ce qui me permettrait de le constater.",
    "coince": [
      "Une hypothèse est une idée à tester, pas une définition. Un résultat stable peut aussi être intéressant.",
      "Commence par « Si j’ouvre la Calculatrice, je pense que… ». Indique ce que tu comparerais avant et après."
    ],
    "indices": true,
    "q": {
      "type": "enquete",
      "q": "Avant toute manipulation : quelle est ta prévision ?",
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
    "titre": "Observer, comparer et conclure",
    "min": 20,
    "veux": "Comparer des mesures sans chercher à provoquer une grosse variation.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Fais un clic droit sur l’icône ⊞ Démarrer ▸ Gestionnaire des tâches (ou Ctrl + Maj + Échap).</label></li><li><label><input type=\"checkbox\">Si nécessaire, clique sur Plus de détails.</label></li><li><label><input type=\"checkbox\">Clique sur Processus : repère deux applications dont tu reconnais le nom.</label></li><li><label><input type=\"checkbox\">Lis le total Processeur en % en haut de la colonne.</label></li><li><label><input type=\"checkbox\">Lis le total Mémoire en % en haut de la colonne.</label></li><li><label><input type=\"checkbox\">Dans ton rapport, partie 1, saisis ces valeurs dans la ligne Avant du tableau.</label></li><li><label><input type=\"checkbox\">Clique sur ⊞ Démarrer ▸ tape Calculatrice ▸ clique sur l’application Calculatrice.</label></li><li><label><input type=\"checkbox\">Reviens au Gestionnaire par son icône dans la barre des tâches (ou Alt + Tab).</label></li><li><label><input type=\"checkbox\">Attends environ 10 secondes.</label></li><li><label><input type=\"checkbox\">Dans le tableau du rapport, complète la ligne Après 10 s avec les deux mêmes totaux.</label></li><li><label><input type=\"checkbox\">Attends encore environ 10 secondes.</label></li><li><label><input type=\"checkbox\">Dans le tableau du rapport, complète la ligne Après 20 s avec les deux mêmes totaux.</label></li><li><label><input type=\"checkbox\">Après le dernier relevé, prends une capture ciblée : ⊞ Démarrer ▸ Outil Capture d’écran ▸ Nouveau (ou Windows + Maj + S).</label></li><li><label><input type=\"checkbox\">Sélectionne seulement les noms utiles et les colonnes Processeur / Mémoire, sans autre travail visible.</label></li><li><label><input type=\"checkbox\">Reviens dans le rapport et colle la capture avec Édition ▸ Coller (Ctrl + V).</label></li><li><label><input type=\"checkbox\">Redimensionne par un coin pour garder les proportions et rester dans la page.</label></li><li><label><input type=\"checkbox\">Sous l’image, écris une légende qui explique ce qu’elle montre et sa limite.</label></li><li><label><input type=\"checkbox\">Dans le rapport, écris une conclusion de deux phrases : ce qui change dans tes relevés, puis une autre cause possible ou une limite.</label></li><li><label><input type=\"checkbox\">Après ta réponse personnelle, compare les observations avec un voisin.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun et ouvre la synthèse ci-dessous.</label></li></ol>",
    "vois": "Mon rapport contient deux noms d’applications, les trois relevés et une capture légendée ; la variation peut être faible.",
    "coince": [
      "Compare la même grandeur : le total CPU avec le total CPU, pas le total avec une ligne d’application. La mémoire en % n’est pas celle d’un seul logiciel en Mo.",
      "Les totaux se lisent dans les en-têtes Processeur et Mémoire de Processus. Si l’accès est bloqué, note « accès refusé » et clique sur « J'attends de l'aide » : ne contourne pas la restriction."
    ],
    "indices": true,
    "q": {
      "type": "mixte",
      "q": "Après tes observations : choisis une conclusion défendable, puis confirme ce que tu as fait dans le rapport.",
      "activite": {
        "type": "qcm",
        "q": "Cas fictif : le processeur passe de 4 % à 8 % après l’ouverture de la Calculatrice. Que peut-on affirmer ?",
        "c": [
          "Le total a augmenté ; cette comparaison seule ne prouve pas une cause unique.",
          "Toute la hausse vient forcément de la Calculatrice.",
          "Le PC est en panne parce que le pourcentage augmente.",
          "La hausse du processeur prouve que le disque est plein."
        ],
        "p": [
          null,
          "Deux événements qui se suivent ne suffisent pas à isoler une cause. Quelles autres tâches peuvent travailler ?",
          "Un processeur peut travailler davantage sans panne. Observe avant de diagnostiquer.",
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
    "extra": "<details class=\"encart\"><summary>Synthèse — à ouvrir après la mise en commun</summary><p>Windows est un logiciel système ; le PC est une machine. Plusieurs logiciels peuvent fonctionner en même temps. Le processeur effectue du travail ; la mémoire de travail garde des données utiles aux logiciels en cours. Des valeurs instantanées fluctuent : une comparaison courte donne un indice, pas une cause unique. Mémoire de travail et place des fichiers sur le disque sont différentes.</p></details><details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Sans rien fermer ni ouvrir, observe les mêmes totaux pendant 30 secondes. Varient-ils quand même ? Propose une manière de rendre la comparaison plus fiable. L’observation des ressources est un prolongement, sans nouvelle compétence de 3e attribuée.</p></details>"
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
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Clique sur l’icône 📁 Explorateur dans la barre des tâches (ou Windows + E).</label></li><li><label><input type=\"checkbox\">Dans le volet gauche, clique sur le nuage OneDrive scolaire, nommé avec ton compte ou le nom de l’école.</label></li><li><label><input type=\"checkbox\">Ouvre le dossier où tu avais enregistré ton fichier, par exemple Documents ▸ Informatique.</label></li><li><label><input type=\"checkbox\">Sélectionne une fois le fichier choisi, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Clique dans la barre d’adresse pour lire le chemin complet (ou Ctrl + L).</label></li><li><label><input type=\"checkbox\">Dans ton rapport, partie 2, relève le chemin OneDrive et le nom du fichier ; tu peux remplacer ton nom personnel par [moi].</label></li><li><label><input type=\"checkbox\">Si nécessaire, clique sur Afficher ▸ Détails.</label></li><li><label><input type=\"checkbox\">Lis la colonne Statut ; si elle manque, clic droit sur un en-tête de colonne ▸ Statut, si proposé.</label></li><li><label><input type=\"checkbox\">Dans le rapport, relève le symbole ou le message exact ; si rien n’apparaît, écris « statut non affiché ».</label></li><li><label><input type=\"checkbox\">Dans le rapport, écris une seule phrase : serait-il disponible sans réseau, et quel indice le justifie ? Si tu ne peux pas conclure, dis ce qui manque.</label></li><li><label><input type=\"checkbox\">Après ta réponse personnelle, compare les statuts avec un voisin.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun et ouvre la synthèse ci-dessous.</label></li></ol>",
    "vois": "Mon relevé décrit ce poste : chemin, nom et statut. Une absence de statut reste une observation.",
    "coince": [
      "Le chemin permet de vérifier si le dossier se trouve dans OneDrive. Documents ne prouve pas à lui seul qu’il est synchronisé.",
      "Fichier introuvable : regarde le dossier scolaire OneDrive ▸ Documents ▸ Informatique. Après deux minutes, note ce que tu as essayé et clique sur « J'attends de l'aide ». Le professeur fournit un fichier de démonstration à observer personnellement ; précise « démo »."
    ],
    "indices": true,
    "q": {
      "type": "rapport",
      "q": "Le nom du fichier, son chemin, son statut et une seule phrase de justification.",
      "confirmation": "J’ai réalisé les manipulations demandées et complété « 2 — Retrouver ses données » dans mon rapport.",
      "trace": "rapport:2 — Retrouver ses données",
      "juste": "Le professeur examine les preuves et les gestes. Cette déclaration ne constitue ni une correction ni une remise."
    },
    "extra": "<details class=\"encart\"><summary>Synthèse — après la mise en commun</summary><p>Un fichier local est présent sur ce PC ; cela ne prouve pas qu’une copie existe ailleurs. Un fichier synchronisé appartient à un espace OneDrive dont les changements sont répercutés en ligne lorsque la synchronisation fonctionne. Il peut avoir une copie locale ou être disponible seulement en ligne.</p><p>Nuage bleu : en ligne seulement, réseau nécessaire pour télécharger le contenu. Cercle blanc à bord vert avec coche : disponible localement. Disque vert plein avec coche blanche : toujours conserver sur cet appareil. Deux flèches : synchronisation en cours ; croix rouge : problème. Ces deux derniers états ne prouvent pas que la copie en ligne est à jour. Sans indication exploitable, on ne tranche pas.</p></details><details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Sans ouvrir les fichiers, cherche dans le même dossier un autre statut. Explique ce qui pourrait différer sans réseau. S’il n’y en a pas, compare les cas fictifs « nuage » et « coche verte ». Ne clique ni sur Libérer de l’espace, ni sur Toujours conserver ; ne touche pas aux réglages OneDrive.</p></details>"
  },
  {
    "partie": "3 — Dépanner",
    "titre": "Quatre incidents à tester, un seul à rédiger",
    "min": 12,
    "veux": "Dépanner personnellement quatre incidents ; écrire un seul cas et vérifier les trois autres à deux, chacun à son tour.",
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Choisis l’incident que tu expliqueras dans le rapport.</label></li><li><label><input type=\"checkbox\">Ouvre les quatre cartes ci-dessous et effectue personnellement chaque essai.</label></li><li><label><input type=\"checkbox\">Avant chaque test, formule ton hypothèse et choisis ton test : dans le rapport pour l’incident choisi, à l’oral pour les trois autres.</label></li><li><label><input type=\"checkbox\">Pour l’incident choisi, complète ensuite l’observation et la solution justifiée dans le rapport : quatre lignes courtes suffisent.</label></li><li><label><input type=\"checkbox\">Pour les trois autres incidents, explique ta propre hypothèse et ton test au binôme, puis montre ton geste et justifie ta conclusion. Il t’observe sans toucher ta souris ; inversez ensuite les rôles. Aucun texte supplémentaire dans le rapport.</label></li><li><label><input type=\"checkbox\">Après ta première proposition personnelle, écoute le retour du binôme et refais toi-même le geste à corriger si nécessaire.</label></li><li><label><input type=\"checkbox\">Participe à la mise en commun : quel test départageait deux explications ?</label></li></ol>",
    "vois": "J’ai manipulé personnellement les quatre incidents. Un seul est rédigé ; pour les autres, nous avons alterné acteur et observateur, avec un retour oral précis.",
    "coince": [
      "Pour le cas écrit : hypothèse et test avant d’agir ; observation et solution après. Pour les autres, prépare les mêmes éléments à l’oral.",
      "Ouvre les indices de chaque carte, puis demande au binôme de montrer le critère qui bloque. Si le désaccord ou le blocage persiste, clique sur « J'attends de l'aide » et poursuis un autre essai possible. Un avis du binôme ne remplace pas la note du professeur."
    ],
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
    "extra": "<details id=\"verification-pairs\"><summary>À deux — vérifier un geste sans le faire à la place</summary><ol class=\"etapes\"><li>Acteur : formule ta première hypothèse et choisis un test avant de demander de l’aide.</li><li>Observateur : écoute cette proposition, puis vérifie « test sans risque », « manipulation personnelle » et « conclusion appuyée sur un indice ».</li><li>Donne un retour oral précis : « Je vois… » pour un point réussi ; « Tu pourrais… » pour une correction.</li><li>L’acteur corrige lui-même ou refait le test. L’observateur ne touche ni sa souris ni son clavier.</li><li>Inversez les rôles : chacun manipule sur son propre poste. Si vous hésitez encore après les indices, cliquez sur « J'attends de l'aide » et poursuivez ce qui reste possible.</li></ol><p>Cette vérification aide à progresser ; elle ne donne pas de note et n’est pas collectée par le site.</p></details><div class=\"incidents\"><details class=\"incident\"><summary>Incident 1 : la fenêtre a disparu</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre la Calculatrice par ⊞ Démarrer ▸ Calculatrice.</label></li><li><label><input type=\"checkbox\">Clique sur — Réduire, en haut à droite de la fenêtre.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test pour retrouver la fenêtre.</label></li><li><label><input type=\"checkbox\">Explique ce qui prouve qu’elle était fermée ou seulement masquée.</label></li></ol><details><summary>Indice 1</summary><p>Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?</p></details><details><summary>Indice 2</summary><p>Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice.</p></details></details><details class=\"incident\"><summary>Incident 2 : je tape dans la mauvaise fenêtre</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Ouvre Bloc-notes par ⊞ Démarrer ▸ Bloc-notes.</label></li><li><label><input type=\"checkbox\">Ouvre une seconde fenêtre par Fichier ▸ Nouvelle fenêtre (ou Ctrl + Maj + N, si disponible).</label></li><li><label><input type=\"checkbox\">Place les deux fenêtres côte à côte en les déplaçant par leur barre de titre.</label></li><li><label><input type=\"checkbox\">Clique dans la seconde fenêtre : comment écrire dans la première ?</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Effectue ton test avec le seul mot « test » dans ces fenêtres d’essai.</label></li><li><label><input type=\"checkbox\">Explique quel indice montre où le texte est arrivé.</label></li></ol><details><summary>Indice 1</summary><p>Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.</p></details><details><summary>Indice 2</summary><p>Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît. Si Nouvelle fenêtre manque, utilise l’Explorateur comme autre fenêtre et reviens au Bloc-notes.</p></details></details><details class=\"incident\"><summary>Incident 3 : le fichier serait-il « dans » l’application ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Repère le fichier choisi dans la mission 2, dans le dossier OneDrive scolaire de l’Explorateur, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Formule ton hypothèse : fermer l’application fera-t-il disparaître le fichier ?</label></li><li><label><input type=\"checkbox\">Choisis le test qui te permettra de vérifier, avant de le réaliser.</label></li><li><label><input type=\"checkbox\">Ferme seulement une fenêtre Bloc-notes d’essai par × ; si elle contient le seul mot « test », choisis Ne pas enregistrer.</label></li><li><label><input type=\"checkbox\">Retrouve ton fichier dans son dossier, sans le déplacer.</label></li><li><label><input type=\"checkbox\">Explique la différence entre le fichier et l’application.</label></li></ol><details><summary>Indice 1</summary><p>L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.</p></details><details><summary>Indice 2</summary><p>Le bouton × ferme une fenêtre. Reviens au dossier OneDrive choisi dans la mission 2 et vérifie si ton fichier est toujours là. Si c’est une démonstration, indique-le.</p></details></details><details class=\"incident\"><summary>Incident 4 : écran noir, PC arrêté ?</summary><ol class=\"etapes\"><li><label><input type=\"checkbox\">Repère le bouton ⏻ du moniteur externe montré au groupe par le professeur, distinct de celui du PC. Si aucun bouton n’a été identifié, utilise le cas simulé.</label></li><li><label><input type=\"checkbox\">Formule une hypothèse et choisis ton test avant de toucher au bouton.</label></li><li><label><input type=\"checkbox\">Sur un écran externe dont le bouton a été identifié pour le groupe, éteins seulement cet écran avec ce bouton.</label></li><li><label><input type=\"checkbox\">Rallume seulement l’écran avec le même bouton.</label></li><li><label><input type=\"checkbox\">Explique ce que le retour de la session et des fenêtres permet de conclure.</label></li><li><label><input type=\"checkbox\">Sur portable ou tout-en-un, utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et précise que le cas est simulé.</label></li></ol><details><summary>Indice 1</summary><p>Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.</p></details><details><summary>Indice 2</summary><p>Le seul test autorisé ici est le bouton de l’écran externe identifié par le professeur. Sur portable ou tout-en-un, ne touche pas à ⏻ : utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et explique le test que tu choisirais.</p></details></details></div><details class=\"encart\"><summary>Synthèse — après discussion</summary><p>La méthode : partir du symptôme, proposer une hypothèse, choisir un test simple et réversible, observer, puis justifier — ou changer d’hypothèse. Une fenêtre peut être masquée, une autre active. Fermer une application ne supprime pas un fichier enregistré. Éteindre l’écran n’arrête pas nécessairement le PC. Windows reste le système qui permet d’utiliser la machine et ses applications.</p></details><details class=\"encart\"><summary>Prolongement — si j’ai terminé</summary><p>Invente un incident sans risque combinant deux fenêtres d’essai. Écris deux hypothèses et un test qui les départage. Fais-le lire au professeur avant toute mise en scène. Aucune manipulation sur le travail d’un voisin.</p></details>"
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
    "fais": "<ol class=\"etapes\"><li><label><input type=\"checkbox\">Réalise le test de fenêtre sur ton poste, avec l’Explorateur recouvert par une fenêtre d’essai.</label></li><li><label><input type=\"checkbox\">Lis le chemin et le statut du fichier choisi, sans l’ouvrir.</label></li><li><label><input type=\"checkbox\">Dans le rapport, note en une ligne l’indice observé ; distingue ton poste réel du nuage donné dans le scénario.</label></li><li><label><input type=\"checkbox\">Dans le rapport, réponds au camarade en deux phrases maximum : ta décision et ce qui la justifie.</label></li><li><label><input type=\"checkbox\">Prépare ton geste et ton indice pour le contrôle individuel du professeur en circulation ; explique-lui machine, Windows, application et fichier. Tu peux relire et vérifier ta mise en page pendant l’attente.</label></li><li><label><input type=\"checkbox\">Participe à la synthèse finale, puis utilise « Mon rapport et ma remise » pour vérifier le document et le joindre dans Classroom.</label></li></ol>",
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
  }
];
const FIN = {
 titre:'Mon enquête est terminée',
 bulle:'Enquête bouclée : bravo, détective !',
 revision:{titre:'Je retiens — préparer le bilan',texte:'Trois situations à résoudre sans aide, puis une synthèse pour te corriger. Rien à ajouter au rapport.',url:'https://root75.github.io/campin-public/labo-07/je-retiens.html'},
 citation:{texte:'Car ce n’est pas assez d’avoir l’esprit bon, mais le principal est de l’appliquer bien.',auteur:'René Descartes',source:'Discours de la méthode, première partie (1637)',lien:'Mon hypothèse m’a donné une piste ; c’est mon test et ma preuve qui m’ont permis de la discuter.'},
 texte:'Le rapport contient les preuves utiles. Les incidents non rédigés sont vérifiés à deux ; le défi final reste à expliquer individuellement au professeur. Les déclarations du site ne valident ni les gestes ni la remise du document.',
 plus:'Reprends une de tes hypothèses et explique à l’oral ce qui te ferait changer d’avis.',
 lien:'le « Je retiens » et les synthèses de cette enquête'
};

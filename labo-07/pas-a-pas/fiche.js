/* Contenu Labo 07 ; moteur commun pas-a-pas/blocs.js, issu des blocs Python.
 * Réponses courtes via noter(), sans auto-correction des raisonnements ni dépôt de captures. */
const COURS = 'labo-07';
const HORS_SUIVI = 'Essai local : aucune réponse envoyée. En classe, ouvre Mes cours avec ton compte scolaire.';
let EMAIL = '';
// Interface minimale des variantes attendue par le moteur ; aucune variante pour cette enquête.
const VIES_V = [{}]; let LV = {};
const tirage = () => 1;
const etapes = a => '<ol class="etapes">'+a.map(t=>'<li><label><input type="checkbox">'+t+'</label></li>').join('')+'</ol>';
const champ = (cle,nom,max) => ({cle,nom,max});
const question = (q,champs) => ({type:'enquete',q,champs,juste:'Cette réponse marque une étape faite. Elle ne constitue pas une correction ni une note.'});
const bloc = (partie,titre,min,veux,actions,vois,indices,q,extra='') => ({partie,titre,min,veux,fais:etapes(actions),vois,coince:indices,indices:true,q,extra});
const regles = '<p class="stop">Chacun manipule son propre PC. Première réponse seul ; comparaison à deux ensuite. Aucune fin de tâche, aucune suppression, aucun réglage.</p>';
const BLOCS = [
bloc('1 — Observer ce qui tourne','Défi : une application ouverte, qu’est-ce qui change ?',8,
  'Prévoir ce que le PC fera si j’ouvre la Calculatrice. Une fenêtre invisible veut-elle dire qu’aucun logiciel ne tourne ?',[
  'Lis le défi.',
  'Choisis ce que tu observeras : processeur et mémoire du PC.',
  'Écris ton hypothèse ci-dessous avant d’ouvrir la Calculatrice.'
  ],'Mon hypothèse annonce un changement possible et ce qui me permettrait de le constater.',[
  'Une hypothèse est une idée à tester, pas une définition. Un résultat stable peut aussi être intéressant.',
  'Commence par « Si j’ouvre la Calculatrice, je pense que… ». Indique ce que tu comparerais avant et après.'
  ],question('Avant toute manipulation : quelle est ta prévision ?',[
  champ('H','Mon hypothèse sur le processeur et la mémoire',125)
  ]),regles+'<p>Durées indicatives : une mission peut continuer au prochain cours. Le retour sur le Labo 06 se fait avec le professeur avant de commencer.</p>'),
bloc('1 — Observer ce qui tourne','Je relève un avant et un après',20,
  'Comparer des mesures sans chercher à provoquer une grosse variation.',[
  'Fais un clic droit sur l’icône ⊞ Démarrer ▸ Gestionnaire des tâches (ou Ctrl + Maj + Échap).',
  'Si nécessaire, clique sur Plus de détails.',
  'Clique sur Processus : repère deux applications dont tu reconnais le nom.',
  'Lis le total Processeur en % en haut de la colonne.',
  'Lis le total Mémoire en % en haut de la colonne.',
  'Note ces deux valeurs dans le champ « Avant » ci-dessous.',
  'Clique sur ⊞ Démarrer ▸ tape Calculatrice ▸ clique sur l’application Calculatrice.',
  'Reviens au Gestionnaire par son icône dans la barre des tâches (ou Alt + Tab).',
  'Attends environ 10 secondes.',
  'Relève les deux mêmes totaux dans « Après 10 s ».',
  'Attends encore environ 10 secondes.',
  'Relève une seconde fois les deux totaux dans « Après 20 s ».'
  ],'J’ai deux noms d’applications et trois couples de valeurs, même si la variation est faible.',[
  'Compare la même grandeur : le total CPU avec le total CPU, pas le total avec une ligne d’application. La mémoire en % n’est pas celle d’un seul logiciel en Mo.',
  'Les totaux se lisent dans les en-têtes Processeur et Mémoire de Processus. Si l’accès est bloqué, note « accès refusé » et pose ton chevalet : ne contourne pas la restriction.'
  ],question('Relève tes observations. CPU = processeur ; M = mémoire. Aucun chiffre attendu à l’avance.',[
  champ('Apps','Deux applications identifiées',40),champ('Av','Avant : CPU … % ; M … %',35),
  champ('10s','Après 10 s : CPU … % ; M … %',35),champ('20s','Après 20 s : CPU … % ; M … %',35)
  ])),
bloc('1 — Observer ce qui tourne','Ce que mes mesures prouvent… et leurs limites',15,
  'Expliquer ma comparaison sans attribuer toute variation à la Calculatrice.',[
  'Compare les trois relevés.',
  'Écris ta conclusion personnelle ci-dessous.',
  'Enregistre ta réponse.',
  'Compare ensuite avec un voisin : chacun explique une différence constatée.',
  'Participe à la mise en commun : propose une autre cause possible de variation.',
  'Lis la synthèse après la discussion.'
  ],'Je distingue ce que j’ai observé de ce que je suppose.',[
  'Une hausse juste après l’ouverture ne suffit pas à prouver que cette application explique toute la hausse.',
  'D’autres tâches de Windows, une synchronisation ou le navigateur peuvent aussi travailler. « Je ne vois pas de différence nette » est une conclusion possible si tu cites tes mesures.'
  ],question('En deux phrases brèves : que conclus-tu et quelle limite gardes-tu ?',[
  champ('C','Conclusion appuyée sur tes valeurs',95),champ('L','Une autre cause possible ou une limite',85)
  ]),'<details class="encart"><summary>Synthèse — à ouvrir après la mise en commun</summary><p>Windows est un logiciel système ; le PC est une machine. Plusieurs logiciels peuvent fonctionner en même temps. Le processeur effectue du travail ; la mémoire de travail garde des données utiles aux logiciels en cours. Des valeurs instantanées fluctuent : une comparaison courte donne un indice, pas une cause unique. Mémoire de travail et place des fichiers sur le disque sont différentes.</p></details><details class="encart"><summary>Prolongement — si j’ai terminé</summary><p>Sans rien fermer ni ouvrir, observe les mêmes totaux pendant 30 secondes. Varient-ils quand même ? Propose une manière de rendre la comparaison plus fiable. L’observation des ressources est un prolongement, sans nouvelle compétence de 3e attribuée.</p></details>'),
bloc('2 — Retrouver ses données','Défi : mon fichier est-il vraiment sur ce PC ?',10,
  'Retrouver un fichier du Labo 06 et prévoir sa disponibilité sans changer son état.',[
  'Écris où tu penses retrouver ton fichier du Labo 06 et s’il serait lisible sans réseau.',
  'Enregistre cette première réponse avant de chercher.'
  ],'Je sépare ma prévision de la preuve que je vais chercher.',[
  '« Dans Word » donne une application, pas un emplacement. Cherche le dossier dans lequel le fichier avait été rangé.',
  'Le Labo 06 utilisait Documents ▸ Informatique et un fichier de type AAAA-MM-JJ_OneDrive. L’état peut varier selon le poste : ne le devine pas.'
  ],question('Avant de chercher, formule ton hypothèse.',[
  champ('H','Emplacement supposé et disponibilité sans réseau',150)
  ])),
bloc('2 — Retrouver ses données','Je relève le chemin et le statut',20,
  'Produire une preuve sur mon propre fichier, sans le supprimer ni modifier la synchronisation.',[
  'Clique sur l’icône 📁 Explorateur dans la barre des tâches (ou Windows + E).',
  'Clique sur Documents dans le volet de gauche.',
  'Ouvre le dossier Informatique.',
  'Sélectionne une fois ton fichier du Labo 06, sans l’ouvrir.',
  'Clique dans la barre d’adresse pour lire le chemin complet (ou Ctrl + L).',
  'Relève le chemin et le nom dans les champs ci-dessous ; remplace ton nom personnel par [moi] si nécessaire.',
  'Si nécessaire, clique sur Afficher ▸ Détails.',
  'Lis la colonne Statut ; si elle manque, clic droit sur un en-tête de colonne ▸ Statut, si proposé.',
  'Relève le symbole ou le message exact ; si rien n’apparaît, écris « statut non affiché ».'
  ],'Mon relevé décrit ce poste : chemin, nom et statut. Une absence de statut reste une observation.',[
  'Le chemin permet de vérifier si le dossier se trouve dans OneDrive. Documents ne prouve pas à lui seul qu’il est synchronisé.',
  'Fichier introuvable : regarde le dossier scolaire OneDrive ▸ Documents ▸ Informatique. Après deux minutes, note ce que tu as essayé et pose ton chevalet. Le professeur fournit un fichier de démonstration à observer personnellement ; précise « démo ».'
  ],question('Conserve une preuve textuelle. Ne double-clique pas sur un nuage : cela peut télécharger le fichier.',[
  champ('P','Chemin (remplace le nom personnel par [moi])',85),champ('F','Nom du fichier ou recherche infructueuse',50),champ('S','Statut exact observé',40)
  ])),
bloc('2 — Retrouver ses données','Local, synchronisé, en ligne : ma conclusion',15,
  'Décider ce que mon relevé permet de dire sur la disponibilité du fichier.',[
  'Relis ton chemin et ton statut.',
  'Explique ce qui serait disponible sur ce poste sans réseau.',
  'Enregistre ta réponse personnelle.',
  'Compare ensuite avec un voisin sans ouvrir ni déplacer les fichiers.',
  'Participe à la mise en commun : deux élèves ont-ils forcément le même statut ?',
  'Lis la synthèse après la discussion.'
  ],'Je justifie ma réponse par un indice précis, ou j’explique ce qu’il manque pour conclure.',[
  'Local et synchronisé ne sont pas deux contraires : un fichier OneDrive peut aussi avoir une copie locale.',
  'Un nuage indique « en ligne seulement » ; une coche verte indique une copie disponible localement. Pas de statut ne signifie pas automatiquement « local uniquement ».'
  ],question('Explique la disponibilité et l’indice qui la justifie.',[
  champ('C','Disponible sans réseau ? Pourquoi ? Ou information manquante ?',165)
  ]),'<details class="encart"><summary>Synthèse — après la mise en commun</summary><p>Un fichier local est présent sur ce PC ; cela ne prouve pas qu’une copie existe ailleurs. Un fichier synchronisé appartient à un espace OneDrive dont les changements sont répercutés en ligne lorsque la synchronisation fonctionne. Il peut avoir une copie locale ou être disponible seulement en ligne.</p><p>Nuage bleu : en ligne seulement, réseau nécessaire pour télécharger le contenu. Cercle blanc à bord vert avec coche : disponible localement. Disque vert plein avec coche blanche : toujours conserver sur cet appareil. Deux flèches : synchronisation en cours ; croix rouge : problème. Ces deux derniers états ne prouvent pas que la copie en ligne est à jour. Sans indication exploitable, on ne tranche pas.</p></details><details class="encart"><summary>Prolongement — si j’ai terminé</summary><p>Sans ouvrir les fichiers, cherche dans le même dossier un autre statut. Explique ce qui pourrait différer sans réseau. S’il n’y en a pas, compare les cas fictifs « nuage » et « coche verte ». Ne clique ni sur Libérer de l’espace, ni sur Toujours conserver ; ne touche pas aux réglages OneDrive.</p></details>'),
bloc('3 — Dépanner','Incident 1 : la fenêtre a disparu',12,
  'Retrouver une fenêtre masquée sans relancer l’application.',[
  'Ouvre la Calculatrice par ⊞ Démarrer ▸ Calculatrice.',
  'Clique sur le bouton — Réduire en haut à droite de sa fenêtre.',
  'Écris une hypothèse et le test choisi ci-dessous, avant le test.',
  'Effectue personnellement ton test.',
  'Relève ce qui montre si l’application avait été fermée ou seulement masquée.'
  ],'Je peux expliquer pourquoi ma solution a fait réapparaître la fenêtre.',[
  'Observe la barre des tâches : la fenêtre a disparu, mais l’application est-elle encore présente ?',
  'Clique sur l’icône Calculatrice dans la barre des tâches, ou affiche les vignettes avec Alt + Tab et sélectionne Calculatrice.'
  ],question('Remplis H et T avant le test ; complète P après. Puis enregistre.',[
  champ('H','Mon hypothèse',45),champ('T','Le test choisi',55),champ('P','Observation et solution justifiée',75)
  ])),
bloc('3 — Dépanner','Incident 2 : je tape dans la mauvaise fenêtre',12,
  'Identifier la fenêtre active avant de saisir un texte.',[
  'Ouvre Bloc-notes par ⊞ Démarrer ▸ tape Bloc-notes ▸ clique sur Bloc-notes.',
  'Ouvre une seconde fenêtre Bloc-notes par son menu Fichier ▸ Nouvelle fenêtre (ou Ctrl + Maj + N, si disponible).',
  'Place les deux fenêtres côte à côte en les déplaçant par leur barre de titre.',
  'Clique dans la première, puis dans la seconde : l’endroit où le texte arrivera change.',
  'Écris ton hypothèse et le test choisi pour saisir dans la première, avant de le faire.',
  'Effectue le test avec le seul mot « test » dans ces fenêtres d’essai.',
  'Relève un indice montrant où le texte est arrivé.'
  ],'J’ai vérifié la fenêtre active sans taper dans un document important.',[
  'Le pointeur de la souris et le curseur de saisie ne sont pas la même chose. Déplacer la souris ne suffit pas à activer une fenêtre.',
  'Clique dans la zone de texte de la fenêtre voulue, ou sélectionne sa vignette avec Alt + Tab, puis clique dans sa zone de texte. Le curseur de saisie y apparaît. Si Nouvelle fenêtre manque, utilise l’Explorateur comme autre fenêtre et reviens au Bloc-notes.'
  ],question('H et T avant le test, puis P après le test.',[
  champ('H','Pourquoi le texte pouvait-il arriver ailleurs ?',45),champ('T','Mon test',55),champ('P','Indice observé et solution justifiée',75)
  ])),
bloc('3 — Dépanner','Incident 3 : le fichier serait-il « dans » l’application ?',12,
  'Distinguer un fichier et le logiciel qui permet de l’ouvrir.',[
  'Repère ton fichier du Labo 06 dans l’Explorateur, sans l’ouvrir.',
  'Écris ton hypothèse : fermer une application ferait-il disparaître ce fichier ?',
  'Écris le test que tu choisis avant de le réaliser.',
  'Ferme uniquement une fenêtre Bloc-notes d’essai par son bouton × Fermer ; si elle demande d’enregistrer le seul mot « test », choisis Ne pas enregistrer.',
  'Retrouve le fichier du Labo 06 dans son dossier, sans le déplacer.',
  'Relève ce qui justifie ta conclusion.'
  ],'Je peux désigner séparément le fichier, son dossier et l’application.',[
  'L’icône d’une application n’est pas ton document. Cherche le nom du fichier et son emplacement.',
  'Le bouton × ferme une fenêtre. Vérifie dans 📁 Explorateur ▸ Documents ▸ Informatique si ton fichier est toujours là. Si c’est un fichier de démonstration, indique-le.'
  ],question('H et T avant la fermeture de la fenêtre d’essai, puis P après.',[
  champ('H','Mon hypothèse sur le fichier',45),champ('T','Le test choisi',55),champ('P','Observation et différence fichier / application',75)
  ])),
bloc('3 — Dépanner','Incident 4 : écran noir, PC arrêté ?',12,
  'Vérifier une hypothèse en distinguant l’écran et l’ordinateur.',[
  'Demande au professeur d’identifier le bouton ⏻ de l’écran, distinct de celui du PC.',
  'Écris ton hypothèse et le test avant de toucher au bouton.',
  'Si le professeur confirme un écran externe séparé, éteins seulement l’écran avec son bouton.',
  'Rallume seulement cet écran avec le même bouton.',
  'Observe si ta session et tes fenêtres sont encore présentes.'
  ],'Je justifie ce que le retour à l’écran permet de conclure. Aucun arrêt forcé, aucun câble touché.',[
  'Un écran est un périphérique d’affichage. Un affichage noir peut avoir plusieurs causes.',
  'Le seul test autorisé ici est le bouton de l’écran externe identifié par le professeur. Sur portable ou tout-en-un, ne touche pas à ⏻ : utilise le cas simulé « écran externe éteint, puis mêmes fenêtres retrouvées » et explique le test que tu choisirais.'
  ],question('H et T avant le test ; P après (précise « simulé » si nécessaire).',[
  champ('H','Mon hypothèse',45),champ('T','Mon test sans risque',55),champ('P','Observation et conclusion justifiée',75)
  ])),
bloc('3 — Dépanner','Mise en commun : quel test était utile ?',15,
  'Construire une méthode de dépannage à partir des quatre incidents.',[
  'Choisis l’incident qui t’a demandé le plus de réflexion.',
  'Écris pourquoi ton test permettait de départager deux explications.',
  'Enregistre ta réponse personnelle.',
  'Compare ensuite ta démarche à celle d’un voisin.',
  'Participe à la mise en commun : explique un test sans lire la réponse du voisin.',
  'Lis la synthèse.'
  ],'Je peux expliquer le rôle du test et une limite de la conclusion.',[
  '« J’ai cliqué et ça marche » raconte un geste, sans expliquer ce qu’il permet de vérifier.',
  'Nomme les deux explications possibles, puis l’observation qui en soutient une. Un écran rallumé ne permet pas d’expliquer tous les écrans noirs.'
  ],question('Quel incident, quel test et pourquoi ce test ? Une phrase suffit.',[
  champ('C','Mon explication',180)
  ]),'<details class="encart"><summary>Synthèse — après discussion</summary><p>Je pars du symptôme ; je propose une hypothèse ; je choisis un test simple et réversible ; j’observe ; je justifie ou je change d’hypothèse. Une fenêtre peut être masquée, une autre active. Fermer une application ne supprime pas un fichier enregistré. Éteindre l’écran n’arrête pas nécessairement le PC. Windows reste le système qui permet d’utiliser la machine et ses applications.</p></details><details class="encart"><summary>Prolongement — si j’ai terminé</summary><p>Invente un incident sans risque combinant deux fenêtres d’essai. Écris deux hypothèses et un test qui les départage. Fais-le lire au professeur avant toute mise en scène. Aucune manipulation sur le travail d’un voisin.</p></details>'),
bloc('Final — Situation individuelle nouvelle','Le dossier de secours',8,
  'Résoudre seul une situation nouvelle : après un changement de poste, peut-on lire le document sans réseau ?',[
  'Lis la situation : tu prépares une présentation sur un autre PC de l’école. L’Explorateur y montre le nom du document avec un nuage bleu. Une autre fenêtre recouvre l’Explorateur. Un camarade dit : « Le fichier est là, il marchera sans réseau ; ferme Windows pour le retrouver. »',
  'Écris ton hypothèse personnelle sur la disponibilité du contenu.',
  'Choisis un test sans risque pour retrouver la fenêtre et vérifier l’indice de disponibilité.',
  'Enregistre avant de tester. Ne coupe pas le réseau.'
  ],'Mon hypothèse et mon test sont conservés avant l’observation.',[
  'Le scénario combine deux problèmes : retrouver une fenêtre et juger la disponibilité d’un contenu. Propose un test qui ne change pas l’état du fichier.',
  'Tu peux revenir à l’Explorateur par son icône 📁 dans la barre des tâches ou Alt + Tab, puis lire le chemin et le statut sans ouvrir le fichier. Il n’est pas nécessaire d’arrêter Windows.'
  ],question('Situation finale, seul : hypothèse puis test choisi.',[
  champ('H','Mon hypothèse',75),champ('T','Le test que je choisis',105)
  ]),'<p class="encart">Proposition de travail quotidien /10 : hypothèse 2 · test 2 · preuve 2 · conclusion justifiée 2 · distinction machine, Windows, application et fichier 2. Les aides restent accessibles ; leur utilisation n’est pas une pénalité de vitesse. Le bilan sommatif global est réservé à décembre, sans date fixée.</p>'),
bloc('Final — Situation individuelle nouvelle','Je réalise mon test et relève une preuve',10,
  'Appliquer personnellement mon test sans ouvrir le fichier ni modifier la synchronisation.',[
  'Réalise le test de fenêtre sur ton poste, avec l’Explorateur recouvert par une fenêtre d’essai.',
  'Lis le chemin et le statut de ton fichier, sans l’ouvrir.',
  'Relève l’observation. Si ton fichier n’a pas de nuage, indique son vrai statut puis utilise le nuage donné dans la situation pour la conclusion.',
  'Enregistre la preuve individuelle ci-dessous.'
  ],'Je ne présente pas une donnée du scénario comme une observation réelle sur mon PC.',[
  'Distingue ce que tu as réalisé et ce qui est seulement donné dans la situation.',
  'Écris par exemple où la fenêtre est revenue, puis le symbole réellement lu. En cas d’accès bloqué, relève précisément le blocage ; le professeur fournit un cas de démonstration et note l’observation à compléter.'
  ],question('Quelle preuve as-tu obtenue personnellement ?',[
  champ('P','Manipulation, indice relevé et éventuelle différence avec le scénario',180)
  ])),
bloc('Final — Situation individuelle nouvelle','Je justifie ma décision',10,
  'Expliquer ma décision pour le cas du nuage bleu, sans promettre plus que ma preuve.',[
  'Réponds à l’affirmation du camarade à partir du nuage bleu donné dans la situation.',
  'Explique le rôle de Windows par rapport à la machine et au fichier ouvert avec une application.',
  'Enregistre ta réponse seul, avant toute correction collective.',
  'Montre ensuite personnellement au professeur le geste choisi et ton indice.',
  'Participe à la synthèse finale : quelle idée as-tu dû revoir ?'
  ],'Le professeur dispose de ma démarche ; les points seront attribués après examen, pas par la fiche.',[
  'Un nom de fichier visible ne suffit pas à prouver que son contenu est déjà téléchargé.',
  'Justifie séparément la disponibilité du fichier et l’utilité de fermer Windows. Relie l’écran et le PC au matériel, Windows au système, l’Explorateur ou Bloc-notes à un logiciel, le document à un fichier.'
  ],question('Deux phrases personnelles et courtes, sans comparaison avec un voisin.',[
  champ('C','Ma décision pour le scénario et sa justification',100),champ('D','Machine, Windows, application et fichier : quel lien ?',80)
  ]),'<details class="encart"><summary>Prolongement après passage du professeur</summary><p>Dans le même scénario, remplace le nuage par une coche verte : quelle partie de ton raisonnement change ? Quelle conclusion sur une panne matérielle resterait impossible avec ces seuls indices ?</p></details>')
];
const FIN = {
 titre:'Mon enquête est terminée',
 texte:'J’ai formulé des hypothèses, manipulé moi-même et gardé des preuves. Mon professeur examine les réponses : l’avancement n’est pas une note. Bilan sommatif global en décembre, date à annoncer.',
 plus:'Reprends une de tes hypothèses et explique à l’oral ce qui te ferait changer d’avis.',
 lien:'les trois synthèses de cette enquête'
};

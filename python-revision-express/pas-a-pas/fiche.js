/* Python 01 et 02 — Révision express — FICHE GÉNÉRÉ par outils/nouveau-cours.cjs depuis sequence.json (même dossier).
   Ne rien modifier ici : changer sequence.json, puis relancer
   node outils/nouveau-cours.cjs python-revision-express/pas-a-pas/sequence.json */
const COURS = "python-revision-express";
const VERSION_PARCOURS = "v1";
const PRESENTATION = 'missions';
const ECRAN_LEGER = true;
const PREUVES = "https://root75.github.io/campin-public/python-revision-express/pas-a-pas/preuves.json?v=b08d83af";
const HORS_SUIVI = "Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.";

const BLOCS = [
 {
  "partie": "A — Je lis un programme",
  "titre": "La trace",
  "min": 1,
  "veux": "Trouver ce qu’un programme affiche, une instruction après l’autre.",
  "gestes": [
   "Lis le programme de la question, <b>une instruction à la fois</b>.",
   "Note la <b>valeur de la variable</b> après chaque instruction, sur ta feuille de brouillon."
  ],
  "coince": [
   "Je me perds : je recommence à la première instruction et je note chaque valeur.",
   "Python fait les instructions dans l’ordre où elles sont écrites, jamais dans un autre ordre."
  ],
  "q": {
   "serveur": true
  }
 },
 {
  "partie": "A — Je lis un programme",
  "titre": "Le calcul qui n’est pas rangé",
  "min": 1,
  "veux": "Voir qu’un calcul sans = ne change pas la variable.",
  "gestes": [
   "Cherche l’instruction qui n’a <b>pas de signe =</b>.",
   "Demande-toi si son résultat est <b>rangé</b> dans la variable."
  ],
  "coince": [
   "Une instruction comme x + 4 calcule, mais ne range rien : la variable garde sa valeur.",
   "Pour garder le résultat, on écrit x = x + 4."
  ],
  "q": {
   "serveur": true
  }
 },
 {
  "partie": "A — Je lis un programme",
  "titre": "Avec ou sans guillemets",
  "min": 1,
  "veux": "Distinguer le nom d’une variable et un texte.",
  "gestes": [
   "Regarde ce qui est écrit <b>entre les parenthèses</b> de print.",
   "Cherche les <b>guillemets</b>."
  ],
  "coince": [
   "Avec des guillemets, Python affiche le mot tel quel.",
   "Sans guillemets, Python affiche le contenu de la variable."
  ],
  "q": {
   "serveur": true
  }
 },
 {
  "partie": "B — Je corrige et je traduis",
  "titre": "Le message rouge",
  "min": 1,
  "veux": "Lire un message d’erreur et trouver quoi corriger.",
  "gestes": [
   "Lis le <b>nom de l’erreur</b>, puis le nom que Python ne connaît pas.",
   "Compare ce nom avec celui de la variable, <b>lettre par lettre</b>."
  ],
  "coince": [
   "NameError veut dire : Python ne connaît pas ce nom.",
   "Python distingue les majuscules et les minuscules : Score n’est pas score."
  ],
  "q": {
   "serveur": true
  }
 },
 {
  "partie": "B — Je corrige et je traduis",
  "titre": "Du pseudo-code à Python",
  "min": 1,
  "veux": "Traduire une instruction de pseudo-code en Python.",
  "gestes": [
   "Repère la <b>flèche ←</b> : en Python, elle s’écrit avec le signe =.",
   "Repère le <b>signe du calcul</b> : en Python, multiplier s’écrit avec l’étoile *."
  ],
  "coince": [
   "La variable qui reçoit le résultat s’écrit à gauche du = , le calcul à droite.",
   "« Afficher x » s’écrit print(x), sans guillemets."
  ],
  "q": {
   "serveur": true
  }
 }
];

const GRILLE = {
 "intro": "<p><b>Avant de partir : où en es-tu ?</b> Pour chaque question, lis les quatre phrases, de A à D, et clique sur celle qui te ressemble le plus. Ce n’est pas coté : ta réponse t’aide à voir ce qu’il te reste à travailler, et ton professeur voit où t’aider.</p>",
 "niveaux": {
  "A": "",
  "B": "",
  "C": "",
  "D": ""
 },
 "criteres": [
  {
   "n": "1. Sais-tu trouver ce qu’un programme affiche ?",
   "inc": false,
   "regarde": "Critère : Reconnaître et manipuler des variables, des constantes et des types d'affectation.",
   "A": "Je fais la trace seul, et j’explique à un camarade pourquoi un calcul qui n’est pas rangé est perdu.",
   "B": "Je fais la trace seul, sans me tromper.",
   "C": "Je fais la trace quand on me rappelle de noter chaque valeur.",
   "D": "Je ne sais pas encore par où commencer."
  },
  {
   "n": "2. Sais-tu dire ce que print affiche, avec ou sans guillemets ?",
   "inc": false,
   "regarde": "Critère : Appliquer les instructions d'entrée et de sortie.",
   "A": "Je le dis à coup sûr, et je l’explique à un camarade.",
   "B": "Je le dis à coup sûr.",
   "C": "J’hésite encore entre le mot et le contenu de la variable.",
   "D": "Je ne vois pas encore la différence."
  },
  {
   "n": "3. Sais-tu traduire du pseudo-code en Python ?",
   "inc": false,
   "regarde": "Critère : Traduire un algorithme dans un langage informatique structuré.",
   "A": "Je traduis seul, et je corrige un message rouge en le lisant.",
   "B": "Je traduis seul.",
   "C": "Je traduis avec l’aide-mémoire sous les yeux.",
   "D": "Je ne sais pas encore remplacer la flèche ni le signe du calcul."
  }
 ]
};

const FIN = {
 "titre": "Révision terminée",
 "bulle": "Prêt !",
 "texte": "Tu as revu les cinq points de Python 01 et 02 : la trace, le calcul rangé, les guillemets, le message rouge et le pseudo-code.",
 "citation": {
  "texte": "Nous sommes ce que nous faisons de manière répétée. L’excellence n’est donc pas un acte, mais une habitude.",
  "auteur": "Will Durant",
  "source": "The Story of Philosophy (1926), à propos d’Aristote, traduit de l’anglais",
  "lien": "Réviser, c’est refaire : cinq questions de plus, et le geste devient une habitude."
 },
 "plus": "Dans Thonny : écris un programme de quatre instructions. Il range 12 dans billes, en enlève 5, double le résultat, puis l’affiche. Il doit afficher 14.",
 "revision": {
  "titre": "Python 01 et 02 — Révision express — je révise ↗",
  "texte": "L’essentiel en 6 lignes, un quiz et 5 cartes.",
  "url": "https://root75.github.io/campin-public/revisions/je-revise/?cours=python-revision-express"
 },
 "lien": "<a href=\"https://root75.github.io/campin-public/revisions/je-revise/?cours=python-revision-express\" target=\"_blank\" rel=\"noopener\">la page « je révise » du cours</a>"
};

if(typeof module!=='undefined') module.exports = { BLOCS, FIN, GRILLE, COURS };

/* Le rat de ville — fiche pas à pas sur le moteur commun (pas-a-pas/blocs.js), en mode déclaratif.
   Ici, seulement des DONNÉES ; mode d'emploi : pas-a-pas/MOTEUR.md, section « Le mode déclaratif ».
   Une étape = un bloc ; son numéro est sa place dans BLOCS. Les cases sont enregistrées par le serveur sous
   « étape.rang » : déplacer une étape ou une case déplacerait les déclarations déjà faites. Ajouter une case en
   fin d'étape est sans risque. Le nombre de cases par étape est aussi dans pas-a-pas/cours.json (« cases ») :
   tests/rat-de-ville.cjs vérifie que les deux sont égaux.
   Dans une case : <b>…</b> = le mot-clé ; <span class="a-ecrire"> = à écrire exactement.
   « demos » : "N" (N-ième case) → [clé de l'animation dans demos.js, numéros des images à montrer sous cette case]. */
const COURS = 'rat-de-ville-6';   // 6 étapes depuis le 27/11/2026 ; l'ancien suivi en 10 étapes reste au Journal sous rat-de-ville-formatif
const DECOUVERTES = [["📜", "Manuscrit ouvert"], ["🐀", "Les rats entrent en scène"], ["🎨", "Fable mise en forme"], ["🔢", "Listes en place"], ["💬", "Méthode expliquée"], ["📚", "Fable vérifiée et remise"]];
const PRESENTATION = 'missions';
const MODE = 'declaratif';
/* Pendant l'action, le moins possible d'autres éléments à l'écran (Vincent, 25/11/2026) : voir ECRAN_LEGER dans blocs.js.
   « ensembles » d'une étape = les cases d'un même geste de sens, affichées sur une seule vue (61 cases, 45 vues). */
const ECRAN_LEGER = true;
const HORS_SUIVI = 'Aperçu libre — ouvre Mes cours avec ton compte scolaire pour retrouver ta progression.';
const BASE = 'https://root75.github.io/campin-public/rat-de-ville/pas-a-pas/', ICONES = BASE + 'icones/';
/* Repère de début de séance, y compris quand la classe reprend au milieu de la fable. */
const ICO_ANNULER = '<img class="ico" src="' + ICONES + 'annuler.png" alt="">';
const RAPPEL_DEBUT_SEANCE = '<aside class="repere agir"><h3>✋ À moi dans Docs !</h3><p>Je fais, puis je coche.</p>'
  + '<p class="annuler">' + ICO_ANNULER + '<span><b>Je me suis trompé ?</b> Tout de suite : <b>Annuler</b> (<kbd>Ctrl</kbd> + <kbd>Z</kbd>), la flèche tout à gauche de la barre d’outils.</span></p></aside>';

const FIN_DE_LISTE = '<figure class="modele-fin-liste"><figcaption>Dans ton document Docs</figcaption>'
  + '<ol start="6"><li>J’ai sélectionné la strophe 1, puis j’ai choisi la police EB Garamond et la taille 14.</li></ol>'
  + '<p>Pour changer une seule strophe, je…</p></figure>';

const BLOCS = [
 {
  "partie": "A — Le texte",
  "titre": "Je crée et je nomme",
  "min": 5,
  "bulle": "Salut ! On va mettre une fable en forme, case par case.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Je repère le nom du document en haut à gauche dans Docs.</p></aside>",
  "gestes": [
   "Menu Google (la gaufre) ▸ Docs ▸ <b>Créer un document</b> ▸ Vierge.",
   "Clique sur « <b>Document sans titre</b> » et tape : <span class=\"a-ecrire\" aria-label=\"À écrire exactement : AAAAMMJJ Le rat de ville – Prénom Nom\">AAAAMMJJ Le rat de ville – Prénom Nom</span> AAAAMMJJ : année, mois, jour de la date d’aujourd’hui.",
   "Place ton document à côté du cours : clique sur l’onglet du cours, puis clic droit sur l’onglet de ton document ▸ Ajouter l’onglet à une <b>nouvelle vue fractionnée</b>. Le cours et ton document s’affichent côte à côte dans la même fenêtre."
  ],
  "vois": "Le nom contient la date d’aujourd’hui, Le rat de ville, mon prénom et mon nom.<br><span class=\"note\">Un nom précis me permettra de retrouver mon travail à la prochaine période.</span>",
  "demos": {
   "1": [
    "etape1",
    [
     0,
     1,
     2
    ]
   ],
   "2": [
    "etape1",
    [
     3,
     4
    ]
   ],
   "3": [
    "cote",
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
  "partie": "A — Le texte",
  "titre": "Je recopie la fable",
  "min": 30,
  "bulle": "Bon début ! Regarde bien les animations.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Je repère le titre, les vers et l’auteur avant de recopier. Un vers = une ligne : touche Enter au bout de chaque vers.</p></aside>",
  "gestes": [
   {
    "geste": "Tape le <b>titre</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/titre.png\" alt=\"Extrait de la fable à recopier\">"
   },
   {
    "geste": "Recopie les <b>vers 1 à 4</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-1.png\" alt=\"Extrait de la fable à recopier\"><details><summary>Comment taper ç et à ?</summary><p>Sur le clavier belge : ç est sur la touche 9, à sur la touche 0. Je tape la touche seule, sans Shift.</p><blockquote>façon · à des reliefs</blockquote><p class=\"note\">Avec Shift, ces touches donnent 9 et 0. Je me suis trompé ? " + ICO_ANNULER + "Annuler (Ctrl + Z).</p></details>"
   },
   {
    "geste": "Recopie les <b>vers 5 à 8</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-2.png\" alt=\"Extrait de la fable à recopier\">"
   },
   {
    "geste": "Recopie les <b>vers 9 à 12</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-3.png\" alt=\"Extrait de la fable à recopier\"><details><summary>Comment taper ê (accent circonflexe) ?</summary><p>Je tape d’abord la touche ^, à droite du P : rien ne s’affiche, c’est normal. Puis je tape e : ê apparaît.</p><blockquote>honnête · fête</blockquote><p class=\"note\">^ puis la voyelle : ^ + o donne ô, ^ + a donne â.</p></details>"
   },
   {
    "geste": "Recopie les <b>vers 13 à 16</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-4.png\" alt=\"Extrait de la fable à recopier\">"
   },
   {
    "geste": "Recopie les <b>vers 17 à 20</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-5.png\" alt=\"Extrait de la fable à recopier\"><details><summary>Comment taper ô et les guillemets « » ?</summary><p>ô : je tape la touche ^, à droite du P (rien ne s’affiche, c’est normal), puis o. Guillemets : j’utilise les guillemets américains \" : la touche 3, sans Shift, avant et après les mots.</p><blockquote>aussitôt · rôt · \"achevons tout notre rôt.\"</blockquote><p class=\"note\">Le ^ apparaît seul ? Je l’efface et je recommence : ^, puis o, sans espace. Les guillemets « » de l’image ne sont pas sur le clavier : \" les remplace.</p></details>"
   },
   {
    "geste": "Recopie les <b>vers 21 à 24</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-6.png\" alt=\"Extrait de la fable à recopier\">"
   },
   {
    "geste": "Recopie les <b>vers 25 à 28</b>. Puis Enter <b>deux fois</b> : une ligne vide.",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/strophe-7.png\" alt=\"Extrait de la fable à recopier\">"
   },
   {
    "geste": "Tape l’<b>auteur</b> : <span class=\"a-ecrire\" aria-label=\"À écrire exactement : Jean de La Fontaine\">Jean de La Fontaine</span>",
    "sous": "<img class=\"extrait\" src=\"" + BASE + "fable/auteur.png\" alt=\"Extrait de la fable à recopier\">"
   }
  ],
  "vois": "Je compare ma dernière ligne à l’image avant de passer au groupe suivant. Je dois retrouver le titre, 28 vers en 7 strophes, puis l’auteur, séparés par une ligne vide.<br><span class=\"note\">Les petits groupes de quatre vers m’aident à garder ma place.</span>",
  "extra": "<button class=\"btn vide\" type=\"button\" onclick=\"const t=document.getElementById('texte');t.open=true;t.scrollIntoView({behavior:'smooth'})\">Voir le texte à recopier</button>",
  "demos": {
   "1": [
    "etape2",
    [
     0
    ]
   ],
   "2": [
    "etape2",
    [
     1,
     2,
     3,
     4
    ]
   ]
  }
 },
 {
  "partie": "A — Le texte",
  "titre": "Je structure",
  "min": 10,
  "bulle": "Tu es lancé(e) !",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Une strophe regroupe quatre vers. Une ligne vide sépare deux strophes.</p></aside>",
  "gestes": [
   {
    "geste": "Mets une <b>majuscule</b> à la première lettre de chaque vers.",
    "sous": "<details><summary>Comment mettre à en majuscule (À) ?</summary><p>Je double-clique sur le à pour le sélectionner, seul. Puis Format ▸ Texte ▸ Minuscules/majuscules ▸ <b>MAJUSCULES</b>.</p><blockquote>à la porte de la salle → À la porte de la salle</blockquote><p class=\"note\">Deux vers commencent par à : le vers 4 et le vers 13. Pour les autres lettres, j’efface la minuscule et je tape la majuscule avec Shift.</p><img class=\"capture\" src=\"" + BASE + "capture-majuscules.png\" alt=\"Menu Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES dans Docs\"></details>"
   },
   "Vérifie les <b>lignes vides</b> : une seule après le titre, entre deux strophes et avant l’auteur, 7 strophes en tout. Il en manque une ? Clique à la fin du dernier vers de la strophe, puis Enter.",
   {
    "geste": "Montre ton <b>texte</b> au professeur : clique sur le bouton <b>🔔 Texte prêt : appeler le professeur</b> ci-dessous, puis continue à l’étape 4 sans attendre. Quand il a regardé, cette case se coche toute seule.",
    "accord": { "bouton": "🔔 Texte prêt : appeler le professeur", "attente": "✋ Ton professeur sait que ton texte est prêt. Continue à l’étape 4 : cette case se cochera toute seule.", "ok": "✅ Le professeur a regardé ton texte." }
   }
  ],
  "vois": "Je compte sept groupes de quatre vers et je regarde la première lettre de chaque vers.<br><span class=\"note\">Les strophes sont maintenant plus faciles à repérer.</span>",
  "demos": {
   "1": [
    "etape3",
    [
     0,
     1
    ]
   ],
   "2": [
    "etape3",
    [
     2
    ]
   ]
  }
 },
 {
  "partie": "B — La mise en forme",
  "titre": "Titre, texte, auteur",
  "min": 10,
  "ensembles": [[1, 2, 3], [4], [5, 6, 7]],
  "bulle": "Tu es lancé(e) !",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Je compare les trois zones du modèle : le titre, les strophes et l’auteur.</p><div class=\"apercu-document\" aria-label=\"Modèle de présentation des trois zones\"><p class=\"exemple-titre\">TITRE DE LA FABLE</p><p class=\"exemple-strophe\">Les strophes sont centrées.</p><p class=\"exemple-auteur\">Jean de La Fontaine</p></div></aside>",
  "gestes": [
   "<img class=\"ico\" src=\"" + ICONES + "centrer.png\" alt=\"\">Sélectionne le <b>titre</b>. Clique sur <b>Centrer</b> (Ctrl + Shift + E).",
   "<img class=\"ico\" src=\"" + ICONES + "gras.png\" alt=\"\">Le titre toujours sélectionné, clique sur <b>Gras</b> (Ctrl + B).",
   "Le titre toujours sélectionné : Format ▸ Texte ▸ Minuscules/majuscules ▸ <b>MAJUSCULES</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "centrer.png\" alt=\"\">Sélectionne les <b>7 strophes</b>. Clique sur <b>Centrer</b> (Ctrl + Shift + E).",
   "<img class=\"ico\" src=\"" + ICONES + "droite.png\" alt=\"\">Sélectionne l’<b>auteur</b>. Clique sur <b>Aligner à droite</b> (Ctrl + Shift + R).",
   "<img class=\"ico\" src=\"" + ICONES + "italique.png\" alt=\"\">L’auteur toujours sélectionné, clique sur <b>Italique</b> (Ctrl + I).",
   "<img class=\"ico\" src=\"" + ICONES + "souligne.png\" alt=\"\">L’auteur toujours sélectionné, clique sur <b>Souligner</b> (Ctrl + U)."
  ],
  "vois": "Le titre est centré, gras et en majuscules ; le texte est centré ; l’auteur est à droite, italique et souligné. J’utilise les boutons d’alignement, sans taper d’espaces.<br><span class=\"note\">Sélectionner la bonne zone me permet de modifier seulement ce que je veux.</span>",
  "demos": {
   "1": [
    "etape6",
    [
     0,
     1
    ]
   ],
   "2": [
    "etape6",
    [
     2
    ]
   ],
   "3": [
    "etape6",
    [
     3
    ]
   ],
   "4": [
    "etape6",
    [
     4,
     5
    ]
   ],
   "5": [
    "etape6",
    [
     6
    ]
   ],
   "6": [
    "etape6",
    [
     7
    ]
   ],
   "7": [
    "etape6",
    [
     8
    ]
   ]
  }
 },
 {
  "partie": "B — La mise en forme",
  "titre": "Une police par strophe",
  "min": 12,
  "bulle": "Déjà la moitié ! Le rat est fier de toi.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Je repère le numéro de la strophe avant de choisir sa police et sa taille.</p><table class=\"repere-polices\"><caption>Police et taille attendues</caption><tr><th>Strophes</th><th>Police</th><th>Taille</th></tr><tr><td>1 et 2</td><td>EB Garamond ou Garamond</td><td>14</td></tr><tr><td>3 et 4</td><td>Arial</td><td>12</td></tr><tr><td>5</td><td>Calibri</td><td>10</td></tr><tr><td>6 et 7</td><td>Arial Black</td><td>8</td></tr></table></aside><p class=\"note\">Pour chaque strophe : je la sélectionne seule, je choisis la police dans le menu des polices, puis je tape la taille dans la case du nombre.</p>",
  "gestes": [
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 1</b> : <b>EB Garamond (ou Garamond), taille 14</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 2</b> : <b>EB Garamond (ou Garamond), taille 14</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 3</b> : <b>Arial, taille 12</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 4</b> : <b>Arial, taille 12</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 5</b> : <b>Calibri, taille 10</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 6</b> : <b>Arial Black, taille 8</b>.",
   "<img class=\"ico\" src=\"" + ICONES + "police.png\" alt=\"\"><img class=\"ico\" src=\"" + ICONES + "taille.png\" alt=\"\">Sélectionne seulement la <b>strophe 7</b> : <b>Arial Black, taille 8</b>."
  ],
  "vois": "Je clique dans chaque strophe et je lis la police et la taille dans la barre d’outils. Si les autres strophes ont changé aussi : Ctrl + Z, puis je sélectionne uniquement la strophe voulue.<br><span class=\"note\">Changer une strophe sans toucher aux autres montre que je maîtrise la sélection.</span>",
  "demos": {
   "1": [
    "etape7",
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
  "partie": "B — La mise en forme",
  "titre": "Mon bloc-notes : la liste à puces",
  "min": 5,
  "ensembles": [[3, 4]],
  "bulle": "Déjà la moitié ! Le rat est fier de toi.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Des puces quand l’ordre ne compte pas : les choses du festin.</p></aside>",
  "gestes": [
   {
    "geste": "Clique à la fin de la fable, après l’auteur. Insertion ▸ Saut ▸ <b>Saut de page</b> (Ctrl + Enter). Sur la nouvelle page, écris : <span class=\"a-ecrire\" aria-label=\"À écrire exactement : Mon bloc-notes\">Mon bloc-notes</span>",
    "sous": "<details><summary>Où est le saut de page ?</summary><p>Menu <b>Insertion</b> ▸ <b>Saut</b>, vers le bas du menu ▸ <b>Saut de page</b>.</p><img class=\"capture\" src=\"" + BASE + "capture-saut-de-page.png\" alt=\"Menu Insertion ▸ Saut ▸ Saut de page dans Docs\"></details>"
   },
   {
    "geste": "Sous le titre, écris <b>trois choses du repas</b> du rat de ville. Une chose par ligne : touche Enter après chacune.",
    "sous": "<details><summary>Qu’est-ce que j’écris ?</summary><ul><li>Relis les strophes 1 et 2 de la fable : c’est le repas.</li><li>Cherche ce qu’il y a sur la table ou par terre.</li><li>Écris trois choses, en deux ou trois mots. Pas de phrase.</li><li>Exemple : <b>le tapis</b>.</li></ul><p class=\"note\">« Les reliefs d’ortolans », dans la fable, ce sont des restes de petits oiseaux.</p></details>"
   },
   {
    "geste": "<b>Sélectionne</b> les trois lignes : clique avant la première, garde le bouton de la souris enfoncé, glisse jusqu’à la fin de la troisième.",
    "sous": "<p class=\"note\">Les trois lignes deviennent bleues. Le titre, lui, reste blanc.</p>"
   },
   {
    "geste": "<img class=\"ico\" src=\"" + ICONES + "puces.png\" alt=\"\">Clique sur le bouton <b>Liste à puces</b> (Ctrl + Shift + 8), dans la barre d’outils, à droite.",
    "sous": "<p class=\"note\">Un rond noir apparaît devant chaque ligne. Une vraie liste à puces se fait avec le bouton, jamais avec un tiret tapé.</p>"
   }
  ],
  "vois": "Dans Docs : « Mon bloc-notes », puis trois choses du repas, chacune sur sa ligne, avec un rond noir devant.",
  "demos": {
   "1": [
    "etape8",
    [
     0,
     1,
     2
    ]
   ],
   "2": [
    "etape8",
    [
     3
    ]
   ],
   "3": [
    "etape8",
    [
     4
    ]
   ],
   "4": [
    "etape8",
    [
     5,
     6
    ]
   ]
  }
 },
 {
  "partie": "B — La mise en forme",
  "libelleConsigne": "Consigne",
  "titre": "Écrire les six lignes de « Mes gestes »",
  "min": 10,
  "ensembles": [[1, 2]],
  "bulle": "Presque fini, courage !",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Dans Docs, ma liste « Mes gestes » va de 1 à 6. Chaque numéro raconte une action que j’ai faite sur la fable.</p></aside><p class=\"note\">Je raconte six gestes de mise en forme, un par un. Un geste complet dit deux choses : ce que j’ai sélectionné, puis le bouton ou le menu utilisé.</p>",
  "gestes": [
   {
    "geste": "Sous tes puces, sur une <b>nouvelle ligne</b>, écris : <span class=\"a-ecrire\" aria-label=\"À écrire exactement : Mes gestes\">Mes gestes</span>",
    "sous": "<details><summary>Que signifie « Mes gestes » ?</summary><p>Je raconte comment j’ai mis mon document en forme. Pour chaque geste, je précise ce que j’ai sélectionné et le bouton, le menu ou le raccourci utilisé. Avant le premier geste, je clique sur Liste numérotée (Ctrl + Shift + 7) : j’écris chaque geste à côté de son numéro, et Enter fait apparaître le suivant.</p><blockquote>Exemple d’un geste : « J’ai sélectionné le titre, puis j’ai cliqué sur Centrer. »</blockquote><p class=\"note\">« J’ai écrit le texte » ou « J’ai mis l’auteur » ne sont pas des gestes de mise en forme : il manque ce que j’ai sélectionné et le bouton.</p></details>"
   },
   "<img class=\"ico\" src=\"" + ICONES + "numeros.png\" alt=\"\">Enter, puis clique sur <b>Liste numérotée</b> (Ctrl + Shift + 7) : le numéro 1 apparaît.",
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 1</b> de ta liste dans Docs. Enter.",
    "trous": {
     "ligneDocs": 1,
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
    }
   },
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 2</b> de ta liste dans Docs. Enter.",
    "trous": {
     "ligneDocs": 2,
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
    }
   },
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 3</b> de ta liste dans Docs. Enter.",
    "trous": {
     "ligneDocs": 3,
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
    }
   },
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 4</b> de ta liste dans Docs. Enter.",
    "trous": {
     "ligneDocs": 4,
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
    }
   },
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 5</b> de ta liste dans Docs. Enter.",
    "trous": {
     "ligneDocs": 5,
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
    }
   },
   {
    "geste": "Complète la phrase ici, puis écris-la à la <b>ligne 6</b> de ta liste dans Docs.",
    "trous": {
     "ligneDocs": 6,
     "modeleApres": FIN_DE_LISTE,
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
   }
  ],
  "vois": "Dans Docs : six lignes numérotées de 1 à 6. Chacune dit ce que j’ai sélectionné et le bouton ou le menu utilisé.<br><span class=\"note\">Nommer le bouton utilisé permet à quelqu’un d’autre de comprendre ma méthode.</span>",
  "demos": {
   "2": [
    "etape10",
    [
     0,
     1,
     2
    ]
   ]
  }
 },
 {
  "partie": "B — La mise en forme",
  "libelleConsigne": "Consigne",
  "titre": "Expliquer pourquoi je sélectionne une seule strophe",
  "min": 5,
  "ensembles": [[1, 2]],
  "bulle": "Presque fini, courage !",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>La liste de six lignes est terminée. Sous cette liste, tu vas écrire une seule phrase pour expliquer pourquoi les autres strophes gardent leur police.</p></aside>" + FIN_DE_LISTE,
  "gestes": [
   {
    "geste": "Sur le site, complète la <b>phrase d’entraînement</b>.",
    "trous": {
     "titre": "Pourquoi sélectionner d’abord ?",
     "intro": "Je complète l’explication avec les mots de la banque.",
     "bravo": "Juste ! Maintenant, ta phrase à toi, dans Docs, juste en dessous.",
     "effacer": "<p>Dans Docs, commence ta phrase par :</p><blockquote>Pour changer une seule strophe, je…</blockquote><p class=\"note\">Avec tes mots : sélectionner, police, taille.</p>",
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
   {
    "geste": "Dans Docs, place le curseur à la fin de la ligne 6. Appuie deux fois sur <b>Enter</b> pour quitter la liste. Sur la ligne sans numéro, explique avec tes mots pourquoi seule la strophe sélectionnée change de police.",
    "sous": "<details><summary>Qu’expliquer dans ma phrase ?</summary><p>Je réponds avec mes mots à la question : « Comment je change la police d’une seule strophe sans toucher aux autres ? » J’explique pourquoi les autres strophes gardent leur police quand je change la police ou la taille de celle que j’ai sélectionnée.</p><blockquote>Début possible à compléter : « Pour changer une seule strophe, je… »</blockquote><p class=\"note\">J’écris ma phrase dans le document Docs, sous la liste de mes gestes. Je ne recopie pas le texte à trous : je le dis à ma façon.</p></details>"
   }
  ],
  "vois": "Dans Docs : une phrase sous ma liste, écrite avec mes mots, avec sélectionner, police et taille.<br><span class=\"note\">Expliquer pourquoi, c’est montrer que j’ai compris, pas seulement que j’ai fini.</span>",
  "demos": {
   "2": [
    "etape11",
    [
     0
    ]
   ]
  }
 },
 {
  "partie": "B — La mise en forme",
  "titre": "Je vérifie mon document",
  "court": "Je vérifie",
  "min": 10,
  "ensembles": [[1, 2], [3, 4, 5], [6, 7, 8, 9], [10], [11]],
  "bulle": "Avant de remettre : je vérifie tout, une chose par case.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>J’ouvre la grille : les critères avec une étoile sont incontournables.</p></aside><figure class=\"attendu\"><a href=\"" + BASE + "attendu.png\" target=\"_blank\" rel=\"noopener\"><img class=\"ressource\" src=\"" + BASE + "attendu.png\" alt=\"Un document terminé : la fable mise en forme, le bloc-notes, Mes gestes et la phrase\"></a><figcaption>Voici l’attendu : je compare mon document, page par page.</figcaption></figure><p class=\"note\">Je vérifie une chose par case, dans mon document. Si une chose manque, je la corrige avant de cocher.</p>",
  "gestes": [
   "<img class=\"ico\" src=\"" + ICONES + "orthographe.png\" alt=\"\">Clique sur <b>Vérifier l’orthographe</b> (Ctrl + Alt + X) et corrige.",
   "Vérifie le <b>nom</b> : <span class=\"a-ecrire\" aria-label=\"À écrire exactement : AAAAMMJJ Le rat de ville – Prénom Nom\">AAAAMMJJ Le rat de ville – Prénom Nom</span>",
   "Vérifie que la fable est <b>complète</b> : titre, 28 vers, auteur.",
   "Vérifie qu’il y a une <b>majuscule</b> au début de chaque vers.",
   "Vérifie qu’il y a <b>7 strophes</b>, séparées par une ligne vide.",
   "Vérifie le <b>titre</b> : centré, gras, en MAJUSCULES.",
   "Vérifie que les 7 strophes sont <b>centrées</b>.",
   "Vérifie l’<b>auteur</b> : à droite, en italique, souligné.",
   "Vérifie que chaque strophe a sa <b>police</b> et sa <b>taille</b>.",
   "Vérifie ton <b>bloc-notes</b> : une vraie liste à puces, une vraie liste numérotée de six gestes, ta phrase.",
   "<b>Montre ton document à ton voisin</b>. Il le compare aux cases 2 à 10 et te montre un écart, sans toucher la souris. Corrige."
  ],
  "vois": "Chaque case cochée = une chose vérifiée dans mon document, et corrigée s’il le fallait. Mon voisin n’a plus trouvé d’écart.<br><span class=\"note\">Repérer et corriger un écart fait partie du travail : après la remise, je ne peux plus modifier mon document.</span>",
  "demos": {
   "1": ["etape9", [0]]
  }
 },
 {
  "partie": "B — La mise en forme",
  "titre": "Je remets mon document",
  "court": "Je remets",
  "min": 10,
  "ensembles": [[3, 4, 5], [6, 7]],
  "bulle": "Le professeur dit oui, puis je remets dans Classroom.",
  "avant": "<aside class=\"repere observation\"><h3>À observer</h3><p>Dans Classroom, le cadre <b>Vos devoirs</b> est à droite du devoir. Il dit <b>Attribué</b> avant la remise, <b>Remis</b> après.</p></aside><p class=\"note\">Une fois remis, mon document ne se modifie plus : c’est le professeur qui l’a.</p>",
  "gestes": [
   {
    "geste": "Demande l’<b>accord</b> du professeur : clique sur le bouton <b>🔔 Je demande l’accord du professeur</b> ci-dessous. Il vient regarder ton document. Quand il a dit oui, cette case se coche toute seule.",
    "accord": true,
    "sous": "<details><summary>Le professeur demande une correction ?</summary><p>Je corrige dans mon document. Ma demande reste allumée : il revient voir. Si j’ai éteint la cloche, je clique encore sur <b>🔔 Je demande l’accord du professeur</b>.</p></details>"
   },
   {
    "geste": "Ouvre le <b>devoir</b> : clique sur le bouton <b>Ouvrir Travaux et devoirs</b>, juste en dessous. Dans le nouvel onglet, clique sur <b>03 EVAL Formatif Le rat de ville</b> ▸ <b>Afficher les instructions</b>.",
    "sous": "<p><a class=\"btn plein\" style=\"display:inline-block;text-decoration:none\" data-classroom=\"travaux\" href=\"https://classroom.google.com/\" target=\"_blank\" rel=\"noopener\">Ouvrir Travaux et devoirs ↗</a></p><details><summary>Le bouton n’ouvre pas Travaux et devoirs ?</summary><p>Dans Classroom : <b>Numérique</b> (ma classe) ▸ onglet <b>Travaux et devoirs</b>.</p><p>Classroom ne s’ouvre pas du tout ? Menu Google (la gaufre ⋮⋮⋮, en haut à droite) ▸ <b>Classroom</b>. Pas de gaufre ? Ouvre un nouvel onglet (<b>Ctrl + T</b>), tape <b>classroom.google.com</b>, puis appuie sur <b>Enter</b>.</p><img class=\"capture\" src=\"" + BASE + "capture-devoir-classroom.png\" alt=\"Classroom, onglet Travaux et devoirs : le devoir 03 EVAL Formatif Le rat de ville\"></details>"
   },
   {
    "geste": "À droite, dans le cadre <b>Vos devoirs</b> : clique sur <b>+ Ajouter ou créer</b> ▸ <b>Google Drive</b> (la 1re ligne du menu).",
    "attention": "⚠️ Pas <b>Docs</b>, sous « Créer » : il fabriquerait un nouveau document vide. Ton document existe déjà."
   },
   "Dans la fenêtre Google Drive, clique sur <b>ton document</b> (AAAAMMJJ Le rat de ville – Prénom Nom), puis sur le bouton bleu <b>Ajouter</b>, en bas à droite.",
   "Vérifie : ton document apparaît maintenant sous <b>Vos devoirs</b>, avec son nom. Joindre ne suffit pas : il n’est pas encore rendu.",
   "Clique sur le bouton bleu <b>Rendre le devoir</b>. Une fenêtre demande « Rendre le devoir ? » : clique encore sur <b>Rendre le devoir</b>.",
   "Vérifie : en haut du cadre <b>Vos devoirs</b>, c’est écrit <b>Remis</b>. C’est rendu !"
  ],
  "vois": "Le professeur a donné son accord, puis j’ai rendu : « Vos devoirs » affiche <b>Remis</b>. Il me reste à m’évaluer avec ma grille.<br><span class=\"note\">Rendre, c’est dire « j’ai fini » : le professeur peut maintenant lire et corriger mon document.</span>",
  "demos": {
   "2": ["etape9", [1]],
   "3": ["etape9", [2, 3]],
   "4": ["etape9", [4, 5]],
   "5": ["etape9", [6]],
   "6": ["etape9", [6, 7]],
   "7": ["etape9", [8]]
  }
 }
];

const GRILLE_CRITERES = [
 {
  "n": "1. Choix de l'outil et des fonctions",
  "inc": false,
  "regarde": "Chaque mise en forme est faite avec la bonne fonction : alignements avec le bouton (aucun espace tapé), gras, italique, souligné, vraie liste à puces, vraie liste numérotée, une seule ligne vide entre les strophes.",
  "A": "Tout est fait avec la bonne fonction, sans exception.",
  "B": "Une seule mise en forme faite « à la main ».",
  "C": "Deux ou trois mises en forme faites à la main.",
  "D": "La plupart des mises en forme faites à la main, ou absentes."
 },
 {
  "n": "2. Qualité de la production",
  "inc": true,
  "regarde": "Document nommé « AAAAMMJJ Le rat de ville – Prénom Nom ». Fable complète et exacte, une majuscule à chaque vers, 7 strophes séparées. Titre centré, gras, en majuscules ; texte centré ; auteur à droite, italique, souligné. La bonne police et la bonne taille pour chaque strophe (EB Garamond ou Garamond : les deux sont justes).",
  "A": "Tout est conforme et la copie est sans faute.",
  "B": "Conforme, avec au plus deux écarts légers (1 à 3 fautes, une taille, une strophe).",
  "C": "Plusieurs éléments manquent ou sont faux (une police sur plusieurs strophes, l'auteur mal placé, des vers oubliés…).",
  "D": "Production inachevée : fable incomplète, mise en forme absente, ou rien de remis."
 },
 {
  "n": "3. Démarche de création",
  "inc": true,
  "regarde": "La liste numérotée « Mes gestes » : les gestes de mise en forme, dans l'ordre où je les ai faits, chacun avec le bouton, le menu ou le raccourci utilisé. Le document correspond à ce que j'annonce.",
  "A": "Au moins six gestes, dans l'ordre, chacun avec son bouton ou menu, tous visibles dans le document.",
  "B": "Cinq gestes dans un ordre cohérent ; le bouton n'est pas toujours nommé.",
  "C": "Deux à quatre gestes, ou une liste qui ne correspond pas au document.",
  "D": "Pas de liste des gestes, ou sans rapport avec la mise en forme."
 },
 {
  "n": "4. Communication et justification",
  "inc": false,
  "regarde": "La phrase qui répond à : « Comment je change la police d'une seule strophe sans toucher aux autres ? », avec les mots du cours (sélectionner, police, taille).",
  "A": "Démarche juste et précise : je sélectionne seulement la strophe, puis je choisis la police et la taille.",
  "B": "Démarche juste, dite simplement.",
  "C": "Réponse vague : « je change la police », « je clique dessus ».",
  "D": "Pas de phrase, ou une démarche fausse."
 }
];

/* La grille d'auto-évaluation « Moi », écran final du moteur. */
const GRILLE = {
  intro: '<p>Grille WBE « Création de contenus », la même que pour le Bilan. Attendu : « produire, éditer et enrichir un contenu numérique en choisissant un outil adapté à son intention, en mettant en forme un document […] ». ★ = critère incontournable. « Moi » = ma lettre avant la correction.</p>'
    + '<p>Coté en formatif : mes quatre lettres et ma couleur me disent quoi travailler avant le Bilan. Le suivi ne calcule aucune cote.</p>',
  niveaux: { A: 'dépasse', B: 'atteint', C: 'proche', D: 'loin' },
  criteres: GRILLE_CRITERES,
  legende: '<ul class="couleurs"><li><span class="couleur bleu">Bleu</span> attendu dépassé : A au critère 2 ou 3, et au moins B partout ailleurs.</li><li><span class="couleur vert">Vert</span> attendu atteint : B aux critères 2 et 3, et au moins C aux critères 1 et 4.</li>'
    + '<li><span class="couleur jaune">Jaune</span> presque atteint : un des critères ★ reste à C.</li><li><span class="couleur orange">Orange</span> pas encore atteint : les critères ★ ne sont pas atteints.</li></ul>'
};
const FIN = {
  titre: 'Je m’évalue',
  bouton: 'Je m’évalue →',
  bulle: 'Dernière ligne droite : je choisis mes lettres.',
  texte: 'Mon document est rendu. Pour chaque critère, je lis les quatre phrases, de A à D. Je clique sur celle qui décrit mon travail : c’est ma lettre « Moi ».',
  citation: { texte: 'Rien ne sert de courir ; il faut partir à point.', auteur: 'Jean de La Fontaine', source: '« Le Lièvre et la Tortue », Fables, livre VI, fable 10 (1668)',
    lien: 'Strophe après strophe, une case après l’autre : c’est la régularité qui a fait mon document.' }
};

/* « Ça coince ? » : les aides de l'étape affichée. */
const AIDE_RETROUVER = { html: '<b>Je ne retrouve pas mon document ?</b><br>Menu Google (la gaufre) ▸ <b>Drive</b> ▸ <b>Récents</b>.' };
const AIDES_FRAPPE = [
  { html: '<b>Un accent circonflexe : ê, ô ?</b><br>La touche <kbd>^</kbd> à droite du P (rien ne s’affiche), <b>puis</b> la voyelle.' },
  { html: '<b>Des guillemets ?</b><br>Les <b>guillemets américains</b> " : la touche <kbd>3</kbd>, sans Shift.' },
  { html: '<b>Un À majuscule ?</b><br>Je sélectionne le à ▸ <b>Format ▸ Texte ▸ Minuscules/majuscules ▸ MAJUSCULES</b>.' }
];
const AIDES_FORME = [
  { html: '<b>Sélectionner une strophe ?</b><br>Je clique <b>juste avant</b> son premier mot, je garde <kbd>Shift</kbd> enfoncée, je clique <b>juste après</b> son dernier mot.' },
  { html: '<b>Tout le texte a changé de police ?</b><br><kbd>Ctrl</kbd> + <kbd>Z</kbd>, puis je sélectionne <b>seulement</b> la strophe.' },
  { html: '<b>Gras ou centrage au mauvais endroit ?</b><br><kbd>Ctrl</kbd> + <kbd>Z</kbd>, puis je <b>sélectionne d’abord</b>, je clique ensuite.' },
  { html: '<b>La police n’est pas dans la liste (EB Garamond, Arial Black…) ?</b><br>Menu des polices ▸ <b>Autres polices</b> ▸ je tape son nom ▸ je la coche ▸ <b>OK</b>.' },
  { html: '<b>La taille 8 ou 14 n’est pas proposée ?</b><br>Je clique dans <b>la case du nombre</b>, j’efface, je tape la taille, puis <kbd>Enter</kbd>.' },
  { html: '<b>Ma liste numérotée ne commence pas à 1 ?</b><br>Clic droit sur le premier numéro ▸ <b>Recommencer la numérotation</b>.' }
];

const AIDES_REMISE = [
  { html: '<b>Je ne trouve pas le devoir ?</b><br>Classroom ▸ <b>Numérique</b> (ma classe) ▸ onglet <b>Travaux et devoirs</b> ▸ <b>03 EVAL Formatif Le rat de ville</b> ▸ <b>Afficher les instructions</b>.' },
  { html: '<b>Mon document n’est pas dans la fenêtre Google Drive ?</b><br>Je clique sur l’onglet <b>Récents</b>, ou sur <b>Mon Drive</b>. Sinon, je tape « rat » dans <b>Rechercher dans Drive</b>, en haut de la fenêtre.' },
  { html: '<b>J’ai joint le mauvais fichier ?</b><br>Dans <b>Vos devoirs</b>, je clique sur la <b>croix ✕</b> à droite du fichier, puis je recommence : <b>+ Ajouter ou créer</b> ▸ <b>Google Drive</b>.' },
  { html: '<b>J’ai cliqué sur Docs et un document vide s’est ouvert ?</b><br>Je ferme son onglet. Dans <b>Vos devoirs</b>, je clique sur la <b>croix ✕</b> à droite de ce document vide, puis <b>+ Ajouter ou créer</b> ▸ <b>Google Drive</b>.' },
  { html: '<b>Le bouton dit « Marquer comme terminé » ?</b><br>Aucun fichier n’est joint. Je ne clique pas : d’abord <b>+ Ajouter ou créer</b> ▸ <b>Google Drive</b> ▸ mon document ▸ <b>Ajouter</b>.' }
];

/* Sous chaque étape (BAS_ETAPE du moteur) : fermer et se déconnecter à la sonnerie, puis les deux gestes pour reprendre. Pas de case. */
const BAS_ETAPE = [
  { classe: 'sonnerie', titre: '🔔 À la sonnerie, où que j’en sois', gestes: [
    { texte: '<b>1. Je ferme l’onglet de mon document.</b> Je ne remets PAS : Docs l’enregistre tout seul.', demo: 'fermer' },
    { texte: '<b>2. Je me déconnecte de Windows :</b> touche Windows ⊞ ▸ clic sur <b>mon nom</b>, en bas à gauche du menu ▸ <b>Se déconnecter</b> (ou <b>Ctrl + Alt + Delete</b> ▸ <b>Se déconnecter</b>). Sinon, l’élève suivant arrive dans <b>ma</b> session : mon Drive, mes documents, en mon nom.',
      note: 'Le bouton ⏻ du menu propose Verrouiller, Arrêter, Redémarrer : pas « Se déconnecter ». Je n’éteins pas l’ordinateur.', demo: 'deconnecter' } ] },
  { classe: 'reprise', titre: '▶ Je reprends mon cours', gestes: [
    { texte: '<b>Je retrouve mon document :</b> menu Google (la gaufre) ▸ <b>Drive</b> ▸ <b>Récents</b> ▸ double-clic sur mon document.', demo: 'retrouver' },
    { texte: '<b>Je mets le cours et mon document côte à côte :</b> je clique sur l’onglet du cours, puis clic droit sur l’onglet de mon document ▸ <b>Ajouter l’onglet à une nouvelle vue fractionnée</b>. <button class="btn vide" type="button" data-cote-a-cote hidden>🪟 Mettre côte à côte</button>', demo: 'cote' } ] }
];

/* Six étapes au lieu de dix (Vincent, 27/11/2026 : trop d'étapes). Les parties ci-dessus restent écrites séparément,
   lisibles une à une ; ici, chaque paire devient une seule étape : les gestes de la seconde suivent ceux de la première,
   son « À observer » passe sous son premier geste, ses animations et ses vues sont renumérotées. Les cases sont donc
   enregistrées sous les numéros des six étapes (cours.json). */
function fusionne(A, B, titre, court) {
  const n = A.gestes.length;
  const g = B.gestes.map(x => typeof x === 'string' ? { geste: x } : Object.assign({}, x));
  if (B.avant) g[0].sous = '<div class="avant">' + B.avant + '</div>' + (g[0].sous || '');
  A.gestes = A.gestes.concat(g);
  A.min += B.min;
  A.vois = [A.vois, B.vois].filter(Boolean).join('<br>');
  A.demos = Object.assign({}, A.demos);
  Object.keys(B.demos || {}).forEach(k => { A.demos[n + Number(k)] = B.demos[k]; });
  const ens = (A.ensembles || []).concat((B.ensembles || []).map(e => e.map(x => x + n)));
  if (ens.length) A.ensembles = ens;
  A.titre = titre; if (court) A.court = court; else delete A.court;
  return A;
}
BLOCS.splice(0, BLOCS.length,
  BLOCS[0],
  fusionne(BLOCS[1], BLOCS[2], 'Je recopie la fable'),
  fusionne(BLOCS[3], BLOCS[4], 'Je mets en forme'),
  fusionne(BLOCS[5], BLOCS[6], 'Mes deux listes'),
  BLOCS[7],
  fusionne(BLOCS[8], BLOCS[9], 'Je vérifie et je remets', 'Je vérifie, je remets'));
BLOCS.forEach((B, i) => {
  B.coince = [].concat(i === 1 ? AIDES_FRAPPE : [], i >= 2 && i <= 5 ? AIDES_FORME : [], i === 5 ? AIDES_REMISE : [], [AIDE_RETROUVER]);
});

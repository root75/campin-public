/* Le contenu de la fiche « python-bugs ». Hors de index.html : servie par Apps Script, une page voit son
   script modifié au passage. Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de « Python — La chasse aux bugs » =====
   Un cours de pratique, entre « Texte, nombre et input() » et « Si… alors, sinon » : rien de nouveau à
   apprendre, des programmes du jeu à réparer. Notions utilisées : print( ), variables, calculs,
   commentaires, texte ou nombre, int(input( )). Aucun if.
   Il se fait À DEUX, chacun sur son poste et son compte : le binôme lit le message et regarde l'écran,
   il ne touche ni la souris ni le clavier de l'autre. Chaque élève a SA version de chaque bug.
   Trois parties : A les bugs qui crient (message rouge), B les bugs silencieux (pas de message),
   C « je piège, tu répares » dans Thonny, puis le fichier rendu dans Classroom, coté sur 5.
   Même moteur que les autres fiches Python (questions `code` avec `essais`, input() simulé). */
const COURS = "python-bugs";
const PRESENTATION = "missions";   // blocs.js : cloche, mascotte, bulle, bravo
let EMAIL = "";
const CODE = s => `<pre class="code">${s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
const SORTIE = r => r.sortie.replace(/\s+$/,"");
const DERNIERE = r => SORTIE(r).split("\n").pop().replace(/\s+/g," ").trim();
// Une case peut porter son « ne fais pas » : {geste:"…", attention:"⚠️ …"}, un encadré sous la case, jamais dans son texte.
const CASES = (...l) => `<ol class="etapes">${l.map(x => typeof x === "string" ? `<li><label><input type="checkbox"><span>${x}</span></label></li>` : `<li><label><input type="checkbox"><span>${x.geste}</span></label><p class="attention">${x.attention}</p></li>`).join("")}</ol>`;
const EXECUTER = `Clique sur <span class="chemin">▶ <b>Exécuter</b></span> (ou <b>Ctrl + Enter</b>).`;
const BINOME = `<b>Montre ton écran</b> à ton binôme : dis-lui quel était le bug.`;
const DOIT = t => `<div class="encart"><p><b>Ce que le programme doit faire :</b> ${t}</p></div>`;
const LIGNE_ROUGE = "Lis la <b>ligne rouge</b> : elle donne le numéro de la ligne et le nom de l'erreur.";

/* Les cinq familles de bugs, affichées dans la partie C et dans l'aide-mémoire de la page. */
const FAMILLES = ["Signe oublié : guillemet, parenthèse ou virgule (SyntaxError)", "Nom mal écrit (NameError)",
                  "Texte au lieu de nombre (TypeError, ou un résultat fou)", "Mauvais calcul (aucun message rouge)",
                  "Lignes dans le mauvais ordre"];
const LISTE_FAMILLES = `<div class="encart"><p><b>Les cinq familles de bugs :</b></p><ol>${FAMILLES.map(f => `<li>${f}</li>`).join("")}</ol></div>`;

/* A1. Un signe oublié : SyntaxError. Le print doit garder la boîte (pas de réponse écrite en dur). */
const signe = (depart, attendu, boite) => ({
  extra: DOIT(`afficher <b>${attendu}</b>.`),
  coince:["La ligne rouge donne un numéro de ligne : le signe oublié est sur cette ligne, ou juste avant.",
          "Un texte s'ouvre ET se ferme par un guillemet. Une parenthèse ouverte se referme.",
          "Dans print( ), les morceaux sont séparés par une virgule."],
  q:{ type:"code", q:"Répare le programme : un seul signe manque.", depart,
      test: r => r.erreur ? (r.erreur.type==="SyntaxError" ? "SyntaxError : il manque encore un signe. Regarde la ligne indiquée : guillemets, parenthèses, virgules."
                           : "Lis la <b>ligne rouge</b> : son numéro te dit où chercher.")
               : !new RegExp("print\\([^\\n]*\\b"+boite+"\\b").test(r.code.replace(/"[^"\n]*"/g,'""')) ? `Garde la boîte ${boite} dans le print : c'est elle qui porte le nombre.`
               : DERNIERE(r)===attendu ? true
               : `La console affiche « ${DERNIERE(r)} ». On attend « ${attendu} » : il manquait un seul signe, le reste était juste.`,
      juste:"Une SyntaxError, c'est un signe qui manque : Python n'a même pas commencé à exécuter le programme." } });

/* A2. Un nom mal écrit : NameError. Créer une deuxième boîte au mauvais nom n'est pas une réparation. */
const nom = (depart, attendu, faux, bon) => ({
  extra: DOIT(`afficher <b>${attendu}</b>.`),
  coince:["NameError veut dire : Python ne connaît pas ce nom. La ligne rouge cite le nom qu'il ne trouve pas.",
          "Compare ce nom, lettre par lettre, à celui de la boîte créée plus haut.",
          "Pour Python, une majuscule change le nom : Vies et vies sont deux boîtes différentes."],
  q:{ type:"code", q:"Répare le programme : un nom est mal écrit.", depart,
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "NameError : Python ne connaît pas ce nom. Compare-le, lettre par lettre, au nom de la boîte créée plus haut."
                           : "Lis la <b>ligne rouge</b> : son numéro te dit où chercher.")
               : new RegExp("\\b"+faux+"\\b").test(r.code) ? `Le nom ${faux} est encore là. Corrige le nom mal écrit au lieu de créer une deuxième boîte : la bonne s'appelle ${bon}.`
               : DERNIERE(r)===attendu ? true
               : `La console affiche « ${DERNIERE(r)} ». On attend « ${attendu} » : touche seulement au nom mal écrit.`,
      juste:"Une NameError, c'est un nom que Python ne connaît pas : une faute de frappe, ou une majuscule en trop." } });

/* A3. Texte au lieu de nombre : TypeError. Deux essais : le nombre tapé change, le résultat aussi. */
const type_ = (depart, tapes, attendus, aide) => ({
  extra: DOIT(`on tape <b>${tapes[0]}</b>, il affiche <b>${attendus[0]}</b> ; on tape <b>${tapes[1]}</b>, il affiche <b>${attendus[1]}</b>.`),
  coince:["TypeError veut dire : Python ne peut pas faire cette opération entre un texte et un nombre.",
          "input( ) rend toujours un TEXTE, même si on tape des chiffres.", aide],
  q:{ type:"code", q:"Répare le programme : un texte est pris pour un nombre.", depart, essais:tapes.map(t => [t]),
      test: r => r.erreur ? (r.erreur.type==="TypeError" ? "TypeError : un texte et un nombre ne se mélangent pas. D'où vient le texte ? Que rend input( ) ?"
                           : r.erreur.type==="ValueError" ? "ValueError : int( ) a reçu autre chose qu'un nombre entier. Entoure seulement le input( )."
                           : "Lis la <b>ligne rouge</b> : son numéro te dit où chercher.")
               : r.essais.every((x,i) => DERNIERE(x)===attendus[i]) ? true
               : `Avec ${tapes[0]}, la console affiche « ${DERNIERE(r.essais[0])} ». On attend « ${attendus[0]} ».`,
      juste:"Une TypeError, c'est un texte là où Python attend un nombre (ou l'inverse)." } });

/* B1. Le bug silencieux : un texte multiplié. Prédire AVANT d'exécuter. */
const fou = (n, k) => ({
  extra: CODE(`pieces = input("Combien de pièces ? ")\nscore = pieces * ${k}\nprint(score)`) +
         `<p>Le joueur veut ${k} points par pièce. On tape <b>${n}</b>.</p>`,
  q:{ type:"qcm", q:`Prédis, sans exécuter : on tape ${n}. Qu'affiche la dernière ligne de la console ?`,
      c:[String(n).repeat(k), String(n*k), "Une ligne rouge TypeError", `${n} * ${k}`],
      p:[null, `${n*k}, ce serait ${n} × ${k} avec un NOMBRE. Mais que rend input( ) ?`,
         "Pas de ligne rouge ici : Python sait multiplier un texte par un nombre… à sa façon.",
         "Python fait le calcul : il n'affiche pas l'opération telle quelle."],
      juste:`input( ) rend le TEXTE "${n}". Un texte × ${k}, c'est le texte répété ${k} fois : ${String(n).repeat(k)}. Aucun message rouge : c'est un bug silencieux. Avec int(input( )), on aurait ${n*k}.` } });

/* B2. Le mauvais calcul : aucun message, un résultat faux. La réparation garde les boîtes. */
const calcul = (depart, quoi, attendu, motif, garde) => ({
  extra: DOIT(`${quoi} Il doit afficher <b>${attendu}</b>.`),
  coince:["Pas de ligne rouge : Python a fait exactement ce qui est écrit. C'est ce qui est écrit qui est faux.",
          "Exécute, puis compare ce qui s'affiche avec ce qui est attendu.",
          "Relis chaque calcul en le disant à voix basse à ton binôme : le signe dit-il ce que la phrase demande ?"],
  q:{ type:"code", q:"Répare le programme : il s'exécute, mais le résultat est faux.", depart,
      test: r => r.erreur ? "Tu as créé une ligne rouge : le programme de départ s'exécutait. Lis-la, puis change une seule chose."
               : DERNIERE(r)!==attendu ? `La console affiche « ${DERNIERE(r)} ». On attend « ${attendu} » : quel signe ne dit pas ce que la phrase demande ?`
               : !motif.test(r.code) ? `Le résultat est bon, mais garde ${garde} dans le calcul : change seulement le signe.`
               : true,
      juste:"Un bug silencieux ne donne aucun message : on le trouve en comparant ce qui s'affiche avec ce qui est attendu." } });

/* B3. Les lignes dans le mauvais ordre. `lignes` est donné dans le bon ordre ; la page les mélange. */
const bonOrdre = (lignes, quoi, attendu) => ({
  extra: DOIT(`${quoi} Il doit afficher <b>${attendu}</b>.`),
  coince:["Python exécute les lignes de haut en bas, une à la fois.",
          "Une boîte doit être créée AVANT d'être utilisée : sinon, NameError.",
          "Deux calculs dans l'autre ordre donnent un autre résultat, sans aucun message. Relis la phrase : qu'est-ce qui arrive en premier ?"],
  q:{ type:"ordre", q:"Remets les lignes dans l'ordre, puis exécute.", lignes,
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "NameError : une boîte est utilisée avant d'être créée. Quelle ligne doit venir en premier ?"
                           : "Lis la <b>ligne rouge</b> : son numéro te dit où chercher.")
               : DERNIERE(r)===attendu ? true
               : `La console affiche « ${DERNIERE(r)} ». On attend « ${attendu} » : quelle ligne s'exécute trop tôt ?`,
      juste:"Le même programme, dans un autre ordre, fait autre chose. L'ordre des lignes fait partie du programme." } });

/* B4. Deux bugs dans le même programme : un qui crie, un silencieux. */
const deux = (depart, quoi, tapes, attendus) => ({
  extra: DOIT(`${quoi} On tape <b>${tapes[0]}</b>, il affiche <b>${attendus[0]}</b> ; on tape <b>${tapes[1]}</b>, il affiche <b>${attendus[1]}</b>.`),
  coince:["Commence par le bug qui crie : la ligne rouge te donne sa ligne et son nom.",
          "Quand il n'y a plus de ligne rouge, ce n'est pas fini : compare ce qui s'affiche avec ce qui est attendu.",
          "Change une seule chose à la fois, puis exécute."],
  q:{ type:"code", q:"Répare le programme : deux bugs, un qui crie et un silencieux.", depart, essais:tapes.map(t => [t]),
      test: r => r.erreur ? `${r.erreur.type} : le premier bug crie encore. Lis la <b>ligne rouge</b>, répare, puis exécute.`
               : r.essais.every((x,i) => DERNIERE(x)===attendus[i]) ? true
               : `Plus de ligne rouge, mais avec ${tapes[0]} la console affiche « ${DERNIERE(r.essais[0])} ». On attend « ${attendus[0]} » : il reste le bug silencieux.`,
      juste:"Plus de ligne rouge ne veut pas dire « ça marche » : on vérifie toujours le résultat." } });

/* C1. Reconnaître la famille d'un bug caché dans « Le score ». */
const SCORE = `pieces = int(input("Combien de pièces ? "))\nscore = pieces * 10\nprint(score)`;
const famille = (ligne, bonne, pieges, juste) => ({
  q:{ type:"qcm", q:`Un élève a caché ce bug dans « Le score » : il a écrit ${ligne}. De quelle famille est ce bug ?`,
      c:[FAMILLES[bonne]].concat(pieges.map(([k]) => FAMILLES[k])), p:[null].concat(pieges.map(([,t]) => t)), juste } });

/* C2. Expliquer la méthode avec ses mots : texte à trous, puis une phrase libre (la même pour les trois versions). */
const PHRASE_METHODE = "comment as-tu trouvé le bug caché par ton binôme ?";
const methode = (texte, mots, pieges) => ({ q:{ type:"trous", q:"Complète la méthode avec les mots de la banque.", texte, mots, pieges,
  phrase:PHRASE_METHODE, juste:"C'est la méthode de tous les programmeurs : exécuter, lire, comparer, changer une chose à la fois." } });

/* C3. La grille du rendu, avec le nombre de la version de l'élève. */
const RENDU_V = [{n:7,r:70},{n:3,r:30},{n:6,r:60}];
const rendre = ({n,r}) => ({
  extra:`<div class="encart"><p><b>Grille — sur 5.</b> Le professeur ouvre ton fichier, l'exécute et lit tes commentaires.</p><table>
  <tr><th>Dans ton fichier</th><th>Points</th></tr>
  <tr><td>Il s'appelle <b>02_Le-bug_</b> suivi de ton nom, et finit par .py.</td><td>1</td></tr>
  <tr><td>F5, puis on tape <b>${n}</b> : le programme réparé s'exécute sans ligne rouge et affiche <b>${r}</b>.</td><td>1</td></tr>
  <tr><td>Ligne 1, <code># Bug caché :</code> la famille du bug que TU avais caché, et sa ligne.</td><td>1</td></tr>
  <tr><td>Ligne 2, <code># Trouvé par :</code> le prénom de ton binôme, et ce qui l'a mis sur la piste (la ligne rouge, ou le résultat).</td><td>1</td></tr>
  <tr><td>Ligne 3, <code># Réparation :</code> ce qui a été changé, avec tes mots.</td><td>1</td></tr></table>
  <p class="stop">Pas de copier-coller du voisin. Des commentaires copiés sur un autre élève, c'est 0 sur 5, pour les deux fichiers.</p></div>` });

const BLOCS = [
  { partie:"A — Les bugs qui crient", titre:"Le signe oublié", min:4,
    bulle:"Un bug, c'est une erreur dans un programme. Certains crient : Python affiche une ligne rouge.",
    veux:"Réparer un programme arrêté par une SyntaxError.",
    fais:CASES("Assieds-toi <b>avec ton binôme</b> : chacun ouvre ce cours sur son poste.", EXECUTER, LIGNE_ROUGE,
               "Répare <b>le signe</b> qui manque, puis exécute à nouveau.", BINOME),
    ...signe(`vies = 3\nprint("Il te reste", vies, "vies)`, "Il te reste 3 vies", "vies"),
    variantes:[signe(`score = 50\nprint("Ton score :", score`, "Ton score : 50", "score"),
               signe(`pieces = 4\nprint("Tu as" pieces, "pièces")`, "Tu as 4 pièces", "pieces")] },

  { partie:"A — Les bugs qui crient", titre:"Le nom mal écrit", min:4,
    bulle:"Python ne devine rien : une lettre de travers, et il ne reconnaît plus la boîte.",
    veux:"Réparer un programme arrêté par une NameError.",
    fais:CASES(EXECUTER, LIGNE_ROUGE, "Trouve <b>le nom</b> que Python ne connaît pas, corrige-le, puis exécute.", BINOME),
    ...nom(`score = 40\nbonus = 10\nscore = score + bonnus\nprint(score)`, "50", "bonnus", "bonus"),
    variantes:[nom(`vies = 3\ndegats = 1\nvies = Vies - degats\nprint(vies)`, "2", "Vies", "vies"),
               nom(`pieces = 6\nprix = 2\nreste = pieces - pris\nprint(reste)`, "4", "pris", "prix")] },

  { partie:"A — Les bugs qui crient", titre:"Texte ou nombre ?", min:5, indices:true,
    bulle:"Un texte et un nombre ne se mélangent pas. D'où vient le texte ?",
    veux:"Réparer un programme arrêté par une TypeError.",
    fais:CASES(EXECUTER, LIGNE_ROUGE, "Trouve <b>d'où vient le texte</b>, répare, puis exécute.", BINOME),
    ...type_(`pieces = input("Combien de pièces ? ")\nscore = pieces + 5\nprint(score)`, ["7","2"], ["12","7"],
             "Pour obtenir un nombre : int( ) autour du input( ), parenthèses comprises."),
    variantes:[type_(`vies = input("Combien de vies ? ")\nvies = vies - 1\nprint(vies)`, ["3","5"], ["2","4"],
                     "Pour obtenir un nombre : int( ) autour du input( ), parenthèses comprises."),
               type_(`score = int(input("Ton score ? "))\nprint("Score final : " + score)`, ["40","15"], ["Score final : 40","Score final : 15"],
                     "Ici score est bien un nombre : c'est le + du print qui le colle à un texte. Dans print( ), on sépare un texte et un nombre par une virgule.")] },

  { partie:"B — Les bugs silencieux", titre:"Le score fou", min:3,
    bulle:"Les pires bugs ne crient pas. Le programme s'exécute… et donne n'importe quoi.",
    veux:"Prédire ce qu'affiche un programme qui s'exécute sans ligne rouge, mais qui a un bug.",
    fais:CASES("Lis <b>le programme</b> ci-dessous, ligne par ligne.", "Dis <b>ta prédiction</b> à ton binôme, à voix basse. Il te dit la sienne.",
               "Clique sur <span class=\"chemin\">✅ <b>C'est vérifié</b></span> : réponds seul à la question."),
    coince:["Que rend input( ) : un texte ou un nombre ?", "Python sait multiplier un texte par un nombre : essaie d'imaginer \"ha\" * 3."],
    ...fou(7, 3), variantes:[fou(5, 2), fou(4, 3)] },

  { partie:"B — Les bugs silencieux", titre:"Le calcul à l'envers", min:5,
    bulle:"Aucune ligne rouge. Pourtant, le résultat est faux.",
    veux:"Trouver un bug silencieux en comparant ce qui s'affiche avec ce qui est attendu.",
    fais:CASES("Lis, dans l'encadré, <b>ce que le programme doit faire</b>.", EXECUTER, "Compare <b>ce qui s'affiche</b> avec ce qui est attendu.",
               "Répare <b>le calcul</b>, puis exécute.", BINOME),
    ...calcul(`vies = 5\ndegats = 2\nvies = vies + degats\nprint(vies)`, "Le joueur a 5 vies et en perd 2.", "3", /vies\s*=\s*vies\s*-\s*degats/, "les boîtes vies et degats"),
    variantes:[calcul(`score = 20\nscore = score + 2\nprint(score)`, "Le score vaut 20, puis il double.", "40", /score\s*=\s*(score\s*\*\s*2|2\s*\*\s*score)/, "la boîte score et le 2"),
               calcul(`pieces = 8\nbonus = 3\ntotal = pieces - bonus\nprint(total)`, "Le joueur a 8 pièces et reçoit un bonus de 3.", "11", /total\s*=\s*(pieces\s*\+\s*bonus|bonus\s*\+\s*pieces)/, "les boîtes pieces et bonus")] },

  { partie:"B — Les bugs silencieux", titre:"Dans le bon ordre", min:4,
    bulle:"Les bonnes lignes, dans le mauvais ordre : encore un bug.",
    veux:"Remettre dans l'ordre les lignes d'un programme.",
    fais:CASES("Lis, dans l'encadré, <b>ce que le programme doit faire</b>.", "Glisse <b>les lignes</b> dans le bon ordre.", EXECUTER, BINOME),
    ...bonOrdre(["pieces = 4", "score = pieces * 10", "score = score + 5", `print("Score :", score)`],
             "Le joueur a 4 pièces. Chaque pièce vaut 10 points, PUIS il reçoit 5 points de bonus.", "Score : 45"),
    variantes:[bonOrdre(["vies = 3", "vies = vies - 1", "vies = vies * 2", `print("Vies :", vies)`],
                     "Le joueur a 3 vies. Il en perd 1, PUIS une potion double ses vies.", "Vies : 4"),
               bonOrdre(["score = 10", "score = score * 3", "score = score - 4", `print("Score :", score)`],
                     "Le score vaut 10. Il triple, PUIS le joueur perd 4 points.", "Score : 26")] },

  { partie:"B — Les bugs silencieux", titre:"Deux bugs à la fois", min:7, stop:true, indices:true,
    bulle:"Un bug peut en cacher un autre. Le premier crie, le second se tait.",
    veux:"Réparer un programme qui a deux bugs : un qui crie, un silencieux.",
    fais:CASES("Lis, dans l'encadré, <b>ce que le programme doit faire</b>.", EXECUTER+" Répare <b>le bug qui crie</b>.",
               "Exécute à nouveau : compare <b>ce qui s'affiche</b> avec ce qui est attendu.", "Répare <b>le bug silencieux</b>, puis exécute.", BINOME),
    ...deux(`pieces = input("Combien de pièces ? ")\nscore = pieces * 10\nprint("Score :", score`, "Chaque pièce vaut 10 points.", ["7","3"], ["Score : 70","Score : 30"]),
    variantes:[deux(`vies = int(input("Combien de vies ? "))\nvies = vies + 1\nprint("Il te reste", vie)`, "Le joueur perd 1 vie.", ["3","5"], ["Il te reste 2","Il te reste 4"]),
               deux(`pieces = int(input("Combien de pièces ? "))\nbonus = 5\ntotal = pieces - bonus\nprint("Total :" total)`, "Le joueur reçoit un bonus de 5 pièces.", ["4","10"], ["Total : 9","Total : 15"])] },

  { partie:"C — Je piège, tu répares", titre:"Je cache un bug dans « Le score »", min:8, stop:true,
    bulle:"À toi de jouer le méchant : cache UN bug pour ton binôme.",
    veux:"Cacher un seul bug, d'une des cinq familles, dans une copie de ton programme « Le score ».",
    fais:CASES(`Ouvre <b>Thonny</b> : touche Windows ⊞, tape Thonny, puis Enter.`,
               `Ouvre ton programme : <span class="chemin">menu <b>Fichier ▸ Ouvrir…</b></span> (ou <b>Ctrl + O</b>) ▸ <span class="chemin">Documents ▸ Python ▸ 02_Le-score_…</span> ▸ Ouvrir.`,
               `Fais-en une copie : <span class="chemin">menu <b>Fichier ▸ Enregistrer sous…</b></span> ▸ dans Nom du fichier, tape <b>02_Le-bug_Nom.py</b>, avec TON nom à la place de Nom ▸ Enregistrer.`,
               "Choisis <b>une famille</b> dans la liste ci-dessous, sans la dire à ton binôme.",
               {geste:"Cache <b>un seul bug</b> de cette famille dans le programme.", attention:"⚠️ Un seul bug, et pas de ligne effacée : ton binôme doit pouvoir le réparer."},
               `Exécute (<span class="chemin">▶</span> ou <b>F5</b>) : vérifie que <b>le bug est bien là</b>. Puis enregistre (<b>Ctrl + S</b>).`,
               "Clique sur <span class=\"chemin\">✅ <b>C'est vérifié</b></span> : réponds seul à la question."),
    vois:"Dans Thonny, l'onglet au-dessus de ton programme affiche 02_Le-bug_ suivi de ton nom.",
    extra: LISTE_FAMILLES + `<p>Le programme « Le score », sans bug :</p>` + CODE(SCORE),
    coince:["Pas de fichier 02_Le-score_ dans Documents ▸ Python : dans la fenêtre Ouvrir, tape 02_Le-score dans la case Rechercher, en haut à droite, puis Enter. Toujours rien : tape le programme de l'encadré dans un nouveau fichier.",
            "Tu as enregistré le bug dans 02_Le-score_ : annule avec Ctrl + Z jusqu'au programme sans bug, Ctrl + S, puis reprends à Enregistrer sous…",
            "Ton bug ne se voit pas à l'exécution : choisis-en un autre, ou un autre nombre à taper."],
    ...famille("score = pieces + 10", 3, [[0,"Aucun signe ne manque : Python exécute cette ligne sans ligne rouge."],[1,"Tous les noms sont bien écrits : pieces et score existent."],[4,"Les lignes sont à leur place : c'est le calcul lui-même qui est faux."]],
               "Le + à la place du × ne donne aucun message : avec 7, le programme affiche 17 au lieu de 70. C'est un mauvais calcul."),
    variantes:[famille(`pieces = input("Combien de pièces ? ")`, 2, [[0,"Les guillemets et les parenthèses sont tous là."],[3,"Le calcul pieces * 10 est le bon : c'est ce qu'il reçoit qui ne va pas."],[1,"Tous les noms sont bien écrits."]],
                       "Sans int( ), pieces est un texte : avec 7, le programme affiche 7777777777. C'est un texte au lieu d'un nombre."),
               famille("print(scor)", 1, [[0,"Les parenthèses sont là : aucun signe ne manque."],[3,"Le calcul n'a pas changé."],[2,"score est bien un nombre : c'est son nom qui est mal écrit dans le print."]],
                       "Python ne connaît aucune boîte scor : NameError. C'est un nom mal écrit.")] },

  { partie:"C — Je piège, tu répares", titre:"Je répare le piège de mon binôme", min:10, stop:true,
    bulle:"Échangez vos places. Le chasseur répare, l'auteur regarde et se tait.",
    veux:"Réparer le bug caché par ton binôme, puis écrire dans ton fichier comment il a été trouvé.",
    fais:CASES("<b>Échangez vos places</b> : tu t'assieds devant le Thonny de ton binôme, il s'assied devant le tien.",
               {geste:"<b>Chasse le bug</b> : exécute (F5), lis, compare avec 7 → 70, répare, exécute.", attention:"⚠️ L'auteur du piège regarde. S'il est interrogé, il répond seulement : « relis la ligne rouge » ou « compare avec ce qui est attendu »."},
               "Bug réparé : <b>explique à l'auteur</b> comment tu l'as trouvé. Puis reprenez vos places.",
               "Dans TON fichier, tout en haut, écris <b>trois commentaires</b> (le # est AltGr + 3) : <code># Bug caché :</code> … <code># Trouvé par :</code> … <code># Réparation :</code> …",
               "Exécute (F5) pour vérifier, puis enregistre (<b>Ctrl + S</b>).",
               "Clique sur <span class=\"chemin\">✅ <b>C'est vérifié</b></span> : complète la méthode."),
    vois:"Dans Thonny, ton fichier 02_Le-bug_ s'exécute : tu tapes 7, la console du bas affiche 70.",
    extra:`<div class="encart"><p><b>Tes trois commentaires, tout en haut de ton fichier :</b></p>
  <p><code># Bug caché :</code> la famille du bug que tu avais caché, et sa ligne.<br><code># Trouvé par :</code> le prénom de ton binôme, et ce qui l'a mis sur la piste.<br><code># Réparation :</code> ce qui a été changé, avec tes mots.</p></div>`,
    coince:["Le bug de ton binôme est introuvable après 5 minutes : il te donne la FAMILLE du bug, pas la ligne.",
            "Ton binôme a caché plusieurs bugs : répare-les un par un, en commençant par celui qui crie.",
            "Le # est AltGr + 3. Une ligne qui commence par # n'est pas exécutée : elle est écrite pour celui qui lit le programme."],
    ...methode("Je commence par ___ le programme. S'il y a une ligne rouge, je lis le ___ de la ligne. S'il n'y en a pas, je compare ce qui s'affiche avec ce qui est ___.",
               ["exécuter","numéro","attendu"], ["effacer","titre"]),
    variantes:[methode("Une ligne rouge donne le ___ de l'erreur et sa ___. Un bug silencieux n'en donne pas : je dois ___ le résultat.",
                       ["nom","ligne","vérifier"], ["couleur","deviner"]),
               methode("Pour réparer, je change ___ chose à la fois, puis j'___ à nouveau. Si rien ne s'arrange, je ___ ma modification.",
                       ["une seule","exécute","annule"], ["chaque","enregistre"])] },

  { partie:"C — Je piège, tu répares", titre:"Rendre « Le bug » dans Classroom", min:4, stop:true, cle:"rendu",
    bulle:"Ton fichier « Le bug », réparé et commenté, part chez le professeur. Il est coté sur 5.",
    veux:"Rendre ton fichier 02_Le-bug, réparé et commenté, dans Classroom, pour qu'il soit coté sur 5.",
    fais:CASES(`Lis la <b>grille</b> ci-dessous : vérifie chaque ligne dans ton fichier.`,
               `Dans Thonny, enregistre une dernière fois : <span class="chemin">menu <b>Fichier ▸ Enregistrer</b></span> (ou <b>Ctrl + S</b>).`,
               `Ouvre un nouvel onglet (<b>Ctrl + T</b>), tape <b>classroom.google.com</b>, puis appuie sur <b>Enter</b>.`,
               `Clique sur le cours de <b>Logique et programmation</b> ▸ onglet <span class="chemin">Travaux et devoirs</span> ▸ le devoir <b>Python — La chasse aux bugs</b> ▸ <span class="chemin">Afficher le devoir</span>.`,
               `À droite, dans <span class="chemin">Vos devoirs</span> : <b class="chemin">＋ Ajouter ou créer ▸ Fichier ▸ Parcourir</b>.`,
               `Dans la fenêtre : <span class="chemin">Documents ▸ double-clic sur Python ▸ clic sur 02_Le-bug_… ▸ Ouvrir</span>, puis <b class="chemin">Importer</b>.`,
               `Ton fichier apparaît sous Vos devoirs : clique sur <b class="chemin">Rendre le devoir ▸ Rendre le devoir</b>.`),
    vois:"Dans Classroom, le devoir affiche « Remis » et ton fichier 02_Le-bug_… .py.",
    coince:["Pas de devoir « Python — La chasse aux bugs » dans Travaux et devoirs : vérifie que tu es dans le cours de Logique et programmation. Toujours rien : sonne la cloche 🔔.",
            "Ton fichier n'est pas dans Documents ▸ Python : dans la fenêtre, tape 02_Le-bug dans la case Rechercher, en haut à droite, puis Enter.",
            "Le bouton dit « Marquer comme terminé » : ton fichier n'est pas joint. Reprends à l'étape ＋ Ajouter ou créer.",
            "Tu as rendu le mauvais fichier (02_Le-score) : clique sur Annuler l'envoi ▸ Annuler l'envoi, retire-le avec la ✕ à droite de son nom, puis reprends à l'étape ＋ Ajouter ou créer."],
    ...rendre(RENDU_V[0]),
    variantes:[rendre(RENDU_V[1]), rendre(RENDU_V[2])],
    q:{ type:"rapport", q:"Ton fichier « Le bug » est-il rendu ?",
        confirmation:"J'ai rendu 02_Le-bug, réparé et commenté, dans Classroom : je vois « Remis ».",
        trace:"rendu Classroom : 02_Le-bug réparé et commenté",
        juste:"Le professeur ouvre ton fichier, l'exécute avec ton nombre, lit tes trois commentaires et le cote sur 5." } }
];

const FIN = {
  titre:"🎉 Chasse aux bugs terminée !",
  bulle:"Bravo ! Tu sais lire une ligne rouge, et tu te méfies des programmes qui se taisent.",
  texte:"Tu connais cinq familles de bugs : le signe oublié, le nom mal écrit, le texte au lieu du nombre, le mauvais calcul, les lignes dans le mauvais ordre. Et une méthode : exécuter, lire, comparer avec ce qui est attendu, changer une seule chose à la fois.",
  plus:"Au choix, pour aller plus loin : (1) cache DEUX bugs de familles différentes dans une nouvelle copie de « Le score » et propose-la à un autre binôme. (2) Aide un binôme voisin qui cherche encore : tu poses des questions, tu ne montres pas la ligne. (3) Reprends ton programme « Les vies » et cherche ce qui se passe si on enlève un seul signe.",
  citation:{
    texte:"Déboguer est deux fois plus difficile que d'écrire le programme. Alors, si vous l'écrivez aussi astucieusement que possible, comment ferez-vous pour le déboguer ?",
    auteur:"Brian W. Kernighan et P. J. Plauger", source:"The Elements of Programming Style (2e édition, 1978), traduit de l'anglais",
    lien:"C'est pour cela qu'on écrit des programmes simples, avec des noms clairs et des commentaires : pour celui qui devra les réparer."
  }
};

/* ===== Python dans la page : pas-a-pas/python-editeur.js ===== */
const PYTHON_INPUT = true;   // input( ) lit les réponses de q.essais, comme dans la console de Thonny
const ERREURS_FICHE = {
  ValueError:"int( ) a reçu un texte qui n'est pas un nombre entier.",
  EOFError:"le programme veut lire une réponse de plus que ce qui a été tapé : un input( ) de trop ?"
};

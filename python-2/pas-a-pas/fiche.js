/* Le moteur et le contenu de la fiche « python-2 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie,
   alors que la même page sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de la séance 2 =====
   Pas de fiche élève : blocs écrits depuis le déroulé de « LogProg04_PROF_Premiers-pas-en-Python ».
   Exercices inspirés de la leçon 1E de Cercles informatiques (CEMC, Université de Waterloo,
   CC BY-NC-SA 3.0), réécrits et exécutés dans la page. Thonny reste pour « Les vies ».
   Chaque bloc : veux (le but, une phrase) / fais (les cases, à l'impératif) / vois (« À vérifier »), bulle, stop, minutes, coince (les pièges de CE bloc), et une preuve :
   QCM (bonne réponse TOUJOURS en premier, mélangée à l'affichage, p = ce qu'on dit au piège),
   saisie (ok = test, faux = texte ou fonction de la réponse), code (depart = programme de départ,
   test(r) = true ou l'explication ; r = { sortie, erreur:{type,ligne,message}, vars, code }),
   ordre (lignes à remettre dans l'ordre, puis test(r) comme code), trace (code, vars, valeurs
   après chaque ligne, aide par ligne) ou ligne (code, bonne = la ligne fautive, p par ligne). */
const COURS = "python-2";
const PRESENTATION = "missions";   // blocs.js : cloche, mascotte, bulle, bravo, sans « Je veux / Je fais / Je vois » (05/11/2026)
const CODE = s => `<pre class="code">${s}</pre>`;
const SORTIE = r => r.sortie.replace(/\s+$/,"");

/* ===== Variantes (contre la copie) =====
   Un bloc peut porter `variantes` : deux autres versions de sa preuve (même compétence, même
   difficulté, même format), écrites comme des morceaux de bloc qui remplacent ceux de la version 1.
   Chaque élève a la sienne, tirée de son adresse : un rechargement ou un autre poste la redonne.
   `cle` partage un tirage entre blocs et entre séances (« vies » : python-1 et python-2).
   Hors Apps Script : la version 1. Aperçu professeur : un bouton par version.
   « Les vies » : {D} (la valeur de départ), {K} (ce qu'on enlève) et {R} (le résultat)
   sont remplacés dans les textes ; les tests lisent LV. */
const VIES_V = [{d:3,k:1,r:2},{d:5,k:2,r:3},{d:6,k:2,r:4}];
let LV = VIES_V[0];
let EMAIL = "";
const hache = s => {   // FNV-1a brassé, comme hache_() dans Code.gs
  let h = 2166136261;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
};
const tirage = (cle, n) => n<2 || !EMAIL ? 1 : 1 + hache(EMAIL.toLowerCase()+"|"+cle) % n;
const VIES = CODE("vies = {D}\nvies = vies - {K}\nprint(vies)");

/* Une case par action, à l'impératif (style « missions » du Labo 07 et du Rat de ville). */
const CASES = (...l) => `<ol class="etapes">${l.map(x => `<li><label><input type="checkbox"><span>${x}</span></label></li>`).join("")}</ol>`;
const EXECUTER = `Clique sur <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`;

/* Les exercices à nombres variables : une fonction rend la partie du bloc qui change. */
const additionneur = n => {
  const somme = n*(n+1)/2, termes = Array.from({length:n},(_,i)=>i+1).join(" + ");
  return {
    vois:"Le programme affiche "+somme+".",
    q:{ type:"code", q:"Répare le programme.", depart:"print("+termes+" +)",
        test: r => r.erreur ? "Lis la ligne rouge : une SyntaxError, c'est un caractère de trop ou de moins. Regarde juste avant la parenthèse finale."
                 : SORTIE(r)===String(somme) ? true : "Python affiche « "+SORTIE(r)+" » : un nombre a disparu. ↺ Code de départ, et n'enlève qu'UN caractère.",
        juste:"Le + collé à la parenthèse n'avait rien après lui à additionner." } };
};
const bonjour = nom => ({
  titre:"Bonjour "+nom,
  vois:"Le programme affiche Bonjour "+nom+".",
  coince:["NameError : Python cherche une variable qui n'existe pas. "+nom+", c'est un texte ou un nom de variable ?",
          "Deux caractères à ajouter, pas à enlever."],
  q:{ type:"code", q:"Répare le programme.", depart:"nom = "+nom+'\nprint("Bonjour", nom)',
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "NameError, ligne "+r.erreur.ligne+" : Python cherche une variable "+nom+". Un texte s'écrit entre guillemets." : "Lis la ligne rouge : il manque un guillemet ?")
               : SORTIE(r)==="Bonjour "+nom ? true : "Python affiche « "+SORTIE(r)+" ». Il doit afficher Bonjour "+nom+" : ↺ Code de départ et ajoute seulement deux guillemets.",
      juste:"Avec les guillemets, "+nom+" est un texte rangé dans la boîte nom." } });
const fr = x => String(x).replace(".", ",");
const soldes = (prix, pct) => {
  const faux = pct/100, garde = (100-pct)/100, reste = prix*(100-pct)/100;
  return {
    fais:CASES(`Lis : un pull à ${prix} €, soldé à −${pct} %, doit coûter ${reste} €.`, EXECUTER,
               `Compare le résultat avec ${reste}.`, "Trouve la ligne qui calcule faux, puis corrige-la."),
    vois:`Le programme affiche ${reste}.0.`,
    extra:`<div class="encart"><h3>Pourquoi ${reste}.0 ?</h3><p>Dès qu'un calcul utilise un nombre à virgule (${garde}), Python donne un nombre à virgule : ${reste}.0. Une virgule s'écrit avec un POINT en Python.</p></div>`,
    coince:[`prix * ${faux}, c'est ${pct} % du prix : ${fr(prix*faux)} €. Ce qu'on garde, c'est ${100-pct} % du prix.`,
            `${100-pct} %, c'est ${garde} : un seul caractère à changer.`],
    q:{ type:"code", q:"Corrige le calcul.", depart:`prix = ${prix}\n# les soldes : moins ${pct} %\nprix = prix * ${faux}\nprint(prix)`,
        test: r => r.erreur ? "Lis la ligne rouge. Une virgule s'écrit avec un point en Python : "+garde+", pas "+fr(garde)+"."
                 : !/\bprix\b\s*\*/.test(r.code.split("\n").slice(1).join("\n")) && !/\*\s*\bprix\b/.test(r.code.split("\n").slice(1).join("\n")) ? "Calcule à partir de prix : le programme doit marcher pour un autre prix."
                 : SORTIE(r).startsWith("(") ? "Python affiche « "+SORTIE(r)+" » : avec une virgule, il voit deux nombres. Un nombre à virgule s'écrit avec un POINT : "+garde+"."
                 : Math.abs(r.vars.prix-reste)<1e-9 ? true
                 : "Python affiche « "+SORTIE(r)+" » : on veut "+reste+". Quelle part du prix garde-t-on après −"+pct+" % ?",
        juste:faux+" gardait "+pct+" % du prix au lieu d'en enlever "+pct+" %. Aucune ligne rouge : c'est à toi de comparer avec le résultat attendu." } };
};

const BLOCS = [
  { partie:"A — Se remettre en route", titre:"Le quiz « Python — je révise »", min:8, stop:true,
    bulle:"Re-bonjour ! On se remet en route avec un petit quiz.",
    veux:"Te rappeler print, les variables et = avant d'aller plus loin. Rien n'est coté.",
    fais:CASES(`Clique sur le lien <a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Python — je révise</a> : il s'ouvre dans un nouvel onglet.`,
               `Clique sur <span class="chemin">l'onglet Quiz ▸ Commencer le quiz</span>.`,
               "Réponds aux cinq questions.",
               "Reviens à cette fiche (son onglet, en haut de Chrome) et regarde le projecteur : le professeur reprend la question la plus ratée."),
    vois:"Ton score sur 5, et la trace au projecteur.",
    coince:["Garde deux onglets : celui-ci pour la fiche, l'autre pour le quiz. Pour revenir à la fiche : clic sur son onglet, en haut de Chrome.",
            "Le lien ne s'ouvre pas : nouvel onglet (Ctrl + T) ▸ barre d'adresse ▸ root75.github.io/campin-public/python-je-revise/ ▸ Enter.",
            "Un trou de mémoire : l'onglet « L'essentiel » de la même page redit tout en cinq lignes."],
    q:{ type:"qcm", q:"Dans vies = vies - 1, que fait Python ?",
        c:["Il calcule à droite, puis il range à gauche.","Il vérifie que vies est égal à vies - 1.","Il range 1 dans vies.","Il affiche vies."],
        p:[null,"= n'est pas une égalité : c'est la flèche ← du logigramme. À droite on calcule, à gauche on range.","1 fait partie du calcul : vies - 1 est calculé d'abord, puis rangé dans vies.","Rien ne s'affiche sans print."] },
    variantes:[
      { q:{ type:"qcm", q:"Après x = 5 puis x = x + 2, que vaut x ?",
            c:["7","5","2","x + 2"],
            p:[null,"5, c'était la valeur d'avant : la 2e ligne la remplace.","2, c'est ce qu'on ajoute, pas le résultat.","Python calcule x + 2 avant de ranger : la boîte contient un nombre."] } },
      { q:{ type:"qcm", q:"Que fait print(score) ?",
            c:["Il affiche la valeur rangée dans score.","Il affiche le mot score.","Il range une valeur dans score.","Il efface score."],
            p:[null,"Pour afficher le mot, il faut des guillemets : print(\"score\").","Ranger, c'est le = : à droite on calcule, à gauche on range.","print n'efface rien : il montre."] } } ] },

  { partie:"B — Lire les messages d'erreur", titre:"La règle de toute la leçon", min:2,
    bulle:"Aujourd'hui, tu deviens réparateur de programmes.",
    veux:"Réparer un programme en lisant, pas en changeant au hasard.",
    fais:CASES("Lis l'encadré ci-dessous.",
               "Devant un programme cassé : exécute, lis la ligne rouge, dis à ton voisin quelle ligne est fautive, et SEULEMENT ensuite touche au code."),
    vois:"Tu sais nommer les trois sortes d'erreurs.",
    extra:`<div class="encart"><p>Trois sortes d'erreurs : <b>SyntaxError</b> (l'écriture est cassée), une erreur <b>pendant l'exécution</b> (NameError : un nom inconnu), et l'erreur <b>de logique</b> (pas de ligne rouge, mais le résultat est faux).</p></div>`,
    coince:["Perdu dans un programme : bouton ↺ Code de départ, sous le cadre."],
    q:{ type:"qcm", q:"Devant un programme qui ne marche pas, je commence par :",
        c:["Lire le message et trouver la ligne fautive.","Changer des caractères au hasard.","Tout effacer et recommencer.","Cliquer sur ↺ Code de départ."],
        p:[null,"Au hasard, ça finit parfois par marcher, mais tu ne sauras pas pourquoi. Le message dit où chercher.","Tu perdrais ce qui est juste : souvent, un seul caractère est faux.","↺ Code de départ, c'est quand tu t'es perdu : ça remet le programme cassé du départ."] } },

  { partie:"B — Lire les messages d'erreur", titre:"L'additionneur", min:5,
    bulle:"Une faute d'écriture : un seul caractère à trouver.",
    veux:"Réparer une faute d'écriture : un seul caractère.",
    fais:CASES(`Exécute le programme tel quel : <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`,
               "Lis la ligne rouge.", "Trouve le caractère fautif et corrige-le.", EXECUTER),
    coince:["SyntaxError : l'écriture est cassée. Regarde juste avant la parenthèse finale.",
            "Un seul caractère à enlever, rien à ajouter."],
    ...additionneur(10),
    variantes:[additionneur(8), additionneur(12)] },

  { partie:"B — Lire les messages d'erreur", min:5,
    bulle:"Cette fois, l'erreur arrive pendant l'exécution.",
    veux:"Réparer une erreur qui arrive pendant l'exécution. Deux caractères.",
    fais:CASES(`Exécute le programme tel quel : <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`,
               "Lis le nom de l'erreur.", "Dis à ton voisin quelle ligne est fautive.", "Corrige-la.", EXECUTER),
    ...bonjour("Joe"),
    variantes:[bonjour("Léa"), bonjour("Sam")] },

  { partie:"B — Lire les messages d'erreur", titre:"Quelle ligne cloche ?", min:3,
    bulle:"Pas de ligne rouge… et pourtant c'est faux !",
    veux:"Trouver une erreur de logique en lisant, sans exécuter.",
    fais:CASES("Lis le programme ligne par ligne, comme une trace.", "Clique sur la ligne fautive."),
    vois:"Le score doit valoir 15 : 10 points, plus un bonus de 5. Le programme affiche 5.",
    coince:["Aucune ligne rouge ici : le programme tourne, mais il calcule faux. C'est une erreur de logique.",
            "Fais la trace : que vaut score après chaque ligne ?"],
    q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["score = 10","bonus = 5","score = score - bonus","print(score)"], bonne:3,
        p:["score = 10 : le score de départ est bien 10.","bonus = 5 : le bonus vaut bien 5.",null,"print(score) affiche bien le score. Le problème est dans le calcul, juste avant."],
        juste:"Le signe − enlève le bonus au lieu de l'ajouter : score = score + bonus." },
    variantes:[
      { vois:"Le total doit valoir 24 : 3 objets à 8 €. Le programme affiche 11.",
        coince:["Aucune ligne rouge ici : le programme tourne, mais il calcule faux. C'est une erreur de logique.",
                "Fais la trace : que vaut total après chaque ligne ?"],
        q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["prix = 8","quantite = 3","total = prix + quantite","print(total)"], bonne:3,
            p:["prix = 8 : un objet coûte bien 8 €.","quantite = 3 : on en achète bien 3.",null,"print(total) affiche bien le total. Le problème est dans le calcul, juste avant."],
            juste:"Le + additionne le prix et la quantité au lieu de les multiplier : total = prix * quantite." } },
      { vois:"Le programme doit afficher la température après la baisse : 15. Il affiche 5.",
        coince:["Aucune ligne rouge ici : le programme tourne, mais il affiche faux. C'est une erreur de logique.",
                "Fais la trace : que vaut temperature après chaque ligne ? Et quelle boîte la dernière ligne affiche-t-elle ?"],
        q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["temperature = 20","baisse = 5","temperature = temperature - baisse","print(baisse)"], bonne:4,
            p:["temperature = 20 : la température de départ est bien 20.","baisse = 5 : la baisse vaut bien 5.","temperature - baisse = 15, rangé dans temperature : le calcul est juste.",null],
            juste:"Le calcul est juste, mais la dernière ligne affiche la mauvaise boîte : print(temperature)." } } ] },

  { partie:"B — Lire les messages d'erreur", titre:"Les soldes", min:6, stop:true,
    bulle:"Les soldes : le programme se trompe de prix.",
    veux:"Trouver une erreur de logique : pas de ligne rouge, mais un résultat faux.",
    ...soldes(20, 10),
    variantes:[soldes(30, 20), soldes(50, 10)] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Ouvrir mon fichier", min:3, stop:true, cle:"vies", variantes:[{},{}],
    bulle:"Retour dans Thonny : retrouve ton programme de Python 01.",
    veux:"Retrouver le programme de Python 01.",
    fais:CASES(`Appuie sur la touche <b>Windows</b> ⊞, tape <b>Thonny</b>, puis appuie sur <b>Enter</b>.`,
               `Dans Thonny : <span class="chemin">menu Fichier ▸ Ouvrir…</span> (ou <b>Ctrl + O</b>).`,
               `<span class="chemin">Documents ▸ double-clic sur Python ▸ 01_Les-vies_Nom.py ▸ Ouvrir</span>.`,
               `Exécute : <span class="chemin">icône ▶ verte « Exécuter le script courant »</span> (ou <b>F5</b>).`),
    vois:"Tes trois lignes, comme le modèle ci-dessous, et {R} dans la console du bas.",
    extra: VIES,
    coince:["Ton fichier n'est pas là : recrée-le. Documents ▸ bouton Nouveau ▸ Dossier ▸ Python ; puis dans Thonny, Fichier ▸ Enregistrer sous… (Ctrl + Shift + S) ▸ 01_Les-vies_Nom.py, et tape les trois lignes du modèle.",
            "Thonny ne se lance pas : nouvel onglet (Ctrl + T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Enter. Tape les trois lignes du modèle dans la console de secours et exécute. Rien n’y est enregistré : sonne la cloche 🔔 ; le professeur vérifie le résultat et organise la sauvegarde. Puis reviens à cette fiche."],
    q:{ type:"qcm", q:"F5 : qu'affiche la console du bas ?",
        c:["{R}","{D}","vies","Un message d'erreur"],
        p:[null,"vies - {K} doit être rangé : vies = vies - {K}. Corrige, Ctrl+S, F5.","print(\"vies\") affiche le mot : enlève les guillemets, Ctrl+S, F5.","Lis le message, compare avec le modèle, corrige, Ctrl+S, F5."] } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Le casser : Vies", min:4,
    bulle:"On casse exprès, pour apprendre à réparer.",
    veux:"Voir que Python lit chaque lettre : Vies n'est pas vies.",
    fais:CASES("À la 3e ligne, remplace vies par <b>Vies</b> : print(Vies).",
               "Réponds à la question ci-dessous AVANT de faire F5.",
               "Puis F5 : lis le message d'erreur.",
               "Répare (vies en minuscules), puis F5."),
    vois:"Un message d'erreur, puis de nouveau {R} après la réparation.",
    coince:["Le message est long : lis la dernière ligne, c'est elle qui donne le nom de l'erreur."],
    q:{ type:"qcm", q:"Prédis : avec print(Vies), que va-t-il se passer ?",
        c:["Une erreur NameError : Python ne connaît pas Vies.","Il affiche {R}.","Il affiche Vies.","Une erreur SyntaxError."],
        p:[null,"La boîte s'appelle vies, en minuscules. Vies est un autre nom, que Python ne connaît pas.","Sans guillemets, Vies n'est pas un texte : c'est un nom de variable.","L'écriture est correcte : c'est le nom qui est inconnu. Ce n'est pas une faute de syntaxe."] },
    variantes:[
      { titre:"Le casser : vie", veux:"Voir que Python lit chaque lettre : vie n'est pas vies.",
        fais:CASES("À la 3e ligne, efface le s de vies : print(vie).",
                   "Réponds à la question ci-dessous AVANT de faire F5.",
                   "Puis F5 : lis le message d'erreur.",
                   "Répare (print(vies)), puis F5."),
        q:{ type:"qcm", q:"Prédis : avec print(vie), sans le s, que va-t-il se passer ?",
            c:["Une erreur NameError : Python ne connaît pas vie.","Il affiche {R}.","Il affiche vie.","Une erreur SyntaxError."],
            p:[null,"La boîte s'appelle vies, avec un s. vie est un autre nom, que Python ne connaît pas.","Sans guillemets, vie n'est pas un texte : c'est un nom de variable.","L'écriture est correcte : c'est le nom qui est inconnu. Ce n'est pas une faute de syntaxe."] } },
      { titre:"Le casser : prnt", veux:"Voir que Python lit chaque lettre : prnt n'est pas print.",
        fais:CASES("À la 3e ligne, efface le i de print : prnt(vies).",
                   "Réponds à la question ci-dessous AVANT de faire F5.",
                   "Puis F5 : lis le message d'erreur.",
                   "Répare (print(vies)), puis F5."),
        q:{ type:"qcm", q:"Prédis : avec prnt(vies), que va-t-il se passer ?",
            c:["Une erreur NameError : Python ne connaît pas prnt.","Il affiche {R}.","Il affiche vies.","Une erreur SyntaxError."],
            p:[null,"prnt n'est pas print : Python ne devine pas, il ne connaît pas ce nom.","Python ne connaît pas prnt : rien ne s'affiche.","L'écriture est correcte (un nom suivi de parenthèses) : c'est le nom qui est inconnu."] } } ] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Le casser : une parenthèse", min:4,
    bulle:"Une parenthèse de travers : quelle erreur ?",
    veux:"Reconnaître une faute d'écriture.",
    fais:CASES("À la 3e ligne, efface la dernière parenthèse : print(vies.",
               "Réponds à la question ci-dessous AVANT de faire F5.",
               "Puis F5 : lis le message d'erreur.",
               "Remets la parenthèse, puis F5."),
    vois:"Un message d'erreur, puis de nouveau {R} après la réparation.",
    coince:["La parenthèse ) est la touche à droite du 0, sans Shift."],
    q:{ type:"qcm", q:"Prédis : avec print(vies sans la parenthèse finale, quelle erreur ?",
        c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
        p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas la parenthèse manquante.","Rien ne s'affiche quand l'écriture est cassée."] },
    variantes:[
      { fais:CASES("À la 3e ligne, efface la parenthèse ouvrante et laisse un espace : print vies).",
                   "Réponds à la question ci-dessous AVANT de faire F5.",
                   "Puis F5 : lis le message d'erreur.",
                   "Répare (print(vies)), puis F5."),
        coince:["La parenthèse ( est la touche 5, sans Shift."],
        q:{ type:"qcm", q:"Prédis : avec print vies), sans la parenthèse ouvrante, quelle erreur ?",
            c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
            p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas la parenthèse manquante.","Rien ne s'affiche quand l'écriture est cassée."] } },
      { fais:CASES("À la 3e ligne, ajoute une parenthèse finale : print(vies)).",
                   "Réponds à la question ci-dessous AVANT de faire F5.",
                   "Puis F5 : lis le message d'erreur.",
                   "Enlève la parenthèse en trop (print(vies)), puis F5."),
        q:{ type:"qcm", q:"Prédis : avec print(vies)), une parenthèse en trop, quelle erreur ?",
            c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
            p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas qu'il faut ignorer la parenthèse en trop.","Rien ne s'affiche quand l'écriture est cassée."] } } ] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Commenter chaque ligne", min:6, stop:true,
    bulle:"Un programme que tout le monde comprend : explique chaque ligne.",
    veux:"Un programme que n'importe qui comprend en le lisant.",
    fais:CASES("Au-dessus de chaque ligne, ajoute une ligne qui commence par <b>#</b> et dit ce que fait la ligne.",
               `Enregistre : <span class="chemin">icône disquette « Enregistrer »</span> (ou <b>Ctrl + S</b>).`,
               `Exécute : <span class="chemin">icône ▶ verte</span> (ou <b>F5</b>).`,
               "Réponds ci-dessous. Ensuite, montre ton programme à ton voisin : il lit tes commentaires et te dit s'il comprend chaque ligne. Il ne les recopie pas : chacun écrit les siens, avec ses mots."),
    vois:"Six lignes : trois commentaires, trois instructions. La console affiche toujours {R}.",
    extra: CODE("# on range {D} dans la boîte vies\nvies = {D}\n# …\nvies = vies - {K}\n# …\nprint(vies)"),
    coince:["Le # est AltGr + 3.",
            "Pas d'idée de commentaire : dis ce que fait la ligne, comme dans le logigramme (on range, on calcule, on affiche)."],
    q:{ type:"qcm", q:"Avec tes trois commentaires, qu'affiche le programme ?",
        c:["{R}, comme avant : Python ignore ce qui suit #.","Les commentaires, puis {R}.","Une erreur.","Rien."],
        p:[null,"Les commentaires sont pour les humains : Python ne les affiche pas.","Si tu as une erreur, un # manque au début d'une ligne de commentaire.","print(vies) est toujours là : il affiche {R}."] },
    variantes:[
      { q:{ type:"qcm", q:"À quoi sert une ligne qui commence par # ?",
            c:["À expliquer le programme aux humains : Python l'ignore.","À afficher un texte.","À arrêter le programme.","À ranger une valeur."],
            p:[null,"Pour afficher, c'est print( ). Python n'affiche jamais un commentaire.","Le programme continue : Python saute simplement la ligne.","Ranger, c'est le = . Une ligne qui commence par # ne fait rien."] } },
      { q:{ type:"qcm", q:"Tu écris # devant print(vies). Qu'affiche le programme ?",
            c:["Rien : la ligne est devenue un commentaire.","{R}","# print(vies)","Une erreur."],
            p:[null,"La ligne print(vies) est devenue un commentaire : Python ne l'exécute plus.","Python n'affiche jamais un commentaire, même s'il contient print.","Un commentaire n'est jamais une erreur : Python l'ignore."] } } ] },

  { partie:"D — Rendre mon programme", titre:"Rendre mon fichier commenté dans Classroom", min:4, stop:true, cle:"vies", variantes:[{},{}],
    bulle:"Dernière mission : ton programme commenté part chez le professeur. Il est coté sur 5.",
    veux:"Rendre ton fichier 01_Les-vies, commenté, dans Classroom, pour qu'il soit coté sur 5.",
    fais:CASES(`Lis la grille ci-dessous : vérifie chaque ligne dans ton programme.`,
               `Relis tes trois commentaires : ce sont TES mots, pas ceux de ton voisin, et pas la ligne recopiée.`,
               `Dans Thonny, enregistre une dernière fois : <span class="chemin">menu Fichier ▸ Enregistrer</span> (ou <b>Ctrl + S</b>).`,
               `Ouvre un nouvel onglet (<b>Ctrl + T</b>), tape <b>classroom.google.com</b>, puis appuie sur <b>Enter</b>.`,
               `Clique sur le cours de <b>Logique et programmation</b> ▸ onglet <span class="chemin">Travaux et devoirs</span> ▸ le devoir <b>Python 02 — Les vies commenté</b> ▸ <span class="chemin">Afficher le devoir</span>.`,
               `À droite, dans <span class="chemin">Vos devoirs</span> : <span class="chemin">＋ Ajouter ou créer ▸ Fichier ▸ Parcourir</span>.`,
               `Dans la fenêtre : <span class="chemin">Documents ▸ double-clic sur Python ▸ clic sur 01_Les-vies_… ▸ Ouvrir</span>, puis <span class="chemin">Importer</span>.`,
               `Ton fichier apparaît sous Vos devoirs : clique sur <span class="chemin">Rendre le devoir ▸ Rendre le devoir</span>.`),
    vois:"Dans Classroom, le devoir affiche « Remis » et ton fichier 01_Les-vies_… .py.",
    extra:`<div class="encart"><p><b>Grille — sur 5.</b> Le professeur ouvre ton fichier, l'exécute et lit tes commentaires.</p><table>
  <tr><th>Dans ton programme</th><th>Points</th></tr>
  <tr><td>F5 : le programme s'exécute sans message rouge et affiche <b>{R}</b>.</td><td>1</td></tr>
  <tr><td>Trois commentaires : une ligne qui commence par <code>#</code> au-dessus de chacune des trois instructions.</td><td>1</td></tr>
  <tr><td>Au-dessus de <code>vies = {D}</code> : ton commentaire explique qu'on range {D} dans la boîte vies.</td><td>1</td></tr>
  <tr><td>Au-dessus de <code>vies = vies - {K}</code> : ton commentaire explique le calcul, et que le résultat est rangé dans vies.</td><td>1</td></tr>
  <tr><td>Au-dessus de <code>print(vies)</code> : ton commentaire explique qu'on affiche ce qu'il y a dans la boîte vies.</td><td>1</td></tr></table>
  <p>Un commentaire explique avec TES mots ce que fait la ligne. Recopier la ligne (<code># vies = vies - {K}</code>) n'explique rien : 0 point pour cette ligne.</p>
  <p class="stop">Pas de copier-coller du voisin. Des commentaires copiés sur un autre élève, c'est 0 sur 5, pour les deux fichiers.</p>
  <p>Avant tout : le fichier rendu s'appelle 01_Les-vies_ suivi de ton nom, et finit par .py. Sinon, le professeur ne peut pas l'ouvrir.</p></div>`,
    coince:["Pas de devoir « Python 02 — Les vies commenté » dans Travaux et devoirs : vérifie que tu es dans le cours de Logique et programmation. Toujours rien : sonne la cloche 🔔.",
            "Ton fichier n'est pas dans Documents ▸ Python : dans la fenêtre, tape 01_Les-vies dans la case Rechercher, en haut à droite, puis Enter.",
            "Le bouton dit « Marquer comme terminé » : ton fichier n'est pas joint. Reprends à l'étape ＋ Ajouter ou créer.",
            "Tu as rendu le fichier sans tes commentaires : clique sur Annuler l'envoi ▸ Annuler l'envoi, retire-le avec la ✕ à droite de son nom, enregistre dans Thonny (Ctrl + S), puis reprends à l'étape ＋ Ajouter ou créer."],
    q:{ type:"rapport", q:"Ton fichier commenté est-il rendu ?",
        confirmation:"J'ai rendu 01_Les-vies, commenté, dans Classroom : je vois « Remis ».",
        trace:"rendu Classroom : 01_Les-vies commenté",
        juste:"Le professeur ouvre ton fichier, l'exécute, lit tes commentaires et le cote sur 5 avec la grille ci-dessus." } }
];

const FIN = {
  titre:"🎉 Python 02 terminé !",
  bulle:"Bravo ! Ton programme est réparé, commenté et rendu.",
  texte:"Ton programme est réparé, commenté et rendu dans Classroom. Prochaine étape : Python 03, des programmes qui posent des questions.",
  plus:"Change DEUX touches de « Les vies » pour qu'il affiche 1, puis corrige ton commentaire.",
  lien:'<a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Premiers pas en Python — je révise</a> (onglet Cartes)',
  citation:{
    texte:"Les programmes doivent être écrits pour que des gens les lisent, et seulement accessoirement pour que des machines les exécutent.",
    auteur:"Harold Abelson et Gerald Jay Sussman", source:"Structure and Interpretation of Computer Programs (1985), traduit de l'anglais",
    lien:"Un commentaire est pour le lecteur, et ce lecteur, ce sera peut-être toi dans un mois."
  }
};

/* ===== Démos animées « Regarde comment faire » (lues par pas-a-pas/demos-python.js) =====
   Numéro de bloc (0 = bloc 1) ▸ titre, images. Jamais une réponse de preuve : les lignes modifiées
   sont des barres grises et le nom de l'erreur est masqué. volet:false = absente du volet (doublon). */
const FICHIER_VIES = "01_Les-vies_Nom.py";
const CASSER = { titre:"Casser, lire le message, réparer", images:[
  { ecran:"thonny", nom:FICHIER_VIES, code:[["","cache"],["","cache"],["print(vies)",""]], cible:"L2", legende:"Clique dans la 3e ligne." },
  { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","cache"],["","cache"],["","cache"]], cible:"L2", legende:"Modifie-la comme la fiche le demande. Puis réponds à la question AVANT d’exécuter." },
  { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","cache"],["","cache"],["","cache"]], cible:"th-executer", legende:"▶ verte (ou F5). Thonny propose d’enregistrer : Oui." },
  { ecran:"thonny", nom:FICHIER_VIES, code:[["","cache"],["","cache"],["","cache"]], run:1, erreur:1, cible:"th-erreur", legende:"Lis la DERNIÈRE ligne rouge : elle donne le nom de l’erreur. Compare avec ta prédiction." },
  { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","cache"],["","cache"],["print(vies)","sel"]], cible:"L2", legende:"Répare la 3e ligne." },
  { ecran:"thonny", nom:FICHIER_VIES, code:[["","cache"],["","cache"],["print(vies)",""]], run:1, cible:"th-console", ok:1, legende:"F5 : le programme remarche." } ] };
const DEMOS_FICHE = {
  0: { titre:"Ouvrir le quiz et revenir à la fiche", images:[
    { ecran:"chrome", page:"fiche", cible:"ch-lien", legende:"Clique sur le lien « Python — je révise »." },
    { ecran:"chrome", page:"revise", cible:"ch-quiz", legende:"Un nouvel onglet s’ouvre. Clique sur Quiz." },
    { ecran:"chrome", page:"quiz", cible:"ch-commencer", legende:"Commencer le quiz, puis réponds aux cinq questions." },
    { ecran:"chrome", page:"quiz", cible:"ch-fiche", ok:1, legende:"Pour revenir à la fiche : clique sur son onglet, en haut." } ] },
  6: { titre:"Ouvrir mon fichier dans Thonny", images:[
    { ecran:"bureau", cible:"demarrer", legende:"Appuie sur la touche Windows ⊞ (ou clique sur Démarrer)." },
    { ecran:"bureau", demarrer:1, cible:"app-thonny", legende:"Tape Thonny, puis Enter." },
    { ecran:"thonny", nom:"<sans nom>", cible:"m-fichier", legende:"Clique sur le menu Fichier." },
    { ecran:"thonny", nom:"<sans nom>", menu:"item-ouvrir", cible:"item-ouvrir", legende:"Ouvrir… (ou Ctrl + O)." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, ouvrir:1, cible:"dlg-documents", legende:"À gauche, clique sur Documents." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, ouvrir:1, cible:"dlg-python", legende:"Double-clic sur le dossier Python." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, ouvrir:1, cible:"dlg-fichier", legende:"Clique sur ton fichier 01_Les-vies_… ." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, ouvrir:1, choisi:1, cible:"dlg-ouvrir", legende:"Clique sur Ouvrir." },
    { ecran:"thonny", nom:FICHIER_VIES, lignes:3, cible:"th-executer", legende:"Tes trois lignes sont là. ▶ verte (ou F5)." },
    { ecran:"thonny", nom:FICHIER_VIES, lignes:3, run:1, cible:"th-console", ok:1, legende:"Lis le résultat dans la console du bas." } ] },
  7: CASSER,
  8: Object.assign({}, CASSER, { volet:false }),
  9: { titre:"Ajouter un commentaire au-dessus d’une ligne", images:[
    { ecran:"thonny", nom:FICHIER_VIES, lignes:3, cible:"L0", legende:"Clique au tout début de la ligne 1." },
    { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","sel"],["","cache"],["","cache"],["","cache"]], cible:"L0", legende:"Enter : une ligne vide apparaît au-dessus. Remonte dessus (flèche ↑)." },
    { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["# …","sel"],["","cache"],["","cache"],["","cache"]], cible:"L0", legende:"Tape # (AltGr + 3), puis ce que fait la ligne du dessous." },
    { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","com"],["","cache"],["","com"],["","cache"],["","com"],["","cache"]], cible:"th-editeur", legende:"Pareil au-dessus de chaque ligne : 3 commentaires, 3 instructions." },
    { ecran:"thonny", nom:FICHIER_VIES, modifie:1, code:[["","com"],["","cache"],["","com"],["","cache"],["","com"],["","cache"]], cible:"th-enregistrer", legende:"Disquette « Enregistrer » (ou Ctrl + S)." },
    { ecran:"thonny", nom:FICHIER_VIES, code:[["","com"],["","cache"],["","com"],["","cache"],["","com"],["","cache"]], run:1, cible:"th-console", ok:1, legende:"F5, puis lis la console : qu’affiche-t-elle ? Réponds ci-dessous." } ] }
};

/* ===== Python dans la page : pas-a-pas/python-editeur.js =====
   L'éditeur « Mon programme », le code mélangé, le tableau de trace, la ligne fautive et la console
   sont communs aux fiches Python. La page charge python-editeur.js avant blocs.js. */

/* Compatibilité : un ancien index.html peut rester 10 min dans le cache Apps Script.
   Il ne charge pas encore python-editeur.js (ni, plus ancien, blocs.js) : charger ce qui manque.
   En attendant le fichier, les quatre questions Python patientent au lieu de lever une erreur. */
if(typeof editeur==="undefined"){
  const script=document.createElement("script");
  script.src="https://root75.github.io/campin-public/pas-a-pas/python-editeur.js";
  const pret=new Promise(ok=>script.addEventListener("load",ok));
  ["editeur","ordre","trace","ligneFautive"].forEach(nom=>{ window[nom]=(...a)=>{ pret.then(()=>window[nom](...a)); }; });
  document.head.append(script);
}
addEventListener("DOMContentLoaded",()=>{
  if(typeof affiche!=="undefined") return;
  const script=document.createElement("script");
  script.src="https://root75.github.io/campin-public/pas-a-pas/blocs.js";
  document.head.append(script);
});


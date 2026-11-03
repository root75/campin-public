/* Le moteur et le contenu de la fiche « python-2 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie,
   alors que la même page sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de la séance 2 =====
   Pas de fiche élève : blocs écrits depuis le déroulé de « LogProg04_PROF_Premiers-pas-en-Python ».
   Exercices inspirés de la leçon 1E de Cercles informatiques (CEMC, Université de Waterloo,
   CC BY-NC-SA 3.0), réécrits et exécutés dans la page. Thonny reste pour « Les vies ».
   Chaque bloc : veux / fais / vois, stop, minutes, coince (les pièges de CE bloc), et une preuve :
   QCM (bonne réponse TOUJOURS en premier, mélangée à l'affichage, p = ce qu'on dit au piège),
   saisie (ok = test, faux = texte ou fonction de la réponse), code (depart = programme de départ,
   test(r) = true ou l'explication ; r = { sortie, erreur:{type,ligne,message}, vars, code }),
   ordre (lignes à remettre dans l'ordre, puis test(r) comme code), trace (code, vars, valeurs
   après chaque ligne, aide par ligne) ou ligne (code, bonne = la ligne fautive, p par ligne). */
const COURS = "python-2";
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
    fais:`Un pull à ${prix} € est soldé à −${pct} % : il doit coûter ${reste} €. <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> ▸ je compare avec ${reste} ▸ je trouve la ligne qui calcule faux ▸ je la corrige.`,
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
  { partie:"A — Je me remets en route", titre:"Le quiz « Python — je révise »", min:8, stop:true,
    veux:"Me rappeler print, les variables et = après le congé. Rien n'est coté.",
    fais:`Je clique sur le lien <a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Python — je révise</a> : il s'ouvre dans un nouvel onglet ▸ <span class="chemin">onglet Quiz ▸ Commencer le quiz</span>. Puis je regarde le projecteur : le professeur reprend la question la plus ratée.`,
    vois:"Mon score sur 5, et la trace au projecteur.",
    coince:["Je garde deux onglets : celui-ci pour la fiche, l'autre pour le quiz. Pour revenir à la fiche : clic sur son onglet, en haut de Chrome.",
            "Le lien ne s'ouvre pas : nouvel onglet (Ctrl+T) ▸ barre d'adresse ▸ root75.github.io/campin-public/python-je-revise/ ▸ Entrée.",
            "Je ne sais plus : l'onglet « L'essentiel » de la même page redit tout en cinq lignes."],
    q:{ type:"qcm", q:"Dans vies = vies - 1, que fait Python ?",
        c:["Il calcule à droite, puis il range à gauche.","Il vérifie que vies est égal à vies - 1.","Il range 1 dans vies.","Il affiche vies."],
        p:[null,"= n'est pas une égalité : c'est la flèche ← du logigramme. À droite je calcule, à gauche je range.","1 fait partie du calcul : vies - 1 est calculé d'abord, puis rangé dans vies.","Rien ne s'affiche sans print."] },
    variantes:[
      { q:{ type:"qcm", q:"Après x = 5 puis x = x + 2, que vaut x ?",
            c:["7","5","2","x + 2"],
            p:[null,"5, c'était la valeur d'avant : la 2e ligne la remplace.","2, c'est ce qu'on ajoute, pas le résultat.","Python calcule x + 2 avant de ranger : la boîte contient un nombre."] } },
      { q:{ type:"qcm", q:"Que fait print(score) ?",
            c:["Il affiche la valeur rangée dans score.","Il affiche le mot score.","Il range une valeur dans score.","Il efface score."],
            p:[null,"Pour afficher le mot, il faut des guillemets : print(\"score\").","Ranger, c'est le = : à droite je calcule, à gauche je range.","print n'efface rien : il montre."] } } ] },

  { partie:"B — Je lis les messages d'erreur", titre:"La consigne de toute la leçon", min:2,
    veux:"Réparer un programme en lisant, pas en changeant au hasard.",
    fais:"Je lis la consigne. Devant un programme cassé : j'exécute, je lis la ligne rouge, je dis à mon voisin quelle ligne est fautive, et SEULEMENT ensuite je touche au code.",
    vois:"Trois sortes d'erreurs : <b>SyntaxError</b> (l'écriture est cassée), une erreur <b>pendant l'exécution</b> (NameError : un nom inconnu), et l'erreur <b>de logique</b> (pas de ligne rouge, mais le résultat est faux).",
    coince:["Je me suis perdu dans un programme : bouton ↺ Code de départ, sous le cadre."],
    q:{ type:"qcm", q:"Devant un programme qui ne marche pas, je commence par :",
        c:["Lire le message et trouver la ligne fautive.","Changer des caractères au hasard.","Tout effacer et recommencer.","Cliquer sur ↺ Code de départ."],
        p:[null,"Au hasard, ça finit parfois par marcher, mais tu ne sauras pas pourquoi. Le message dit où chercher.","Tu perdrais ce qui est juste : souvent, un seul caractère est faux.","↺ Code de départ, c'est quand tu t'es perdu : ça remet le programme cassé du départ."] } },

  { partie:"B — Je lis les messages d'erreur", titre:"L'additionneur", min:5,
    veux:"Réparer une faute d'écriture : un seul caractère.",
    fais:`<span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> tel quel ▸ je lis la ligne rouge ▸ je trouve le caractère fautif ▸ je le corrige ▸ Exécuter.`,
    coince:["SyntaxError : l'écriture est cassée. Je regarde juste avant la parenthèse finale.",
            "Un seul caractère à enlever, rien à ajouter."],
    ...additionneur(10),
    variantes:[additionneur(8), additionneur(12)] },

  { partie:"B — Je lis les messages d'erreur", min:5,
    veux:"Réparer une erreur qui arrive pendant l'exécution. Deux caractères.",
    fais:`<span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> tel quel ▸ je lis le nom de l'erreur ▸ je dis à mon voisin quelle ligne est fautive ▸ je corrige ▸ Exécuter.`,
    ...bonjour("Joe"),
    variantes:[bonjour("Léa"), bonjour("Sam")] },

  { partie:"B — Je lis les messages d'erreur", titre:"Quelle ligne cloche ?", min:3,
    veux:"Trouver une erreur de logique en lisant, sans exécuter.",
    fais:"Je lis le programme ligne par ligne, comme une trace. Je clique sur la ligne fautive.",
    vois:"Le score doit valoir 15 : 10 points, plus un bonus de 5. Le programme affiche 5.",
    coince:["Aucune ligne rouge ici : le programme tourne, mais il calcule faux. C'est une erreur de logique.",
            "Je fais la trace : que vaut score après chaque ligne ?"],
    q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["score = 10","bonus = 5","score = score - bonus","print(score)"], bonne:3,
        p:["score = 10 : le score de départ est bien 10.","bonus = 5 : le bonus vaut bien 5.",null,"print(score) affiche bien le score. Le problème est dans le calcul, juste avant."],
        juste:"Le signe − enlève le bonus au lieu de l'ajouter : score = score + bonus." },
    variantes:[
      { vois:"Le total doit valoir 24 : 3 objets à 8 €. Le programme affiche 11.",
        coince:["Aucune ligne rouge ici : le programme tourne, mais il calcule faux. C'est une erreur de logique.",
                "Je fais la trace : que vaut total après chaque ligne ?"],
        q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["prix = 8","quantite = 3","total = prix + quantite","print(total)"], bonne:3,
            p:["prix = 8 : un objet coûte bien 8 €.","quantite = 3 : on en achète bien 3.",null,"print(total) affiche bien le total. Le problème est dans le calcul, juste avant."],
            juste:"Le + additionne le prix et la quantité au lieu de les multiplier : total = prix * quantite." } },
      { vois:"Le programme doit afficher la température après la baisse : 15. Il affiche 5.",
        coince:["Aucune ligne rouge ici : le programme tourne, mais il affiche faux. C'est une erreur de logique.",
                "Je fais la trace : que vaut temperature après chaque ligne ? Et quelle boîte la dernière ligne affiche-t-elle ?"],
        q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["temperature = 20","baisse = 5","temperature = temperature - baisse","print(baisse)"], bonne:4,
            p:["temperature = 20 : la température de départ est bien 20.","baisse = 5 : la baisse vaut bien 5.","temperature - baisse = 15, rangé dans temperature : le calcul est juste.",null],
            juste:"Le calcul est juste, mais la dernière ligne affiche la mauvaise boîte : print(temperature)." } } ] },

  { partie:"B — Je lis les messages d'erreur", titre:"Les soldes", min:6, stop:true,
    veux:"Trouver une erreur de logique : pas de ligne rouge, mais un résultat faux.",
    ...soldes(20, 10),
    variantes:[soldes(30, 20), soldes(50, 10)] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"J'ouvre mon fichier", min:3, stop:true, cle:"vies", variantes:[{},{}],
    veux:"Retrouver le programme de la séance 1.",
    fais:`<span class="chemin">touche Windows ▸ je tape Thonny ▸ Entrée</span> ▸ <span class="chemin">menu Fichier ▸ Ouvrir… (Ctrl+O) ▸ Documents ▸ Python ▸ 01_Les-vies_Nom.py ▸ Ouvrir</span> ▸ <span class="chemin">icône ▶ verte « Exécuter le script courant » (F5)</span>.`,
    vois:"Mes trois lignes, et {R} dans la console du bas.",
    extra: VIES,
    coince:["Mon fichier n'est pas là : je le recrée. Documents ▸ bouton Nouveau ▸ Dossier ▸ Python ; puis dans Thonny, Fichier ▸ Enregistrer sous… (Ctrl+Maj+S) ▸ 01_Les-vies_Nom.py, et je tape les trois lignes du modèle.",
            "Thonny ne se lance pas : nouvel onglet (Ctrl+T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Entrée. Je tape les trois lignes du modèle dans la console de secours et j’exécute. Rien n’y est enregistré : je montre mon écran au professeur pour vérifier le résultat et organiser la sauvegarde, puis je reviens à cette fiche."],
    q:{ type:"qcm", q:"F5 : qu'affiche la console du bas ?",
        c:["{R}","{D}","vies","Un message d'erreur"],
        p:[null,"vies - {K} doit être rangé : vies = vies - {K}. Corrige, Ctrl+S, F5.","print(\"vies\") affiche le mot : enlève les guillemets, Ctrl+S, F5.","Lis le message, compare avec le modèle, corrige, Ctrl+S, F5."] } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je le casse : Vies", min:4,
    veux:"Voir que Python lit chaque lettre : Vies n'est pas vies.",
    fais:"À la 3e ligne, je remplace vies par <b>Vies</b> : print(Vies). Je réponds à la question AVANT de faire F5. Puis F5, je lis le message, et je répare (vies en minuscules), F5.",
    vois:"Un message d'erreur, puis de nouveau {R} après la réparation.",
    coince:["Le message est long : je lis la dernière ligne, c'est elle qui donne le nom de l'erreur."],
    q:{ type:"qcm", q:"Prédis : avec print(Vies), que va-t-il se passer ?",
        c:["Une erreur NameError : Python ne connaît pas Vies.","Il affiche {R}.","Il affiche Vies.","Une erreur SyntaxError."],
        p:[null,"La boîte s'appelle vies, en minuscules. Vies est un autre nom, que Python ne connaît pas.","Sans guillemets, Vies n'est pas un texte : c'est un nom de variable.","L'écriture est correcte : c'est le nom qui est inconnu. Ce n'est pas une faute de syntaxe."] },
    variantes:[
      { titre:"Je le casse : vie", veux:"Voir que Python lit chaque lettre : vie n'est pas vies.",
        fais:"À la 3e ligne, j'efface le s de vies : print(vie). Je réponds à la question AVANT de faire F5. Puis F5, je lis le message, et je répare (print(vies)), F5.",
        q:{ type:"qcm", q:"Prédis : avec print(vie), sans le s, que va-t-il se passer ?",
            c:["Une erreur NameError : Python ne connaît pas vie.","Il affiche {R}.","Il affiche vie.","Une erreur SyntaxError."],
            p:[null,"La boîte s'appelle vies, avec un s. vie est un autre nom, que Python ne connaît pas.","Sans guillemets, vie n'est pas un texte : c'est un nom de variable.","L'écriture est correcte : c'est le nom qui est inconnu. Ce n'est pas une faute de syntaxe."] } },
      { titre:"Je le casse : prnt", veux:"Voir que Python lit chaque lettre : prnt n'est pas print.",
        fais:"À la 3e ligne, j'efface le i de print : prnt(vies). Je réponds à la question AVANT de faire F5. Puis F5, je lis le message, et je répare (print(vies)), F5.",
        q:{ type:"qcm", q:"Prédis : avec prnt(vies), que va-t-il se passer ?",
            c:["Une erreur NameError : Python ne connaît pas prnt.","Il affiche {R}.","Il affiche vies.","Une erreur SyntaxError."],
            p:[null,"prnt n'est pas print : Python ne devine pas, il ne connaît pas ce nom.","Python ne connaît pas prnt : rien ne s'affiche.","L'écriture est correcte (un nom suivi de parenthèses) : c'est le nom qui est inconnu."] } } ] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je le casse : une parenthèse", min:4,
    veux:"Reconnaître une faute d'écriture.",
    fais:"À la 3e ligne, j'efface la dernière parenthèse : print(vies. Je réponds AVANT de faire F5. Puis F5, je lis le message, et je remets la parenthèse, F5.",
    vois:"Un message d'erreur, puis de nouveau {R} après la réparation.",
    coince:["La parenthèse ) est la touche à droite du 0, sans Maj."],
    q:{ type:"qcm", q:"Prédis : avec print(vies sans la parenthèse finale, quelle erreur ?",
        c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
        p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas la parenthèse manquante.","Rien ne s'affiche quand l'écriture est cassée."] },
    variantes:[
      { fais:"À la 3e ligne, j'efface la parenthèse ouvrante et je laisse un espace : print vies). Je réponds AVANT de faire F5. Puis F5, je lis le message, et je répare (print(vies)), F5.",
        coince:["La parenthèse ( est la touche 5, sans Maj."],
        q:{ type:"qcm", q:"Prédis : avec print vies), sans la parenthèse ouvrante, quelle erreur ?",
            c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
            p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas la parenthèse manquante.","Rien ne s'affiche quand l'écriture est cassée."] } },
      { fais:"À la 3e ligne, j'ajoute une parenthèse finale : print(vies)). Je réponds AVANT de faire F5. Puis F5, je lis le message, et j'enlève la parenthèse en trop (print(vies)), F5.",
        q:{ type:"qcm", q:"Prédis : avec print(vies)), une parenthèse en trop, quelle erreur ?",
            c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche {R}.","Il affiche vies."],
            p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas qu'il faut ignorer la parenthèse en trop.","Rien ne s'affiche quand l'écriture est cassée."] } } ] },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je commente chaque ligne", min:6, stop:true,
    veux:"Un programme que n'importe qui comprend en le lisant.",
    fais:`Au-dessus de chaque ligne, j'ajoute une ligne qui commence par <b>#</b> et dit ce que fait la ligne ▸ <span class="chemin">icône disquette (Ctrl+S)</span> ▸ F5. Puis je montre mon écran au professeur.`,
    vois:"Six lignes : trois commentaires, trois instructions. La console affiche toujours {R}.",
    extra: CODE("# je range {D} dans la boîte vies\nvies = {D}\n# …\nvies = vies - {K}\n# …\nprint(vies)"),
    coince:["Le # est AltGr + 3.",
            "Je ne sais pas quoi écrire : je dis ce que fait la ligne, comme dans le logigramme (je range, je calcule, j'affiche)."],
    q:{ type:"qcm", q:"Avec tes trois commentaires, qu'affiche le programme ?",
        c:["{R}, comme avant : Python ignore ce qui suit #.","Les commentaires, puis {R}.","Une erreur.","Rien."],
        p:[null,"Les commentaires sont pour les humains : Python ne les affiche pas.","Si tu as une erreur, un # manque au début d'une ligne de commentaire.","print(vies) est toujours là : il affiche {R}."] },
    variantes:[
      { q:{ type:"qcm", q:"À quoi sert une ligne qui commence par # ?",
            c:["À expliquer le programme aux humains : Python l'ignore.","À afficher un texte.","À arrêter le programme.","À ranger une valeur."],
            p:[null,"Pour afficher, c'est print( ). Python n'affiche jamais un commentaire.","Le programme continue : Python saute simplement la ligne.","Ranger, c'est le = . Une ligne qui commence par # ne fait rien."] } },
      { q:{ type:"qcm", q:"Tu écris # devant print(vies). Qu'affiche le programme ?",
            c:["Rien : la ligne est devenue un commentaire.","{R}","# print(vies)","Une erreur."],
            p:[null,"La ligne print(vies) est devenue un commentaire : Python ne l'exécute plus.","Python n'affiche jamais un commentaire, même s'il contient print.","Un commentaire n'est jamais une erreur : Python l'ignore."] } } ] }
];

const FIN = {
  titre:"🎉 J'ai fini la séance 2",
  texte:"Mon programme est réparé, commenté et enregistré. J'écoute l'annonce de la première évaluation : quoi et quand.",
  plus:"Changer DEUX touches de « Les vies » pour qu'il affiche 1, et corriger mon commentaire.",
  lien:'<a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Premiers pas en Python — je révise</a> (onglet Cartes)',
  citation:{
    texte:"Les programmes doivent être écrits pour que des gens les lisent, et seulement accessoirement pour que des machines les exécutent.",
    auteur:"Harold Abelson et Gerald Jay Sussman", source:"Structure and Interpretation of Computer Programs (1985), traduit de l'anglais",
    lien:"Mon commentaire est pour le lecteur, et ce lecteur, ce sera peut-être moi dans un mois."
  }
};

/* ===== Python dans la page =====
   Pyodide (le vrai Python, compilé pour le navigateur), servi par campin-public/python-moteur :
   même domaine que la fiche, rien d'autre à laisser passer par le filtre de l'école.
   Chargé une seule fois, dès le premier bloc qui a un cadre « Mon programme ». */
const MOTEUR = /google/.test(location.hostname) ? "https://root75.github.io/campin-public/python-moteur/"
                                                : new URL("../../python-moteur/", location.href).href;
/* Le lanceur rend ce que les tests regardent : l'erreur (type, ligne, message comme dans Thonny)
   et les variables simples. Le compteur de lignes arrête une boucle sans fin au lieu de figer l'onglet. */
const LANCEUR = `
import json, sys, traceback
def _lance(code):
    g = {"__name__": "__main__"}
    err = None
    n = [0]
    def garde(frame, evt, arg):
        n[0] += 1
        if n[0] > 200000:
            raise TimeoutError("le programme tourne sans fin")
        return garde
    try:
        prog = compile(code, "programme.py", "exec")
        sys.settrace(garde)
        try:
            exec(prog, g)
        finally:
            sys.settrace(None)
    except SyntaxError as e:
        err = {"type": type(e).__name__, "ligne": e.lineno, "message": type(e).__name__ + ": " + str(e.msg)}
    except Exception as e:
        lignes = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename == "programme.py"]
        err = {"type": type(e).__name__, "ligne": lignes[-1] if lignes else None, "message": type(e).__name__ + ": " + str(e)}
    v = {k: x for k, x in g.items() if not k.startswith("__") and type(x) in (int, float, str, bool)}
    return json.dumps({"erreur": err, "vars": v})
`;
/* Le nom de l'erreur reste en anglais, comme dans Thonny ; la fiche le traduit dessous. */
const ERREURS = {
  SyntaxError:"l'écriture de la ligne est cassée : guillemet, parenthèse, signe en trop ou en moins ?",
  IndentationError:"la ligne commence par des espaces en trop ou en moins.",
  NameError:"Python ne connaît pas ce nom : majuscules ? guillemets oubliés ? variable créée avant ?",
  TypeError:"on mélange des choses qui ne vont pas ensemble, par exemple un texte et un nombre.",
  ZeroDivisionError:"une division par zéro.",
  TimeoutError:"le programme ne s'arrête jamais : je relis ma boucle."
};
let python = null;
function chargePython(){
  if(!python){
    python = new Promise((ok, ko) => {
      const s = document.createElement("script"); s.src = MOTEUR + "pyodide.js";
      s.onload = () => loadPyodide({ indexURL: MOTEUR }).then(ok, ko);
      s.onerror = ko; document.head.append(s);
    }).then(py => { py.runPython(LANCEUR); return py; });
    python.catch(() => { python = null; });   // un échec n'est pas définitif : le clic suivant réessaie
  }
  return python;
}
async function executePython(code){
  const py = await chargePython();
  let sortie = "";
  py.setStdout({ batched: s => sortie += s + "\n" });
  py.setStderr({ batched: s => sortie += s + "\n" });
  const lance = py.globals.get("_lance");
  const r = JSON.parse(lance(code)); lance.destroy();
  return Object.assign(r, { sortie, code });
}

/* Le cadre « Mon programme » : la preuve, c'est le programme qui passe le test. */
function editeur(zone, Q, reussi, rate){
  const ta = el("textarea","editeur"); ta.value = Q.depart || ""; ta.spellcheck = false;
  ta.setAttribute("autocapitalize","off"); ta.setAttribute("aria-label","Mon programme");
  ta.rows = Math.max(4, ta.value.split("\n").length + 1);
  const lance = txt("button","btn plein","▶ Exécuter (Ctrl+Entrée)"); lance.type = "button";
  const depart = txt("button","btn vide","↺ Code de départ"); depart.type = "button";
  const ecran = el("pre","console"); ecran.hidden = true; ecran.setAttribute("aria-live","polite");
  const barre = el("div","actions"); barre.append(lance, depart);
  zone.append(ta, barre, ecran);
  chargePython().catch(() => {});

  ta.addEventListener("keydown", e => {
    if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); go(); }
    else if(e.key === "Tab" && !e.shiftKey){ e.preventDefault(); ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end"); }
  });
  depart.addEventListener("click", () => { ta.value = Q.depart || ""; ecran.hidden = true; ta.focus(); });
  lance.addEventListener("click", go);

  async function go(){
    if(lance.disabled) return;
    lance.disabled = true; ta.readOnly=true; depart.disabled=true; ecran.hidden = false; ecran.className = "console";
    ecran.textContent = "⏳ Python se prépare… (la première fois seulement, quelques secondes)";
    let r;
    try { r = await executePython(ta.value); }
    catch(e){
      ecran.textContent = "Le moteur Python ne se charge pas. Je réessaie dans un instant ; sinon, je pose mon chevalet.";
      lance.disabled = false;ta.readOnly=false;depart.disabled=false; return;
    }
    montre(ecran, r);
    const verdict = Q.test(r);
    if(verdict === true){ ta.readOnly = true; depart.disabled = true; reussi(ta.value); }
    else { lance.disabled = false;ta.readOnly=false;depart.disabled=false; rate(verdict, ta.value); }
  }
}

/* Code mélangé : l'élève remet les lignes dans l'ordre (▲ ▼), puis la fiche EXÉCUTE le programme
   et applique test(r) comme pour un programme écrit : tous les ordres qui marchent sont justes. */
function ordre(zone, Q, reussi, rate){
  let lignes = melange(Q.lignes);
  let execution=false;
  while(lignes.join("\n") === Q.lignes.join("\n")) lignes = melange(Q.lignes);
  const ol = el("ol","ordre");
  const ecran = el("pre","console"); ecran.hidden = true;
  const ok = txt("button","btn plein","▶ Exécuter dans cet ordre"); ok.type = "button";
  const dessine = () => {
    ol.replaceChildren();
    lignes.forEach((l,i) => {
      const li = el("li"); const c = txt("code", null, l);
      const haut = txt("button","fleche","▲"); haut.type="button"; haut.disabled = i===0; haut.setAttribute("aria-label","Monter la ligne « "+l+" »");
      const bas = txt("button","fleche","▼"); bas.type="button"; bas.disabled = i===lignes.length-1; bas.setAttribute("aria-label","Descendre la ligne « "+l+" »");
      haut.addEventListener("click",()=>{ if(execution)return; [lignes[i-1],lignes[i]]=[lignes[i],lignes[i-1]]; dessine(); ol.children[i-1].querySelector(".fleche").focus(); });
      bas.addEventListener("click",()=>{ if(execution)return; [lignes[i+1],lignes[i]]=[lignes[i],lignes[i+1]]; dessine(); ol.children[i+1].querySelectorAll(".fleche")[1].focus(); });
      li.append(c, haut, bas); ol.append(li);
    });
  };
  dessine();
  zone.append(ol, el("div","actions"), ecran); zone.children[1].append(ok);
  chargePython().catch(() => {});
  ok.addEventListener("click", async () => {
    if(ok.disabled)return;execution=true;
    ok.disabled = true; ecran.hidden = false; ecran.textContent = "⏳ Python se prépare… (la première fois seulement, quelques secondes)";
    let r;
    try { r = await executePython(lignes.join("\n")); }
    catch(e){ ecran.textContent = "Le moteur Python ne se charge pas. Je réessaie dans un instant ; sinon, je pose mon chevalet."; ok.disabled = false; execution=false; return; }
    montre(ecran, r);
    const verdict = Q.test(r);
    if(verdict === true){ ol.querySelectorAll("button").forEach(b=>b.disabled=true); reussi(lignes.join(" / ")); }
    else { execution=false;ok.disabled = false; rate(verdict, lignes.join(" / ")); }
  });
}

/* Tableau de trace : la valeur de chaque variable après chaque ligne, comme en LogProg 03. */
function trace(zone, Q, reussi, rate){
  const t = el("table","trace"); const tete = el("tr");
  tete.append(txt("th",null,"Ligne"), txt("th",null,"Instruction"));
  Q.vars.forEach(v => tete.append(txt("th",null,v)));
  t.append(tete);
  const cases = Q.code.map((l,i) => {
    const tr = el("tr"); tr.append(txt("td",null,String(i+1)), el("td",null,"<code></code>")); tr.children[1].firstChild.textContent = l;
    const ins = Q.vars.map(v => { const td = el("td"); const inp = el("input"); inp.type="text"; inp.inputMode="numeric"; inp.autocomplete="off";
      inp.setAttribute("aria-label", v+" après la ligne "+(i+1)); td.append(inp); tr.append(td); return inp; });
    t.append(tr); return ins;
  });
  const ok = txt("button","btn plein","Vérifier ma trace"); ok.type="button";
  const barre = el("div","actions"); barre.append(ok);
  zone.append(el("div","defile"), barre); zone.firstChild.append(t);
  ok.addEventListener("click", () => {
    const reponse = cases.map(l => l.map(x => x.value.trim()).join(",")).join(" / ");
    let premiere = -1;
    cases.forEach((l,i) => l.forEach((x,j) => {
      const juste = x.value.trim().replace(",",".") === String(Q.valeurs[i][j]);
      x.classList.toggle("faux", !juste); x.classList.toggle("juste", juste);
      if(!juste && premiere<0) premiere = i;
    }));
    if(premiere < 0){ cases.flat().forEach(x=>x.disabled=true); ok.disabled=true; reussi(reponse); }
    else rate((Q.aide && Q.aide[premiere]) || "Ligne "+(premiere+1)+" : refais le calcul. À droite je calcule avec la valeur d'avant, à gauche je range.", reponse);
  });
}

/* Ligne fautive : l'élève montre la ligne qui cloche AVANT de toucher au code.
   bonne = numéro de la ligne (à partir de 1), p = ce qu'on dit pour chaque autre ligne. */
function ligneFautive(zone, Q, reussi, rate){
  const liste = el("div","choix lignes-code"); const boutons = [];
  Q.code.forEach((l,i) => {
    const b = el("button"); b.type="button";
    b.append(txt("span","lettre",String(i+1)), txt("code",null,l));
    b.addEventListener("click", () => {
      if(i+1 === Q.bonne){ boutons.forEach(x=>{ x.disabled=true; if(x!==b) x.classList.add("estompe"); }); b.classList.add("juste"); reussi("ligne "+(i+1)); }
      else { b.classList.add("faux"); b.disabled = true; rate((Q.p && Q.p[i]) || "La ligne "+(i+1)+" fait bien ce qu'elle dit. Cherche ailleurs.", "ligne "+(i+1)); }
    });
    boutons.push(b); liste.append(b);
  });
  zone.append(liste);
}

function montre(ecran, r){
  ecran.replaceChildren(txt("span", null, r.sortie));
  if(r.erreur){
    ecran.append(txt("span","err", (r.erreur.ligne ? "Ligne " + r.erreur.ligne + " — " : "") + r.erreur.message));
    if(ERREURS[r.erreur.type]) ecran.append(txt("span","vide","→ " + ERREURS[r.erreur.type]));
  }
  if(!r.sortie && !r.erreur) ecran.append(txt("span","vide","(rien n'est affiché)"));
}

/* Compatibilité : un ancien index.html peut rester 10 min dans le cache Apps Script.
   Il n’inclut pas encore blocs.js. Au DOM prêt, charger le moteur seulement s’il manque. */
addEventListener("DOMContentLoaded",()=>{
  if(typeof affiche!=="undefined") return;
  const script=document.createElement("script");
  script.src="https://root75.github.io/campin-public/pas-a-pas/blocs.js";
  document.head.append(script);
});


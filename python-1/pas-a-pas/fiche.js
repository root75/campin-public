/* Le moteur et le contenu de la fiche « python-1 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie,
   alors que la même page sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de la séance 1 =====
   Pas de fiche élève : blocs écrits depuis le déroulé de « LogProg04_PROF_Premiers-pas-en-Python ».
   Exercices inspirés des leçons 0 et 1 de Cercles informatiques (CEMC, Université de Waterloo,
   CC BY-NC-SA 3.0), réécrits et exécutés dans la page. Thonny reste pour le défi « Les vies ».
   Chaque bloc : veux (le but, une phrase) / fais (les cases, à l'impératif) / vois (« À vérifier »), bulle, stop, minutes, coince (les pièges de CE bloc), et une preuve :
   QCM (bonne réponse TOUJOURS en premier, mélangée à l'affichage, p = ce qu'on dit au piège),
   saisie (ok = test, faux = texte ou fonction de la réponse), code (depart = programme de départ,
   test(r) = true ou l'explication ; r = { sortie, erreur:{type,ligne,message}, vars, code }),
   ordre (lignes à remettre dans l'ordre, puis test(r) comme code), trace (code, vars, valeurs
   après chaque ligne, aide par ligne) ou ligne (code, bonne = la ligne fautive, p par ligne). */
const COURS = "python-1";
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

const LOGIGRAMME_VIES = `<figure class="logigramme"><svg viewBox="0 0 240 380" role="img" aria-label="Logigramme Les vies : Début, vies ← {D}, vies ← vies − {K}, Afficher vies, Fin">
  <defs><marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b6873"/></marker></defs>
  <g stroke="#5b6873" stroke-width="2" marker-end="url(#pointe)"><line x1="120" y1="50" x2="120" y2="78"/><line x1="120" y1="126" x2="120" y2="154"/><line x1="120" y1="202" x2="120" y2="230"/><line x1="120" y1="278" x2="120" y2="306"/></g>
  <g stroke-width="2" font-family="Atkinson Hyperlegible, Segoe UI, Arial, sans-serif" font-size="19" text-anchor="middle" fill="#1f2a33">
    <ellipse cx="120" cy="27" rx="70" ry="23" fill="#d5e8d4" stroke="#82b366"/><text x="120" y="34" stroke="none">Début</text>
    <rect x="25" y="80" width="190" height="46" rx="8" fill="#dae8fc" stroke="#6c8ebf"/><text x="120" y="110" stroke="none">vies ← {D}</text>
    <rect x="25" y="156" width="190" height="46" rx="8" fill="#dae8fc" stroke="#6c8ebf"/><text x="120" y="186" stroke="none">vies ← vies − {K}</text>
    <path d="M45 232H225L195 278H15Z" fill="#e1d5e7" stroke="#9673a6"/><text x="120" y="262" stroke="none">Afficher vies</text>
    <ellipse cx="120" cy="331" rx="70" ry="23" fill="#f8cecc" stroke="#b85450"/><text x="120" y="338" stroke="none">Fin</text>
  </g></svg><figcaption>Le logigramme « Les vies » (LogProg 03)</figcaption></figure>`;

/* Une case par action, à l'impératif (style « missions » du Labo 07 et du Rat de ville). */
// Une case peut porter son « ne fais pas » : {geste:"…", attention:"⚠️ …"}, un encadré sous la case, jamais dans son texte.
const CASES = (...l) => `<ol class="etapes">${l.map(x => typeof x === "string" ? `<li><label><input type="checkbox"><span>${x}</span></label></li>` : `<li><label><input type="checkbox"><span>${x.geste}</span></label><p class="attention">${x.attention}</p></li>`).join("")}</ol>`;
const EXECUTER = `Clique sur <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`;

/* Les exercices à nombres variables : une fonction rend la partie du bloc qui change. */
const afficheExact = (t, detail) => ({
  titre:"Afficher « "+t+" »",
  fais:CASES(`Écris UNE ligne qui affiche exactement <b>${t}</b>.`, EXECUTER),
  vois:"Le cadre affiche "+t+", à la lettre près, et la fiche dit « Oui, c'est ça ».",
  coince:["Ligne rouge : il manque les guillemets ou une parenthèse.",
          "Python affiche autre chose : compare lettre par lettre. "+detail[0].toUpperCase()+detail.slice(1)+"."],
  q:{ type:"code", q:"Écris la ligne qui affiche "+t, depart:"",
      test: r => r.erreur ? "Lis la <b>ligne rouge</b>. C'est un texte : il faut des guillemets, et print( ) autour."
               : SORTIE(r)===t ? true
               : SORTIE(r)==="" ? "Rien ne s'affiche : il faut print( ) autour du texte."
               : "Python affiche « "+SORTIE(r)+" ». Compare lettre par lettre avec "+t+" : "+detail+".",
      juste:"Exact à la lettre près. Un ordinateur ne devine pas : il fait ce qui est écrit." } });
const xFactor = (a, b) => ({
  q:{ type:"trace", q:"Remplis la valeur de x après chaque ligne.",
      code:["x = "+a,"x = x + x","x = x - "+b], vars:["x"], valeurs:[[a],[2*a],[2*a-b]],
      aide:["Ligne 1 : on range "+a+" dans x.",
            "Ligne 2 : avant, x vaut "+a+". À droite, x + x = "+a+" + "+a+". On range le résultat dans x.",
            "Ligne 3 : avant, x vaut "+(2*a)+" (pas "+a+" : la ligne 2 l'a changé). On enlève "+b+"."],
      juste:a+", puis "+a+" + "+a+" = "+(2*a)+", puis "+(2*a)+" − "+b+" = "+(2*a-b)+". La valeur finale de x est "+(2*a-b)+"." } });
const cartes = n => ({
  vois:`Avec ${n} paquets : ${4*n} rois, ${12*n} figures, ${52*n} cartes. Et si on remplace paquets = ${n} par paquets = 5, tout suit.`,
  q:{ type:"code", q:"Complète les trois lignes.", depart:"paquets = "+n+"\nrois = \nfigures = \ncartes = \nprint(rois, figures, cartes)",
      test: r => {
        if(r.erreur) return r.erreur.type==="SyntaxError" ? "Lis la <b>ligne rouge</b> : une ligne n'a rien à droite du =. Complète-la avec un calcul."
                                                           : "Lis la <b>ligne rouge</b> : quel nom Python ne connaît-il pas ? Vérifie l'orthographe de paquets.";
        const sansPaquets = ["rois","figures","cartes"].filter(v => !new RegExp("^\\s*"+v+"\\s*=.*\\bpaquets\\b","m").test(r.code));
        if(sansPaquets.length) return "La ligne de "+sansPaquets[0]+" n'utilise pas paquets : si on change le nombre de paquets, elle sera fausse. Écris un calcul avec * paquets.";
        const p = r.vars.paquets;
        return (r.vars.rois===4*p && r.vars.figures===12*p && r.vars.cartes===52*p) || "Un calcul est faux : un paquet, c'est 4 rois, 12 figures, 52 cartes. Relis chaque ligne.";
      },
      juste:"Le programme marche pour n'importe quel nombre de paquets : c'est tout l'intérêt d'une variable." } });
const tickets = (prix, nombre) => ({
  vois:`Le programme affiche ${prix*nombre} : le prix total de ${nombre} tickets à ${prix} €.`,
  q:{ type:"ordre", q:"Remets les lignes dans l'ordre.", lignes:["prix = "+prix,"nombre = "+nombre,"total = prix * nombre","print(total)"],
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "Ligne "+r.erreur.ligne+" : Python ne connaît pas encore ce nom. La variable doit être créée AVANT, plus haut." : "Lis la <b>ligne rouge</b>.")
               : SORTIE(r)===String(prix*nombre) ? true : "Python affiche « "+SORTIE(r)+" » : on veut "+(prix*nombre)+". Vérifie l'ordre.",
      juste:"Python lit de haut en bas : chaque variable est créée avant d'être utilisée." } });
const echange = (a, b) => ({
  fais:CASES("<b>Prévois</b> ce que donnent <code>a = b</code> puis <code>b = a</code>.",
             "Explique quelle <b>valeur est perdue</b>, et pourquoi.",
             "Construis l’échange avec une <b>troisième boîte</b>, <code>temp</code>.",
             "Vérifie avec <b>d’autres valeurs</b>.",
             "<b>Explique ton idée</b> à ton voisin, sans lui dicter le code."),
  vois:"Tu sais dire ce qu’une affectation remplace, et pourquoi une valeur doit d’abord être mise à l’abri.",
  indices:true,
  coince:["Une affectation copie la valeur de droite dans la boîte de gauche. La valeur précédente de cette boîte est remplacée.","Représente trois boîtes sur une feuille. Mets une valeur à l’abri avant de remplacer le contenu d’une boîte."],
  q:{type:"code",q:"Échanger deux variables : comprendre avant de valider.",initialA:a,initialB:b,guide:echangeGuide,
     depart:`a = ${a}\nb = ${b}\n\nprint(a, b)`,
     test:r=>r.erreur ? "Lis l’erreur Python et repère la ligne concernée."
       : !echangeGeneral(r.code,a,b) ? "Conserve les deux lignes de départ et print(a, b). Entre les deux, utilise uniquement des copies entre a, b et temp : la méthode doit fonctionner avec d’autres nombres."
       : (r.vars.a===b && r.vars.b===a) || "Les valeurs finales ne sont pas encore échangées. Suis le contenu des trois boîtes ligne par ligne.",
     juste:"Prédiction, échange et transfert vérifiés. Je sais expliquer le rôle de la valeur conservée."}
});
/* Le nom du fichier doit porter le nom de l'élève : le prénom ou le nom de son adresse. */
const nomsEleve = () => EMAIL ? EMAIL.split("@")[0].split(".").map(m=>norm(m).replace(/[^a-z]/g,"")).filter(m=>m.length>1) : [];
const portemonNom = f => { const n = nomsEleve(); return !n.length || n.some(m => norm(f).replace(/[^a-z]/g,"").includes(m)); };

const BLOCS = [
  { partie:"A — Mon premier programme", titre:"Exécuter un programme", min:3,
    bulle:"Salut ! Aujourd'hui, tu écris tes premières lignes de Python.",
    veux:"Voir ce qu'un programme affiche.",
    fais:CASES(`Sous « Mon programme », clique sur <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`,
               "La première fois, <b>attends quelques secondes</b> : Python se prépare."),
    vois:"Dans le cadre du dessous, le texte écrit par le programme : Bonjour !",
    coince:["Rien ne s'affiche après une minute : recharge la page (touche F5), puis clique de nouveau sur Exécuter.",
            "« Le moteur Python ne se charge pas » : sonne la cloche 🔔, en haut à droite. En attendant, passe à Thonny avec le professeur."],
    q:{ type:"code", q:"Exécute le programme.", depart:'print("Bonjour !")',
        test: r => SORTIE(r)==="Bonjour !" || "Le programme a changé : clique sur ↺ Code de départ, puis sur Exécuter.",
        juste:"print affiche ce qu'il y a entre les parenthèses. Le texte est entre guillemets." } },

  { partie:"A — Mon premier programme", titre:"Le casser exprès", min:4,
    bulle:"Un message d'erreur n'est pas grave : il dit où regarder.",
    veux:"Voir à quoi ressemble un message d'erreur, et à quoi servent les guillemets.",
    fais:CASES(`Efface les deux guillemets <b>"</b>.`, EXECUTER, "Lis la <b>ligne rouge</b> à voix haute à ton voisin."),
    vois:"Une ligne rouge : le numéro de la ligne fautive, puis le nom de l'erreur.",
    coince:["Le guillemet \" est la touche 3 du clavier, sans Shift.",
            "Le programme marche encore : il reste un guillemet. Efface les deux."],
    q:{ type:"code", q:"Efface les guillemets, puis exécute.", depart:'print("Bonjour !")',
        test: r => !r.erreur ? "Pas d'erreur : il reste au moins un guillemet. Efface les deux, puis Exécuter."
                 : r.code.includes('"') ? "Il reste un guillemet : efface les deux, puis Exécuter."
                 : /^print\(\s*Bonjour\s*!?\s*\)$/.test(r.code.trim()) ? true
                 : "Tu as effacé plus que les guillemets. Clique sur ↺ Code de départ, puis efface seulement les deux \".",
        juste:"Sans guillemets, Python croit que Bonjour est un nom de variable, et ne comprend plus la ligne. Le message dit OÙ (la ligne) et QUOI (le nom de l'erreur)." } },

  { partie:"A — Mon premier programme", min:6, stop:true,
    bulle:"À toi d'écrire, sans modèle. Exact à la lettre près !",
    veux:"Écrire seul un premier programme, exact à la lettre près.",
    ...afficheExact("Hello world!", "majuscule à Hello, pas de virgule, le ! collé"),
    variantes:[afficheExact("Bonjour Python!", "majuscules à Bonjour et à Python, le ! collé"),
               afficheExact("Salut tout le monde!", "une seule majuscule, à Salut, et le ! collé")] },

  { partie:"B — Les variables", titre:"La règle de toute la leçon", min:2,
    bulle:"Place aux variables : des boîtes qui portent un nom.",
    veux:"Apprendre en prédisant, pas en cliquant au hasard.",
    fais:CASES("Lis l'<b>encadré</b> ci-dessous.",
               "À chaque programme, <b>prédis</b> ce qui va s'afficher AVANT de cliquer sur Exécuter, comme pour une trace."),
    vois:"Tu sais redire la règle : prédire, puis exécuter.",
    extra:`<div class="encart"><p><b>Une variable, c'est une boîte qui porte un nom.</b> <code>=</code> range une valeur dedans : c'est la flèche ← du logigramme. À droite, on calcule ; à gauche, on range.</p></div>`,
    coince:["Le bouton 🐍 « Du logigramme à Python », en bas de la page, redit tout."],
    q:{ type:"qcm", q:"Quelle est la règle de toute la leçon ?",
        c:["Je prédis ce qui va s'afficher, puis j'exécute.","Je clique jusqu'à ce que ça passe au vert.","Je recopie la réponse du voisin.","Je lis sans rien essayer."],
        p:[null,"Cliquer au hasard finit par passer, mais tu n'apprends rien. Prédis d'abord.","Ta prédiction, c'est la tienne : c'est elle qui t'entraîne.","Il faut essayer : mais après avoir prédit."] } },

  { partie:"B — Les variables", titre:"« x factor », comme une trace", min:5, stop:true,
    bulle:"Suis x à la trace, ligne par ligne.",
    veux:"Suivre la valeur de x ligne par ligne, sans rien exécuter.",
    fais:CASES("<b>Suis avec le professeur</b>, au projecteur.",
               "Pour chaque ligne, écris <b>la valeur de x</b> APRÈS cette ligne, comme dans un tableau de trace de LogProg 03."),
    vois:"La dernière case donne la valeur finale de x.",
    coince:["= n'est pas une égalité : à droite, calcule avec la valeur d'avant ; à gauche, range.",
            "Descends ligne par ligne : la valeur de la ligne d'avant sert au calcul de la ligne suivante."],
    ...xFactor(10, 5),
    variantes:[xFactor(7, 4), xFactor(12, 6)] },

  { partie:"B — Les variables", titre:"Le compte des cartes", min:7,
    bulle:"Une variable peut servir à en calculer d'autres.",
    veux:"Calculer des variables à partir d'une autre.",
    fais:CASES("Lis : un paquet de jeu, c'est <b>4 rois, 12 figures et 52 cartes</b>.",
               "Complète les trois lignes avec la variable <b>paquets</b>.", EXECUTER),
    coince:["Le signe de la multiplication est * (étoile), pas x.",
            "N'écris pas 12 : écris 4 * paquets. Sinon, le programme est faux dès qu'on change le nombre de paquets.",
            "Ligne rouge sur « rois = » : il manque le calcul à droite du =."],
    ...cartes(3),
    variantes:[cartes(2), cartes(4)] },

  { partie:"B — Les variables", titre:"Le code mélangé", min:4,
    bulle:"Python lit de haut en bas. Dans quel ordre ?",
    veux:"Comprendre qu'une variable doit exister AVANT qu'on s'en serve.",
    fais:CASES(`<b>Remets les lignes dans l'ordre</b> avec les boutons <span class="chemin">▲ ▼</span>.`,
               `Clique sur <b class="chemin">▶ Exécuter dans cet ordre</b>.`),
    coince:["NameError : une ligne utilise une variable qui n'est pas encore créée. Elle doit descendre.",
            "Le print vient à la fin : on affiche le total quand il est calculé.",
            "Les deux premières lignes peuvent être dans n'importe quel ordre."],
    ...tickets(4, 3),
    variantes:[tickets(5, 2), tickets(6, 3)] },

  { partie:"B — Les variables", titre:"Échanger deux boîtes", min:12,
    bulle:"Un vrai casse-tête : échanger deux boîtes sans rien perdre.",
    veux:"Échanger le contenu de deux variables, sans rien perdre.",
    extra:`<div class="encart"><p><b>À ton rythme :</b> la validation vient après les quatre parties. Si la séance s’arrête, tu reprendras ce bloc. Après réussite, explique ton raisonnement à ton voisin sans lui dicter le code.</p></div>`,
    ...echange(4, 7),
    variantes:[echange(3, 9), echange(5, 8)] },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Le dossier Python", min:2,
    bulle:"Direction Thonny ! D'abord, un dossier pour ranger tes programmes.",
    veux:"Créer, dans Documents, le dossier qui rangera tous tes programmes de l'année.",
    fais:CASES(`Ouvre l'Explorateur de fichiers : <span class="chemin">icône dossier jaune de la barre des tâches</span> (ou <b>Windows + E</b>).`,
               `Dans la colonne de gauche, clique sur <b class="chemin">Documents</b>.`,
               `En haut à gauche, clique sur <span class="chemin">⊕ Nouveau ▸ Dossier</span> (ou <b>Ctrl + Shift + N</b>).`,
               "Tape <b>Python</b>, puis appuie sur <b>Enter</b>."),
    vois:"Un dossier <b>Python</b> dans Documents.",
    coince:["Le dossier s'appelle « Nouveau dossier » : clic droit dessus ▸ Renommer (touche F2) ▸ tape Python ▸ Enter.",
            "Pas de bouton Nouveau : clic droit dans une zone vide de Documents ▸ Nouveau ▸ Dossier.",
            "Le dossier Python existe déjà : rien à refaire, passe à la suite."],
    q:{ type:"qcm", q:"Où est ton dossier Python ?",
        c:["Dans Documents.","Sur le Bureau.","Dans Téléchargements.","Dans Thonny."],
        p:[null,"Sur le Bureau, on ne le retrouve pas sur un autre poste. Recrée-le dans Documents.","Téléchargements se vide : recrée-le dans Documents.","Thonny est un programme, pas un dossier : le dossier Python va dans Documents."] },
    variantes:[
      { q:{ type:"qcm", q:"Comment s'appelle le dossier où tu ranges tes programmes ?",
            c:["Python","Thonny","Documents","Mes programmes"],
            p:[null,"Thonny est le programme, pas le dossier.","Documents contient ton dossier : lui s'appelle Python.","Tu l'as nommé Python : c'est ce nom qu'on cherchera à chaque séance."] } },
      { q:{ type:"qcm", q:"Dans l'Explorateur de fichiers, quel raccourci crée un nouveau dossier ?",
            c:["Ctrl+Shift+N","Ctrl+N","Ctrl+S","F2"],
            p:[null,"Ctrl+N ouvre une nouvelle fenêtre de l'Explorateur.","Ctrl+S enregistre un fichier.","F2 renomme ce qui est sélectionné."] } } ] },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Ouvrir Thonny et enregistrer", min:3, stop:true,
    bulle:"Un fichier à ton nom, enregistré avant d'écrire une seule ligne.",
    veux:"Enregistrer un fichier à ton nom AVANT d'écrire, pour ne rien perdre.",
    fais:CASES(`Appuie sur la touche <b>Windows</b> ⊞, tape <b>Thonny</b>, puis appuie sur <b>Enter</b>.`,
               `Dans Thonny : <span class="chemin">menu Fichier ▸ Enregistrer sous…</span> (ou <b>Ctrl + Shift + S</b>).`,
               `Dans la fenêtre qui s'ouvre : <b class="chemin">Documents ▸ double-clic sur Python</b>.`,
               `Dans <span class="chemin">Nom du fichier</span>, tape <b>01_Les-vies_Nom.py</b>, avec TON nom à la place de Nom.`,
               `Clique sur <b class="chemin">Enregistrer</b>.`),
    vois:"L'onglet, en haut de Thonny, affiche le nom de ton fichier.",
    coince:["Thonny ne se lance pas : nouvel onglet (Ctrl + T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Enter. Sonne la cloche 🔔 : le professeur organise la sauvegarde avant que tu continues le défi dans cette console de secours. Ne recopie pas un nom de fichier fictif pour valider ce bloc.",
            "Sans .py à la fin, Thonny n'exécute pas comme attendu : Fichier ▸ Enregistrer sous… et corrige le nom.",
            "Deux signes différents : le tiret - entre Les et vies, le trait de soulignement _ partout ailleurs."],
    q:{ type:"saisie", q:"Recopie le nom de ton fichier, tel que Thonny l'affiche.",
        ok: r => /^01_les-vies_[^\s_]{2,}.*\.py$/i.test(r.trim()) && !/_nom\.py$/i.test(r.trim()) && portemonNom(r.trim().slice(12)),
        faux: r => !/\.py$/i.test(r.trim()) ? "Il manque .py à la fin : sans lui, Thonny n'exécute pas comme attendu. Fichier ▸ Enregistrer sous… et corrige."
                 : /_nom\.py$/i.test(r.trim()) ? "Remplace Nom par TON nom : sinon, ton fichier ne se retrouve pas. Fichier ▸ Enregistrer sous… et corrige."
                 : /^01_les-vies_[^\s_]{2,}.*\.py$/i.test(r.trim()) ? "Après 01_Les-vies_, écris TON nom, celui de ton adresse de l'école. Fichier ▸ Enregistrer sous… et corrige."
                 : "Le nom doit être 01_Les-vies_ suivi de ton nom, puis .py. Vérifie les _ et le - .",
        juste:"Le fichier est à ton nom, dans Documents ▸ Python." } },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Traduire le logigramme", min:4, cle:"vies", variantes:[{},{}],
    bulle:"Du logigramme à Python : à toi de traduire, sans modèle.",
    veux:"Écrire en Python le logigramme « Les vies », sans modèle.",
    fais:CASES("Clique dans la <b>grande zone du haut</b> de Thonny, celle qui porte le nom de ton fichier.",
               "Écris <b>une ligne par forme</b> du logigramme, en suivant les flèches.",
               `Enregistre : <span class="chemin">icône disquette « Enregistrer »</span> (ou <b>Ctrl + S</b>).`,
               { geste:"<b>Prédis</b> le résultat, ci-dessous.", attention:"⚠️ N'exécute pas encore : tu exécutes au bloc suivant, après ta prédiction." }),
    vois:"Trois lignes de Python, une par forme du milieu.",
    extra: LOGIGRAMME_VIES + `<div class="encart"><table>
  <tr><th>Dans le logigramme</th><th>En Python</th></tr>
  <tr><td>la flèche ←</td><td><b>=</b></td></tr>
  <tr><td>le parallélogramme Afficher</td><td><b>print( )</b></td></tr>
  <tr><td>Début et Fin</td><td>rien : ils ne s'écrivent pas</td></tr></table></div>`,
    coince:["Le bouton 🐍 « Du logigramme à Python », en bas de la page, redit les deux règles.",
            "Le signe − du logigramme s'écrit avec la touche - du clavier.",
            "Tu as tapé dans la console du bas (>>>) : tape dans la zone du haut, celle qui porte le nom du fichier.",
            "Tout en minuscules : Vies n'est pas vies, Print n'est pas print.",
            "Toujours bloqué après ton voisin : la 1re ligne est vies = {D}. Cherche les deux autres seul."],
    q:{ type:"saisie", q:"AVANT d'exécuter : que va afficher ton programme ?",
        ok: r => r.trim()===String(LV.r),
        faux: r => r.trim()===String(LV.d) ? "La 2e ligne calcule "+LV.d+" − "+LV.k+" et range le résultat dans vies : la boîte ne contient plus "+LV.d+"."
                 : norm(r)==="vies" ? "Sans guillemets, print affiche ce qu'il y a dans la boîte, pas son nom."
                 : "Fais la trace : quelle valeur a vies après chaque ligne ?",
        juste:"À droite on calcule, à gauche on range : vies passe de {D} à {R}. Vérifions." } },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Exécuter et comparer", min:2, stop:true, cle:"vies", variantes:[{},{}],
    bulle:"Moment de vérité : ta prédiction était-elle juste ?",
    veux:"Vérifier si ta prédiction était juste.",
    fais:CASES(`Clique sur <span class="chemin">icône ▶ verte « Exécuter le script courant »</span> (ou <b>F5</b>).`,
               "Lis le nombre affiché dans la <b>console du bas</b>.",
               "Compare-le avec <b>ta prédiction</b> du bloc 11.",
               "Réponds ci-dessous. Ensuite, <b>montre ton programme à ton voisin</b> : il vérifie qu'il suit le logigramme, ligne par ligne."),
    vois:"Dans la console du bas, le nombre {R}.",
    coince:["NameError : Python ne connaît pas un nom. Vérifie les majuscules : vies partout.",
            "SyntaxError : c'est l'écriture. Vérifie les parenthèses de print( ).",
            "Thonny demande d'enregistrer : clique sur Oui (ou Ctrl + S, puis F5)."],
    q:{ type:"qcm", q:"Qu'affiche la console du bas ?",
        c:["{R}","{D}","vies","Un message d'erreur"],
        p:[null,"Tu as écrit vies - {K} seul sur sa ligne ? Le calcul est fait, puis jeté. Où ranges-tu le résultat ? Corrige, Ctrl+S, F5.",
               "print(\"vies\") affiche le mot. Tu veux le mot, ou ce qu'il y a dans la boîte ? Enlève les guillemets, Ctrl+S, F5.",
               "Lis le message : quel nom ne connaît-il pas ? Compare chaque ligne avec le logigramme du bloc précédent, corrige, Ctrl+S, F5."] } },

  { partie:"D — Rendre mon programme", titre:"Rendre mon fichier dans Classroom", min:4, stop:true, cle:"vies", variantes:[{},{}],
    bulle:"Dernière mission : ton programme part chez le professeur. Il est coté sur 5.",
    veux:"Rendre ton fichier 01_Les-vies dans Classroom, pour qu'il soit coté sur 5.",
    fais:CASES(`Lis la <b>grille</b> ci-dessous : vérifie chaque ligne dans ton programme.`,
               `Dans Thonny, enregistre une dernière fois : <span class="chemin">menu Fichier ▸ Enregistrer</span> (ou <b>Ctrl + S</b>).`,
               `Ouvre un nouvel onglet (<b>Ctrl + T</b>), tape <b>classroom.google.com</b>, puis appuie sur <b>Enter</b>.`,
               `Clique sur le cours de <b>Logique et programmation</b> ▸ onglet <span class="chemin">Travaux et devoirs</span> ▸ le devoir <b>Python 01 — Les vies</b> ▸ <span class="chemin">Afficher le devoir</span>.`,
               `À droite, dans <span class="chemin">Vos devoirs</span> : <b class="chemin">＋ Ajouter ou créer ▸ Fichier ▸ Parcourir</b>.`,
               `Dans la fenêtre : <span class="chemin">Documents ▸ double-clic sur Python ▸ clic sur 01_Les-vies_… ▸ Ouvrir</span>, puis <b class="chemin">Importer</b>.`,
               `Ton fichier apparaît sous Vos devoirs : clique sur <b class="chemin">Rendre le devoir ▸ Rendre le devoir</b>.`),
    vois:"Dans Classroom, le devoir affiche « Remis » et ton fichier 01_Les-vies_… .py.",
    extra:`<div class="encart"><p><b>Grille — sur 5.</b> Le professeur ouvre ton fichier et l'exécute.</p><table>
  <tr><th>Dans ton programme</th><th>Points</th></tr>
  <tr><td><code>vies = {D}</code> : la variable est créée avec la valeur de départ du logigramme.</td><td>1</td></tr>
  <tr><td><code>vies = vies - {K}</code> : le calcul est à droite du =, le résultat est rangé dans vies.</td><td>2</td></tr>
  <tr><td><code>print(vies)</code> : sans guillemets, on affiche ce qu'il y a dans la boîte.</td><td>1</td></tr>
  <tr><td>F5 : le programme s'exécute sans message rouge et affiche <b>{R}</b>.</td><td>1</td></tr></table>
  <p>Avant tout : le fichier rendu s'appelle 01_Les-vies_ suivi de ton nom, et finit par .py. Sinon, le professeur ne peut pas l'ouvrir.</p></div>`,
    coince:["Pas de devoir « Python 01 — Les vies » dans Travaux et devoirs : vérifie que tu es dans le cours de Logique et programmation. Toujours rien : sonne la cloche 🔔.",
            "Ton fichier n'est pas dans Documents ▸ Python : dans la fenêtre, tape 01_Les-vies dans la case Rechercher, en haut à droite, puis Enter.",
            "Le bouton dit « Marquer comme terminé » : ton fichier n'est pas joint. Reprends à l'étape ＋ Ajouter ou créer.",
            "Tu as rendu le mauvais fichier : clique sur Annuler l'envoi ▸ Annuler l'envoi, retire-le avec la ✕ à droite de son nom, puis reprends à l'étape ＋ Ajouter ou créer."],
    q:{ type:"rapport", q:"Ton fichier est-il rendu ?",
        confirmation:"J'ai rendu 01_Les-vies dans Classroom : je vois « Remis ».",
        trace:"rendu Classroom : 01_Les-vies",
        juste:"Le professeur ouvre ton fichier, l'exécute et le cote sur 5 avec la grille ci-dessus." } }
];

const FIN = {
  titre:"🎉 Python 01 terminé !",
  bulle:"Bravo ! Ton premier programme Python tourne.",
  texte:"Ton fichier 01_Les-vies est rendu dans Classroom et enregistré dans Documents ▸ Python : ne le supprime pas, on le reprend dans Python 02.",
  plus:"Change DEUX touches de ton programme pour qu'il affiche 1. Prédis, puis F5.",
  lien:'<a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Premiers pas en Python — je révise</a>',
  citation:{
    texte:"Déjà essayé. Déjà échoué. Peu importe. Essayer encore. Échouer encore. Échouer mieux.",
    auteur:"Samuel Beckett", source:"Cap au pire (1983)",
    lien:"Un message d'erreur rouge n'est pas un échec : il dit quoi corriger."
  }
};

/* ===== Démos animées « Regarde comment faire » (lues par pas-a-pas/demos-python.js) =====
   Numéro de bloc (0 = bloc 1) ▸ titre, replie (indice à ouvrir), images. Jamais une réponse de preuve. */
const FICHIER_VIES = "01_Les-vies_Nom.py";
const DEMOS_FICHE = {
  7: { titre: 'Une image pour comprendre : les deux verres', replie: true, images: [
    { ecran: 'verres', a: 'jus', b: 'lait', t: '', legende: 'Du jus dans le verre a, du lait dans le verre b. On veut les échanger.' },
    { ecran: 'verres', a: 'jus', b: 'lait', t: '', barre: 'a', cible: 'v-a', legende: 'Verser tout de suite le lait dans a ? Le jus serait perdu.' },
    { ecran: 'verres', a: '', b: 'lait', t: 'jus', cible: 'v-t', legende: 'Un troisième verre, temp : on y met d’abord le jus à l’abri.' },
    { ecran: 'verres', a: '', b: 'lait', t: 'jus', cible: 'v-a', ok: 1, legende: 'Le verre a est libre. Quels deux gestes restent ? À toi de les écrire en Python.' }
  ] },
  8: { titre: 'Créer le dossier Python', images: [
    { ecran: 'bureau', cible: 'explorateur', legende: 'Clique sur le dossier jaune de la barre des tâches (ou Windows + E).' },
    { ecran: 'explorateur', lieu: 'Accueil', cible: 'nav-documents', legende: 'Dans la colonne de gauche, clique sur Documents.' },
    { ecran: 'explorateur', lieu: 'Documents', cible: 'nouveau', legende: 'En haut à gauche, clique sur ⊕ Nouveau.' },
    { ecran: 'explorateur', lieu: 'Documents', menu: 1, cible: 'item-dossier', legende: 'Choisis Dossier (ou Ctrl + Shift + N).' },
    { ecran: 'explorateur', lieu: 'Documents', neuf: 'Nouveau dossier', cible: 'neuf', legende: '« Nouveau dossier » est déjà sélectionné : tape directement Python.' },
    { ecran: 'explorateur', lieu: 'Documents', neuf: 'Python', cible: 'neuf', legende: 'Appuie sur Enter.' },
    { ecran: 'explorateur', lieu: 'Documents', python: 1, cible: 'dossier-python', ok: 1, legende: 'Le dossier Python est dans Documents.' }
  ] },
  9: { titre: 'Ouvrir Thonny et enregistrer à mon nom', images: [
    { ecran: 'bureau', cible: 'demarrer', legende: 'Appuie sur la touche Windows ⊞ (ou clique sur Démarrer).' },
    { ecran: 'bureau', demarrer: 1, cible: 'app-thonny', legende: 'Tape Thonny, puis Enter.' },
    { ecran: 'thonny', nom: '<sans nom>', cible: 'm-fichier', legende: 'Thonny est ouvert. Clique sur le menu Fichier.' },
    { ecran: 'thonny', nom: '<sans nom>', menu: 'item-sous', cible: 'item-sous', legende: 'Enregistrer sous… (ou Ctrl + Shift + S).' },
    { ecran: 'thonny', nom: '<sans nom>', dialogue: 1, cible: 'dlg-documents', legende: 'À gauche, clique sur Documents.' },
    { ecran: 'thonny', nom: '<sans nom>', dialogue: 1, cible: 'dlg-python', legende: 'Double-clic sur le dossier Python.' },
    { ecran: 'thonny', nom: '<sans nom>', dialogue: 2, cible: 'dlg-nom', legende: 'Nom du fichier : 01_Les-vies_ puis TON nom, puis .py.' },
    { ecran: 'thonny', nom: '<sans nom>', dialogue: 2, cible: 'dlg-enregistrer', legende: 'Clique sur Enregistrer.' },
    { ecran: 'thonny', nom: FICHIER_VIES, cible: 'th-onglet', ok: 1, legende: 'L’onglet affiche le nom de ton fichier.' }
  ] },
  10: { titre: 'Écrire dans Thonny et enregistrer', images: [
    { ecran: 'thonny', nom: FICHIER_VIES, cible: 'th-editeur', legende: 'Clique dans la grande zone du haut, pas dans la console du bas.' },
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 1, modifie: 1, cible: 'th-editeur', legende: 'Une ligne par forme du logigramme…' },
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 3, modifie: 1, cible: 'th-editeur', legende: '… trois lignes en tout. L’étoile * de l’onglet : pas encore enregistré.' },
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 3, modifie: 1, cible: 'th-enregistrer', legende: 'Disquette « Enregistrer » (ou Ctrl + S).' },
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 3, cible: 'th-onglet', ok: 1, legende: 'L’étoile a disparu : c’est enregistré. Prédis avant d’exécuter !' }
  ] },
  11: { titre: 'Exécuter dans Thonny', images: [
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 3, cible: 'th-executer', legende: 'Icône ▶ verte « Exécuter le script courant » (ou F5).' },
    { ecran: 'thonny', nom: FICHIER_VIES, lignes: 3, run: 1, cible: 'th-console', ok: 1, legende: 'Le résultat s’affiche dans la console du bas. Compare avec ta prédiction.' }
  ] }
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



/* Une réussite n’est enregistrée qu’après prédiction, construction et transfert. */
function echangeGeneral(code,a,b){
 const lignes=code.split('\n').map(l=>l.replace(/#.*/,'').trim()).filter(Boolean);
 if(lignes[0]!==`a = ${a}`||lignes[1]!==`b = ${b}`||!/^print\(\s*a\s*,\s*b\s*\)$/.test(lignes.at(-1)))return false;
 const gestes=lignes.slice(2,-1).map(l=>/^(a|b|temp)\s*=\s*(a|b|temp)$/.exec(l));
 if(!gestes.length||gestes.some(x=>!x)||!gestes.some(x=>x[1]==='temp'))return false;
 return [[a,b],[13,-6],[-2,11]].every(([x,y])=>{const v={a:x,b:y};for(const g of gestes){if(!(g[2] in v))return false;v[g[1]]=v[g[2]];}return v.a===y&&v.b===x;});
}
/* Souple (Vincent, 09/11/2026) : une idée suffit, avec les mots de l'élève et ses fautes.
   Soit temp garde une valeur (garder, stocker, mettre de côté, retenir…), soit sans elle on la
   perd (écrasée, remplacée, effacée, deux fois le même nombre…). Refus : négation ou rien de tout ça. */
function raisonEchange(rep){
 const n=norm(rep);
 if(/(pas besoin|inutile|sert a rien|ne sert pas|ne (conserve|garde) pas)/.test(n))return false;
 const garde=/(gard|conserv|sauv|stoc?k|reti?en|souvi?en|memo|abri|preserv|de cote|copi|reserv|enregistr)/.test(n);
 const perte=/(ecras|perd|pert|ef?fac|dispar|oubli|rempla|deux fois|identique|meme (valeur|nombre|chiffre|resultat))/.test(n);
 return garde||perte;
}
/* Après SEUIL_ECHANGE erreurs différentes à une étape, la réponse s'affiche sous l'explication
   (Vincent : « affiche la réponse si trop d'essais »). Le suivi le note : « réponse montrée ». */
const SEUIL_ECHANGE=3;
function echangeGuide(zone,Q,reussi,rate,effaceRetour=()=>{}){
 const a=Q.initialA,b=Q.initialB,x=a+11,y=b+3;let codeValide='';const preuves=[];const montrees=[];
 const rateEtape=(etape,reponse)=>{let n=0,derniere=null;return (erreur,r)=>{
  if(r!==derniere){derniere=r;n++;}
  if(n<SEUIL_ECHANGE){rate(erreur,r);return;}
  if(!montrees.includes(etape))montrees.push(etape);
  rate([erreur,'Voici la réponse : '+reponse+'. Recopie-la, puis explique-la à ton voisin.'],r);
  const retour=zone.nextElementSibling;   // la réponse remplace « Toujours bloqué… J'attends de l'aide »
  if(retour)[...retour.querySelectorAll('p')].filter(x=>/^Toujours bloqué/.test(x.textContent)).forEach(x=>x.remove());
 };};
 const titre=t=>zone.append(txt('h3',null,t));
 const texte=t=>zone.append(txt('p',null,t));
 const programme=t=>{const pre=el('pre');pre.textContent=t;zone.append(pre);};
 const champs=(definitions,verifie,suite,rateIci=rate)=>{
  const f=el('form','bilan');const inputs=definitions.map(([label,numerique])=>{const lab=el('label'),inp=el('input');inp.type='text';inp.required=true;inp.maxLength=numerique?12:180;inp.setAttribute('aria-label',label);if(numerique)inp.inputMode='numeric';lab.append(txt('span',null,label),inp);f.append(lab);return inp;});
  const btn=txt('button','btn plein','Vérifier mon raisonnement');btn.type='submit';f.append(btn);zone.append(f);
  f.addEventListener('submit',e=>{e.preventDefault();if(btn.disabled)return;const r=inputs.map(x=>x.value.trim());if(r.some(x=>!x))return;const erreur=verifie(r);if(erreur){rateIci(erreur,r.join(' | '));return;}btn.disabled=true;inputs.forEach(x=>x.disabled=true);preuves.push(r.join('/'));zone.replaceChildren();effaceRetour();suite();});inputs[0].focus();
 };
 const transfert=()=>{
  titre('4. Vérifie avec d’autres valeurs');texte(`Sans exécuter : a vaut ${x} et b vaut ${y} au départ. On ne fait que les deux instructions suivantes.`);programme('temp = a\na = b');
  champs([['Valeur de a après ces deux lignes',true],['Valeur de b après ces deux lignes',true],['Valeur conservée dans temp',true]],r=>r[0]===String(y)&&r[1]===String(y)&&r[2]===String(x)?'':'Relis les affectations : copier dans a ne modifie pas b. Quelle boîte garde encore la valeur de départ de a ?',()=>{
   titre('Échange construit et raisonnement vérifié');programme(codeValide);texte('Explique à ton voisin pourquoi temp est nécessaire, sans lui dicter les trois lignes. Le professeur peut te demander cette explication.');
   reussi('prediction:'+preuves[0]+' | pourquoi:'+preuves[1].slice(0,100)+' | echange OK | transfert:'+preuves.at(-1)+(montrees.length?' | réponse montrée étape '+montrees.join(','):''));
  },rateEtape(4,`a vaut ${y}, b vaut ${y}, temp vaut ${x}`));
 };
 const construire=()=>{
  titre('3. Construis un échange qui marche avec tous les nombres');texte('Ajoute des affectations entre les deux lignes de départ et print. Utilise temp pour conserver une valeur. Ne recopie aucun nombre dans tes instructions.');
  editeur(zone,Q,code=>{codeValide=code;zone.replaceChildren();effaceRetour();transfert();},rateEtape(3,`entre b = ${b} et print(a, b), écris trois lignes : temp = a, puis a = b, puis b = temp`));
 };
 const expliquer=()=>{
  titre('2. Où est passée la première valeur ?');texte(`Après a = b puis b = a, les deux boîtes contiennent ${b}.`);
  texte('Explique le rôle de la troisième boîte avec tes mots, en une phrase. Le professeur vérifie aussi le sens.');
  champs([['Quelle valeur de départ a été perdue ?',true],['Pourquoi utiliser une boîte temporaire ?',false]],r=>!(r[0].match(/-?\d+/g)||[]).includes(String(a))||(r[0].match(/-?\d+/g)||[]).includes(String(b))?'Repère la valeur de a avant la première affectation.':!raisonEchange(r[1])?'Dis à quoi sert temp : ce qu’elle garde, ou ce qui se passerait sans elle.':'',construire,rateEtape(2,`la valeur perdue est ${a} ; pourquoi : pour garder la valeur de a avant qu’elle soit écrasée`));
 };
 titre('1. Prévois avant de programmer');texte(`Au départ, a vaut ${a} et b vaut ${b}. Ne lance pas Python : suis ces deux instructions dans l’ordre.`);programme('a = b\nb = a');
 champs([['Valeur finale de a',true],['Valeur finale de b',true]],r=>r[0]===String(b)&&r[1]===String(b)?'':'À la première ligne, a reçoit le contenu de b. À la deuxième, on lit la nouvelle valeur de a : on ne retrouve pas automatiquement l’ancienne.',expliquer,rateEtape(1,`a vaut ${b} et b vaut ${b}`));
}

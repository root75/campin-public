/* Le moteur et le contenu de la fiche « python-1 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie,
   alors que la même page sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de la séance 1 =====
   Pas de fiche élève : blocs écrits depuis le déroulé de « LogProg04_PROF_Premiers-pas-en-Python ».
   Exercices inspirés des leçons 0 et 1 de Cercles informatiques (CEMC, Université de Waterloo,
   CC BY-NC-SA 3.0), réécrits et exécutés dans la page. Thonny reste pour le défi « Les vies ».
   Chaque bloc : veux / fais / vois, stop, minutes, coince (les pièges de CE bloc), et une preuve :
   QCM (bonne réponse TOUJOURS en premier, mélangée à l'affichage, p = ce qu'on dit au piège),
   saisie (ok = test, faux = texte ou fonction de la réponse), code (depart = programme de départ,
   test(r) = true ou l'explication ; r = { sortie, erreur:{type,ligne,message}, vars, code }),
   ordre (lignes à remettre dans l'ordre, puis test(r) comme code), trace (code, vars, valeurs
   après chaque ligne, aide par ligne) ou ligne (code, bonne = la ligne fautive, p par ligne). */
const COURS = "python-1";
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

/* Les exercices à nombres variables : une fonction rend la partie du bloc qui change. */
const afficheExact = (t, detail) => ({
  titre:"Je fais afficher « "+t+" »",
  fais:`J'écris UNE ligne qui affiche exactement <b>${t}</b> ▸ <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span>.`,
  vois:"Le cadre affiche "+t+" et la fiche dit « Oui, c'est ça ».",
  coince:["Ligne rouge : il manque les guillemets ou une parenthèse.",
          "Python affiche autre chose : je compare lettre par lettre. "+detail[0].toUpperCase()+detail.slice(1)+"."],
  q:{ type:"code", q:"Écris la ligne qui affiche "+t, depart:"",
      test: r => r.erreur ? "Lis la ligne rouge. C'est un texte : il faut des guillemets, et print( ) autour."
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
  vois:`Avec ${n} paquets : ${4*n} rois, ${12*n} figures, ${52*n} cartes. Et si je change paquets = ${n} en paquets = 5, tout suit.`,
  q:{ type:"code", q:"Complète les trois lignes.", depart:"paquets = "+n+"\nrois = \nfigures = \ncartes = \nprint(rois, figures, cartes)",
      test: r => {
        if(r.erreur) return r.erreur.type==="SyntaxError" ? "Lis la ligne rouge : une ligne n'a rien à droite du =. Complète-la avec un calcul."
                                                           : "Lis la ligne rouge : quel nom Python ne connaît-il pas ? Vérifie l'orthographe de paquets.";
        const sansPaquets = ["rois","figures","cartes"].filter(v => !new RegExp("^\\s*"+v+"\\s*=.*\\bpaquets\\b","m").test(r.code));
        if(sansPaquets.length) return "La ligne de "+sansPaquets[0]+" n'utilise pas paquets : si on change le nombre de paquets, elle sera fausse. Écris un calcul avec * paquets.";
        const p = r.vars.paquets;
        return (r.vars.rois===4*p && r.vars.figures===12*p && r.vars.cartes===52*p) || "Un calcul est faux : un paquet, c'est 4 rois, 12 figures, 52 cartes. Relis chaque ligne.";
      },
      juste:"Le programme marche pour n'importe quel nombre de paquets : c'est tout l'intérêt d'une variable." } });
const tickets = (prix, nombre) => ({
  vois:`Le programme affiche ${prix*nombre} : le prix total de ${nombre} tickets à ${prix} €.`,
  q:{ type:"ordre", q:"Remets les lignes dans l'ordre.", lignes:["prix = "+prix,"nombre = "+nombre,"total = prix * nombre","print(total)"],
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "Ligne "+r.erreur.ligne+" : Python ne connaît pas encore ce nom. La variable doit être créée AVANT, plus haut." : "Lis la ligne rouge.")
               : SORTIE(r)===String(prix*nombre) ? true : "Python affiche « "+SORTIE(r)+" » : on veut "+(prix*nombre)+". Vérifie l'ordre.",
      juste:"Python lit de haut en bas : chaque variable est créée avant d'être utilisée." } });
const echange = (a, b) => ({
  fais:"Suis les quatre parties : prévoir, expliquer la valeur perdue, construire l’échange, puis vérifier avec d’autres valeurs. Explique ton idée avant de montrer ton programme au voisin.",
  vois:"Je peux expliquer ce qu’une affectation remplace et pourquoi une valeur doit être conservée.",
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
  { partie:"A — Mon premier programme", titre:"J'exécute un programme", min:3,
    veux:"Voir ce qu'un programme affiche.",
    fais:`Sous « Mon programme », bouton <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span>. La première fois, Python met quelques secondes à se préparer.`,
    vois:"Dans le cadre du dessous, le texte écrit par le programme : Bonjour !",
    coince:["Rien ne s'affiche après une minute : je recharge la page (touche F5 de Chrome) et je clique de nouveau sur Exécuter.",
            "« Le moteur Python ne se charge pas » : je pose mon chevalet. En attendant, je passe à Thonny avec le professeur."],
    q:{ type:"code", q:"Exécute le programme.", depart:'print("Bonjour !")',
        test: r => SORTIE(r)==="Bonjour !" || "Le programme a changé : clique sur ↺ Code de départ, puis sur Exécuter.",
        juste:"print affiche ce qu'il y a entre les parenthèses. Le texte est entre guillemets." } },

  { partie:"A — Mon premier programme", titre:"Je le casse exprès", min:4,
    veux:"Savoir à quoi ressemble un message d'erreur, et à quoi servent les guillemets.",
    fais:`J'efface les deux guillemets <b>"</b> ▸ <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> ▸ je lis la ligne rouge à voix haute à mon voisin.`,
    vois:"Une ligne rouge : le numéro de la ligne fautive, puis le nom de l'erreur.",
    coince:["Le guillemet \" est la touche 3 du clavier, sans Maj.",
            "Le programme marche encore : il reste un guillemet. J'efface les deux."],
    q:{ type:"code", q:"Efface les guillemets, puis exécute.", depart:'print("Bonjour !")',
        test: r => !r.erreur ? "Pas d'erreur : il reste au moins un guillemet. Efface les deux, puis Exécuter."
                 : r.code.includes('"') ? "Il reste un guillemet : efface les deux, puis Exécuter."
                 : /^print\(\s*Bonjour\s*!?\s*\)$/.test(r.code.trim()) ? true
                 : "Tu as effacé plus que les guillemets. Clique sur ↺ Code de départ, puis efface seulement les deux \".",
        juste:"Sans guillemets, Python croit que Bonjour est un nom de variable, et ne comprend plus la ligne. Le message dit OÙ (la ligne) et QUOI (le nom de l'erreur)." } },

  { partie:"A — Mon premier programme", min:6, stop:true,
    veux:"Mon premier programme écrit seul, exact à la lettre près.",
    ...afficheExact("Hello world!", "majuscule à Hello, pas de virgule, le ! collé"),
    variantes:[afficheExact("Bonjour Python!", "majuscules à Bonjour et à Python, le ! collé"),
               afficheExact("Salut tout le monde!", "une seule majuscule, à Salut, et le ! collé")] },

  { partie:"B — Les variables", titre:"La consigne de toute la leçon", min:2,
    veux:"Apprendre en prédisant, pas en cliquant au hasard.",
    fais:"Je lis la consigne. À chaque programme, je prédis ce qui va s'afficher AVANT de cliquer sur Exécuter, comme pour une trace.",
    vois:"<b>Une variable, c'est une boîte qui porte un nom.</b> <code>=</code> range une valeur dedans : c'est la flèche ← du logigramme. À droite je calcule, à gauche je range.",
    coince:["Le bouton 🐍 « Du logigramme à Python », en bas de la page, redit tout."],
    q:{ type:"qcm", q:"Quelle est la consigne de toute la leçon ?",
        c:["Je prédis ce qui va s'afficher, puis j'exécute.","Je clique jusqu'à ce que ça passe au vert.","Je recopie la réponse du voisin.","Je lis sans rien essayer."],
        p:[null,"Cliquer au hasard finit par passer, mais tu n'apprends rien. Prédis d'abord.","Ta prédiction, c'est la tienne : c'est elle qui t'entraîne.","Il faut essayer : mais après avoir prédit."] } },

  { partie:"B — Les variables", titre:"« x factor », comme une trace", min:5, stop:true,
    veux:"Suivre la valeur de x ligne par ligne, sans rien exécuter.",
    fais:"Avec le professeur, au projecteur. Pour chaque ligne, j'écris la valeur de x APRÈS cette ligne, comme dans un tableau de trace de LogProg 03.",
    vois:"La valeur de x après chaque ligne. La dernière est la valeur finale.",
    coince:["= n'est pas une égalité : à droite je calcule avec la valeur d'avant, à gauche je range.",
            "Je descends ligne par ligne : la valeur de la ligne d'avant sert au calcul de la ligne suivante."],
    ...xFactor(10, 5),
    variantes:[xFactor(7, 4), xFactor(12, 6)] },

  { partie:"B — Les variables", titre:"Le compte des cartes", min:7,
    veux:"Calculer des variables à partir d'une autre.",
    fais:`Un paquet de jeu, c'est 4 rois, 12 figures et 52 cartes. Je complète les trois lignes avec la variable <b>paquets</b> ▸ <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span>.`,
    coince:["Le signe de la multiplication est * (étoile), pas x.",
            "Je n'écris pas 12 : j'écris 4 * paquets. Sinon, le programme est faux dès qu'on change le nombre de paquets.",
            "Ligne rouge sur « rois = » : il manque le calcul à droite du =."],
    ...cartes(3),
    variantes:[cartes(2), cartes(4)] },

  { partie:"B — Les variables", titre:"Le code mélangé", min:4,
    veux:"Comprendre qu'une variable doit exister AVANT qu'on s'en serve.",
    fais:`Les lignes du programme sont mélangées. Je les remets dans l'ordre avec les boutons <span class="chemin">▲ ▼</span> ▸ bouton <span class="chemin">▶ Exécuter dans cet ordre</span>.`,
    coince:["NameError : une ligne utilise une variable qui n'est pas encore créée. Elle doit descendre.",
            "Le print vient à la fin : on affiche le total quand il est calculé.",
            "Les deux premières lignes peuvent être dans n'importe quel ordre."],
    ...tickets(4, 3),
    variantes:[tickets(5, 2), tickets(6, 3)] },

  { partie:"B — Les variables", titre:"J'échange deux boîtes", min:12,
    veux:"Échanger le contenu de deux variables, sans rien perdre.",
    extra:`<div class="encart"><p><b>À ton rythme :</b> la validation vient après les quatre parties. Si la séance s’arrête, tu pourras reprendre ce bloc. Après réussite, explique ton raisonnement à ton voisin sans lui dicter le code.</p></div>`,
    ...echange(4, 7),
    variantes:[echange(3, 9), echange(5, 8)] },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Je crée mon dossier Python", min:2,
    veux:"Un endroit où ranger tous mes programmes de l'année. Au signal du professeur seulement.",
    fais:`Explorateur de fichiers : <span class="chemin">icône dossier jaune de la barre des tâches (touche Windows+E) ▸ colonne de gauche ▸ Documents ▸ bouton Nouveau, en haut à gauche ▸ Dossier (Ctrl+Maj+N)</span> ▸ je tape <b>Python</b> ▸ touche Entrée.`,
    vois:"Un dossier Python dans Documents.",
    coince:["Le dossier s'appelle « Nouveau dossier » : clic droit dessus ▸ Renommer (touche F2) ▸ je tape Python ▸ Entrée.",
            "Pas de bouton Nouveau : clic droit dans une zone vide de Documents ▸ Nouveau ▸ Dossier."],
    q:{ type:"qcm", q:"Où est ton dossier Python ?",
        c:["Dans Documents.","Sur le Bureau.","Dans Téléchargements.","Dans Thonny."],
        p:[null,"Sur le Bureau, on ne le retrouve pas sur un autre poste. Recrée-le dans Documents.","Téléchargements se vide : recrée-le dans Documents.","Thonny est un programme, pas un dossier : le dossier Python va dans Documents."] },
    variantes:[
      { q:{ type:"qcm", q:"Comment s'appelle le dossier où tu ranges tes programmes ?",
            c:["Python","Thonny","Documents","Mes programmes"],
            p:[null,"Thonny est le programme, pas le dossier.","Documents contient ton dossier : lui s'appelle Python.","Tu l'as nommé Python : c'est ce nom qu'on cherchera à chaque séance."] } },
      { q:{ type:"qcm", q:"Dans l'Explorateur de fichiers, quel raccourci crée un nouveau dossier ?",
            c:["Ctrl+Maj+N","Ctrl+N","Ctrl+S","F2"],
            p:[null,"Ctrl+N ouvre une nouvelle fenêtre de l'Explorateur.","Ctrl+S enregistre un fichier.","F2 renomme ce qui est sélectionné."] } } ] },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"J'ouvre Thonny et j'enregistre", min:3, stop:true,
    veux:"Un fichier à mon nom, enregistré AVANT d'écrire, pour ne rien perdre.",
    fais:`<span class="chemin">touche Windows ▸ je tape Thonny ▸ Entrée</span>. Puis <span class="chemin">menu Fichier ▸ Enregistrer sous… (Ctrl+Maj+S) ▸ Documents ▸ Python ▸ Nom du fichier</span> : <b>01_Les-vies_Nom.py</b> (avec MON nom) ▸ bouton <span class="chemin">Enregistrer</span>.`,
    vois:"L'onglet du haut, dans Thonny, affiche le nom de mon fichier.",
    coince:["Thonny ne se lance pas : nouvel onglet (Ctrl+T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Entrée. Je montre mon écran au professeur : il organise la sauvegarde avant que je continue le défi dans cette console de secours. Je ne recopie pas un nom de fichier fictif pour valider ce bloc.",
            "Sans .py à la fin, Thonny n'exécute pas comme attendu : Fichier ▸ Enregistrer sous… et je corrige le nom.",
            "Deux signes différents : le tiret - entre Les et vies, le trait de soulignement _ partout ailleurs."],
    q:{ type:"saisie", q:"Recopie le nom de ton fichier, tel que Thonny l'affiche.",
        ok: r => /^01_les-vies_[^\s_]{2,}.*\.py$/i.test(r.trim()) && !/_nom\.py$/i.test(r.trim()) && portemonNom(r.trim().slice(12)),
        faux: r => !/\.py$/i.test(r.trim()) ? "Il manque .py à la fin : sans lui, Thonny n'exécute pas comme attendu. Fichier ▸ Enregistrer sous… et corrige."
                 : /_nom\.py$/i.test(r.trim()) ? "Remplace Nom par TON nom : sinon, ton fichier ne se retrouve pas. Fichier ▸ Enregistrer sous… et corrige."
                 : /^01_les-vies_[^\s_]{2,}.*\.py$/i.test(r.trim()) ? "Après 01_Les-vies_, écris TON nom, celui de ton adresse de l'école. Fichier ▸ Enregistrer sous… et corrige."
                 : "Le nom doit être 01_Les-vies_ suivi de ton nom, puis .py. Vérifie les _ et le - .",
        juste:"Le fichier est à ton nom, dans Documents ▸ Python." } },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"Je traduis le logigramme", min:4, cle:"vies", variantes:[{},{}],
    veux:"Écrire en Python le logigramme « Les vies », sans modèle.",
    fais:`Dans la zone du haut de Thonny, j'écris une ligne par forme, en suivant les flèches ▸ <span class="chemin">icône disquette « Enregistrer » (Ctrl+S)</span>. Je n'exécute pas encore.`,
    vois:"Trois lignes de Python, une par forme du milieu.",
    extra: LOGIGRAMME_VIES + `<div class="encart"><table>
  <tr><th>Dans le logigramme</th><th>En Python</th></tr>
  <tr><td>la flèche ←</td><td><b>=</b></td></tr>
  <tr><td>le parallélogramme Afficher</td><td><b>print( )</b></td></tr>
  <tr><td>Début et Fin</td><td>rien : ils ne s'écrivent pas</td></tr></table></div>`,
    coince:["Le bouton 🐍 « Du logigramme à Python », en bas de la page, redit les deux règles.",
            "Le signe − du logigramme s'écrit avec la touche - du clavier.",
            "J'ai tapé dans la console du bas : je tape dans la zone du haut, celle qui porte le nom du fichier.",
            "Tout en minuscules : Vies n'est pas vies, Print n'est pas print.",
            "Toujours bloqué après mon voisin : la 1re ligne est vies = {D}. Je cherche les deux autres seul."],
    q:{ type:"saisie", q:"AVANT d'exécuter : que va afficher ton programme ?",
        ok: r => r.trim()===String(LV.r),
        faux: r => r.trim()===String(LV.d) ? "La 2e ligne calcule "+LV.d+" − "+LV.k+" et range le résultat dans vies : la boîte ne contient plus "+LV.d+"."
                 : norm(r)==="vies" ? "Sans guillemets, print affiche ce qu'il y a dans la boîte, pas son nom."
                 : "Fais la trace : quelle valeur a vies après chaque ligne ?",
        juste:"À droite je calcule, à gauche je range : vies passe de {D} à {R}. Vérifions." } },

  { partie:"C — Défi « Les vies », dans Thonny", titre:"J'exécute et je montre", min:2, stop:true, cle:"vies", variantes:[{},{}],
    veux:"Voir si ma prédiction était juste.",
    fais:`<span class="chemin">icône ▶ verte « Exécuter le script courant » (touche F5)</span>. Puis je montre mon écran au professeur.`,
    vois:"Dans la console du bas, le nombre {R}.",
    coince:["NameError : Python ne connaît pas un nom. Je vérifie les majuscules : vies partout.",
            "SyntaxError : c'est l'écriture. Je vérifie les parenthèses de print( ).",
            "Thonny demande d'enregistrer : je clique sur Oui (ou Ctrl+S, puis F5)."],
    q:{ type:"qcm", q:"Qu'affiche la console du bas ?",
        c:["{R}","{D}","vies","Un message d'erreur"],
        p:[null,"Tu as écrit vies - {K} seul sur sa ligne ? Le calcul est fait, puis jeté. Où ranges-tu le résultat ? Corrige, Ctrl+S, F5.",
               "print(\"vies\") affiche le mot. Tu veux le mot, ou ce qu'il y a dans la boîte ? Enlève les guillemets, Ctrl+S, F5.",
               "Lis le message : quel nom ne connaît-il pas ? Compare chaque ligne avec le logigramme du bloc précédent, corrige, Ctrl+S, F5."] } }
];

const FIN = {
  titre:"🎉 J'ai fini la séance 1",
  texte:"Mon fichier 01_Les-vies est enregistré dans Documents ▸ Python : je ne le supprime pas, on le reprend à la séance 2.",
  plus:"Je change DEUX touches de mon programme pour qu'il affiche 1. Je prédis, puis F5.",
  lien:'<a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Premiers pas en Python — je révise</a>',
  citation:{
    texte:"Déjà essayé. Déjà échoué. Peu importe. Essayer encore. Échouer encore. Échouer mieux.",
    auteur:"Samuel Beckett", source:"Cap au pire (1983)",
    lien:"Un message d'erreur rouge n'est pas un échec : il me dit quoi corriger."
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



/* Une réussite n’est enregistrée qu’après prédiction, construction et transfert. */
function echangeGeneral(code,a,b){
 const lignes=code.split('\n').map(l=>l.replace(/#.*/,'').trim()).filter(Boolean);
 if(lignes[0]!==`a = ${a}`||lignes[1]!==`b = ${b}`||!/^print\(\s*a\s*,\s*b\s*\)$/.test(lignes.at(-1)))return false;
 const gestes=lignes.slice(2,-1).map(l=>/^(a|b|temp)\s*=\s*(a|b|temp)$/.exec(l));
 if(!gestes.length||gestes.some(x=>!x)||!gestes.some(x=>x[1]==='temp'))return false;
 return [[a,b],[13,-6],[-2,11]].every(([x,y])=>{const v={a:x,b:y};for(const g of gestes){if(!(g[2] in v))return false;v[g[1]]=v[g[2]];}return v.a===y&&v.b===x;});
}
function raisonEchange(rep){
 const n=norm(rep);
 return !/(pas besoin|inutile|sert a rien|ne sert pas|ne conserve pas|ne garde pas)/.test(n)&&/(valeur|contenu|nombre)/.test(n)&&(/(conserv|gard|sauvegard|sauv|abri|preserv)/.test(n)&&/(ecras|perd|remplac|avant)/.test(n)||/(pour|afin de) ne pas (perdre|ecraser)/.test(n));
}
function echangeGuide(zone,Q,reussi,rate,effaceRetour=()=>{}){
 const a=Q.initialA,b=Q.initialB,x=a+11,y=b+3;let codeValide='';const preuves=[];
 const titre=t=>zone.append(txt('h3',null,t));
 const texte=t=>zone.append(txt('p',null,t));
 const programme=t=>{const pre=el('pre');pre.textContent=t;zone.append(pre);};
 const champs=(definitions,verifie,suite)=>{
  const f=el('form','bilan');const inputs=definitions.map(([label,numerique])=>{const lab=el('label'),inp=el('input');inp.type='text';inp.required=true;inp.maxLength=numerique?12:180;inp.setAttribute('aria-label',label);if(numerique)inp.inputMode='numeric';lab.append(txt('span',null,label),inp);f.append(lab);return inp;});
  const btn=txt('button','btn plein','Vérifier mon raisonnement');btn.type='submit';f.append(btn);zone.append(f);
  f.addEventListener('submit',e=>{e.preventDefault();if(btn.disabled)return;const r=inputs.map(x=>x.value.trim());if(r.some(x=>!x))return;const erreur=verifie(r);if(erreur){rate(erreur,r.join(' | '));return;}btn.disabled=true;inputs.forEach(x=>x.disabled=true);preuves.push(r.join('/'));zone.replaceChildren();effaceRetour();suite();});inputs[0].focus();
 };
 const transfert=()=>{
  titre('4. Vérifie avec d’autres valeurs');texte(`Sans exécuter : a vaut ${x} et b vaut ${y} au départ. On ne fait que les deux instructions suivantes.`);programme('temp = a\na = b');
  champs([['Valeur de a après ces deux lignes',true],['Valeur de b après ces deux lignes',true],['Valeur conservée dans temp',true]],r=>r[0]===String(y)&&r[1]===String(y)&&r[2]===String(x)?'':'Relis les affectations : copier dans a ne modifie pas b. Quelle boîte garde encore la valeur de départ de a ?',()=>{
   titre('Échange construit et raisonnement vérifié');programme(codeValide);texte('Explique à ton voisin pourquoi temp est nécessaire, sans lui dicter les trois lignes. Le professeur peut te demander cette explication.');
   reussi('prediction:'+preuves[0]+' | pourquoi:'+preuves[1].slice(0,100)+' | echange OK | transfert:'+preuves.at(-1));
  });
 };
 const construire=()=>{
  titre('3. Construis un échange qui marche avec tous les nombres');texte('Ajoute des affectations entre les deux lignes de départ et print. Utilise temp pour conserver une valeur. Ne recopie aucun nombre dans tes instructions.');
  editeur(zone,Q,code=>{codeValide=code;zone.replaceChildren();effaceRetour();transfert();},rate);
 };
 const expliquer=()=>{
  titre('2. Où est passée la première valeur ?');texte(`Après a = b puis b = a, les deux boîtes contiennent ${b}.`);
  texte('Explique le rôle de la troisième boîte avec tes mots. Ta phrase doit relier la conservation de la valeur au risque de l’écraser. Le contrôle repère ces idées ; le professeur vérifie aussi le sens.');
  champs([['Quelle valeur de départ a été perdue ?',true],['Pourquoi utiliser une boîte temporaire ?',false]],r=>r[0]!==String(a)?'Repère la valeur de a avant la première affectation.':!raisonEchange(r[1])?'Explique ce que l’on conserve avant qu’une affectation écrase ou remplace une valeur.':'',construire);
 };
 titre('1. Prévois avant de programmer');texte(`Au départ, a vaut ${a} et b vaut ${b}. Ne lance pas Python : suis ces deux instructions dans l’ordre.`);programme('a = b\nb = a');
 champs([['Valeur finale de a',true],['Valeur finale de b',true]],r=>r[0]===String(b)&&r[1]===String(b)?'':'À la première ligne, a reçoit le contenu de b. À la deuxième, on lit la nouvelle valeur de a : on ne retrouve pas automatiquement l’ancienne.',expliquer);
}

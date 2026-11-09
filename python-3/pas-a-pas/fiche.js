/* Le moteur et le contenu de la fiche « python-3 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie,
   alors que la même page sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de Python 03 — Texte, nombre et input() =====
   Exercices inspirés des leçons 4 « Types » et 5 « Entrée » de Cercles informatiques (CEMC,
   Université de Waterloo, CC BY-NC-SA 3.0), relevées le 07/11/2026, réécrites et exécutées dans la
   page. Thonny reste pour « Le score » (logigramme 4 de LogProg 03, sans son losange : le bonus
   attend le si…alors de Python 04).
   Même moteur que Python 02 (voir son en-tête pour les types de preuve), plus un ajout :
   une question de code peut porter `essais` : la liste des réponses tapées au clavier, essai par
   essai (ex. [["3"],["8"]] = deux exécutions, on tape 3 puis on tape 8). input() lit ces réponses
   dans l'ordre et les réécrit dans la console, comme Thonny. test(r) reçoit alors r.essais, la
   liste des résultats (un r par essai). Sans `essais`, une seule exécution, sans rien à taper. */
const COURS = "python-3";
const PRESENTATION = "missions";   // blocs.js : cloche, mascotte, bulle, bravo
const CODE = s => `<pre class="code">${s}</pre>`;
const SORTIE = r => r.sortie.replace(/\s+$/,"");
const DERNIERE = r => SORTIE(r).split("\n").pop();

/* ===== Variantes (contre la copie) — même mécanisme que Python 01 et 02 =====
   « Les vies » : {D} (départ), {K} (ce qu'on enlève), {R} (le résultat), clé partagée « vies ». */
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

const CASES = (...l) => `<ol class="etapes">${l.map(x => `<li><label><input type="checkbox"><span>${x}</span></label></li>`).join("")}</ol>`;
const EXECUTER = `Clique sur <span class="chemin">▶ Exécuter</span> (ou <b>Ctrl + Enter</b>).`;
const sansAccent = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"");

/* Le nom du fichier doit porter le nom de l'élève : le prénom ou le nom de son adresse. */
const nomsEleve = () => EMAIL ? EMAIL.split("@")[0].split(".").map(m=>norm(m).replace(/[^a-z]/g,"")).filter(m=>m.length>1) : [];
const portemonNom = f => { const n = nomsEleve(); return !n.length || n.some(m => norm(f).replace(/[^a-z]/g,"").includes(m)); };

/* ===== Les exercices à valeurs variables : une fonction rend la partie du bloc qui change ===== */

/* Deux textes collés : "3" + "4" → 34. */
const colle = (a, b) => ({
  vois:`Le programme affiche ${a+b}.`,
  coince:[`Entre guillemets, "${a}" est un texte : + colle les deux textes, il ne calcule pas.`,
          "Deux façons de réparer : enlever les guillemets, ou transformer chaque texte en nombre avec int( )."],
  q:{ type:"code", q:`Répare le programme : il doit afficher ${a+b}, pas ${a}${b}.`,
      depart:`a = "${a}"\nb = "${b}"\nprint(a + b)`,
      test: r => r.erreur ? "Lis la ligne rouge. Un guillemet tout seul casse l'écriture : enlève-les par paires."
               : !/\ba\b[\s\S]*\bb\b/.test(r.code.split("\n").slice(2).join("\n")) ? "Garde a et b dans le calcul : le programme doit marcher avec d'autres nombres."
               : SORTIE(r)===`${a}${b}` ? `Python affiche encore ${a}${b} : a et b sont toujours des textes.`
               : SORTIE(r)===String(a+b) ? true
               : `Python affiche « ${SORTIE(r)} » : on attend ${a+b}.`,
      juste:`Sans guillemets (ou avec int( )), a et b sont des nombres : + calcule ${a} + ${b} = ${a+b}.` } });

/* Texte + nombre : TypeError. On répare avec la virgule de print. */
const melangeTexte = (texte, nom, val) => ({
  vois:`Le programme affiche ${texte} : ${val}`,
  coince:["TypeError : on additionne un texte et un nombre. Python refuse de deviner.",
          `Dans print, la virgule sépare deux choses à afficher et met un espace entre elles : print("${texte} :", ${nom}).`],
  q:{ type:"code", q:`Répare le programme : il doit afficher ${texte} : ${val}`,
      depart:`${nom} = ${val}\nprint("${texte} : " + ${nom})`,
      test: r => r.erreur ? (r.erreur.type==="TypeError" ? "Toujours TypeError : un texte + un nombre. Remplace le + par une virgule." : "Lis la ligne rouge : il manque un guillemet ou une parenthèse ?")
               : new RegExp("print\\([^\\n]*\\b"+val+"\\b").test(r.code) ? `Ne tape pas ${val} dans print : affiche la boîte ${nom}, pour que le programme marche avec un autre nombre.`
               : SORTIE(r).replace(/\s+/g," ")===`${texte} : ${val}` ? true
               : `Python affiche « ${SORTIE(r)} ». On attend : ${texte} : ${val}`,
      juste:"La virgule de print affiche le texte, un espace, puis le nombre. Pas de mélange, pas d'erreur." } });

/* Nombres à virgule (QCM « Flottant » de la leçon 4). */
const flottant = (x, y) => {
  const z = x*y, zf = Number.isInteger(z) ? z+".0" : String(z);
  return {
    extra: CODE(`x = ${x}\ny = ${y}\nz = x * y\nprint(x, y, z)`),
    q:{ type:"qcm", q:"Prédis : qu'affiche ce programme ?",
        c:[`${x} ${y} ${zf}`, `${x} ${y} ${z}`, `${x} ${y}.0 ${zf}`, "Une erreur TypeError"],
        p:[null, `x vaut ${x}, un nombre à virgule : le résultat de x * y en est un aussi, et Python l'affiche avec .0.`,
           "y n'a jamais changé : il vaut toujours "+y+", un nombre entier.",
           "Mélanger un nombre entier et un nombre à virgule est permis : seuls texte et nombre ne se mélangent pas."],
        juste:`x * y mélange un entier et un nombre à virgule : le résultat est un nombre à virgule, ${zf}.` } };
};

/* input() : le programme salue la personne qui tape son prénom. */
const salue = mot => ({
  vois:`Quand on tape Léa, la console affiche ${mot} Léa.`,
  q:{ type:"code", q:`Complète le programme : il demande un prénom, puis affiche ${mot} et ce prénom.`,
      depart:`prenom = input("Ton prénom ? ")\n`, essais:[["Léa"],["Sam"]],
      test: r => r.erreur ? (r.erreur.type==="NameError" ? "NameError : prenom s'écrit sans accent, exactement comme à la 1re ligne." : "Lis la ligne rouge : guillemets et parenthèses vont par paires.")
               : !/input\(/.test(r.code) ? "Garde la 1re ligne : c'est elle qui demande le prénom."
               : r.essais.every((e,i) => DERNIERE(e).replace(/\s+/g," ")===`${mot} ${["Léa","Sam"][i]}`) ? true
               : r.essais.some(e => DERNIERE(e)==="prenom" || /prenom$/.test(DERNIERE(e))) ? "La console affiche le mot prenom : sans guillemets, print affiche ce qu'il y a dans la boîte."
               : `Avec Léa, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend : ${mot} Léa`,
      juste:`input( ) range dans prenom ce qu'on tape. print("${mot}", prenom) l'affiche après ${mot}.` } });

/* Echo (leçon 5) : un seul input(), une variable, plusieurs print. */
const echo = n => ({
  vois:`Quand on tape Echo, la console affiche Echo ${n} fois (plus la ligne que tu as tapée).`,
  coince:["EOFError : le programme veut lire une 2e réponse, mais on n'a tapé qu'une seule ligne. Chaque input( ) attend une nouvelle réponse.",
          "Lis UNE fois, range dans une boîte : mot = input(). Puis affiche la boîte autant de fois qu'il faut."],
  q:{ type:"code", q:`Répare le programme : il lit UNE ligne et l'affiche ${n} fois.`,
      depart: Array(n).fill("print(input())").join("\n"), essais:[["Echo"],["Hop"]],
      test: r => r.essais.some(e => e.erreur && e.erreur.type==="EOFError") ? `EOFError : il y a ${(r.code.match(/input\(/g)||[]).length} input( ), mais une seule ligne tapée. Garde un seul input( ) et range sa réponse dans une boîte.`
               : r.erreur ? "Lis la ligne rouge : parenthèses et noms."
               : (r.code.match(/input\(/g)||[]).length!==1 ? "Un seul input( ) : c'est lui qui lit la ligne."
               : r.essais.every((e,i) => { const l = SORTIE(e).split("\n"), m = ["Echo","Hop"][i]; return l.length===n+1 && l.every(x => x.trim()===m); }) ? true
               : `Avec Echo, la console doit montrer Echo ${n+1} fois : la ligne tapée, puis ${n} fois le print.`,
      juste:`input( ) n'est appelé qu'une fois ; la boîte, elle, s'affiche autant de fois qu'on veut.` } });

/* Le piège du nombre tapé : "3" * 10 → 3333333333. */
const PIEGE_V = [{n:3,m:10},{n:5,m:4},{n:7,m:3}];
const piegeQ = ({n,m}) => ({
  extra: CODE(`nombre = input("Un nombre ? ")\nprint(nombre * ${m})`) + `<p>À l'exécution, on tape <b>${n}</b> puis Enter.</p>`,
  q:{ type:"qcm", q:"Prédis : qu'affiche la dernière ligne ?",
      c:[String(n).repeat(m), String(n*m), "Une erreur TypeError", `nombre * ${m}`],
      p:[null, `input( ) rend TOUJOURS un texte : "${n}", pas ${n}. Et un texte fois ${m}, c'est le texte recopié ${m} fois.`,
         `Texte × nombre est permis en Python (souviens-toi de "ha" * 3). Seul texte + nombre est refusé.`,
         "Sans guillemets, nombre * "+m+" est un calcul : Python affiche son résultat, pas la formule."],
      juste:`"${n}" est un texte : × ${m} le recopie ${m} fois. Il faut le transformer en nombre : c'est le bloc suivant.` } });
const piegeCode = ({n,m}) => {
  const autre = n===3 ? 8 : n===5 ? 2 : 4;
  return {
    vois:`On tape ${n} : la console affiche ${n*m}. On tape ${autre} : elle affiche ${autre*m}.`,
    coince:["int( ) transforme un texte en nombre entier : int(\"3\") vaut 3.",
            "On peut convertir à la lecture, nombre = int(input(\"Un nombre ? \")), ou juste avant le calcul, int(nombre) * …"],
    q:{ type:"code", q:`Répare le programme : il doit afficher ${n*m} quand on tape ${n}.`,
        depart:`nombre = input("Un nombre ? ")\nprint(nombre * ${m})`, essais:[[String(n)],[String(autre)]],
        test: r => r.erreur ? (r.erreur.type==="ValueError" ? "ValueError : int( ) a reçu autre chose qu'un nombre entier. Ne touche pas aux réponses tapées." : "Lis la ligne rouge : chaque parenthèse ouverte doit être fermée. int(input(\"…\")) en a DEUX à la fin.")
                 : !/\bint\(/.test(r.code) ? "Utilise int( ) : c'est lui qui transforme le texte en nombre."
                 : DERNIERE(r.essais[0])===String(n).repeat(m) ? "Toujours recopié : int( ) doit entourer le texte tapé (ou la boîte nombre)."
                 : r.essais.every((e,i) => DERNIERE(e)===String([n,autre][i]*m)) ? true
                 : `Avec ${n}, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend ${n*m}.`,
        juste:`int( ) transforme le texte "${n}" en nombre ${n} : × ${m}, cela fait ${n*m}.` } };
};

/* Ce qui se passe quand on tape autre chose qu'un nombre entier. */
const tapeQ = (tape, c, p, juste) => ({ q:{ type:"qcm", q:`Prédis : tu exécutes « Le score » et tu tapes ${tape}. Que se passe-t-il ?`, c, p, juste } });

const LOGIGRAMME_SCORE = `<figure class="logigramme"><svg viewBox="0 0 240 380" role="img" aria-label="Logigramme Le score : Début, Lire pieces, score ← pieces × 10, Afficher score, Fin">
  <defs><marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b6873"/></marker></defs>
  <g stroke="#5b6873" stroke-width="2" marker-end="url(#pointe)"><line x1="120" y1="50" x2="120" y2="78"/><line x1="120" y1="126" x2="120" y2="154"/><line x1="120" y1="202" x2="120" y2="230"/><line x1="120" y1="278" x2="120" y2="306"/></g>
  <g stroke-width="2" font-family="Atkinson Hyperlegible, Segoe UI, Arial, sans-serif" font-size="19" text-anchor="middle" fill="#1f2a33">
    <ellipse cx="120" cy="27" rx="70" ry="23" fill="#d5e8d4" stroke="#82b366"/><text x="120" y="34" stroke="none">Début</text>
    <path d="M45 80H225L195 126H15Z" fill="#e1d5e7" stroke="#9673a6"/><text x="120" y="110" stroke="none">Lire pieces</text>
    <rect x="15" y="156" width="210" height="46" rx="8" fill="#dae8fc" stroke="#6c8ebf"/><text x="120" y="186" stroke="none">score ← pieces × 10</text>
    <path d="M45 232H225L195 278H15Z" fill="#e1d5e7" stroke="#9673a6"/><text x="120" y="262" stroke="none">Afficher score</text>
    <ellipse cx="120" cy="331" rx="70" ry="23" fill="#f8cecc" stroke="#b85450"/><text x="120" y="338" stroke="none">Fin</text>
  </g></svg><figcaption>Le logigramme « Le score » (LogProg 03), sans son losange</figcaption></figure>`;
const SCORE_V = [{n:3,r:30},{n:7,r:70},{n:5,r:50}];
const scorePredit = ({n,r}) => ({
  q:{ type:"saisie", q:`AVANT d'exécuter : tu taperas ${n}. Que va afficher la dernière ligne ?`,
      ok: x => x.trim()===String(r) || x.replace(/\s+/g," ").trim()===`Score : ${r}`,
      faux: x => x.trim()===String(n).repeat(10) ? "Ça, c'est le piège : sans int( ), le texte est recopié. Ton programme a bien int( ) ?"
               : x.trim()===String(n) ? `${n}, c'est le nombre de pièces. Le score, c'est pieces × 10.`
               : "Fais la trace : pieces vaut "+n+", puis score vaut pieces × 10.",
      juste:`pieces vaut ${n}, score vaut ${n} × 10 = ${r}. Maintenant F5, et vérifie dans Thonny.` } });

const BLOCS = [
  { partie:"A — Se remettre en route", titre:"Quelle sorte d'erreur ?", min:3,
    bulle:"Re-bonjour ! D'abord, un rappel de la séance des erreurs.",
    veux:"Te rappeler les trois sortes d'erreurs de Python 02.",
    fais:CASES("Lis le programme et ce qu'il est censé faire.", "Prédis la sorte d'erreur, puis réponds."),
    extra: CODE("score = 10\nprint(score"),
    coince:["SyntaxError : l'écriture est cassée. NameError : un nom inconnu. Logique : pas de ligne rouge, mais un résultat faux."],
    q:{ type:"qcm", q:"Quelle sorte d'erreur ?",
        c:["SyntaxError : l'écriture est cassée.","NameError : un nom inconnu.","Une erreur de logique : le résultat est faux.","Aucune erreur."],
        p:[null,"Le nom score existe : c'est la parenthèse finale qui manque.","Une erreur de logique ne donne pas de ligne rouge. Ici, Python ne peut même pas lire la ligne.","Compte les parenthèses de la 2e ligne."],
        juste:"Une parenthèse ouverte doit être fermée : l'écriture est cassée." },
    variantes:[
      { extra: CODE("score = 10\nprint(Score)"),
        q:{ type:"qcm", q:"Quelle sorte d'erreur ?",
            c:["NameError : un nom inconnu.","SyntaxError : l'écriture est cassée.","Une erreur de logique : le résultat est faux.","Aucune erreur."],
            p:[null,"L'écriture est correcte : c'est Score, avec une majuscule, que Python ne connaît pas.","Python s'arrête avec une ligne rouge : ce n'est pas une erreur de logique.","Python lit chaque lettre : Score n'est pas score."],
            juste:"Score n'est pas score : Python ne connaît pas ce nom." } },
      { extra: CODE("# le score doit passer de 10 à 15\nscore = 10\nscore = score - 5\nprint(score)"),
        q:{ type:"qcm", q:"Quelle sorte d'erreur ?",
            c:["Une erreur de logique : le résultat est faux.","SyntaxError : l'écriture est cassée.","NameError : un nom inconnu.","Aucune erreur."],
            p:[null,"Toutes les lignes sont bien écrites : Python exécute sans ligne rouge.","Tous les noms existent : score est créé à la 2e ligne.","Le programme affiche 5, pas 15 : relis le commentaire."],
            juste:"Aucune ligne rouge, mais 5 au lieu de 15 : le − devait être un +." } } ] },

  { partie:"B — Texte ou nombre ?", titre:"Deux sortes de valeurs", min:3,
    bulle:"Pour Python, \"3\" et 3, ce n'est pas du tout pareil.",
    veux:"Distinguer un texte d'un nombre.",
    fais:CASES("Lis l'encadré.", "Prédis, puis réponds."),
    extra:`<div class="encart"><table>
  <tr><th>On écrit</th><th>Python y voit</th><th>Son type</th></tr>
  <tr><td><code>"3"</code></td><td>un texte (avec des guillemets)</td><td><code>str</code></td></tr>
  <tr><td><code>3</code></td><td>un nombre entier</td><td><code>int</code></td></tr>
  <tr><td><code>3.5</code></td><td>un nombre à virgule (avec un POINT)</td><td><code>float</code></td></tr></table>
  <p>Avec deux nombres, <b>+</b> calcule : <code>3 + 4</code> donne 7. Avec deux textes, <b>+</b> colle : <code>"3" + "4"</code> donne 34.</p>
  <p><code>print(type(3))</code> affiche <code>&lt;class 'int'&gt;</code> : Python dit le type.</p></div>`,
    coince:["Les guillemets changent tout : ce qui est entre guillemets est un texte, même si ce sont des chiffres."],
    q:{ type:"qcm", q:`Prédis : que fait print("5" + "2") ?`, c:["52","7","5 + 2","Une erreur"],
        p:[null,"Les guillemets en font des textes : + colle, il ne calcule pas.","Entre guillemets, Python affiche le résultat : il colle les deux textes.","Coller deux textes est permis : pas d'erreur."], juste:"Deux textes : + les colle, 5 puis 2." },
    variantes:[
      { q:{ type:"qcm", q:`Prédis : que fait print("6" + "1") ?`, c:["61","7","6 + 1","Une erreur"],
            p:[null,"Les guillemets en font des textes : + colle, il ne calcule pas.","Entre guillemets, Python affiche le résultat : il colle les deux textes.","Coller deux textes est permis : pas d'erreur."], juste:"Deux textes : + les colle, 6 puis 1." } },
      { q:{ type:"qcm", q:`Prédis : que fait print("4" + "4") ?`, c:["44","8","4 + 4","Une erreur"],
            p:[null,"Les guillemets en font des textes : + colle, il ne calcule pas.","Entre guillemets, Python affiche le résultat : il colle les deux textes.","Coller deux textes est permis : pas d'erreur."], juste:"Deux textes : + les colle, 4 puis 4." } } ] },

  { partie:"B — Texte ou nombre ?", titre:"Le total qui colle", min:5,
    bulle:"Pas de ligne rouge… mais un total bizarre.",
    veux:"Réparer un calcul fait sur des textes.",
    fais:CASES("Exécute le programme tel quel : "+EXECUTER, "Compare avec le résultat attendu.", "Répare, puis exécute à nouveau."),
    ...colle(3, 4),
    variantes:[colle(6, 2), colle(5, 4)] },

  { partie:"B — Texte ou nombre ?", titre:"Texte fois nombre", min:3,
    bulle:"Et si on multiplie un texte ?",
    veux:"Prédire ce que fait * sur un texte.",
    fais:CASES("Lis l'encadré.", "Prédis, puis réponds."),
    extra:`<div class="encart"><p>Un texte multiplié par un nombre entier est <b>recopié</b> : <code>"hop" * 2</code> donne <b>hophop</b>.</p><p>Mais un texte <b>+</b> un nombre est refusé : <b>TypeError</b>.</p></div>`,
    coince:["* recopie le texte autant de fois que le nombre le dit, sans espace."],
    q:{ type:"qcm", q:`Prédis : que fait print("ha" * 3) ?`, c:["hahaha","ha3","ha ha ha","Une erreur TypeError"],
        p:[null,"* ne colle pas le nombre : il recopie le texte.","Python n'ajoute pas d'espace entre les copies.","Texte × nombre est permis ; c'est texte + nombre qui est refusé."], juste:"Le texte ha, recopié 3 fois." },
    variantes:[
      { q:{ type:"qcm", q:`Prédis : que fait print("bip" * 2) ?`, c:["bipbip","bip2","bip bip","Une erreur TypeError"],
            p:[null,"* ne colle pas le nombre : il recopie le texte.","Python n'ajoute pas d'espace entre les copies.","Texte × nombre est permis ; c'est texte + nombre qui est refusé."], juste:"Le texte bip, recopié 2 fois." } },
      { q:{ type:"qcm", q:`Prédis : que fait print("na" * 4) ?`, c:["nananana","na4","na na na na","Une erreur TypeError"],
            p:[null,"* ne colle pas le nombre : il recopie le texte.","Python n'ajoute pas d'espace entre les copies.","Texte × nombre est permis ; c'est texte + nombre qui est refusé."], juste:"Le texte na, recopié 4 fois." } } ] },

  { partie:"B — Texte ou nombre ?", titre:"Texte + nombre : TypeError", min:5, stop:true,
    bulle:"Afficher un texte ET un nombre, sans erreur.",
    veux:"Afficher un texte et un nombre sur la même ligne.",
    fais:CASES("Exécute le programme tel quel : "+EXECUTER, "Lis la ligne rouge : quel est le nom de l'erreur ?", "Répare avec une virgule, puis exécute à nouveau."),
    ...melangeTexte("Vies", "vies", 3),
    variantes:[melangeTexte("Score", "score", 30), melangeTexte("Pièces", "pieces", 7)] },

  { partie:"B — Texte ou nombre ?", titre:"Les nombres à virgule", min:3,
    bulle:"Un dernier type : les nombres à virgule.",
    veux:"Prédire le type d'un calcul qui mélange entier et nombre à virgule.",
    fais:CASES("Lis le programme ligne par ligne.", "Prédis les trois valeurs affichées, puis réponds."),
    coince:["En Python, la virgule d'un nombre s'écrit avec un POINT : 1.5.",
            "Un calcul avec un nombre à virgule donne un nombre à virgule, même quand le résultat tombe juste : 3.0."],
    ...flottant(1.5, 2),
    variantes:[flottant(2.5, 2), flottant(0.5, 4)] },

  { partie:"C — Le programme pose une question", titre:"input() : le programme attend", min:5,
    bulle:"Jusqu'ici, tes programmes parlaient. Maintenant, ils écoutent !",
    veux:"Écrire un programme qui demande quelque chose à la personne qui l'utilise.",
    fais:CASES("Lis l'encadré.", "Complète le programme : une 2e ligne qui affiche le mot demandé et le prénom.", EXECUTER),
    extra:`<div class="encart"><p><code>prenom = input("Ton prénom ? ")</code> affiche la question, <b>attend</b> qu'on tape une réponse et Enter, puis range la réponse dans la boîte <code>prenom</code>.</p>
  <p><b>Dans Thonny</b>, la console du bas attend : tu tapes ta réponse, puis Enter.<br><b>Dans cette page</b>, les réponses sont déjà tapées pour toi : la fiche essaie ton programme avec <b>Léa</b>, puis avec <b>Sam</b>.</p>
  <p>Dans la console, la ligne tapée reste affichée, comme dans Thonny.</p></div>`,
    coince:["Les noms de variables s'écrivent sans accent : prenom, pas prénom.",
            "print(\"Bonjour\", prenom) : le texte entre guillemets, une virgule, la boîte sans guillemets."],
    ...salue("Bonjour"),
    variantes:[salue("Salut"), salue("Coucou")] },

  { partie:"C — Le programme pose une question", titre:"Echo", min:4,
    bulle:"Un programme qui demande trop…",
    veux:"Comprendre qu'un input( ) = une réponse à taper.",
    fais:CASES("Exécute le programme tel quel : "+EXECUTER, "Lis le nom de l'erreur.", "Répare : un seul input( ), rangé dans une boîte.", EXECUTER),
    ...echo(2),
    variantes:[echo(3), echo(4)] },

  { partie:"C — Le programme pose une question", titre:"Le piège du nombre tapé", min:3, cle:"piege",
    bulle:"Attention, piège !",
    veux:"Découvrir ce que input( ) rend vraiment.",
    fais:CASES("Lis le programme.", "Prédis ce qu'affiche la dernière ligne, puis réponds."),
    coince:["Ce qu'on tape au clavier, c'est toujours du texte, même des chiffres."],
    ...piegeQ(PIEGE_V[0]),
    variantes:[piegeQ(PIEGE_V[1]), piegeQ(PIEGE_V[2])] },

  { partie:"C — Le programme pose une question", titre:"Réparer avec int()", min:5, stop:true, cle:"piege",
    bulle:"int( ) : du texte au nombre.",
    veux:"Transformer la réponse tapée en nombre.",
    fais:CASES("Exécute le programme tel quel : "+EXECUTER, "Ajoute int( ) au bon endroit.", "Exécute : la fiche essaie deux nombres."),
    extra:`<div class="encart"><p><code>int("3")</code> transforme le texte <b>"3"</b> en nombre <b>3</b>. La forme la plus courante, à retenir :</p>${CODE('nombre = int(input("Un nombre ? "))')}
  <p><b>Dans Thonny</b>, <span class="chemin">menu Affichage ▸ Variables</span> le montre : sans int( ), la boîte contient <code>'3'</code>, <b>entre apostrophes</b> : c'est un texte. Avec int( ), elle contient <code>3</code>.</p></div>`,
    ...piegeCode(PIEGE_V[0]),
    variantes:[piegeCode(PIEGE_V[1]), piegeCode(PIEGE_V[2])] },

  { partie:"D — « Le score », dans Thonny", titre:"Un nouveau fichier à mon nom", min:3, stop:true,
    bulle:"Retour dans Thonny : un nouveau programme, un nouveau fichier.",
    veux:"Enregistrer un nouveau fichier à ton nom AVANT d'écrire.",
    fais:CASES(`Appuie sur la touche <b>Windows</b> ⊞, tape <b>Thonny</b>, puis appuie sur <b>Enter</b>.`,
               `Dans Thonny : <span class="chemin">menu Fichier ▸ Nouveau</span> (ou <b>Ctrl + N</b>).`,
               `Puis <span class="chemin">menu Fichier ▸ Enregistrer sous…</span> (ou <b>Ctrl + Shift + S</b>).`,
               `Dans la fenêtre qui s'ouvre : <span class="chemin">Documents ▸ double-clic sur Python</span>.`,
               `Dans <span class="chemin">Nom du fichier</span>, tape <b>02_Le-score_Nom.py</b>, avec TON nom à la place de Nom.`,
               `Clique sur <span class="chemin">Enregistrer</span>.`),
    vois:"L'onglet, en haut de Thonny, affiche 02_Le-score_ et ton nom.",
    coince:["Thonny ne se lance pas : nouvel onglet (Ctrl + T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Enter. Rien n’y est enregistré : sonne la cloche 🔔 ; le professeur organise la sauvegarde.",
            "Ton dossier Python n'est pas dans Documents : crée-le. Documents ▸ ⊕ Nouveau ▸ Dossier ▸ Python ▸ Enter.",
            "Deux signes différents : le tiret - entre Le et score, le trait de soulignement _ partout ailleurs."],
    q:{ type:"saisie", q:"Recopie le nom de ton fichier, tel que Thonny l'affiche.",
        ok: r => /^02_le-score_[^\s_]{2,}.*\.py$/i.test(r.trim()) && !/_nom\.py$/i.test(r.trim()) && portemonNom(r.trim().slice(12)),
        faux: r => !/\.py$/i.test(r.trim()) ? "Il manque .py à la fin. Fichier ▸ Enregistrer sous… et corrige."
                 : /_nom\.py$/i.test(r.trim()) ? "Remplace Nom par TON nom. Fichier ▸ Enregistrer sous… et corrige."
                 : /^02_le-score_[^\s_]{2,}.*\.py$/i.test(r.trim()) ? "Après 02_Le-score_, écris TON nom, celui de ton adresse de l'école. Fichier ▸ Enregistrer sous… et corrige."
                 : "Le nom doit être 02_Le-score_ suivi de ton nom, puis .py. Vérifie les _ et le - .",
        juste:"Le fichier est à ton nom, dans Documents ▸ Python, à côté de « Les vies »." } },

  { partie:"D — « Le score », dans Thonny", titre:"Traduire « Le score »", min:8, cle:"score",
    bulle:"Le logigramme du score : à toi de le traduire, sans modèle.",
    veux:"Écrire en Python un logigramme qui lit, calcule et affiche.",
    fais:CASES("Écris une ligne par forme du logigramme, dans la zone du haut de Thonny.",
               `Pour « Lire pieces » : <code>pieces = int(input("Combien de pièces ? "))</code>.`,
               `Enregistre : <span class="chemin">icône disquette « Enregistrer »</span> (ou <b>Ctrl + S</b>).`,
               "N'exécute pas encore : prédis, ci-dessous.",
               `Puis <span class="chemin">icône ▶ verte</span> (ou <b>F5</b>) : clique dans la console du bas, tape ton nombre, puis <b>Enter</b>.`),
    vois:"Trois lignes de Python. La console pose la question, attend ta réponse, puis affiche le score.",
    extra: LOGIGRAMME_SCORE + `<div class="encart"><table>
  <tr><th>Dans le logigramme</th><th>En Python</th></tr>
  <tr><td>Lire (parallélogramme)</td><td><b>int(input(…))</b>, rangé dans une boîte</td></tr>
  <tr><td>la flèche ←</td><td><b>=</b></td></tr>
  <tr><td>le signe ×</td><td><b>*</b> (Shift + ù, ou le * du pavé numérique)</td></tr>
  <tr><td>Afficher (parallélogramme)</td><td><b>print( )</b></td></tr></table></div>`,
    coince:["Le bouton 🐍 « Texte, nombre et input() », en bas de la page, redit les règles.",
            "Rien ne se passe après F5 : le programme attend ! Clique dans la console du bas, tape un nombre, puis Enter.",
            "pieces s'écrit sans accent, partout pareil.",
            "Toujours bloqué après ton voisin : la 1re ligne est donnée dans les cases. Cherche les deux autres seul."],
    ...scorePredit(SCORE_V[0]),
    variantes:[scorePredit(SCORE_V[1]), scorePredit(SCORE_V[2])] },

  { partie:"D — « Le score », dans Thonny", titre:"Le prouver ici", min:4,
    bulle:"Ton programme marche dans Thonny ? Prouve-le ici.",
    veux:"Montrer que ton programme marche pour n'importe quel nombre de pièces.",
    fais:CASES("Dans Thonny, sélectionne tout ton programme (<b>Ctrl + A</b>) et copie-le (<b>Ctrl + C</b>).",
               "Clique dans le cadre ci-dessous et colle (<b>Ctrl + V</b>).", EXECUTER),
    vois:"La fiche essaie avec 3 pièces, puis avec 12 : 30, puis 120.",
    coince:["ValueError : int( ) a reçu autre chose qu'un nombre entier. Ici, la fiche tape 3 puis 12 : regarde ta ligne input.",
            "Le cadre affiche le nombre de pièces au lieu du score : print doit afficher la boîte score.",
            "Tu peux afficher print(score) ou print(\"Score :\", score) : les deux sont acceptés."],
    q:{ type:"code", q:"Colle ici ton programme « Le score ».", depart:"", essais:[["3"],["12"]],
        test: r => r.erreur ? (r.erreur.type==="EOFError" ? "Un seul input( ) : le programme ne lit qu'un nombre de pièces." : "Lis la ligne rouge, corrige aussi dans Thonny, puis Ctrl + S.")
                 : !/input\(/.test(r.code) ? "Le programme doit demander le nombre de pièces avec input( )."
                 : !/\bint\(/.test(r.code) ? "Il manque int( ) : sans lui, la réponse tapée reste un texte."
                 : r.essais.every((e,i) => { const d = DERNIERE(e).replace(/\s+/g," "); const v = [30,120][i]; return d===String(v) || d===`Score : ${v}` || d===`Score: ${v}`; }) ? true
                 : `Avec 3 pièces, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend 30.`,
        juste:"Ton programme marche pour 3 comme pour 12 pièces : c'est ça, traduire un algorithme." } },

  { partie:"D — « Le score », dans Thonny", titre:"Commenter et relire à deux", min:6, stop:true,
    bulle:"Un programme que ton voisin comprend… et qu'il essaie de casser.",
    veux:"Un programme commenté, vérifié par un camarade.",
    fais:CASES("Dans Thonny, au-dessus de chaque ligne, ajoute un commentaire <b>#</b> qui dit ce qu'elle fait.",
               `Enregistre (<b>Ctrl + S</b>), puis exécute (<b>F5</b>).`,
               "Réponds seul à la question ci-dessous.",
               "Échange de poste avec ton voisin : il lit tes commentaires, exécute ton programme avec un nombre de son choix, et te dit une chose réussie et une chose à corriger.",
               "Corrige toi-même s'il y a lieu, puis Ctrl + S."),
    vois:"Six lignes : trois commentaires, trois instructions. Ton voisin a testé avec SON nombre.",
    extra: CODE(`# on demande le nombre de pièces\npieces = int(input("Combien de pièces ? "))\n# …\n# …`),
    coince:["Le # est AltGr + 3.", "Le voisin regarde et parle ; c'est toi qui tapes sur ton clavier."],
    ...tapeQ("trois, en lettres", ["Une erreur ValueError : int( ) ne sait pas lire « trois ».","Il affiche 30.","Il affiche troistroistrois…","Il affiche 0."],
             [null,"Python ne lit pas les nombres écrits en lettres.","Avec int( ), le texte n'est plus recopié : int( ) refuse « trois ».","Python ne devine pas : il s'arrête avec une erreur."],
             "int( ) ne transforme que des chiffres. Un programme de jeu devra vérifier ce qu'on tape : ce sera pour plus tard."),
    variantes:[
      tapeQ("07", ["Il affiche 70.","Une erreur ValueError.","Il affiche 070.","Il affiche 0707070707…"],
            [null,"07 est fait de chiffres : int( ) le transforme en 7.","int(\"07\") vaut 7 : le zéro devant disparaît, 7 × 10 = 70.","int( ) a transformé le texte en nombre : il n'est plus recopié."],
            "int(\"07\") vaut 7 : le zéro de tête disparaît, et 7 × 10 = 70."),
      tapeQ("-2", ["Il affiche -20.","Une erreur ValueError.","Il affiche 20.","Il affiche -2-2-2-2…"],
            [null,"-2 est un nombre entier : int( ) le lit sans problème.","Le signe moins est gardé : -2 × 10 = -20.","int( ) a transformé le texte en nombre : il n'est plus recopié."],
            "int(\"-2\") vaut -2 : -2 × 10 = -20. Un score négatif ! Il faudra l'empêcher avec un si… alors.") ] },

  { partie:"E — Défi", titre:"Les vies, version jeu", min:6, cle:"vies", variantes:[{},{}],
    bulle:"Défi : « Les vies » devient un vrai morceau de jeu.",
    veux:"Écrire seul un programme qui lit, calcule et affiche.",
    fais:CASES("Le joueur commence avec {D} vies.",
               "Le programme demande les dégâts reçus, puis affiche les vies qui restent.",
               "Écris-le dans le cadre ci-dessous, sans modèle.", EXECUTER),
    vois:"La fiche tape {K} : il reste {R} vies. Puis elle tape 1 : il en reste une de moins que {D}.",
    coince:["Même plan que « Le score » : une boîte de départ, un int(input(…)), un calcul, un print.",
            "Des noms sans accent : degats, pas dégâts.",
            "Toujours bloqué après ton voisin : relis ton programme « Les vies » de Python 01 et ajoute un int(input(…))."],
    q:{ type:"code", q:"Écris le programme « Les vies, version jeu ».", depart:"vies = {D}\n", essais:[["{K}"],["1"]],
        test: r => r.erreur ? (r.erreur.type==="EOFError" ? "Un seul input( ) : on ne tape qu'une fois les dégâts." : r.erreur.type==="TypeError" ? "TypeError : texte et nombre mélangés. As-tu mis int( ) autour de input( ) ?" : "Lis la ligne rouge, corrige, puis exécute.")
                 : !/input\(/.test(r.code) ? "Le programme doit demander les dégâts avec input( )."
                 : r.essais.every((e,i) => (DERNIERE(e).match(/-?\d+/g)||[]).pop()===String([LV.r, LV.d-1][i])) ? true
                 : `Avec ${LV.k} de dégâts, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend ${LV.r}.`,
        juste:"Ton programme lit les dégâts, les retire et affiche les vies : un vrai morceau de jeu." } }
];

const FIN = {
  titre:"🎉 Python 03 terminé !",
  bulle:"Bravo ! Tes programmes savent maintenant poser des questions.",
  texte:"Tu sais distinguer un texte d'un nombre, lire une réponse avec input( ) et la transformer avec int( ). Prochaine étape : le bonus du score, avec si… alors (Python 04).",
  plus:`Défi de la leçon 4 de Cercles informatiques, « Délicieux transtypage » : une pizza carrée de côté L cm (un nombre à virgule, par exemple 17.5) ; chaque personne mange 100 cm². Combien de personnes nourrit-elle ? Indice : float( ) au lieu de int( ), puis round( ) pour arrondir. Écris-le dans Thonny.`,
  lien:'<a href="https://root75.github.io/campin-public/python-03-je-revise/" target="_blank" rel="noopener">Python 03 — je révise</a> (l\'essentiel, un quiz, des cartes) ; pour aller plus loin : <a href="https://cscircles.cemc.uwaterloo.ca/4-fr/" target="_blank" rel="noopener">Cercles informatiques, leçons 4</a> et <a href="https://cscircles.cemc.uwaterloo.ca/5-fr/" target="_blank" rel="noopener">5</a>',
  citation:{
    texte:"La Machine analytique n'a nullement la prétention de créer quoi que ce soit. Elle peut faire tout ce que nous savons lui ordonner de faire.",
    auteur:"Ada Lovelace", source:"Note G de sa traduction du mémoire de Menabrea (1843), traduit de l'anglais",
    lien:"\"3\" * 10 : Python a fait exactement ce qu'on lui a ordonné. À nous de lui ordonner ce qu'on veut, avec int( )."
  }
};

/* ===== Démos animées « Regarde comment faire » (lues par pas-a-pas/demos-python.js) =====
   Numéro de bloc (0 = bloc 1) ▸ titre, images. Jamais une réponse de preuve : les lignes du
   programme sont des barres grises, le score affiché est masqué. */
const FICHIER_SCORE = "02_Le-score_Nom.py";
const DEMOS_FICHE = {
  10: { titre:"Nouveau fichier et Enregistrer sous", images:[
    { ecran:"bureau", cible:"demarrer", legende:"Appuie sur la touche Windows ⊞ (ou clique sur Démarrer)." },
    { ecran:"bureau", demarrer:1, cible:"app-thonny", legende:"Tape Thonny, puis Enter." },
    { ecran:"thonny", nom:"<sans nom>", menu:"item-nouveau", cible:"item-nouveau", legende:"Menu Fichier ▸ Nouveau (ou Ctrl + N) : un onglet vide." },
    { ecran:"thonny", nom:"<sans nom>", menu:"item-sous", cible:"item-sous", legende:"Menu Fichier ▸ Enregistrer sous… (ou Ctrl + Shift + S)." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, fichier:FICHIER_SCORE, cible:"dlg-documents", legende:"À gauche, clique sur Documents." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, fichier:FICHIER_SCORE, cible:"dlg-python", legende:"Double-clic sur le dossier Python." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, fichier:FICHIER_SCORE, cible:"dlg-nom", legende:"Nom du fichier : 02_Le-score_ puis TON nom, puis .py." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, fichier:FICHIER_SCORE, cible:"dlg-enregistrer", legende:"Clique sur Enregistrer." },
    { ecran:"thonny", nom:FICHIER_SCORE, cible:"th-onglet", ok:1, legende:"L’onglet affiche le nom de ton fichier." } ] },
  11: { titre:"Exécuter un programme qui pose une question", images:[
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, modifie:1, cible:"th-enregistrer", legende:"Tes trois lignes écrites : disquette « Enregistrer » (ou Ctrl + S)." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, cible:"th-executer", legende:"Icône ▶ verte (ou F5)." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, run:1, question:"Combien de pièces ? ", cible:"th-console", legende:"La console pose la question et ATTEND. Clique dans la console." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, run:1, question:"Combien de pièces ? ", tape:"ton nombre", cible:"th-console", legende:"Tape ton nombre, puis Enter." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, run:1, question:"Combien de pièces ? ", tape:"ton nombre", resultat:1, cible:"th-console", ok:1, legende:"Le score s’affiche. Compare avec ta prédiction." } ] }
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
def _lance(code, entrees="[]"):
    file = json.loads(entrees)
    def _input(invite=""):
        # comme la console de Thonny : la question, puis la réponse tapée, sur la même ligne
        sys.stdout.write(str(invite))
        if not file:
            print()
            raise EOFError("EOF when reading a line")
        r = file.pop(0)
        print(r)
        return r
    g = {"__name__": "__main__", "input": _input}
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
  ValueError:"int( ) a reçu un texte qui n'est pas un nombre entier.",
  EOFError:"le programme veut lire une réponse de plus que ce qui a été tapé : un input( ) de trop ?",
  ZeroDivisionError:"une division par zéro.",
  TimeoutError:"le programme ne s'arrête jamais : relis ta boucle."
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
async function executePython(code, entrees){
  const py = await chargePython();
  let sortie = "";
  py.setStdout({ batched: s => sortie += s + "\n" });
  py.setStderr({ batched: s => sortie += s + "\n" });
  const lance = py.globals.get("_lance");
  const r = JSON.parse(lance(code, JSON.stringify(entrees || []))); lance.destroy();
  return Object.assign(r, { sortie, code });
}

/* Le cadre « Mon programme » : la preuve, c'est le programme qui passe le test. */
function editeur(zone, Q, reussi, rate){
  const ta = el("textarea","editeur"); ta.value = Q.depart || ""; ta.spellcheck = false;
  ta.setAttribute("autocapitalize","off"); ta.setAttribute("aria-label","Mon programme");
  ta.rows = Math.max(4, ta.value.split("\n").length + 1);
  const lance = txt("button","btn plein","▶ Exécuter (Ctrl+Enter)"); lance.type = "button";
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
    try {
      if(Q.essais){   // un essai par jeu de réponses tapées ; r = le premier, r.essais = tous
        const tous = [];
        for(const e of Q.essais) tous.push(await executePython(ta.value, e));
        r = Object.assign({}, tous[0], { essais: tous, erreur: (tous.find(x => x.erreur) || {}).erreur || null });
      } else r = await executePython(ta.value);
    }
    catch(e){
      ecran.textContent = "Le moteur Python ne se charge pas. Réessaie dans un instant ; sinon, sonne la cloche 🔔, en haut à droite.";
      lance.disabled = false;ta.readOnly=false;depart.disabled=false; return;
    }
    if(r.essais){
      ecran.replaceChildren();
      r.essais.forEach((x,i) => { const b = el("div"); ecran.append(txt("span","vide","Essai "+(i+1)+" — on tape : "+Q.essais[i].join(", "))); montre(b, x); ecran.append(b); });
    } else montre(ecran, r);
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
    catch(e){ ecran.textContent = "Le moteur Python ne se charge pas. Réessaie dans un instant ; sinon, sonne la cloche 🔔, en haut à droite."; ok.disabled = false; execution=false; return; }
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
    else rate((Q.aide && Q.aide[premiere]) || "Ligne "+(premiere+1)+" : refais le calcul. À droite, on calcule avec la valeur d'avant ; à gauche, on range.", reponse);
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


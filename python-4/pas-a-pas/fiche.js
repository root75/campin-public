/* Le moteur et le contenu de la fiche « python-4 ». Hors de index.html : servie par Apps Script,
   une page voit son script modifié au passage (SyntaxError mesurée le 26/10/2026 sur la messagerie).
   Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de Python 04 — Si… alors, sinon =====
   Exercices inspirés de la leçon 6 « If » de Cercles informatiques (CEMC, Université de Waterloo,
   CC BY-NC-SA 3.0 ; l'exemple du plus grand des deux nombres) et de « Tarif du bateau » (France-IOI,
   1.5.5, else), déjà utilisés en 3e, réécrits et exécutés dans la page.
   Le fil : les losanges de LogProg 03 (« Le score » et son bonus, « La porte », « Les vies »,
   « Le distributeur ») deviennent des if / else. « Le score » complet est rendu dans Classroom, /5.
   Même moteur que Python 03 (questions `code` avec `essais`, input() simulé comme dans Thonny).
   Différenciation : `indices:true` sur les blocs d'écriture (appui progressif) ; un volet
   « 🚀 Pour aller plus loin » (approfondissement, facultatif, hors du fil) dans les blocs d'activité. */
const COURS = "python-4";
const PRESENTATION = "missions";   // blocs.js : cloche, mascotte, bulle, bravo
const CODE = s => `<pre class="code">${s}</pre>`;
const SORTIE = r => r.sortie.replace(/\s+$/,"");
const DERNIERE = r => SORTIE(r).split("\n").pop();
const NOMBRES = s => (String(s).match(/-?\d+/g) || []).map(Number);
const PLUS = html => `<details class="coince plus" style="margin-top:12px"><summary>🚀 Pour aller plus loin (facultatif)</summary><p style="margin-top:8px">${html}</p></details>`;

/* ===== Variantes (contre la copie) — même mécanisme que Python 01 à 03 =====
   « Les vies » : {D} (départ), {K} (dégâts), {R} (le résultat), clé partagée « vies » : chaque élève
   retrouve SES nombres de Python 01, 02 et 03. */
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

// Une case peut porter son « ne fais pas » : {geste:"…", attention:"⚠️ …"}, un encadré sous la case, jamais dans son texte.
const CASES = (...l) => `<ol class="etapes">${l.map(x => typeof x === "string" ? `<li><label><input type="checkbox"><span>${x}</span></label></li>` : `<li><label><input type="checkbox"><span>${x.geste}</span></label><p class="attention">${x.attention}</p></li>`).join("")}</ol>`;
const EXECUTER = `Clique sur <span class="chemin">▶ <b>Exécuter</b></span> (ou <b>Ctrl + Enter</b>).`;
const TAB = `<b>Tab</b> décale la ligne de 4 espaces`;

/* Le nom du fichier doit porter le nom de l'élève : le prénom ou le nom de son adresse. */
const nomsEleve = () => EMAIL ? EMAIL.split("@")[0].split(".").map(m=>norm(m).replace(/[^a-z]/g,"")).filter(m=>m.length>1) : [];
const portemonNom = f => { const n = nomsEleve(); return !n.length || n.some(m => norm(f).replace(/[^a-z]/g,"").includes(m)); };

/* ===== Logigrammes (mêmes formes et couleurs que LogProg 03, dessinés dans la page) ===== */
const FL = `<defs><marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b6873"/></marker></defs>`;
const POLICE = `font-family="Atkinson Hyperlegible, Segoe UI, Arial, sans-serif" text-anchor="middle" fill="#1f2a33"`;
/* Un losange, une branche OUI qui ajoute un bonus, la branche NON qui le contourne. */
const logiBonus = (lire, calcul, condition, bonus, legende) => `<figure class="logigramme"><svg viewBox="0 0 270 540" role="img" aria-label="Logigramme : Début, Lire ${lire}, ${calcul}, ${condition} ? OUI : ${bonus} ; puis Afficher, Fin">${FL}
  <g stroke="#5b6873" stroke-width="2" fill="none" marker-end="url(#pointe)"><line x1="120" y1="50" x2="120" y2="78"/><line x1="120" y1="126" x2="120" y2="154"/><line x1="120" y1="202" x2="120" y2="230"/><line x1="120" y1="310" x2="120" y2="328"/><line x1="120" y1="376" x2="120" y2="402"/><path d="M216 270H250V427H218"/><line x1="120" y1="450" x2="120" y2="476"/></g>
  <g stroke-width="2" ${POLICE} font-size="18">
    <ellipse cx="120" cy="27" rx="70" ry="23" fill="#d5e8d4" stroke="#82b366"/><text x="120" y="34" stroke="none">Début</text>
    <path d="M45 80H225L195 126H15Z" fill="#e1d5e7" stroke="#9673a6"/><text x="120" y="110" stroke="none">Lire ${lire}</text>
    <rect x="15" y="156" width="210" height="46" rx="8" fill="#dae8fc" stroke="#6c8ebf"/><text x="120" y="186" stroke="none">${calcul}</text>
    <path d="M120 232L216 270L120 308L24 270Z" fill="#fff2cc" stroke="#d6b656"/><text x="120" y="276" stroke="none" font-size="17">${condition} ?</text>
    <rect x="15" y="330" width="210" height="46" rx="8" fill="#dae8fc" stroke="#6c8ebf"/><text x="120" y="360" stroke="none" font-size="16">${bonus}</text>
    <path d="M45 404H225L195 450H15Z" fill="#e1d5e7" stroke="#9673a6"/><text x="120" y="434" stroke="none">Afficher ${lire==="pieces"?"score":"energie"}</text>
    <ellipse cx="120" cy="501" rx="70" ry="23" fill="#f8cecc" stroke="#b85450"/><text x="120" y="508" stroke="none">Fin</text>
    <text x="146" y="324" stroke="none" font-size="14" font-weight="700">OUI</text><text x="234" y="262" stroke="none" font-size="14" font-weight="700">NON</text>
  </g></svg><figcaption>${legende}</figcaption></figure>`;
/* Un losange, deux branches qui affichent chacune un message, puis Fin. */
const logiSinon = (lire, condition, oui, non, legende) => `<figure class="logigramme" style="max-width:19rem"><svg viewBox="0 0 360 400" role="img" aria-label="Logigramme : Début, Lire ${lire}, ${condition} ? OUI : Afficher ${oui} ; NON : Afficher ${non} ; Fin">${FL}
  <g stroke="#5b6873" stroke-width="2" fill="none" marker-end="url(#pointe)"><line x1="180" y1="50" x2="180" y2="78"/><line x1="180" y1="126" x2="180" y2="150"/><path d="M84 190H70V246"/><path d="M276 190H290V246"/><path d="M70 294V330H170"/><path d="M290 294V330H190"/></g>
  <g stroke-width="2" ${POLICE} font-size="17">
    <ellipse cx="180" cy="27" rx="70" ry="23" fill="#d5e8d4" stroke="#82b366"/><text x="180" y="34" stroke="none">Début</text>
    <path d="M105 80H285L255 126H75Z" fill="#e1d5e7" stroke="#9673a6"/><text x="180" y="110" stroke="none">Lire ${lire}</text>
    <path d="M180 152L276 190L180 228L84 190Z" fill="#fff2cc" stroke="#d6b656"/><text x="180" y="196" stroke="none" font-size="16">${condition} ?</text>
    <path d="M25 248H165L140 294H0Z" fill="#e1d5e7" stroke="#9673a6"/><text x="82" y="276" stroke="none" font-size="14">Afficher « ${oui} »</text>
    <path d="M220 248H360L335 294H195Z" fill="#e1d5e7" stroke="#9673a6"/><text x="278" y="276" stroke="none" font-size="14">Afficher « ${non} »</text>
    <ellipse cx="180" cy="355" rx="70" ry="23" fill="#f8cecc" stroke="#b85450"/><text x="180" y="362" stroke="none">Fin</text>
    <text x="62" y="182" stroke="none" font-size="14" font-weight="700">OUI</text><text x="298" y="182" stroke="none" font-size="14" font-weight="700">NON</text>
  </g></svg><figcaption>${legende}</figcaption></figure>`;
const LOGIGRAMME_SCORE = logiBonus("pieces", "score ← pieces × 10", "score > 50", "score ← score + 100", "Le logigramme « Le score » de LogProg 03, avec son losange");

/* ===== Les exercices à valeurs variables : une fonction rend la partie du bloc qui change ===== */

/* A. Rappel : int(input()) puis un calcul. */
const rappel = n => ({
  extra: CODE(`pieces = int(input("Pièces ? "))\nprint(pieces * 10)`) + `<p>À l'exécution, on tape <b>${n}</b> puis Enter.</p>`,
  q:{ type:"qcm", q:"Prédis : qu'affiche la dernière ligne ?",
      c:[String(n*10), String(n).repeat(10), "Une erreur TypeError", "pieces * 10"],
      p:[null, "Ça, c'était le piège de Python 03 : sans int( ). Ici, int( ) transforme le texte tapé en nombre.",
         "int( ) a transformé le texte en nombre : nombre × nombre, pas d'erreur.",
         "Sans guillemets, pieces * 10 est un calcul : Python affiche son résultat."],
      juste:`int( ) transforme "${n}" en ${n} : ${n} × 10 = ${n*10}.` } });

/* B. Comparer : True / False. */
const OPS = {">":(a,b)=>a>b, "<":(a,b)=>a<b, ">=":(a,b)=>a>=b, "<=":(a,b)=>a<=b, "==":(a,b)=>a===b, "!=":(a,b)=>a!==b};
const compare = (l1, l2) => {
  const v = [l1, l2].map(([a,op,b]) => OPS[op](a,b));
  const dit = x => x ? "True" : "False";
  const choix = [[true,false],[false,true],[true,true],[false,false]].map(([x,y]) => `${dit(x)}, puis ${dit(y)}`);
  const bonne = `${dit(v[0])}, puis ${dit(v[1])}`;
  const c = [bonne, ...choix.filter(x => x !== bonne)];
  const pour = ch => { const [x,y] = ch.split(", puis ").map(t => t==="True");
    const k = x!==v[0] ? 0 : 1, [a,op,b] = [l1,l2][k];
    return `Relis la ligne ${k+1} : ${a} ${op.replace("<","&lt;").replace(">","&gt;")} ${b} est ${v[k] ? "vrai" : "faux"}, donc Python affiche ${dit(v[k])}.`; };
  return {
    extra: CODE(`print(${l1.join(" ").replace(/</g,"&lt;").replace(/>/g,"&gt;")})\nprint(${l2.join(" ").replace(/</g,"&lt;").replace(/>/g,"&gt;")})`),
    q:{ type:"qcm", q:"Prédis : qu'affichent les deux lignes ?", c, p:c.map((ch,i) => i ? pour(ch) : null),
        juste:`Une comparaison vaut True (vrai) ou False (faux). Ligne 1 : ${dit(v[0])}. Ligne 2 : ${dit(v[1])}.` } };
};

/* B. Le seuil : > n'est pas >= (le bonus de LogProg 03, 5 pièces → 50 → pas de bonus). */
const seuil = (op, s) => {
  const ok = n => OPS[op](n*10, s);
  let rep = 0; while(!ok(rep)) rep++;
  const ecrit = op.replace(">","&gt;");
  return {
    extra:`<div class="encart"><p>Le score vaut <code>pieces * 10</code>. Le bonus est donné <b>si</b> <code>score ${ecrit} ${s}</code>.</p></div>`,
    q:{ type:"saisie", q:"Quel est le plus PETIT nombre de pièces qui donne le bonus ?",
        ok: x => x.trim()===String(rep),
        faux: x => { const n = parseInt(x,10);
          if(isNaN(n)) return "Réponds par un nombre de pièces.";
          if(n < rep) return `Avec ${n} pièces, score = ${n*10}. Est-ce que ${n*10} ${ecrit} ${s} ? Non : pas encore de bonus.`;
          return `Avec ${n} pièces, le bonus est donné… mais avec ${n-1} pièces, score = ${(n-1)*10}, et ${(n-1)*10} ${ecrit} ${s} est ${ok(n-1) ? "vrai aussi : cherche plus petit" : "faux"}.`; },
        juste: op===">" ? `Avec ${s/10} pièces, score = ${s} : ${s} > ${s} est FAUX (pas plus grand, égal). Il en faut ${rep}.`
                        : `Avec ${rep} pièces, score = ${rep*10} : ${rep*10} >= ${s} est VRAI (égal suffit). Avec ${rep-1}, ${(rep-1)*10} est trop peu.` } };
};

/* C. Lire un si : le plus grand des deux (exemple de la leçon 6 de Cercles informatiques). */
const plusGrand = (x, y) => ({
  extra: CODE(`x = ${x}\ny = ${y}\nif x &gt;= y:\n    plus_grand = x\nif y &gt; x:\n    plus_grand = y\nprint(plus_grand)`),
  q:{ type:"qcm", q:"Prédis : qu'affiche ce programme ?",
      c:[String(Math.max(x,y)), String(Math.min(x,y)), "Une erreur NameError", `${x} ${y}`],
      p:[null, `Fais la trace : x vaut ${x}, y vaut ${y}. Laquelle des deux conditions est vraie ?`,
         "Une des deux conditions est vraie : plus_grand reçoit une valeur avant le print.",
         "print n'affiche qu'une boîte : plus_grand."],
      juste:`${Math.max(x,y)===x ? `x >= y est vrai (${x} >= ${y})` : `y > x est vrai (${y} > ${x})`} : seule la ligne décalée sous cette condition s'exécute.` } });

/* C. Écrire un si : la super-potion. 5 potions → bonus ; 2 → pas de bonus ; 3 → pile le seuil, pas de bonus. */
const POTION_V = [{m:20,b:50},{m:15,b:30},{m:25,b:40}];
const potion = ({m,b}) => {
  const s = 3*m, att = [5*m+b, 2*m, 3*m];
  return {
    vois:`On tape 5 : la console affiche ${att[0]}. On tape 2 : ${att[1]}. On tape 3 : ${att[2]}, sans bonus.`,
    extra: logiBonus("potions", `energie ← potions × ${m}`, `energie > ${s}`, `energie ← energie + ${b}`, "Le logigramme de la super-potion")
         + `<div class="encart"><p>Un losange devient un <b>if</b>. Un exemple, dans un autre jeu :</p>${CODE(`if temperature &gt; 30:\n    soif = soif + 2`)}
  <p>Les <b>deux-points</b> <code>:</code> à la fin de la ligne <code>if</code>. La ligne en dessous est <b>décalée de 4 espaces</b> : ${TAB}. Elle ne s'exécute QUE si la condition est vraie.</p></div>`
         + PLUS(`Ajoute un 2e losange : si energie dépasse ${s+2*m}, affiche aussi « Super forme ! ». Dans quel ordre places-tu les deux if ?`),
    coince:[`Le losange se lit « energie > ${s} ? » : en Python, if energie > ${s}: — avec les deux-points.`,
            `Sous le if, la ligne du bonus commence par 4 espaces (touche Tab). print(energie) reste collé à gauche : il s'exécute toujours.`,
            `Le bonus s'écrit energie = energie + ${b} : on range dans energie l'ancienne valeur plus ${b}.`],
    q:{ type:"code", q:`Ajoute le losange au programme, à la ligne vide : le bonus de ${b} si energie > ${s}.`,
        depart:`potions = int(input("Combien de potions ? "))\nenergie = potions * ${m}\n\nprint(energie)`, essais:[["5"],["2"],["3"]],
        test: r => r.erreur ? (r.erreur.type==="IndentationError" ? "IndentationError : la ligne sous le if doit être décalée de 4 espaces (touche Tab) ; print(energie) reste collé à gauche."
                             : /expected ':'/.test(r.erreur.message) ? "Il manque les deux-points : à la fin de la ligne if."
                             : "Lis la <b>ligne rouge</b> : un if s'écrit if condition: puis, en dessous, une ligne décalée.")
                 : !/^\s*if\b/m.test(r.code) ? "Il manque le if : c'est lui qui traduit le losange."
                 : !/energie\s*(=\s*energie\s*\+|\+=)/.test(r.code) ? `Le bonus se calcule : energie = energie + ${b}. Écrire le résultat en dur ne marche que pour un nombre.`
                 : NOMBRES(DERNIERE(r.essais[1])).pop()===att[1]+b ? "Avec 2 potions, le bonus est donné quand même : la ligne du bonus est-elle bien décalée sous le if ?"
                 : NOMBRES(DERNIERE(r.essais[2])).pop()===att[2]+b ? `Avec 3 potions, energie vaut ${s}. ${s} > ${s} est faux : pas de bonus. Utilise >, pas >=.`
                 : NOMBRES(DERNIERE(r.essais[0])).pop()===5*m ? `Avec 5 potions, pas de bonus : relis ta condition, energie > ${s}.`
                 : r.essais.every((e,i) => NOMBRES(DERNIERE(e)).pop()===att[i]) ? true
                 : `Avec 5 potions, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend ${att[0]}.`,
        juste:`Le if ne laisse passer la ligne décalée que si energie > ${s}. Avec 3 potions, ${s} > ${s} est faux : pas de bonus.` } };
};

/* C. Le décalage : ce qui est sous le if, et ce qui n'y est pas. */
const decale = (vies, finDecale) => {
  const joue = vies > 0, fin = finDecale ? joue : true;
  const dit = joue && fin ? "Tu joues, puis Fin du tour" : fin ? "Fin du tour, seulement" : joue ? "Tu joues, seulement" : "Rien du tout";
  const tous = ["Tu joues, puis Fin du tour", "Fin du tour, seulement", "Rien du tout", "Tu joues, seulement"];
  const c = [dit, ...tous.filter(x => x !== dit)];
  return {
    extra: CODE(`vies = ${vies}\nif vies &gt; 0:\n    print("Tu joues")\n${finDecale ? "    " : ""}print("Fin du tour")`),
    q:{ type:"qcm", q:"Prédis : qu'affiche ce programme ?", c,
        p:c.map((x,i) => i ? (finDecale ? `Regarde le début de la dernière ligne : elle est décalée, donc sous le if. vies > 0 est ${joue ? "vrai" : "faux"}.`
                                         : `La dernière ligne est collée à gauche : elle n'est pas sous le if, elle s'exécute toujours. Et vies > 0 est ${joue ? "vrai" : "faux"}.`) : null),
        juste: finDecale ? `Les DEUX print sont décalés : ils dépendent du if. vies > 0 est ${joue ? "vrai : les deux s'affichent" : "faux : aucun ne s'affiche"}.`
                         : `Seul le 1er print est décalé : il dépend du if (vies > 0 est ${joue ? "vrai" : "faux"}). Le 2e est collé à gauche : il s'exécute toujours.` } };
};

/* C. Réparer un si : deux erreurs par version (= au lieu de ==, deux-points, décalage). */
const repare = (depart, msg) => ({
  vois:`On tape 0 : la console affiche ${msg}. On tape 2 : rien de plus.`,
  coince:["Lis la ligne rouge : elle donne le numéro de la ligne et le nom de l'erreur. Répare, exécute, puis lis la suivante.",
          "Comparer, c'est == (deux signes). Un seul = range une valeur : Python refuse un = dans un if.",
          "La ligne if finit par deux-points : et la ligne en dessous est décalée de 4 espaces (Tab)."],
  q:{ type:"code", q:`Répare le programme : deux erreurs. Il affiche ${msg} quand les vies tombent à 0.`,
      depart, essais:[["0"],["2"]],
      test: r => r.erreur ? (r.erreur.type==="IndentationError" ? "IndentationError : la ligne sous le if doit être décalée de 4 espaces (Tab)."
                           : /^\s*if[^\n]*[^=!<>]=[^=]/m.test(r.code) ? "SyntaxError : dans un if, on compare avec == (deux signes). Un seul = range une valeur."
                           : /expected ':'/.test(r.erreur.message) ? "SyntaxError : il manque les deux-points : à la fin de la ligne if."
                           : "Lis la <b>ligne rouge</b> : son numéro te dit où chercher.")
               : !SORTIE(r.essais[0]).includes(msg) ? `Avec 0 vie, on attend ${msg}. La condition est-elle vies == 0 ?`
               : SORTIE(r.essais[1]).includes(msg) ? `Avec 2 vies, ${msg} ne doit pas s'afficher : la ligne du print est-elle décalée sous le if ?`
               : true,
      juste:"Trois règles du if : == pour comparer, les deux-points, la ligne décalée en dessous." } });

/* D. Si… sinon : la porte (et ses deux cousines). Un texte se compare entre guillemets. */
const porte = ({nom, question, bon, mauvais, oui, non}) => ({
  vois:`On tape ${bon} : la console affiche ${oui}. On tape ${mauvais} : ${non}`,
  extra: logiSinon(nom, `${nom} = "${bon}"`, oui, non, "Deux branches : OUI → if, NON → else")
       + `<div class="encart"><p>Le <b>else</b> (sinon) donne une ligne à la branche NON. Il est collé à gauche, sous le if, avec ses <b>deux-points</b>. Un exemple, dans un autre jeu :</p>${CODE(`if meteo == "pluie":\n    print("Parapluie !")\nelse:\n    print("Lunettes !")`)}
  <p>input( ) rend un texte : on le compare à un texte, <b>entre guillemets</b>.</p></div>`
       + PLUS(`Une 3e réponse possible : si on tape « ? », le programme affiche un indice. Cherche dans le mémo 🐍 comment enchaîner deux conditions… ou essaie elif, le « sinon si » de Python.`),
  coince:[`Sans guillemets, ${bon} serait un nom de boîte : Python le cherche et ne le trouve pas (NameError).`,
          "else: est collé à gauche, à la même hauteur que if. Ses deux-points, puis sa ligne décalée en dessous.",
          `Structure complète : if ${nom} == "${bon}": / ligne décalée / else: / ligne décalée.`],
  q:{ type:"code", q:`Complète le programme avec un if et un else.`,
      depart:`${nom} = input("${question} ")\n`, essais:[[bon],[mauvais]],
      test: r => r.erreur ? (r.erreur.type==="NameError" ? `NameError : ${bon} sans guillemets est pris pour un nom de boîte. Écris "${bon}".`
                           : r.erreur.type==="IndentationError" ? "IndentationError : sous if et sous else, la ligne est décalée de 4 espaces ; else lui-même est collé à gauche."
                           : "Lis la <b>ligne rouge</b> : == pour comparer, deux-points après la condition et après else.")
               : !/^\s*else\s*:/m.test(r.code) ? "Il manque le else : c'est lui qui traduit la branche NON."
               : DERNIERE(r.essais[0])===non && DERNIERE(r.essais[1])===non ? `On tape ${bon} et on lit ${non} : la condition n'est jamais vraie. Compares-tu avec "${bon}", entre guillemets, sans espace ?`
               : DERNIERE(r.essais[0])===oui && DERNIERE(r.essais[1])===non ? true
               : `On tape ${bon} : ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend ${oui} — à la lettre près.`,
      juste:`Une réponse, deux chemins : if pour « ${bon} », else pour tout le reste.` } });

/* E. Prédire « Le score » complet. */
const BONUS_V = [{n:7,r:170},{n:3,r:30},{n:6,r:160}];
const bonusPredit = ({n,r}) => ({
  q:{ type:"saisie", q:`AVANT d'exécuter : tu taperas ${n}. Que va afficher la dernière ligne ?`,
      ok: x => x.trim()===String(r) || x.replace(/\s+/g," ").trim()===`Score : ${r}`,
      faux: x => x.trim()===String(n*10) && r!==n*10 ? `${n*10}, c'est le score avant le losange. Est-ce que ${n*10} > 50 ?`
               : x.trim()===String(n*10+100) && r===n*10 ? `${n*10} > 50 est faux : la ligne du bonus ne s'exécute pas.`
               : `Fais la trace : pieces vaut ${n}, score vaut ${n*10}, puis le losange : ${n*10} > 50 ?`,
      juste: r===n*10 ? `${n*10} > 50 est faux : pas de bonus, le score reste ${r}.` : `${n*10} > 50 est vrai : 100 de bonus, ${r}.` } });

/* E. Relire à deux : prédire ce que change une modification du voisin. */
const SOLUTION_BONUS = `pieces = int(input("Combien de pièces ? "))\nscore = pieces * 10\nif score > 50:\n    score = score + 100\nprint(score)`;
const modifie = (quoi, tape, c, p, juste) => ({ q:{ type:"qcm", q:`Prédis : ton voisin ${quoi}, puis il tape ${tape}. Qu'affiche la console après la question ?`, c, p, juste } });

/* E. La grille du rendu, avec les nombres de la version de l'élève (mêmes qu'au bloc 11, cle:"bonus"). */
const rendreBonus = ({n,r}) => ({
  extra:`<div class="encart"><p><b>Grille — sur 5.</b> Le professeur ouvre ton fichier, l'exécute et lit tes commentaires.</p><table>
  <tr><th>Dans ton programme</th><th>Points</th></tr>
  <tr><td>F5, puis on tape <b>${n}</b> : le programme s'exécute sans message rouge et affiche <b>${r}</b>.</td><td>1</td></tr>
  <tr><td>F5, puis on tape <b>5</b> : il affiche <b>50</b>, sans bonus (50 &gt; 50 est faux).</td><td>1</td></tr>
  <tr><td>Au-dessus du <code>if</code> : ton commentaire dit, avec tes mots, QUAND le bonus est donné.</td><td>1</td></tr>
  <tr><td>Au-dessus de <code>score = score + 100</code> : ton commentaire explique pourquoi cette ligne est décalée.</td><td>1</td></tr>
  <tr><td>Au-dessus de <code>print(score)</code> : ton commentaire dit pourquoi cette ligne s'exécute toujours.</td><td>1</td></tr></table>
  <p>Un commentaire explique avec TES mots. Recopier la ligne (<code># if score &gt; 50:</code>) n'explique rien : 0 point pour cette ligne.</p>
  <p class="stop">Pas de copier-coller du voisin. Des commentaires copiés sur un autre élève, c'est 0 sur 5, pour les deux fichiers.</p>
  <p>Avant tout : le fichier rendu s'appelle 03_Le-bonus_ suivi de ton nom, et finit par .py. Sinon, le professeur ne peut pas l'ouvrir.</p></div>` });

/* F. Défi : le distributeur (logigramme de l'activité 4 de LogProg 03). */
const distributeur = prix => ({
  vois:`Avec 5 pièces : « Voici ta boisson », puis la monnaie, ${5-prix}. Avec 1 pièce : il manque ${prix-1}. Avec ${prix} pièces, pile le prix : la boisson, et 0 de monnaie.`,
  extra: PLUS("Un 2e choix : le distributeur demande d'abord « eau ou soda ? », et le soda coûte une pièce de plus. Deux input( ), deux if."),
  coince:["Même plan que la porte : un input, un if, un else. Mais ici, la condition compare deux nombres : pieces >= prix.",
          "Assez de pièces, c'est AUTANT ou plus que le prix : >=, pas >.",
          "La monnaie : pieces - prix. Ce qui manque : prix - pieces. Sous le if, deux lignes décalées."],
  q:{ type:"code", q:`Écris le distributeur : une boisson coûte ${prix} pièces.`, depart:`prix = ${prix}\n`, essais:[["5"],["1"],[String(prix)]],
      test: r => r.erreur ? (r.erreur.type==="TypeError" ? "TypeError : texte et nombre mélangés. As-tu mis int( ) autour de input( ) ?" : "Lis la <b>ligne rouge</b>, corrige, puis exécute.")
               : !/input\(/.test(r.code) ? "Le distributeur demande le nombre de pièces avec input( )."
               : !/boisson/i.test(SORTIE(r.essais[2])) ? `Avec exactement ${prix} pièces, on a assez : la condition doit être pieces >= prix.`
               : /boisson/i.test(SORTIE(r.essais[1])) ? "Avec 1 pièce, pas de boisson : la branche else doit dire ce qui manque."
               : !/boisson/i.test(SORTIE(r.essais[0])) ? "Avec 5 pièces, on attend « Voici ta boisson »."
               : NOMBRES(DERNIERE(r.essais[0])).pop()!==5-prix ? `Avec 5 pièces, la dernière ligne doit donner la monnaie : ${5-prix}.`
               : NOMBRES(DERNIERE(r.essais[1])).pop()!==prix-1 ? `Avec 1 pièce, la dernière ligne doit dire ce qui manque : ${prix-1}.`
               : NOMBRES(DERNIERE(r.essais[2])).pop()!==0 ? `Avec ${prix} pièces, la monnaie est 0.`
               : true,
      juste:"Ton distributeur décide seul : il sert, rend la monnaie ou dit ce qui manque." } });

const BLOCS = [
  { partie:"A — Se remettre en route", titre:"Le nombre tapé", min:2,
    bulle:"Aujourd'hui, ton programme apprend à décider. D'abord, un rappel.",
    veux:"Te rappeler ce que fait int(input( )).",
    fais:CASES("Lis le <b>programme</b>.", "<b>Prédis</b> la dernière ligne, puis réponds."),
    coince:["input( ) rend un texte ; int( ) le transforme en nombre. Le bouton 🐍, en bas de la page, a le mémo de Python 03."],
    ...rappel(4),
    variantes:[rappel(6), rappel(9)] },

  { partie:"B — Python compare", titre:"Vrai ou faux ?", min:3,
    bulle:"Avant de décider, Python compare. Et il répond vrai ou faux.",
    veux:"Prédire la valeur d'une comparaison : True ou False.",
    fais:CASES("Lis l'<b>encadré</b>.", "<b>Prédis</b> les deux lignes, puis réponds."),
    coince:["True veut dire vrai, False veut dire faux. Avec la majuscule, en anglais.",
            "> veut dire « strictement plus grand » : 5 > 5 est faux. >= accepte l'égalité : 5 >= 5 est vrai."],
    ...(() => { const b = compare([7,">",5],[7,"<",5]); return Object.assign(b, { extra:`<div class="encart"><table>
  <tr><th>Python</th><th>Se lit</th><th>Exemple vrai</th></tr>
  <tr><td><code>&gt;</code> <code>&lt;</code></td><td>plus grand, plus petit</td><td><code>8 &gt; 3</code></td></tr>
  <tr><td><code>&gt;=</code> <code>&lt;=</code></td><td>plus grand ou égal, plus petit ou égal</td><td><code>5 &gt;= 5</code></td></tr>
  <tr><td><code>==</code></td><td>égal (DEUX signes)</td><td><code>4 == 4</code></td></tr>
  <tr><td><code>!=</code></td><td>différent</td><td><code>4 != 9</code></td></tr></table>
  <p>Dans le losange de LogProg 03, on écrivait <b>score &gt; 50 ?</b> : c'est une comparaison.</p></div>` + b.extra }); })(),
    variantes:[compare([3,">",8],[3,"<",8]), compare([5,">=",5],[5,"<=",5])] },

  { partie:"B — Python compare", titre:"Le seuil du bonus", min:4,
    bulle:"50 > 50 : vrai ou faux ? Le piège du bonus revient.",
    veux:"Trouver à partir de quand une condition devient vraie.",
    fais:CASES("Lis la <b>condition</b>.", "Essaie <b>pièce par pièce</b> : calcule le score, puis teste.", "Réponds par un <b>nombre</b>."),
    coince:["Écris une petite table : 4 pièces → 40, 5 → 50, 6 → 60… et pour chacune, la condition est-elle vraie ?",
            "> exclut l'égalité ; >= l'accepte."],
    indices:true,
    ...seuil(">", 50),
    variantes:[seuil(">=", 70), seuil(">", 30)] },

  { partie:"C — Si… alors", titre:"Le plus grand des deux", min:4,
    bulle:"Lire un programme qui décide, avant d'en écrire un.",
    veux:"Prédire ce que fait un programme avec deux if.",
    fais:CASES("Fais la <b>trace</b> : que valent x et y ?", "Pour chaque <b>if</b> : la condition est-elle vraie ?", "<b>Prédis</b>, puis réponds."),
    coince:["Une ligne décalée sous un if ne s'exécute que si la condition est vraie. Sinon, Python la saute.",
            "plus_grand reçoit une valeur dans UN des deux if, jamais dans les deux."],
    ...plusGrand(5, 2),
    variantes:[plusGrand(3, 7), plusGrand(8, 6)] },

  { partie:"C — Si… alors", titre:"La super-potion", min:8, stop:true, indices:true,
    bulle:"À toi : un losange à traduire en if.",
    veux:"Traduire un losange en if : deux-points, ligne décalée.",
    fais:CASES("Lis le <b>logigramme</b> et l'encadré.",
               "Clique sur la <b>ligne vide</b> du programme.",
               `Écris la ligne <b>if</b>, avec ses deux-points, puis Enter et <b>Tab</b>.`,
               "Écris la ligne du <b>bonus</b>.", EXECUTER),
    ...potion(POTION_V[0]),
    variantes:[potion(POTION_V[1]), potion(POTION_V[2])] },

  { partie:"C — Si… alors", titre:"Ce qui est décalé", min:3,
    bulle:"4 espaces au début d'une ligne… et tout change.",
    veux:"Savoir quelles lignes dépendent du if.",
    fais:CASES("Regarde le <b>début de chaque ligne</b> : collée à gauche, ou décalée ?", "<b>Prédis</b>, puis réponds."),
    coince:["Décalée sous le if : elle dépend de la condition. Collée à gauche : elle s'exécute toujours."],
    ...decale(0, false),
    variantes:[decale(2, false), decale(0, true)] },

  { partie:"C — Si… alors", titre:"Réparer un si", min:6, indices:true,
    bulle:"Deux erreurs cachées dans trois lignes. La ligne rouge te guide.",
    veux:"Réparer un if : ==, deux-points, décalage.",
    fais:CASES(EXECUTER+" Lis la <b>ligne rouge</b>.", "Répare <b>la 1re erreur</b>, puis exécute à nouveau.", "Répare <b>la 2e erreur</b>, puis exécute."),
    ...repare(`vies = int(input("Vies ? "))\nif vies = 0\n    print("Game over")`, "Game over"),
    variantes:[repare(`vies = int(input("Vies ? "))\nif vies == 0\nprint("Perdu !")`, "Perdu !"),
               repare(`vies = int(input("Vies ? "))\nif vies = 0:\nprint("Fin de partie")`, "Fin de partie")] },

  { partie:"D — Si… sinon", titre:"La porte", min:7, stop:true, indices:true,
    bulle:"La porte de LogProg 03 : deux branches, deux messages.",
    veux:"Traduire un losange à deux branches : if et else.",
    fais:CASES("Lis le <b>logigramme</b> : une branche OUI, une branche NON.",
               "Lis l'<b>encadré</b> : où se place le else ?",
               "Écris le <b>if</b> et le <b>else</b> sous la 1re ligne.", EXECUTER),
    ...porte({nom:"cle", question:"As-tu la clé ?", bon:"oui", mauvais:"non", oui:"Ouvert !", non:"Fermé."}),
    variantes:[porte({nom:"code", question:"Code du coffre ?", bon:"1234", mauvais:"0000", oui:"Trésor !", non:"Code faux."}),
               porte({nom:"mot", question:"Mot de passe ?", bon:"ami", mauvais:"ennemi", oui:"Entre !", non:"Halte !"})] },

  { partie:"D — Si… sinon", titre:"Les vies, avec le losange", min:7, cle:"vies", variantes:[{},{}], indices:true,
    bulle:"« Les vies » de Python 01 : cette fois, la partie peut se perdre.",
    veux:"Écrire un if / else à partir de tes propres variables.",
    fais:CASES("Le joueur a <b>{D} vies</b> ; le programme lit les <b>dégâts</b> et les retire.",
               "Ajoute le <b>losange</b> : plus de vies ? alors Game over.",
               "Sinon, <b>affiche</b> les vies qui restent.", EXECUTER),
    vois:"La fiche tape {K} : il te reste {R} vies. Puis elle tape {D} : Game over.",
    extra:`<div class="encart"><p>Dans LogProg 03, le losange disait <b>vies = 0 ?</b>. En Python, on compare avec <b>==</b>… ou avec <b>&lt;= 0</b>, qui marche aussi quand les dégâts dépassent les vies.</p></div>`
         + PLUS("Et si les dégâts tapés sont négatifs ? Le joueur gagnerait des vies ! Ajoute un if qui refuse un nombre plus petit que 0."),
    coince:["Les dégâts ont déjà été retirés : il reste à tester vies, puis à afficher selon le cas.",
            "if vies <= 0: puis, décalé, print(\"Game over\"). Puis else: et, décalé, l'affichage des vies.",
            "Pour afficher un texte et un nombre : print(\"Il te reste\", vies, \"vies\") — la virgule, pas le +."],
    q:{ type:"code", q:"Ajoute le losange au programme « Les vies ».",
        depart:`vies = {D}\ndegats = int(input("Dégâts ? "))\nvies = vies - degats\n`, essais:[["{K}"],["{D}"]],
        test: r => r.erreur ? (r.erreur.type==="TypeError" ? "TypeError : texte + nombre. Dans print, sépare le texte et vies par une virgule." : r.erreur.type==="IndentationError" ? "IndentationError : sous if et sous else, une ligne décalée de 4 espaces (Tab)." : "Lis la <b>ligne rouge</b> : == pour comparer, deux-points, décalage.")
                 : !/^\s*if\b/m.test(r.code) || !/^\s*else\s*:/m.test(r.code) ? "Il faut un if et un else : les deux branches du losange."
                 : /game\s*over/i.test(SORTIE(r.essais[0])) ? `Avec ${LV.k} de dégâts, il reste des vies : pas de Game over. Relis ta condition.`
                 : !/game\s*over/i.test(SORTIE(r.essais[1])) ? `Avec ${LV.d} de dégâts, il ne reste rien : on attend Game over.`
                 : NOMBRES(DERNIERE(r.essais[0])).pop()!==LV.r ? `Avec ${LV.k} de dégâts, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend ${LV.r} vies.`
                 : true,
        juste:"Ton jeu sait maintenant quand la partie est perdue : c'est le losange de LogProg 03, en Python." } },

  { partie:"E — « Le score » avec son bonus, dans Thonny", titre:"Un nouveau fichier, à partir du score", min:4, stop:true,
    bulle:"Retour dans Thonny : ton programme « Le score » va recevoir son losange.",
    veux:"Ouvrir 02_Le-score et l'enregistrer sous un nouveau nom, AVANT de le modifier.",
    fais:CASES(`Appuie sur la touche <b>Windows</b> ⊞, tape <b>Thonny</b>, puis appuie sur <b>Enter</b>.`,
               `<span class="chemin">Menu <b>Fichier ▸ Ouvrir…</b></span> (ou <b>Ctrl + O</b>) ▸ <b class="chemin">Documents ▸ double-clic sur Python ▸ 02_Le-score_… ▸ Ouvrir</b>.`,
               `Puis <span class="chemin">menu <b>Fichier ▸ Enregistrer sous…</b></span> (ou <b>Ctrl + Shift + S</b>).`,
               `Dans <span class="chemin">Nom du fichier</span>, tape <b>03_Le-bonus_Nom.py</b>, avec TON nom à la place de Nom.`,
               `Clique sur <b class="chemin">Enregistrer</b>.`),
    vois:"L'onglet, en haut de Thonny, affiche 03_Le-bonus_ et ton nom. Ton fichier 02_Le-score reste intact, déjà rendu.",
    coince:["Thonny ne se lance pas : nouvel onglet (Ctrl + T) ▸ barre d’adresse ▸ https://cscircles.cemc.uwaterloo.ca/dev/console-fr/ ▸ Enter. Rien n’y est enregistré : sonne la cloche 🔔 ; le professeur organise la sauvegarde.",
            "Pas de fichier 02_Le-score dans Documents ▸ Python : menu Fichier ▸ Nouveau, et recopie les trois lignes de Python 03 : pieces = int(input(\"Combien de pièces ? \")) / score = pieces * 10 / print(score).",
            "Deux signes différents : le tiret - entre Le et bonus, le trait de soulignement _ partout ailleurs."],
    q:{ type:"saisie", q:"Recopie le nom de ton fichier, tel que Thonny l'affiche.",
        ok: r => /^03_le-bonus_[^\s_]{2,}.*\.py$/i.test(r.trim()) && !/_nom\.py$/i.test(r.trim()) && portemonNom(r.trim().slice(12)),
        faux: r => !/\.py$/i.test(r.trim()) ? "Il manque .py à la fin. Fichier ▸ Enregistrer sous… et corrige."
                 : /_nom\.py$/i.test(r.trim()) ? "Remplace Nom par TON nom. Fichier ▸ Enregistrer sous… et corrige."
                 : /^03_le-bonus_[^\s_]{2,}.*\.py$/i.test(r.trim()) ? "Après 03_Le-bonus_, écris TON nom, celui de ton adresse de l'école. Fichier ▸ Enregistrer sous… et corrige."
                 : "Le nom doit être 03_Le-bonus_ suivi de ton nom, puis .py. Vérifie les _ et le - .",
        juste:"Deux fichiers maintenant : 02_Le-score, sans losange, et 03_Le-bonus, que tu vas compléter." } },

  { partie:"E — « Le score » avec son bonus, dans Thonny", titre:"Ajouter le losange", min:8, cle:"bonus", indices:true,
    bulle:"Le logigramme complet de LogProg 03 : à toi de traduire le losange, sans modèle.",
    veux:"Compléter « Le score » avec son bonus : un if dans Thonny.",
    fais:CASES("Compare le <b>logigramme</b> avec tes trois lignes : qu'est-ce qui manque ?",
               "Ajoute le <b>if</b> et la ligne du bonus, entre le calcul et le print.",
               `<b>Enregistre</b> : <span class="chemin">icône disquette « Enregistrer »</span> (ou <b>Ctrl + S</b>).`,
               { geste:"<b>Prédis</b> le résultat, ci-dessous.", attention:"⚠️ Exécute seulement après ta prédiction : d'abord prédire, ensuite F5." },
               `Puis <span class="chemin">icône ▶ verte</span> (ou <b>F5</b>) : clique dans la console du bas, tape ton nombre, puis <b>Enter</b>.`),
    vois:"Cinq lignes de Python. La console pose la question, attend ta réponse, puis affiche le score, avec ou sans bonus.",
    extra: LOGIGRAMME_SCORE + `<p>Dans Thonny, après les deux-points et Enter, la ligne suivante est <b>déjà décalée</b> : Thonny le fait pour toi. Pour revenir à gauche : <b>Backspace</b>.</p>`
         + PLUS("Ajoute un else : quand il n'y a pas de bonus, le programme affiche « Encore un effort ! » avant le score."),
    coince:["Le losange devient if score > 50: — et la flèche OUI, une ligne décalée en dessous.",
            "print(score) reste collé à gauche, tout en bas : il s'exécute avec ou sans bonus.",
            "Toujours bloqué après ton voisin : relis ton programme « La super-potion », au bloc 5. Même forme, autres nombres."],
    ...bonusPredit(BONUS_V[0]),
    variantes:[bonusPredit(BONUS_V[1]), bonusPredit(BONUS_V[2])] },

  { partie:"E — « Le score » avec son bonus, dans Thonny", titre:"Le prouver ici", min:4,
    bulle:"Ton programme marche dans Thonny ? Prouve-le ici, avec le piège du 5.",
    veux:"Montrer que ton programme donne le bonus seulement quand il le faut.",
    fais:CASES("Dans Thonny, <b>sélectionne tout</b> ton programme (<b>Ctrl + A</b>) et copie-le (<b>Ctrl + C</b>).",
               "Clique dans le <b>cadre</b> ci-dessous et colle (<b>Ctrl + V</b>).", EXECUTER),
    vois:"La fiche essaie 7 pièces (170), 3 pièces (30), puis 5 pièces (50 : pas de bonus).",
    coince:["Avec 5 pièces, 150 au lieu de 50 : ta condition est >= ; le logigramme dit > .",
            "Avec 3 pièces, 130 : la ligne du bonus n'est pas sous le if. Décale-la.",
            "Corrige aussi dans Thonny, puis Ctrl + S : c'est ce fichier-là qui sera rendu."],
    q:{ type:"code", q:"Colle ici ton programme « Le score » avec son bonus.", depart:"", essais:[["7"],["3"],["5"]],
        test: r => r.erreur ? (r.erreur.type==="IndentationError" ? "IndentationError : la ligne du bonus est décalée de 4 espaces, le print revient à gauche." : "Lis la <b>ligne rouge</b>, corrige aussi dans Thonny, puis Ctrl + S.")
                 : !/^\s*if\b/m.test(r.code) ? "Il manque le if : c'est lui qui traduit le losange."
                 : !/\bint\(/.test(r.code) ? "Il manque int( ) : sans lui, la réponse tapée reste un texte."
                 : NOMBRES(DERNIERE(r.essais[1])).pop()===130 ? "Avec 3 pièces, tu donnes le bonus : la ligne du bonus est-elle décalée sous le if ?"
                 : NOMBRES(DERNIERE(r.essais[2])).pop()===150 ? "Avec 5 pièces, tu donnes le bonus : 50 > 50 est faux. Utilise >, pas >=."
                 : r.essais.every((e,i) => NOMBRES(DERNIERE(e)).pop()===[170,30,50][i]) ? true
                 : `Avec 7 pièces, ta dernière ligne est « ${DERNIERE(r.essais[0])} ». On attend 170.`,
        juste:"Le bonus tombe exactement quand le logigramme le dit : 7 pièces oui, 3 et 5 non." } },

  { partie:"E — « Le score » avec son bonus, dans Thonny", titre:"Commenter et relire à deux", min:7, stop:true, cle:"relire",
    bulle:"Un programme que ton voisin comprend… et qu'il essaie de piéger.",
    veux:"Un programme commenté, vérifié par un camarade sur trois critères.",
    fais:CASES("Dans Thonny, ajoute un <b>commentaire #</b> au-dessus du if, de la ligne du bonus et du print.",
               "<b>Enregistre</b> (Ctrl + S), puis exécute (F5).",
               "Réponds <b>seul</b> à la question ci-dessous.",
               "<b>À deux</b>, sur ton poste : tu expliques ton programme ; ton voisin vérifie les trois critères de l'encadré.",
               "Il te dit <b>une chose réussie</b> et une chose à corriger. Puis vous <b>inversez les rôles</b>.",
               "<b>Corrige toi-même</b> s'il y a lieu, puis Ctrl + S."),
    vois:"Ton voisin a tapé 5 : 50, sans bonus. Tes trois commentaires disent QUAND et POURQUOI, avec tes mots.",
    extra:`<div class="encart"><p><b>Le voisin vérifie — trois critères :</b></p><ol>
  <li>Il tape <b>5</b> : la console affiche <b>50</b>, sans bonus.</li>
  <li>La ligne du bonus est <b>décalée</b> sous le if ; le print est collé à gauche.</li>
  <li>Le commentaire du if dit <b>quand</b> le bonus est donné, avec d'autres mots que la ligne.</li></ol>
  <p>Il demande « Montre-moi », pas « C'est bon ? ». Chacun garde sa souris : l'auteur tape, le voisin regarde et parle.</p></div>`,
    coince:["Le # est AltGr + 3.", "Le voisin regarde et parle ; c'est toi qui tapes sur ton clavier."],
    ...modifie("remplace > par >=", "5", ["150","50","Une erreur SyntaxError","Rien"],
               [null,"Avec >=, 50 >= 50 est vrai : le bonus est donné.","Python accepte >= : c'est une comparaison valable.","Le print est collé à gauche : il s'exécute toujours."],
               "50 >= 50 est vrai : 50 + 100 = 150. Le logigramme dit > : c'est ce que vérifie le critère 1."),
    variantes:[
      modifie("décale aussi print(score) de 4 espaces", "3", ["Rien","30","130","Une erreur IndentationError"],
              [null,"Le print est maintenant sous le if : avec 30, la condition est fausse, il ne s'exécute pas.","Avec 3 pièces, 30 > 50 est faux : pas de bonus, et pas de print non plus.","Deux lignes décalées sous un if, c'est permis."],
              "Le print décalé dépend du if : 30 > 50 est faux, rien ne s'affiche. D'où le critère 2."),
      modifie("remplace score + 100 par score + 10", "7", ["80","170","70","Une erreur"],
              [null,"Le bonus vaut 10 maintenant, plus 100.","70 > 50 est vrai : le bonus, même petit, est ajouté.","score + 10 est un calcul valable."],
              "70 > 50 est vrai : 70 + 10 = 80. Le programme fait ce qui est écrit, pas ce qu'on voulait.") ] },

  { partie:"E — « Le score » avec son bonus, dans Thonny", titre:"Rendre « Le bonus » dans Classroom", min:4, stop:true, cle:"bonus",
    bulle:"Ton programme « Le bonus » part chez le professeur. Il est coté sur 5.",
    veux:"Rendre ton fichier 03_Le-bonus, commenté, dans Classroom, pour qu'il soit coté sur 5.",
    fais:CASES(`Lis la <b>grille</b> ci-dessous : vérifie chaque ligne dans ton programme.`,
               `Relis <b>tes trois commentaires</b> : ce sont TES mots, pas ceux de ton voisin, et pas la ligne recopiée.`,
               `Dans Thonny, enregistre une dernière fois : <span class="chemin">menu <b>Fichier ▸ Enregistrer</b></span> (ou <b>Ctrl + S</b>).`,
               `Ouvre un nouvel onglet (<b>Ctrl + T</b>), tape <b>classroom.google.com</b>, puis appuie sur <b>Enter</b>.`,
               `Clique sur le cours de <b>Logique et programmation</b> ▸ onglet <span class="chemin">Travaux et devoirs</span> ▸ le devoir <b>Python 04 — Le bonus</b> ▸ <span class="chemin">Afficher le devoir</span>.`,
               `À droite, dans <span class="chemin">Vos devoirs</span> : <b class="chemin">＋ Ajouter ou créer ▸ Fichier ▸ Parcourir</b>.`,
               `Dans la fenêtre : <span class="chemin">Documents ▸ double-clic sur Python ▸ clic sur 03_Le-bonus_… ▸ Ouvrir</span>, puis <b class="chemin">Importer</b>.`,
               `Ton fichier apparaît sous Vos devoirs : clique sur <b class="chemin">Rendre le devoir ▸ Rendre le devoir</b>.`),
    vois:"Dans Classroom, le devoir affiche « Remis » et ton fichier 03_Le-bonus_… .py.",
    coince:["Pas de devoir « Python 04 — Le bonus » dans Travaux et devoirs : vérifie que tu es dans le cours de Logique et programmation. Toujours rien : sonne la cloche 🔔.",
            "Ton fichier n'est pas dans Documents ▸ Python : dans la fenêtre, tape 03_Le-bonus dans la case Rechercher, en haut à droite, puis Enter.",
            "Le bouton dit « Marquer comme terminé » : ton fichier n'est pas joint. Reprends à l'étape ＋ Ajouter ou créer.",
            "Tu as rendu le mauvais fichier (02_Le-score, ou « Le bonus » sans tes commentaires) : clique sur Annuler l'envoi ▸ Annuler l'envoi, retire-le avec la ✕ à droite de son nom, enregistre dans Thonny (Ctrl + S), puis reprends à l'étape ＋ Ajouter ou créer."],
    ...rendreBonus(BONUS_V[0]),
    variantes:[rendreBonus(BONUS_V[1]), rendreBonus(BONUS_V[2])],
    q:{ type:"rapport", q:"Ton fichier « Le bonus » est-il rendu ?",
        confirmation:"J'ai rendu 03_Le-bonus, commenté, dans Classroom : je vois « Remis ».",
        trace:"rendu Classroom : 03_Le-bonus commenté",
        juste:"Le professeur ouvre ton fichier, l'exécute avec ton nombre et avec 5, lit tes commentaires et le cote sur 5." } },

  { partie:"F — Défi", titre:"Le distributeur", min:8, indices:true,
    bulle:"Ton fichier est rendu. Défi : le distributeur de LogProg 03, en vrai.",
    veux:"Écrire seul un if / else qui compare deux nombres.",
    fais:CASES("Le programme demande le <b>nombre de pièces</b> (un nombre : int).",
               "<b>Assez</b> de pièces : il affiche « Voici ta boisson », puis la monnaie.",
               "<b>Pas assez</b> : il affiche ce qui manque.",
               "Écris-le dans le cadre, <b>sans modèle</b>.", EXECUTER),
    ...distributeur(3),
    variantes:[distributeur(2), distributeur(4)] }
];

const FIN = {
  titre:"🎉 Python 04 terminé !",
  bulle:"Bravo ! Tes programmes savent maintenant décider.",
  texte:"Tu sais comparer (>, >=, ==), écrire un if avec ses deux-points et ses lignes décalées, et donner une autre route avec else. Prochaine étape : un jeu qui recommence tant qu'il reste des vies (Python 05).",
  plus:`Au choix, pour aller plus loin : (1) « Avancer », le logigramme 5 de LogProg 03 : le personnage avance si touche == "d" and mur == "non" — and veut dire ET. (2) Le mécanisme de ton projet du labo : écris en Python UNE règle de ton jeu avec un if / else (« si le personnage touche… alors… sinon… »), dans Thonny, et montre-la à ton voisin. (3) La leçon 6 de Cercles informatiques, en ligne.`,
  lien:'Pour aller plus loin : <a href="https://cscircles.cemc.uwaterloo.ca/6-fr/" target="_blank" rel="noopener">Cercles informatiques, leçon 6 « If »</a>',
  citation:{
    texte:"Tester un programme peut montrer la présence de bugs, jamais leur absence.",
    auteur:"Edsger W. Dijkstra", source:"Notes on Structured Programming (1970), traduit de l'anglais",
    lien:"Tu as essayé 7, 3 et 5 : trois essais, pas une preuve. C'est pour ça qu'on choisit un essai au bord, 5, pile sur le seuil."
  }
};

/* ===== Démos animées « Regarde comment faire » (lues par pas-a-pas/demos-python.js) =====
   Numéro de bloc (0 = bloc 1) ▸ titre, images. Jamais une réponse de preuve. */
const FICHIER_SCORE = "02_Le-score_Nom.py", FICHIER_BONUS = "03_Le-bonus_Nom.py";
const DEMOS_FICHE = {
  9: { titre:"Ouvrir « Le score » et l'enregistrer sous un nouveau nom", images:[
    { ecran:"bureau", cible:"demarrer", legende:"Appuie sur la touche Windows ⊞ (ou clique sur Démarrer)." },
    { ecran:"bureau", demarrer:1, cible:"app-thonny", legende:"Tape Thonny, puis Enter." },
    { ecran:"thonny", nom:"<sans nom>", menu:"item-ouvrir", cible:"item-ouvrir", legende:"Menu Fichier ▸ Ouvrir… (ou Ctrl + O)." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, ouvrir:1, cible:"dlg-documents", legende:"À gauche, clique sur Documents." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:1, ouvrir:1, cible:"dlg-python", legende:"Double-clic sur le dossier Python." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, ouvrir:1, cible:"dlg-fichier", legende:"Clique sur ton fichier 02_Le-score_… ." },
    { ecran:"thonny", nom:"<sans nom>", dialogue:2, ouvrir:1, choisi:1, cible:"dlg-ouvrir", legende:"Clique sur Ouvrir." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, menu:"item-sous", cible:"item-sous", legende:"Menu Fichier ▸ Enregistrer sous… (ou Ctrl + Shift + S)." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, dialogue:2, fichier:FICHIER_BONUS, cible:"dlg-nom", legende:"Nom du fichier : 03_Le-bonus_ puis TON nom, puis .py." },
    { ecran:"thonny", nom:FICHIER_SCORE, lignes:3, dialogue:2, fichier:FICHIER_BONUS, cible:"dlg-enregistrer", legende:"Clique sur Enregistrer." },
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:3, cible:"th-onglet", ok:1, legende:"L’onglet affiche le nouveau nom. 02_Le-score reste intact." } ] },
  10: { titre:"Exécuter et répondre dans la console", images:[
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:5, modifie:1, cible:"th-enregistrer", legende:"Tes cinq lignes écrites : disquette « Enregistrer » (ou Ctrl + S)." },
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:5, cible:"th-executer", legende:"Icône ▶ verte (ou F5)." },
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:5, run:1, question:"Combien de pièces ? ", cible:"th-console", legende:"La console pose la question et ATTEND. Clique dans la console." },
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:5, run:1, question:"Combien de pièces ? ", tape:"ton nombre", cible:"th-console", legende:"Tape ton nombre, puis Enter." },
    { ecran:"thonny", nom:FICHIER_BONUS, lignes:5, run:1, question:"Combien de pièces ? ", tape:"ton nombre", resultat:1, cible:"th-console", ok:1, legende:"Le score s’affiche. Compare avec ta prédiction." } ] }
};

/* ===== Python dans la page : pas-a-pas/python-editeur.js ===== */
const PYTHON_INPUT = true;   // input( ) lit les réponses de q.essais, comme dans la console de Thonny
const ERREURS_FICHE = {
  ValueError:"int( ) a reçu un texte qui n'est pas un nombre entier.",
  EOFError:"le programme veut lire une réponse de plus que ce qui a été tapé : un input( ) de trop ?",
  IndentationError:"le décalage ne va pas : sous un if ou un else, la ligne commence par 4 espaces (Tab) ; le reste est collé à gauche."
};

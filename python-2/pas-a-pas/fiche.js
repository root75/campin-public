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
const VIES = CODE("vies = 3\nvies = vies - 1\nprint(vies)");

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
        p:[null,"= n'est pas une égalité : c'est la flèche ← du logigramme. À droite je calcule, à gauche je range.","1 fait partie du calcul : vies - 1 est calculé d'abord, puis rangé dans vies.","Rien ne s'affiche sans print."] } },

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
    vois:"Le programme affiche 55.",
    coince:["SyntaxError : l'écriture est cassée. Je regarde juste avant la parenthèse finale.",
            "Un seul caractère à enlever, rien à ajouter."],
    q:{ type:"code", q:"Répare le programme.", depart:"print(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 +)",
        test: r => r.erreur ? "Lis la ligne rouge : une SyntaxError, c'est un caractère de trop ou de moins. Regarde juste avant la parenthèse finale."
                 : SORTIE(r)==="55" ? true : "Python affiche « "+SORTIE(r)+" » : un nombre a disparu. ↺ Code de départ, et n'enlève qu'UN caractère.",
        juste:"Le + collé à la parenthèse n'avait rien après lui à additionner." } },

  { partie:"B — Je lis les messages d'erreur", titre:"Bonjour Joe", min:5,
    veux:"Réparer une erreur qui arrive pendant l'exécution. Deux caractères.",
    fais:`<span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> tel quel ▸ je lis le nom de l'erreur ▸ je dis à mon voisin quelle ligne est fautive ▸ je corrige ▸ Exécuter.`,
    vois:"Le programme affiche Bonjour Joe.",
    coince:["NameError : Python cherche une variable qui n'existe pas. Joe, c'est un texte ou un nom de variable ?",
            "Deux caractères à ajouter, pas à enlever."],
    q:{ type:"code", q:"Répare le programme.", depart:'nom = Joe\nprint("Bonjour", nom)',
        test: r => r.erreur ? (r.erreur.type==="NameError" ? "NameError, ligne "+r.erreur.ligne+" : Python cherche une variable Joe. Un texte s'écrit entre guillemets." : "Lis la ligne rouge : il manque un guillemet ?")
                 : SORTIE(r)==="Bonjour Joe" ? true : "Python affiche « "+SORTIE(r)+" ». Il doit afficher Bonjour Joe : ↺ Code de départ et ajoute seulement deux guillemets.",
        juste:"Avec les guillemets, Joe est un texte rangé dans la boîte nom." } },

  { partie:"B — Je lis les messages d'erreur", titre:"Quelle ligne cloche ?", min:3,
    veux:"Trouver une erreur de logique en lisant, sans exécuter.",
    fais:"Je lis le programme ligne par ligne, comme une trace. Je clique sur la ligne fautive.",
    vois:"Le score doit valoir 15 : 10 points, plus un bonus de 5. Le programme affiche 5.",
    coince:["Aucune ligne rouge ici : le programme tourne, mais il calcule faux. C'est une erreur de logique.",
            "Je fais la trace : que vaut score après chaque ligne ?"],
    q:{ type:"ligne", q:"Clique sur la ligne fautive.", code:["score = 10","bonus = 5","score = score - bonus","print(score)"], bonne:3,
        p:["score = 10 : le score de départ est bien 10.","bonus = 5 : le bonus vaut bien 5.",null,"print(score) affiche bien le score. Le problème est dans le calcul, juste avant."],
        juste:"Le signe − enlève le bonus au lieu de l'ajouter : score = score + bonus." } },

  { partie:"B — Je lis les messages d'erreur", titre:"Les soldes", min:6, stop:true,
    veux:"Trouver une erreur de logique : pas de ligne rouge, mais un résultat faux.",
    fais:`Un pull à 20 € est soldé à −10 % : il doit coûter 18 €. <span class="chemin">▶ Exécuter (Ctrl+Entrée)</span> ▸ je compare avec 18 ▸ je trouve la ligne qui calcule faux ▸ je la corrige.`,
    vois:"Le programme affiche 18.0.",
    extra:`<div class="encart"><h3>Pourquoi 18.0 ?</h3><p>Dès qu'un calcul utilise un nombre à virgule (0.9), Python donne un nombre à virgule : 18.0. Une virgule s'écrit avec un POINT en Python.</p></div>`,
    coince:["prix * 0.1, c'est 10 % du prix : 2 €. Ce qu'on garde, c'est 90 % du prix.",
            "90 %, c'est 0.9 : un seul caractère à changer."],
    q:{ type:"code", q:"Corrige le calcul.", depart:"prix = 20\n# les soldes : moins 10 %\nprix = prix * 0.1\nprint(prix)",
        test: r => r.erreur ? "Lis la ligne rouge. Une virgule s'écrit avec un point en Python : 0.9, pas 0,9."
                 : !/\bprix\b\s*\*/.test(r.code.split("\n").slice(1).join("\n")) && !/\*\s*\bprix\b/.test(r.code.split("\n").slice(1).join("\n")) ? "Calcule à partir de prix : le programme doit marcher pour un autre prix."
                 : SORTIE(r).startsWith("(") ? "Python affiche « "+SORTIE(r)+" » : avec une virgule, il voit deux nombres. Un nombre à virgule s'écrit avec un POINT : 0.9."
                 : Math.abs(r.vars.prix-18)<1e-9 ? true
                 : "Python affiche « "+SORTIE(r)+" » : on veut 18. Quelle part du prix garde-t-on après −10 % ?",
        juste:"0.1 gardait 10 % du prix au lieu d'en enlever 10 %. Aucune ligne rouge : c'est à toi de comparer avec le résultat attendu." } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"J'ouvre mon fichier", min:3, stop:true,
    veux:"Retrouver le programme de la séance 1.",
    fais:`<span class="chemin">touche Windows ▸ je tape Thonny ▸ Entrée</span> ▸ <span class="chemin">menu Fichier ▸ Ouvrir… (Ctrl+O) ▸ Documents ▸ Python ▸ 01_Les-vies_Nom.py ▸ Ouvrir</span> ▸ <span class="chemin">icône ▶ verte « Exécuter le script courant » (F5)</span>.`,
    vois:"Mes trois lignes, et 2 dans la console du bas.",
    extra: VIES,
    coince:["Mon fichier n'est pas là : je le recrée. Documents ▸ bouton Nouveau ▸ Dossier ▸ Python ; puis dans Thonny, Fichier ▸ Enregistrer sous… (Ctrl+Maj+S) ▸ 01_Les-vies_Nom.py, et je tape les trois lignes du modèle.",
            "Thonny ne se lance pas : je reviens au bloc 3 (bouton ← Bloc précédent) et j'y tape « Les vies ». Rien n'y est enregistré : je montre mon écran au professeur."],
    q:{ type:"qcm", q:"F5 : qu'affiche la console du bas ?",
        c:["2","3","vies","Un message d'erreur"],
        p:[null,"vies - 1 doit être rangé : vies = vies - 1. Corrige, Ctrl+S, F5.","print(\"vies\") affiche le mot : enlève les guillemets, Ctrl+S, F5.","Lis le message, compare avec le modèle, corrige, Ctrl+S, F5."] } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je le casse : Vies", min:4,
    veux:"Voir que Python lit chaque lettre : Vies n'est pas vies.",
    fais:"À la 3e ligne, je remplace vies par <b>Vies</b> : print(Vies). Je réponds à la question AVANT de faire F5. Puis F5, je lis le message, et je répare (vies en minuscules), F5.",
    vois:"Un message d'erreur, puis de nouveau 2 après la réparation.",
    coince:["Le message est long : je lis la dernière ligne, c'est elle qui donne le nom de l'erreur."],
    q:{ type:"qcm", q:"Prédis : avec print(Vies), que va-t-il se passer ?",
        c:["Une erreur NameError : Python ne connaît pas Vies.","Il affiche 2.","Il affiche Vies.","Une erreur SyntaxError."],
        p:[null,"La boîte s'appelle vies, en minuscules. Vies est un autre nom, que Python ne connaît pas.","Sans guillemets, Vies n'est pas un texte : c'est un nom de variable.","L'écriture est correcte : c'est le nom qui est inconnu. Ce n'est pas une faute de syntaxe."] } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je le casse : une parenthèse", min:4,
    veux:"Reconnaître une faute d'écriture.",
    fais:"À la 3e ligne, j'efface la dernière parenthèse : print(vies. Je réponds AVANT de faire F5. Puis F5, je lis le message, et je remets la parenthèse, F5.",
    vois:"Un message d'erreur, puis de nouveau 2 après la réparation.",
    coince:["La parenthèse ) est la touche à droite du 0, sans Maj."],
    q:{ type:"qcm", q:"Prédis : avec print(vies sans la parenthèse finale, quelle erreur ?",
        c:["SyntaxError : une faute d'écriture.","NameError : un nom inconnu.","Aucune : il affiche 2.","Il affiche vies."],
        p:[null,"Le nom vies est connu : c'est l'écriture qui est cassée.","Python ne devine pas la parenthèse manquante.","Rien ne s'affiche quand l'écriture est cassée."] } },

  { partie:"C — « Les vies » cassé, réparé, commenté, dans Thonny", titre:"Je commente chaque ligne", min:6, stop:true,
    veux:"Un programme que n'importe qui comprend en le lisant.",
    fais:`Au-dessus de chaque ligne, j'ajoute une ligne qui commence par <b>#</b> et dit ce que fait la ligne ▸ <span class="chemin">icône disquette (Ctrl+S)</span> ▸ F5. Puis je montre mon écran au professeur.`,
    vois:"Six lignes : trois commentaires, trois instructions. La console affiche toujours 2.",
    extra: CODE("# je range 3 dans la boîte vies\nvies = 3\n# …\nvies = vies - 1\n# …\nprint(vies)"),
    coince:["Le # est AltGr + 3.",
            "Je ne sais pas quoi écrire : je dis ce que fait la ligne, comme dans le logigramme (je range, je calcule, j'affiche)."],
    q:{ type:"qcm", q:"Avec tes trois commentaires, qu'affiche le programme ?",
        c:["2, comme avant : Python ignore ce qui suit #.","Les commentaires, puis 2.","Une erreur.","Rien."],
        p:[null,"Les commentaires sont pour les humains : Python ne les affiche pas.","Si tu as une erreur, un # manque au début d'une ligne de commentaire.","print(vies) est toujours là : il affiche 2."] } }
];

const FIN = {
  titre:"🎉 J'ai fini la séance 2",
  texte:"Mon programme est réparé, commenté et enregistré. J'écoute l'annonce de la première évaluation : quoi et quand.",
  plus:"Changer DEUX touches de « Les vies » pour qu'il affiche 1, et corriger mon commentaire.",
  lien:'<a href="https://root75.github.io/campin-public/python-je-revise/" target="_blank" rel="noopener">Premiers pas en Python — je révise</a> (onglet Cartes)'
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
    lance.disabled = true; ecran.hidden = false; ecran.className = "console";
    ecran.textContent = "⏳ Python se prépare… (la première fois seulement, quelques secondes)";
    let r;
    try { r = await executePython(ta.value); }
    catch(e){
      ecran.textContent = "Le moteur Python ne se charge pas. Je réessaie dans un instant ; sinon, je pose mon chevalet.";
      lance.disabled = false; return;
    }
    montre(ecran, r);
    const verdict = Q.test(r);
    if(verdict === true){ ta.readOnly = true; depart.disabled = true; reussi(ta.value); }
    else { lance.disabled = false; rate(verdict, ta.value); }
  }
}

/* Code mélangé : l'élève remet les lignes dans l'ordre (▲ ▼), puis la fiche EXÉCUTE le programme
   et applique test(r) comme pour un programme écrit : tous les ordres qui marchent sont justes. */
function ordre(zone, Q, reussi, rate){
  let lignes = melange(Q.lignes);
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
      haut.addEventListener("click",()=>{ [lignes[i-1],lignes[i]]=[lignes[i],lignes[i-1]]; dessine(); ol.children[i-1].querySelector(".fleche").focus(); });
      bas.addEventListener("click",()=>{ [lignes[i+1],lignes[i]]=[lignes[i],lignes[i+1]]; dessine(); ol.children[i+1].querySelectorAll(".fleche")[1].focus(); });
      li.append(c, haut, bas); ol.append(li);
    });
  };
  dessine();
  zone.append(ol, el("div","actions"), ecran); zone.children[1].append(ok);
  chargePython().catch(() => {});
  ok.addEventListener("click", async () => {
    ok.disabled = true; ecran.hidden = false; ecran.textContent = "⏳ Python se prépare… (la première fois seulement, quelques secondes)";
    let r;
    try { r = await executePython(lignes.join("\n")); }
    catch(e){ ecran.textContent = "Le moteur Python ne se charge pas. Je réessaie dans un instant ; sinon, je pose mon chevalet."; ok.disabled = false; return; }
    montre(ecran, r);
    const verdict = Q.test(r);
    if(verdict === true){ ol.querySelectorAll("button").forEach(b=>b.disabled=true); reussi(lignes.join(" / ")); }
    else { ok.disabled = false; rate(verdict, lignes.join(" / ")); }
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

/* ===== Moteur ===== */
const LETTRES = "ABCD";
const norm = s => (s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()
  .replace(/[’']/g,"'").replace(/[«»"“”.]/g,"").replace(/\s+/g," ").trim();
const melange = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const el = (tag, cls, html) => { const n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; };
const txt = (tag, cls, t) => { const n=document.createElement(tag); if(cls) n.className=cls; n.textContent=t; return n; };

/* Suivi : servie par Apps Script (outils/pas-a-pas), la page envoie chaque événement
   au tableau de bord du professeur. Ouverte depuis GitHub Pages, rien ne part. */
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;
/* Aperçu professeur : l'adresse finit par #bloc=7. La fiche s'ouvre à ce bloc, la navigation est
   libre et rien n'est enregistré, ni dans le journal ni sur l'ordinateur. Lien depuis le tableau de bord. */
const APERCU = /^#bloc=\d+$/.test(location.hash);
addEventListener("hashchange", () => location.reload());
function envoie(evt){
  if(!SUIVI || APERCU) return;
  google.script.run.withFailureHandler(()=>{}).noter(COURS, evt);
}
/* Avancement local, seulement sans suivi : avec le suivi, il vient du serveur et de la séance,
   pour qu'un poste partagé n'hérite pas de l'élève de l'heure précédente. */
const CLE = "pas-a-pas:"+COURS;
const lit = () => { if(SUIVI || APERCU) return {}; try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch(e){ return {}; } };
const ecrit = o => { if(SUIVI || APERCU) return; try { localStorage.setItem(CLE, JSON.stringify(o)); } catch(e){} };

let etat = Object.assign({ atteint:0, erreurs:0 }, lit());   // atteint = premier bloc non validé
let ici = Math.min(etat.atteint, BLOCS.length);
let enAide = false;

function barre(){
  const b = document.getElementById("progres"); b.replaceChildren();
  BLOCS.forEach((_,i)=>{ const s=el("span"); s.className = i<etat.atteint ? "fait" : (i===ici ? "ici" : ""); b.append(s); });
}

function affiche(){
  barre();
  const z = document.getElementById("bloc"); z.replaceChildren();
  const liste = document.getElementById("coince-liste"); liste.replaceChildren();
  document.getElementById("coince").open = false;
  if(ici >= BLOCS.length){ fin(z); return; }
  const B = BLOCS[ici];

  const num = el("div","numero");
  num.append(txt("span",null,"Bloc "+(ici+1)+" sur "+BLOCS.length+" · Partie "+B.partie.split(" — ")[0]), txt("span",null,"⏱ "+B.min+" min"));
  z.append(num, txt("h2",null,(ici+1)+". "+B.titre));

  const dl = el("dl","lignes");
  [["🎯 Je veux","veux",B.veux],["👉 Je fais","fais",B.fais],["👀 Je vois","vois",B.vois]].forEach(([t,c,h])=>{
    const d = el("div","ligne "+c); d.append(txt("dt",null,t), el("dd",null,h)); dl.append(d);
  });
  z.append(dl);
  if(B.extra) z.append(el("div",null,B.extra));
  if(B.stop) z.append(txt("p","stop","🛑 STOP — je ne continue pas tant que je ne vois pas ça."));

  B.coince.forEach(c=>liste.append(txt("li",null,c)));

  const pr = el("div","preuve");
  const fait = etat.atteint > ici;
  if(fait){
    pr.append(txt("p","retour juste","✅ Bloc déjà validé."));
  } else if(B.cases){
    pr.append(txt("div","etiquette","✅ Les cinq points (mon message est noté sur 5)"));
    const ul = el("ul","cases");
    B.cases.forEach(c=>{ const li=el("li"); const lab=el("label"); const cb=el("input"); cb.type="checkbox";
      lab.append(cb, txt("span",null,c)); li.append(lab); ul.append(li); });
    const go = txt("button","btn plein","Les cinq points sont bons, j'ai cliqué sur Envoyer"); go.type="button"; go.disabled=true;
    ul.addEventListener("change",()=>{ go.disabled = [...ul.querySelectorAll("input")].some(x=>!x.checked); });
    go.addEventListener("click",()=>{ ul.remove(); go.remove(); preuve(pr,B); });
    pr.append(ul, go);
  } else if(["code","ordre","trace","ligne"].includes(B.q.type)){
    preuve(pr,B);
  } else {
    const go = txt("button","btn plein","👀 Je vois ça"); go.type="button";
    go.addEventListener("click",()=>{ go.remove(); preuve(pr,B); });
    pr.append(go);
  }
  z.append(pr);

  const nav = el("div","actions");
  const avant = txt("button","btn vide","← Bloc précédent"); avant.type="button"; avant.disabled = ici===0;
  avant.addEventListener("click",()=>{ ici--; affiche(); });
  nav.append(avant, el("span","espace"));
  if(fait || (APERCU && ici+1<BLOCS.length)){ const s=txt("button","btn plein","Bloc suivant →"); s.type="button"; s.addEventListener("click",()=>{ici++;affiche();}); nav.append(s); }
  z.append(nav);
}

/* La question de preuve. Faux : on explique, on compte, et on recommence. */
function preuve(pr, B){
  const Q = B.q;
  pr.append(txt("div","etiquette", ["code","ordre"].includes(Q.type) ? "Mon programme" : "Je prouve que j'ai fait le bloc"), txt("p","question",Q.q));
  const retour = el("div","retour"); retour.hidden = true;
  const zone = el("div"); pr.append(zone, retour);
  let essais = 0;

  const reussi = (reponse) => {
    retour.className="retour juste"; retour.replaceChildren(txt("strong",null,"Oui, c'est ça."));
    if(Q.juste) retour.append(txt("p",null,Q.juste));
    retour.hidden=false;
    envoie({ etape:ici+1, type:"juste", essais:essais, reponse:reponse });
    etat.atteint = Math.max(etat.atteint, ici+1); ecrit(etat); barre();
    if(enAide) basculeAide();
    const s = txt("button","btn plein", ici+1<BLOCS.length ? "Bloc suivant →" : "J'ai fini ✓"); s.type="button";
    s.addEventListener("click",()=>{ ici++; affiche(); });
    pr.append(s); s.focus();
  };
  const rate = (explication, reponse) => {
    essais++; etat.erreurs++; ecrit(etat);
    envoie({ etape:ici+1, type:"faux", essais:essais, reponse:reponse });
    retour.className="retour faux"; retour.replaceChildren(txt("strong",null,"Pas encore."), txt("p",null,explication));
    if(essais>=2){ retour.append(txt("p",null,"Ouvre « Ça coince ? » juste en dessous.")); document.getElementById("coince").open = true; }
    if(essais>=3) retour.append(txt("p",null,"Toujours bloqué : demande à ton voisin, puis pose ton chevalet sur l'écran."));
    retour.hidden=false;
  };

  if(Q.type==="code"){ editeur(zone, Q, reussi, rate); return; }
  if(Q.type==="ordre"){ ordre(zone, Q, reussi, rate); return; }
  if(Q.type==="trace"){ trace(zone, Q, reussi, rate); return; }
  if(Q.type==="ligne"){ ligneFautive(zone, Q, reussi, rate); return; }
  if(Q.type==="qcm"){
    const tour = () => {
      zone.replaceChildren();
      const liste = el("div","choix"); const boutons=[];
      melange([0,1,2,3]).forEach((k,pos)=>{
        const b = el("button"); b.type="button";
        b.append(txt("span","lettre",LETTRES[pos]), txt("span",null,Q.c[k]));
        b.addEventListener("click",()=>{
          boutons.forEach(x=>x.disabled=true);
          if(k===0){ b.classList.add("juste"); boutons.forEach(x=>{ if(x!==b) x.classList.add("estompe"); }); reussi(Q.c[k]); }
          else {
            b.classList.add("faux"); rate(Q.p[k], Q.c[k]);
            const r = txt("button","btn vide","Réessayer"); r.type="button";
            r.addEventListener("click",()=>{ r.remove(); retour.hidden=true; tour(); });
            zone.append(r);
          }
        });
        boutons.push(b); liste.append(b);
      });
      zone.append(liste);
    };
    tour();
  } else {
    const f = el("form","saisie"); const inp = el("input"); inp.type="text"; inp.autocomplete="off"; inp.spellcheck=false;
    inp.setAttribute("aria-label", Q.q);
    const ok = txt("button","btn plein","Vérifier"); ok.type="submit";
    f.append(inp, ok);
    f.addEventListener("submit", e=>{
      e.preventDefault(); const r = inp.value.trim(); if(!r) return;
      if(Q.ok(r)){ inp.disabled=true; ok.disabled=true; reussi(r); } else { rate(typeof Q.faux==="function" ? Q.faux(r) : Q.faux, r); inp.select(); }
    });
    zone.append(f); inp.focus();
  }
}

function fin(z){
  z.append(txt("h2",null,FIN.titre), txt("p",null,FIN.texte));
  const plus = el("div","encart");
  plus.append(txt("h3",null,"⚡ J'ai fini avant les autres"), txt("p",null,FIN.plus),
    el("p",null,"Puis je révise : "+FIN.lien+"."));
  const nav = el("div","actions");
  const avant = txt("button","btn vide","← Revoir les blocs"); avant.type="button";
  avant.addEventListener("click",()=>{ ici=0; affiche(); });
  nav.append(avant);
  if(!SUIVI){
    const zero = txt("button","btn vide","Recommencer à zéro"); zero.type="button";
    zero.addEventListener("click",()=>{ etat = { atteint:0, erreurs:0 }; ecrit(etat); ici=0; humeur(); affiche(); });
    nav.append(zero);
  }
  z.append(bilan(), plus, nav);
  if(!etat.fini){ etat.fini = true; ecrit(etat); envoie({ etape:BLOCS.length, type:"fini" }); }
}

/* Humeur du jour : un clic, au-dessus du bloc 1. Ce n'est pas un bloc : rien n'est compté,
   rien n'est bloqué. Même liste dans pas-a-pas/tableau.html. */
const HUMEURS = [["😄","Super"],["🙂","Bien"],["😐","Bof"],["🙁","Pas top"],["😣","Pas bien"]];
function humeur(changer){
  const h = document.getElementById("humeur"); h.replaceChildren(); h.hidden = false;
  if(etat.humeur && !changer){
    h.className = "humeur faite";
    h.append(txt("span",null,"Mon humeur du jour : "+etat.humeur));
    const c = txt("button","lien","changer"); c.type="button";
    c.addEventListener("click",()=>humeur(true));
    h.append(c); return;
  }
  h.className = "humeur";
  h.append(txt("p","question","Comment je me sens aujourd'hui ?"));
  const l = el("div","smileys");
  HUMEURS.forEach(([e,t])=>{
    const b = el("button", etat.humeur===e+" "+t ? "choisi" : ""); b.type="button";
    b.append(txt("span","emoji",e), txt("span",null,t));
    b.addEventListener("click",()=>{ etat.humeur = e+" "+t; ecrit(etat); envoie({ etape:0, type:"humeur", reponse:etat.humeur }); humeur(); });
    l.append(b);
  });
  h.append(l, txt("p","note", SUIVI && !APERCU ? "Un clic, puis je commence. Mon professeur voit l'humeur de la classe." : "Un clic, puis je commence."));
}

/* Mon avis, à la fin : trois questions ouvertes, une ligne du journal chacune.
   Même liste dans pas-a-pas/tableau.html. */
const AVIS = [["plu","Ce qui m'a plu"],["progres","Ce qui m'a aidé à progresser"],["gene","Ce qui m'a gêné dans le cours en ligne"]];
function bilan(){
  const f = el("form","encart bilan");
  f.append(txt("h3",null,"💬 Mon avis sur ce cours"), txt("p","note","Quelques mots suffisent. Je peux laisser une case vide."));
  const champs = AVIS.map(([k,t])=>{
    const lab = el("label"), ta = el("textarea"); ta.rows = 2; ta.maxLength = 200; ta.value = (etat.avis||{})[k] || "";
    lab.append(txt("span",null,t), ta); f.append(lab); return ta;
  });
  const ok = txt("button","btn plein", etat.avis ? "Modifier mon avis" : "Envoyer mon avis"); ok.type="submit";
  const merci = txt("p","note", etat.avis ? "✅ Avis envoyé. Merci !" : "");
  const act = el("div","actions"); act.append(ok, merci); f.append(act);
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const a = {}; AVIS.forEach(([k],i)=>{ a[k] = champs[i].value.trim(); });
    if(!Object.values(a).some(Boolean)){ merci.textContent = "J'écris au moins quelques mots dans une des cases."; return; }
    etat.avis = a; ecrit(etat);
    AVIS.forEach(([k])=>envoie({ etape:BLOCS.length, type:"avis-"+k, reponse:a[k] }));
    ok.textContent = "Modifier mon avis";
    merci.textContent = SUIVI && !APERCU ? "✅ Avis envoyé à mon professeur. Merci !" : "✅ Merci ! (Rien n'est envoyé : la fiche n'est pas suivie.)";
  });
  return f;
}

/* « J'attends de l'aide » : l'équivalent de la case entourée. Le chevalet reste le signal. */
function basculeAide(){
  enAide = !enAide;
  const a = document.getElementById("aide"), b = document.getElementById("aide-btn");
  a.classList.toggle("active", enAide);
  document.getElementById("aide-texte").textContent = enAide
    ? "✋ Ton professeur sait que tu attends au bloc "+(ici+1)+". Pose ton chevalet sur l'écran, et en attendant relis « Ça coince ? »."
    : "Je suis bloqué malgré « Ça coince ? » et mon voisin :";
  b.textContent = enAide ? "Je me suis débloqué" : "J'attends de l'aide";
  envoie({ etape:Math.min(ici,BLOCS.length-1)+1, type: enAide ? "aide" : "aide-fin" });
}
document.getElementById("aide-btn").addEventListener("click", basculeAide);
document.getElementById("memo-btn").addEventListener("click",()=>document.getElementById("memo").showModal());

/* Démarrage. Avec le suivi : on reprend où le serveur s'est arrêté (autre poste, onglet fermé). */
const qui = document.getElementById("qui"), pied = document.getElementById("pied");
if(APERCU){
  ici = Math.max(0, Math.min(BLOCS.length-1, parseInt(location.hash.slice(6),10)-1));
  qui.textContent = "👁 Aperçu professeur : navigation libre, rien n'est enregistré.";
  pied.textContent = "Aperçu : les réponses ne sont ni envoyées ni gardées.";
  document.getElementById("aide").hidden = true;
  humeur();
  affiche();
} else if(SUIVI){
  pied.textContent = "Ton avancement est visible par ton professeur.";
  google.script.run.withSuccessHandler(s=>{
    if(s && s.email){ qui.textContent = "Connecté : "; qui.append(txt("strong",null,s.email)); if(s.classe) qui.append(" · "+s.classe); }
    if(s && s.humeur) etat.humeur = s.humeur;
    if(s && s.avis) etat.avis = s.avis;
    humeur();
    if(s && s.atteint){ etat.atteint = s.atteint; etat.fini = s.atteint >= BLOCS.length; ici = Math.min(s.atteint, BLOCS.length); }
    affiche();
    envoie({ etape:Math.min(ici,BLOCS.length-1)+1, type:"ouvert" });
  }).withFailureHandler(()=>{ humeur(); affiche(); }).etat(COURS);
} else {
  qui.textContent = "Garde deux fenêtres : cette fiche, et Thonny quand elle le demande.";
  pied.textContent = "Ton avancement reste sur cet ordinateur. Aucune donnée n'est envoyée.";
  humeur();
  affiche();
}

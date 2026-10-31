/* Le moteur et le contenu de la fiche « Mon premier message ». Hors de index.html : servie par
   Apps Script, la page voyait son script modifié au passage (SyntaxError, alors que la même page
   sur GitHub Pages marche). Un fichier externe arrive au navigateur tel quel. */
/* ===== Contenu de la leçon =====
   Repris mot pour mot de « Eleve - J'ecris mon premier message - Lecon 1.docx ».
   Chaque bloc : veux / fais / vois, stop, minutes, coince (les pièges de CE bloc).
   Sa question de preuve, en trois variantes, est dans preuves.json (même ordre que BLOCS). */
const COURS = "messagerie-1";
/* Les questions de preuve et leurs réponses : dans preuves.json, pas ici. Servie par Apps Script,
   la fiche reçoit du serveur la variante de l'élève, sans la réponse, et le serveur corrige.
   Hors Apps Script (GitHub Pages, aperçu professeur), elle lit le fichier et corrige elle-même. */
const PREUVES = "https://root75.github.io/campin-public/messagerie/pas-a-pas/preuves.json";

const PROF_TABLE = `<div class="encart"><table>
  <tr><th>Ma classe</th><th>Mon professeur</th><th>Son adresse</th></tr>
  <tr><td>2B · 2F</td><td>M. Louviaux</td><td>vlouviaux@arcampin.be</td></tr>
  <tr><td>2E</td><td>Mme Michiels</td><td>alexia.michiels@arcampin.be</td></tr></table></div>`;

const BLOCS = [
  { partie:"A — J'ouvre Courrier et je m'y repère", titre:"J'ouvre Courrier", min:5, stop:true,
    veux:"Être dans ma boîte de l'école. Elle s'appelle Courrier ; le programme s'appelle Outlook.",
    fais:`Dans Chrome : <span class="chemin">barre de favoris ▸ Favoris du domaine arcampin.com ▸ Microsoft 365 ▸ Courrier</span>`,
    vois:"L'onglet de Chrome affiche « Courrier - mon nom - Outlook ».",
    coince:["Je ne vois pas « Favoris du domaine arcampin.com » : je ne suis pas dans Chrome avec mon compte de l'école. En haut à droite de Chrome, le rond du profil ▸ je choisis mon compte de l'école.",
            "Outlook me demande de me connecter : mon adresse de l'école, puis mon mot de passe.",
            "Je garde deux onglets : celui-ci pour la fiche, un autre pour Courrier."] },

  { partie:"A — J'ouvre Courrier et je m'y repère", titre:"Je trouve mes dossiers", min:3,
    veux:"Savoir où sont rangés mes messages.",
    fais:"Je regarde la colonne de gauche et je montre chaque dossier à mon voisin.",
    vois:"Boîte de réception, Brouillons, Éléments envoyés, Éléments supprimés, Courrier indésirable.",
    coince:["Je ne vois pas la colonne de gauche : en haut à gauche, je clique sur les trois traits ☰."] },

  { partie:"A — J'ouvre Courrier et je m'y repère", titre:"Je trouve la liste des messages", min:3,
    veux:"Savoir où s'affichent les messages du dossier choisi.",
    fais:`Au milieu de l'écran, je clique sur l'onglet <span class="chemin">Autres</span>, puis de nouveau sur <span class="chemin">Prioritaire</span>.`,
    vois:"La liste change, puis revient. Le message le plus récent est en haut.",
    coince:["Un message que je cherche n'est pas dans Prioritaire ? Il est peut-être dans Autres."] },

  { partie:"A — J'ouvre Courrier et je m'y repère", titre:"Je place le message en dessous de la liste", min:4,
    veux:"Une liste large, où les objets des messages se lisent en entier.",
    fais:`<span class="chemin">Onglet Afficher ▸ Disposition ▸ Volet de lecture ▸ Afficher en bas</span>`,
    vois:"La liste prend toute la largeur. Quand je clique sur un message, il s'ouvre en dessous. Le réglage reste pour les prochaines fois.",
    coince:["Je ne vois pas l'onglet Afficher : tout en haut à gauche, à côté de Fichier et Accueil."] },

  { partie:"B — Je lis le message de mon professeur", titre:"J'ouvre le message de mon professeur", min:5, stop:true,
    veux:"Lire le message que mon professeur m'a envoyé avant le cours.",
    fais:`<span class="chemin">Volet des dossiers ▸ Boîte de réception ▸ un clic sur son message</span>. Pas dans Prioritaire ? Je regarde dans Autres. Toujours pas ? Je tape son nom dans Rechercher, tout en haut.`,
    vois:"Le message s'ouvre sous la liste.",
    coince:["Pas dans Prioritaire ? Onglet Autres.","Toujours pas ? Je tape le nom de mon professeur dans Rechercher, tout en haut."] },

  { partie:"B — Je lis le message de mon professeur", titre:"Je repère trois informations", min:5,
    veux:"Savoir ce que je devrai écrire au bloc 10.",
    fais:"Je lis le message en entier, sans répondre. Je garde l'onglet ouvert.",
    vois:"Je peux montrer à mon voisin : l'objet du message (son titre), la date et l'heure d'envoi, et la question qu'il me pose.",
    coince:["L'objet, c'est le titre du message : la ligne en gras, tout en haut du message ouvert.","La date et l'heure sont à droite, au-dessus du texte.",
            "Mon voisin n'a pas la même question que moi : c'est normal. Je réponds à MA question, pas à la sienne."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"J'ouvre un nouveau message", min:3,
    veux:"Une page blanche pour écrire.",
    fais:`<span class="chemin">Onglet Accueil ▸ bouton bleu Nouveau message</span>`,
    vois:"En haut, le bouton Envoyer ; dessous, la ligne À, la ligne Cc, et Cci au bout de la ligne À ; puis Ajouter un objet.",
    extra:`<div class="encart"><h3>📝 Ce message est coté sur 5 par mon professeur</h3>
  <p>Il reçoit mon message et compte un point pour chaque critère :</p>
  <table>
  <tr><td><b>1</b></td><td>L'adresse est celle de mon professeur.</td></tr>
  <tr><td><b>2</b></td><td>L'objet est « Mon premier message - » suivi de mon prénom.</td></tr>
  <tr><td><b>3</b></td><td>Le texte commence par « Bonjour Monsieur, » ou « Bonjour Madame, ».</td></tr>
  <tr><td><b>4</b></td><td>Tous les crochets sont remplacés (l'objet, la date, l'heure, MA réponse), avec une majuscule et un point à chaque phrase.</td></tr>
  <tr><td><b>5</b></td><td>Le message finit par mon prénom, mon nom et ma classe.</td></tr></table>
  <p>Je relis ces cinq points au bloc 11, avant d'envoyer.</p></div>`,
    coince:["J'ai fermé mon message sans l'envoyer : il est dans Brouillons, je clique dessus pour continuer."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"Je mets l'adresse de mon professeur", min:5,
    veux:"Que mon message arrive chez mon professeur, et chez personne d'autre.",
    fais:"Je clique dans la ligne À, je tape le début de son nom, puis je clique sur son nom dans la liste qui s'ouvre.",
    vois:"Son nom est dans la ligne À. Je vérifie l'adresse dans le tableau « Mon professeur ».",
    extra: PROF_TABLE,
    coince:["Le nom de mon professeur ne s'affiche pas dans la liste : je tape son adresse en entier, sans espace."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"Je mets l'objet", min:4,
    veux:"Que mon professeur sache de quoi parle mon message avant de l'ouvrir.",
    fais:`Je clique dans <span class="chemin">Ajouter un objet</span> et je tape : <b>Mon premier message - prénom</b> (avec MON prénom).`,
    vois:"L'objet est écrit, sans faute.",
    coince:["Le tiret est la touche 6 du clavier, sans Maj : « - »."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"J'écris le texte", min:20,
    veux:"Un message complet : saluer, dire, finir, signer.",
    fais:"Je clique dans la grande zone blanche et je tape le modèle ci-dessous, en remplaçant tout ce qui est entre crochets.",
    vois:"Plus aucun crochet [ ] dans mon texte.",
    extra:`<div class="encart"><p class="modele">Bonjour Monsieur,  <span style="color:var(--doux)">(ou : Bonjour Madame,)</span>
J'ai bien reçu votre message. Son objet était « <b>[l'objet du message]</b> » et il a été envoyé le <b>[date]</b> à <b>[heure]</b>.
<b>[Ma réponse à la question du message, en une phrase.]</b>
Un message que je reçois arrive dans le dossier <b>[nom du dossier]</b>. Un message que j'envoie se range dans le dossier <b>[nom du dossier]</b>.
Bonne journée,
<b>[Prénom Nom]</b>, <b>[classe]</b></p></div>`,
    coince:["Je ne retrouve plus la date, l'heure ou la question : je retourne dans Boîte de réception, le message de mon professeur est toujours là.","Les deux dossiers à écrire : regarde le bouton ✉️ « Un e-mail, c'est une lettre » en bas de la page."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"Je relis, puis j'envoie", min:8,
    veux:"Un message sans erreur : il ne se reprend pas.",
    fais:`Je contrôle les cinq points ci-dessous, puis bouton <span class="chemin">Envoyer</span>.`,
    vois:"La fenêtre du message se ferme.",
    cases:["L'adresse est celle de mon professeur.",
           "L'objet est « Mon premier message - » suivi de mon prénom.",
           "Le texte commence par « Bonjour Monsieur, » ou « Bonjour Madame, ».",
           "Tous les crochets sont remplacés, avec une majuscule et un point à chaque phrase.",
           "Le message finit par mon prénom, mon nom et ma classe."],
    coince:["Je me suis trompé d'adresse après l'envoi : j'écris un nouveau message, avec la bonne adresse."] },

  { partie:"C — J'écris et j'envoie mon premier message", titre:"Je vérifie que mon message est parti", min:5, stop:true,
    veux:"Être sûr que mon professeur va le recevoir.",
    fais:`<span class="chemin">Volet des dossiers ▸ Éléments envoyés</span>`,
    vois:"Mon message est en haut de la liste. Je l'ouvre : les cinq points sont bons. S'il en manque un, j'envoie un nouveau message corrigé.",
    coince:["Mon message n'est pas dans Éléments envoyés : je regarde dans Brouillons. Il n'est pas parti, je l'ouvre et je clique sur Envoyer."] }
];

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
    pr.append(txt("div","etiquette","✅ Les cinq points (mon message est coté sur 5)"));
    const ul = el("ul","cases");
    B.cases.forEach(c=>{ const li=el("li"); const lab=el("label"); const cb=el("input"); cb.type="checkbox";
      lab.append(cb, txt("span",null,c)); li.append(lab); ul.append(li); });
    const go = txt("button","btn plein","Les cinq points sont bons, j'ai cliqué sur Envoyer"); go.type="button"; go.disabled=true;
    ul.addEventListener("change",()=>{ go.disabled = [...ul.querySelectorAll("input")].some(x=>!x.checked); });
    go.addEventListener("click",()=>{ ul.remove(); go.remove(); preuve(pr,B); });
    pr.append(ul, go);
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

/* Hors Apps Script : les preuves sont lues dans preuves.json, une fois. */
let preuvesLocales = null;
const chargePreuves = () => preuvesLocales || (preuvesLocales = fetch(PREUVES).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); }));

/* Le test d'une saisie : mêmes règles que regle_() dans Code.gs. */
function regle(r, rep){
  const n = norm(rep);
  if(!n) return false;
  if(r.sauf && new RegExp(r.sauf).test(n)) return false;
  if(r.egal && !r.egal.some(x=>norm(x)===n)) return false;
  if(r.exact && !r.exact.includes(rep.trim().toLowerCase())) return false;
  if(r.contient && !r.contient.some(x=>n.includes(norm(x)))) return false;
  if(r.motif && !new RegExp(r.motif).test(n)) return false;
  return true;   // r.prenom : vérifié seulement par le serveur, qui connaît l'adresse
}
/* Une variante corrigée ici : bonne réponse en premier dans le fichier, mélangée par question(). */
const locale = V => ({ type:V.type, q:V.q, c: V.type==="qcm" ? V.c : null,
  corrige: (rep, essais, fin) => {
    if(V.type==="qcm"){ const k = V.c.indexOf(rep); fin({ juste:k===0, texte: k===0 ? "" : V.p[k] }); }
    else { const j = regle(V.regle, rep); fin({ juste:j, texte: j ? (V.juste||"") : V.faux }); }
  } });

/* La question de preuve. Servie par Apps Script : la variante de l'élève vient du serveur, qui
   corrige et écrit le journal. Aperçu professeur : les trois variantes du bloc. */
function preuve(pr, B){
  pr.append(txt("div","etiquette","Je prouve que j'ai fait le bloc"));
  const attente = txt("p","note","Chargement de la question…"); pr.append(attente);
  const bloc = ici+1;
  const panne = () => { attente.textContent = "La question n'a pas pu se charger. Recharge la page (F5)."; };
  const surPlace = () => chargePreuves().then(P=>{
    const V = P.blocs[bloc-1] || [];
    if(!V.length){ panne(); return; }
    attente.remove();
    if(!APERCU){
      /* La variante 1, corrigée ici. Servie par un Code.gs d'avant les variantes, la page note
         elle-même juste / faux, comme avant ; sans suivi, envoie() ne fait rien. */
      const Q = locale(V[0]), corrige = Q.corrige;
      Q.corrige = (rep, essais, fin) => corrige(rep, essais, r=>{ envoie({ etape:bloc, type: r.juste ? "juste" : "faux", essais, reponse:rep }); fin(r); });
      question(pr, Q, true); return;
    }
    V.forEach((v,k)=>{
      const d = el("div","variante"); d.append(txt("div","etiquette","Variante "+(k+1)+" sur "+V.length));
      pr.append(d); question(d, locale(v), false);
    });
  }).catch(panne);
  if(SUIVI && !APERCU){
    google.script.run.withSuccessHandler(Q=>{
      if(!Q){ panne(); return; }
      attente.remove();
      Q.corrige = (rep, essais, fin) => google.script.run
        .withSuccessHandler(fin).withFailureHandler(()=>fin({ panne:true })).verifier(COURS, bloc, rep, essais);
      question(pr, Q, true);
      if(Q.total>1) pr.append(txt("p","note","Ton voisin a peut-être une autre question que toi : c'est normal, chacun a la sienne."));
    }).withFailureHandler(surPlace).preuve(COURS, bloc);   // un serveur sans preuve() : comme avant
    return;
  }
  surPlace();
}

/* Une question : la poser, corriger, expliquer. Faux : on compte, et on recommence.
   avance = false en aperçu : trois variantes à l'écran, pas trois boutons « Bloc suivant ». */
function question(pr, Q, avance){
  pr.append(txt("p","question",Q.q));
  const retour = el("div","retour"); retour.hidden = true;
  const zone = el("div"); pr.append(zone, retour);
  let essais = 0;

  const reussi = () => {
    retour.className="retour juste"; retour.replaceChildren(txt("strong",null,"Oui, c'est ça."));
    if(Q.juste) retour.append(txt("p",null,Q.juste));
    retour.hidden=false;
    if(!avance) return;
    etat.atteint = Math.max(etat.atteint, ici+1); ecrit(etat); barre();
    if(enAide) basculeAide();
    const s = txt("button","btn plein", ici+1<BLOCS.length ? "Bloc suivant →" : "J'ai fini ✓"); s.type="button";
    s.addEventListener("click",()=>{ ici++; affiche(); });
    pr.append(s); s.focus();
  };
  const rate = (explication) => {
    essais++; etat.erreurs++; ecrit(etat);
    retour.className="retour faux"; retour.replaceChildren(txt("strong",null,"Pas encore."), txt("p",null,explication));
    if(essais>=2){ retour.append(txt("p",null,"Ouvre « Ça coince ? » juste en dessous.")); document.getElementById("coince").open = true; }
    if(essais>=3) retour.append(txt("p",null,"Toujours bloqué : demande à ton voisin, puis pose ton chevalet sur l'écran."));
    retour.hidden=false;
  };
  const panne = () => {
    retour.className="retour faux"; retour.replaceChildren(txt("strong",null,"La réponse n'est pas arrivée."), txt("p",null,"Vérifie la connexion, puis réessaie."));
    retour.hidden=false;
  };
  /* Le verdict : du serveur ou de la fiche. Q.juste sert au message de réussite d'une saisie. */
  const corrige = (rep, fin) => Q.corrige(rep, essais+1, r=>{
    if(r.panne){ panne(); fin(null); return; }
    if(r.juste){ Q.juste = r.texte; reussi(); } else rate(r.texte);
    fin(r.juste);
  });

  if(Q.type==="qcm"){
    const tour = () => {
      zone.replaceChildren();
      const liste = el("div","choix"); const boutons=[];
      melange(Q.c).forEach((c,pos)=>{
        const b = el("button"); b.type="button";
        b.append(txt("span","lettre",LETTRES[pos]), txt("span",null,c));
        b.addEventListener("click",()=>{
          boutons.forEach(x=>x.disabled=true);
          corrige(c, juste=>{
            if(juste===null){ boutons.forEach(x=>x.disabled=false); return; }
            if(juste){ b.classList.add("juste"); boutons.forEach(x=>{ if(x!==b) x.classList.add("estompe"); }); return; }
            b.classList.add("faux");
            const r = txt("button","btn vide","Réessayer"); r.type="button";
            r.addEventListener("click",()=>{ r.remove(); retour.hidden=true; tour(); });
            zone.append(r);
          });
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
      e.preventDefault(); const r = inp.value.trim(); if(!r || ok.disabled) return;
      ok.disabled = true;
      corrige(r, juste=>{ if(juste){ inp.disabled=true; } else { ok.disabled=false; inp.select(); } });
    });
    zone.append(f); if(avance) inp.focus();
  }
}

const CITATION = {
  texte:"Ce que l'on conçoit bien s'énonce clairement,\nEt les mots pour le dire arrivent aisément.",
  auteur:"Nicolas Boileau", source:"L'Art poétique (1674)",
  lien:"Avant d'écrire, je sais ce que je veux dire : mon message s'écrit plus vite."
};

/* La phrase de la fin : une citation réelle, avec son auteur, et une ligne qui la relie au cours.
   Une surprise, pas une récompense : elle s'affiche pour tous, quel que soit le nombre d'erreurs. */
function citation(c){
  const f = el("figure","citation");
  f.append(txt("blockquote",null,"« "+c.texte+" »"), txt("figcaption",null,"— "+c.auteur+", "+c.source));
  if(c.lien) f.append(txt("p",null,c.lien));
  return f;
}

function fin(z){
  z.append(txt("h2",null,"🎉 J'ai fini la leçon 1"),
    txt("p",null,"Mon message est parti. Mon professeur va le coter sur 5. Je coche le dernier bloc sur ma feuille de route."),
    citation(CITATION));
  const plus = el("div","encart");
  plus.append(txt("h3",null,"⚡ J'ai fini avant les autres"),
    txt("p",null,"J'écris un second message à mon voisin (je tape son nom dans À et je le choisis dans la liste). Objet : Question - prénom. Je lui pose une question sur le cours, avec les quatre parties d'un message bien écrit."));
  const lien = el("p",null,'Puis je révise : <a href="https://root75.github.io/campin-public/messagerie/" target="_blank" rel="noopener">Mon premier message — je révise</a>.');
  plus.append(lien);
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
  window.PAS_A_PAS = { cours: COURS, envoie };   // lu par sequence-eleve.js (chargé en différé : il ne bloque jamais la fiche)
} else {
  qui.textContent = "Garde deux onglets : celui-ci pour la fiche, un autre pour Courrier.";
  pied.textContent = "Ton avancement reste sur cet ordinateur. Aucune donnée n'est envoyée.";
  humeur();
  affiche();
}

/* Moteur commun des fiches pas à pas (Python 1-3, Labo 07, Messagerie 02…).
   Une fiche = des DONNÉES (COURS, BLOCS, FIN, et au choix PRESENTATION, PARCOURS, PREUVES, PARTAGE, SEQUENCE) ;
   le moteur fait l'affichage, les preuves, le suivi, la cloche, l'humeur et l'avis.
   Mode d'emploi pour un nouveau cours : pas-a-pas/MOTEUR.md (modèle : pas-a-pas/modele/). */
/* ===== Moteur ===== */
const LETTRES = "ABCDEFGH";
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
const CLE = "pas-a-pas:"+COURS+(typeof VERSION_PARCOURS!=="undefined" ? ":"+VERSION_PARCOURS : "");
const lit = () => { if(SUIVI || APERCU) return {}; try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch(e){ return {}; } };
const ecrit = o => { if(SUIVI || APERCU) return; try { localStorage.setItem(CLE, JSON.stringify(o)); } catch(e){} };

let etat = Object.assign({ atteint:0, erreurs:0 }, lit());   // atteint = premier bloc non validé
let ici = Math.min(etat.atteint, BLOCS.length);
let enAide = false;
/* Opt-in de la fiche : const PRESENTATION = "missions" (cloche, bulle, bravo). Les fiches Python n'en ont pas. */
const MISSIONS = typeof PRESENTATION!=="undefined" && PRESENTATION==="missions";

/* Mode déclaratif — opt-in de la fiche : const MODE = "declaratif" (le Rat de ville). Pas de question de preuve :
   une étape est terminée quand toutes ses cases (B.gestes) sont cochées. Les cases sont enregistrées par le
   serveur (une ligne « case » par geste), donc gardées d'une période à l'autre et d'un poste à l'autre ; la
   navigation est libre, sauf au-delà du cadenas « Blocs ouverts ». Avec const GRILLE = { intro, niveaux:{A:"dépasse",…},
   criteres:[{ n, inc, regarde, A, B, C, D }], legende }, l'écran de fin porte la grille d'auto-évaluation « Moi ».
   const REPRISE = { titre, html, demos } : l'encadré affiché en haut quand l'élève rouvre le cours après une pause.
   État : etat.cases = { "étape.rang": true } (étape et rang à partir de 1), etat.moi = { critère: lettre }. */
const DECLARATIF = typeof MODE!=="undefined" && MODE==="declaratif";
if(DECLARATIF){ etat.cases = etat.cases || {}; etat.moi = etat.moi || {}; ici = Math.min(BLOCS.length-1, Number(etat.ici)||0); }
const nbCases = i => (BLOCS[i].gestes||[]).length;
const cochees = i => { let n = 0; for(let j=1;j<=nbCases(i);j++) if(etat.cases[(i+1)+"."+j]) n++; return n; };
/* Bloc terminé : toutes ses cases en mode déclaratif, sinon sa preuve réussie. */
const complet = i => DECLARATIF ? i<BLOCS.length && cochees(i)===nbCases(i) : i<etat.atteint;
const premierManque = () => { const k = BLOCS.findIndex((_,i)=>!complet(i)); return k<0 ? BLOCS.length : k; };
let repriseVue = false, placeNotee = -1;
/* Une déclaration (case, lettre « Moi ») part au serveur dans l'ordre, une à la fois, et se réessaie seule : la
   fiche ne dit « Enregistré » qu'après une réponse positive. Deux changements de la même case en attente n'en font qu'un. */
const fileDecl = []; let envoiDecl = false;
const ditDecl = t => { const n = document.getElementById("pied"); if(n) n.textContent = t; };
function declare(evt){
  if(!SUIVI || APERCU) return;
  const cle = e => e.type+"|"+e.etape+"|"+String(e.reponse).split(":")[0];
  const k = fileDecl.findIndex((e,i)=>cle(e)===cle(evt) && !(i===0 && envoiDecl));
  if(k>=0) fileDecl[k] = evt; else fileDecl.push(evt);
  videDecl(0);
}
function videDecl(essai){
  if(envoiDecl || !fileDecl.length) return;
  envoiDecl = true; ditDecl("Enregistrement…");
  google.script.run.withSuccessHandler(()=>{
    fileDecl.shift(); envoiDecl = false;
    if(fileDecl.length) videDecl(0); else ditDecl("✓ Enregistré avec ton compte scolaire. Tes cases sont gardées d’une période à l’autre.");
  }).withFailureHandler(()=>{
    envoiDecl = false;
    if(essai<3){ ditDecl("Enregistrement : nouvel essai dans un instant…"); setTimeout(()=>videDecl(essai+1), [2000,5000,10000][essai]); return; }
    fileDecl.push(fileDecl.shift());   // une déclaration refusée ne bloque pas les suivantes
    ditDecl("⚠ "+fileDecl.length+(fileDecl.length>1 ? " choix ne sont pas encore enregistrés" : " choix n’est pas encore enregistré")+". Garde cette page ouverte : nouvel essai à ta prochaine case.");
  }).noter(COURS, fileDecl[0]);
}
/* Une étape terminée se fête : quarante confettis, sauf si l'élève a demandé moins d'animations. */
function confettis(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if(!document.getElementById("style-confettis")){
    const st = el("style"); st.id = "style-confettis";
    st.textContent = ".confetti{position:fixed;top:-20px;width:10px;height:14px;z-index:29;pointer-events:none;animation:confetti-tombe 1.6s linear forwards}@keyframes confetti-tombe{to{transform:translateY(105vh) rotate(540deg)}}";
    document.head.append(st);
  }
  const couleurs = ["#ffcf3f","#2fa36b","#e3a922","#7cc3de","#f2a7b5","#e8742a"];
  for(let k=0;k<40;k++){
    const c = el("span","confetti"); c.style.left = Math.random()*100+"vw"; c.style.background = couleurs[k%couleurs.length];
    c.style.animationDelay = (Math.random()*.5)+"s"; c.style.animationDuration = (1.2+Math.random())+"s";
    document.body.append(c); setTimeout(()=>c.remove(), 2800);
  }
}
const BRAVOS = ["Bravo !","Bien joué !","Une case de plus !","Continue comme ça !","Ça avance !"];
let recoche = false;   // vrai pendant que la fiche recoche elle-même les cases gardées
function declareCase(cb){
  if(recoche || ici>=BLOCS.length) return;
  const j = casesIci().indexOf(cb)+1; if(!j) return;
  const cle = (ici+1)+"."+j, avant = complet(ici);
  if(cb.checked) etat.cases[cle] = true; else delete etat.cases[cle];
  ecrit(etat); barre();
  declare({ etape:ici+1, type:"case", reponse:j+":"+(cb.checked ? 1 : 0) });
  if(!cb.checked) return;
  if(!avant && complet(ici)){ bravo("⭐ Étape "+(ici+1)+" réussie : « "+BLOCS[ici].titre+" » !", true); confettis(); }
  else bravo(BRAVOS[Math.floor(Math.random()*BRAVOS.length)], false);
}

/* Le bloc tel que CET élève le voit : sa version, et les nombres de « Les vies ». */
const apercuV = {};
/* Ce que les premières fiches devaient fournir elles-mêmes : repris ici quand la fiche ne le fait pas.
   hache = FNV-1a brassé, comme hache_() dans Code.gs ; tirage = la version d'une question pour CET élève. */
let emailMoteur = "", classeMoteur = "";
const hacheMoteur = typeof hache!=="undefined" ? hache : s => {
  let h = 2166136261;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
};
const tirageMoteur = typeof tirage!=="undefined" ? tirage : (cle, n) => n<2 || !emailMoteur ? 1 : 1 + hacheMoteur(emailMoteur.toLowerCase()+"|"+cle) % n;
const avecLV = () => typeof VIES_V!=="undefined" && typeof LV!=="undefined";
const remplace = o => typeof o==="string" ? (avecLV() && LV ? o.replace(/\{([DKR])\}/g, (_,x)=>LV[x.toLowerCase()]) : o)
  : Array.isArray(o) ? o.map(remplace)
  : o && typeof o==="object" ? Object.fromEntries(Object.entries(o).map(([k,x])=>[k, remplace(x)])) : o;
function blocVu(i){
  const B = BLOCS[i];
  if(B.q && B.q.serveur) return blocServeur(i, B);
  const n = 1 + (B.variantes||[]).length;
  const v = APERCU ? (apercuV[i] || 1) : tirageMoteur(B.cle || COURS+"|"+(i+1), n);
  if(avecLV()) LV = B.cle==="vies" ? VIES_V[v-1] : VIES_V[tirageMoteur("vies", 3)-1];
  return remplace(Object.assign({}, B, v>1 ? B.variantes[v-2] : {}, { _v:v, _n:n }));
}

/* ===== Preuves corrigées par le serveur (const PREUVES = adresse du preuves.json) =====
   Un bloc dont la question porte « serveur:true » prend sa question dans preuves.json (une liste
   par bloc, la variante 1 d'abord ; QCM : la bonne réponse en premier). Avec le suivi, le serveur
   tire la variante de l'élève (preuve()) et corrige (verifier()) : la réponse du voisin ne vaut rien.
   Sans suivi : la variante 1, corrigée ici. La question du bloc peut ajouter rendu (choix → HTML)
   et, pour une rédaction, ses propres champs et son contrôle. */
let preuvesData = null, preuvesRatees = "";
const varianteServeur = {};
function blocServeur(i, B){
  const liste = (preuvesData && preuvesData.blocs[i]) || [];
  const n = Math.max(1, liste.length);
  const v = APERCU ? Math.min(apercuV[i] || 1, n) : (varianteServeur[i] || 1);
  /* « mixte » : l'activité (B.q.activite) est contrôlée dans la page ; seule la question de validation vient de preuves.json. */
  if(B.q.type==="mixte") return Object.assign({}, B, { _v:v, _n:n,
    q:Object.assign({}, B.q, { validation:Object.assign({}, liste[v-1] || {}, B.q.validation, { serveur:true }) }) });
  const q = Object.assign({}, liste[v-1] || {}, B.q, { serveur:true });
  if(B.q.type) q.type = B.q.type;          // une rédaction reste une rédaction
  return Object.assign({}, B, { q, _v:v, _n:n });
}
function chargePreuves(){
  if(typeof PREUVES==="undefined") return Promise.resolve();
  return fetch(PREUVES).then(r=>{ if(!r.ok) throw new Error(); return r.json(); }).then(d=>{ preuvesData = d; })
    .catch(()=>{ preuvesRatees = "⚠ Les questions n’ont pas pu se charger : recharge la page (F5). Ton travail validé est gardé."; qui.textContent = preuvesRatees; });
}
/* La variante de chaque élève, demandée une fois au démarrage. */
function variantesServeur(){
  if(!SUIVI || APERCU || !preuvesData) return Promise.resolve();
  return Promise.all(BLOCS.map((B,i)=>{
    const l = preuvesData.blocs[i];
    if(!B.q || !B.q.serveur || !l || l.length<2) return null;
    return new Promise(ok=>google.script.run.withSuccessHandler(a=>{
      const k = a && l[a.v-1] && l[a.v-1].q===a.q ? a.v : l.findIndex(x=>a && x.q===a.q)+1;
      if(k>0) varianteServeur[i] = k; ok();
    }).withFailureHandler(()=>ok()).preuve(COURS, i+1));
  }));
}
function correctionServeur(Q, reponse, essais){
  return new Promise((ok, ko)=>google.script.run.withSuccessHandler(r=>ok(r||{})).withFailureHandler(()=>ko(new Error("Le suivi ne répond pas. Ta réponse reste ici : réessaie dans un instant."))).verifier(COURS, ici+1, reponse, essais));
}
/* Mêmes règles que regle_() dans Code.gs : egal, exact, contient, motif, sauf. */
function regle(r, rep){
  const n = norm(rep); if(!n) return false;
  return (!r.sauf || !new RegExp(r.sauf).test(n)) && (!r.egal || r.egal.some(x=>norm(x)===n))
    && (!r.exact || r.exact.includes(String(rep).trim().toLowerCase()))
    && (!r.contient || r.contient.some(x=>n.includes(norm(x)))) && (!r.motif || new RegExp(r.motif).test(n));
}

function groupeCourant(i=ici){
  return typeof PARCOURS!=="undefined" ? PARCOURS.find(g=>i>=g.debut && i<g.fin) : null;
}
function suite(){
  if(DECLARATIF) return ici+1<BLOCS.length ? "Étape suivante →" : (FIN.bouton || FIN.titre+" →");
  if(typeof PARCOURS==="undefined") return ici+1<BLOCS.length ? "Bloc suivant →" : "J'ai fini ✓";
  if(ici+1>=BLOCS.length) return "J’ai terminé l’enquête ✓";
  const avant=groupeCourant(), apres=groupeCourant(ici+1);
  // Un groupe peut donner son propre libellé (bouton:"…") ; sinon le dernier groupe est le défi final.
  return avant===apres ? "Continuer →" : apres.bouton || (apres===PARCOURS[PARCOURS.length-1] ? "Défi final →" : "Mission suivante →");
}
function bulle(){
  const b = document.getElementById("bulle"), g = groupeCourant();
  if(b) b.textContent = ici>=BLOCS.length ? (FIN.bulle || FIN.titre) : (g && g.bulle) || (BLOCS[ici] && BLOCS[ici].bulle) || b.textContent;
}
let minuterieBravo;
function bravo(t, grand){
  const b = document.getElementById("bravo"); if(!b) return;
  b.textContent = t; b.classList.toggle("grand", !!grand); b.classList.add("vu");
  clearTimeout(minuterieBravo); minuterieBravo = setTimeout(()=>b.classList.remove("vu"), grand ? 3200 : 1800);
  const m = document.getElementById("mascotte"); if(m){ m.classList.remove("saute"); void m.offsetWidth; m.classList.add("saute"); }
}
/* Le menu des étapes, repris du Rat de ville : une pastille ronde par bloc (par groupe avec PARCOURS), qui se
   remplit comme un camembert selon les cases cochées, ✓ sur fond vert une fois validée. Le nom est dans
   l'infobulle (survol) ; celui de l'étape affichée reste écrit sous les pastilles. Cliquable jusqu'au premier
   bloc non validé : on revient relire, puis on repart en avant.
   PARCOURS : g.rond = ce qui s'écrit dans la pastille du groupe (sinon son numéro). */
let partIci = 0;   // part des cases cochées dans le bloc affiché, de 0 à 1
function barre(){
  const b = document.getElementById("progres"); b.replaceChildren();
  const groupes = typeof PARCOURS!=="undefined";
  styleBarre();
  b.classList.add("nav"); b.removeAttribute("aria-hidden"); b.setAttribute("role","navigation"); b.setAttribute("aria-label", groupes ? "Mes missions" : "Mes blocs");
  let nomIci = "";
  const rond = (signe, nom, debut, fin, cible) => {
    let fait = etat.atteint>=fin;
    if(DECLARATIF){ fait = true; for(let i=debut;i<fin;i++) fait = fait && complet(i); }
    const ferme = !!plafond && !APERCU && !fait && debut>=plafond.bloc && (DECLARATIF || debut>=etat.atteint);   // pas encore ouvert par le professeur
    let p = 0; for(let i=debut;i<fin;i++) p += DECLARATIF ? cochees(i)/Math.max(1,nbCases(i)) : i<etat.atteint ? 1 : i===ici ? partIci : partCases(i);
    const n = txt("button", fait ? "fait" : ferme ? "ferme" : "", fait ? "✓" : signe);
    n.type = "button"; n.title = nom+(ferme ? " — pas encore ouvert" : "");
    n.style.setProperty("--p", Math.round(100*p/(fin-debut)));
    n.setAttribute("aria-label", n.title+(fait ? (DECLARATIF ? " — terminé" : " — validé") : ""));
    if(ici>=debut && ici<fin){ n.setAttribute("aria-current","step"); nomIci = nom; }
    n.disabled = !APERCU && !DECLARATIF && debut>etat.atteint;   // le premier bloc fermé reste cliquable : il dit pourquoi ; déclaratif : navigation libre
    n.addEventListener("click",()=>{ if(ici===cible) return; ici = cible; affiche(); scrollTo(0,0); });
    b.append(n);
  };
  if(groupes) PARCOURS.forEach((g,k)=>rond(g.rond || String(k+1), g.titre, g.debut, g.fin,
    !APERCU && etat.atteint>g.debut && etat.atteint<g.fin ? etat.atteint : g.debut));   // groupe en cours : là où j'en suis
  else BLOCS.forEach((B,i)=>rond(String(i+1), (i+1)+". "+B.titre, i, i+1, i));
  if(DECLARATIF && typeof GRILLE!=="undefined"){   // la grille « Moi » : une pastille de plus, après les étapes
    const g = txt("button", plafond && !APERCU && plafond.bloc<BLOCS.length ? "ferme" : "", "📋"); g.type = "button"; g.title = FIN.titre; g.setAttribute("aria-label", FIN.titre);
    if(ici>=BLOCS.length){ g.setAttribute("aria-current","step"); nomIci = FIN.titre; }
    g.addEventListener("click",()=>{ if(ici>=BLOCS.length) return; ici = BLOCS.length; affiche(); scrollTo(0,0); });
    b.append(g);
  }
  if(nomIci) b.append(txt("p","nom-etape",nomIci));
  /* Les étapes de la mission affichée, par leur nom : un clic mène droit à « Relever la mémoire » sans passer par
     « Étape précédente ». Seulement quand la mission a plusieurs étapes. Nom court : B.court, sinon le titre
     jusqu'au premier « : » ou à la première virgule. */
  const g = groupes && ici<BLOCS.length ? groupeCourant() : null;
  if(g && g.fin-g.debut>1){
    const ligne = el("div","sous-etapes"); ligne.setAttribute("role","group"); ligne.setAttribute("aria-label","Les étapes de "+(g.court || g.titre));
    for(let i=g.debut;i<g.fin;i++){
      const fait = DECLARATIF ? complet(i) : etat.atteint>i, nom = BLOCS[i].court || BLOCS[i].titre.split(/ : |, /)[0];
      const n = txt("button", fait ? "fait" : "", (fait ? "✓ " : (i-g.debut+1)+". ")+nom); n.type = "button"; n.title = BLOCS[i].titre;
      if(i===ici) n.setAttribute("aria-current","step");
      n.disabled = !APERCU && !DECLARATIF && i>etat.atteint;
      n.addEventListener("click",()=>{ if(ici===i) return; ici = i; affiche(); scrollTo(0,0); });
      ligne.append(n);
    }
    b.append(ligne);
  }
}
function styleBarre(){
  if(document.getElementById("style-barre-blocs")) return;
  const st = el("style"); st.id = "style-barre-blocs";
  st.textContent = ".progres.nav{flex-wrap:wrap;gap:8px;align-items:center}"
    +".progres.nav button{font:inherit;font-weight:800;font-size:1.05rem;line-height:1;width:46px;height:46px;min-width:0;min-height:0;flex:none;padding:0;border-radius:50%;border:3px solid var(--encre-bouton);background:conic-gradient(var(--fromage) calc(var(--p,0)*1%),var(--carte) 0);color:var(--encre);position:relative;cursor:pointer;transition:transform .15s}"
    +".progres.nav button:hover:not(:disabled){transform:scale(1.12);box-shadow:0 2px 6px #0003}"
    +".progres.nav button[aria-current]{outline:3px solid var(--fromage);outline-offset:2px;transform:scale(1.1)}"
    +".progres.nav button.fait{background:var(--juste);border-color:var(--juste);color:var(--carte)}"
    +".progres.nav button:disabled{opacity:.5;cursor:default}"
    +".progres.nav button.ferme{border-style:dashed}"
    +".progres.nav button.ferme::after{content:'🔒';position:absolute;right:-8px;top:-10px;font-size:.85rem}"
    +".progres.nav button:focus-visible{outline:3px solid var(--fromage,#b7791f);outline-offset:2px}"
    +".progres.nav .nom-etape{flex:1 1 100%;margin:2px 0 0;font-weight:700;color:var(--encre)}"
    +".progres.nav .sous-etapes{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:6px}"
    +".progres.nav .sous-etapes button{flex:0 1 auto;max-width:100%;line-height:1.25;width:auto;height:auto;min-height:40px;padding:6px 14px;border-radius:20px;border-width:2px;font-size:.95rem;font-weight:700;background:var(--carte);color:var(--encre);text-align:left}"
    +".progres.nav .sous-etapes button.fait{background:var(--carte);border-color:var(--juste);color:var(--encre)}"
    +".progres.nav .sous-etapes button[aria-current]{background:var(--encre-bouton);border-color:var(--encre-bouton);color:var(--carte);outline:none;transform:none}"
    +".progres.nav .sous-etapes button:hover:not(:disabled){transform:none}";
  document.head.append(st);
}
/* Les cases cochées de la consigne, gardées sur le poste et rangées sous l'adresse de l'élève, comme le
   programme validé : aucun appel au serveur (un appel par case ralentissait la classe, mesure du 10/11/2026).
   Le camembert survit au changement de bloc et au rechargement ; un autre élève sur le même poste ne voit pas
   ces cases. Sur un autre poste, les blocs validés reviennent du serveur, pas les cases du bloc en cours.
   Format : { "i": { n: nombre de cases, c: [rangs cochés] } }, i = rang du bloc à partir de 0. */
const cleCases = () => CLE+":"+(emailMoteur||"")+":cases";
let casesGardees = null, casesDe = null;
function lisCases(){
  if(casesDe!==cleCases()){ casesDe = cleCases(); casesGardees = {};
    if(!APERCU) try{ casesGardees = JSON.parse(localStorage.getItem(casesDe)) || {}; }catch(e){} }
  return casesGardees;
}
const partCases = i => { const g = lisCases()[i]; return g && g.n ? Math.min(1, g.c.length/g.n) : 0; };
const casesIci = () => [...document.querySelectorAll(DECLARATIF ? "#bloc .faire > ol.etapes > li > label input[type=checkbox]" : "#bloc ol.etapes input[type=checkbox]")];
/* Une case cochée ou décochée dans la consigne : le camembert du bloc affiché suit, et la case est gardée. */
document.getElementById("bloc").addEventListener("change", e=>{
  if(!e.target.matches || !e.target.matches("ol.etapes input[type=checkbox]")) return;
  if(DECLARATIF){ declareCase(e.target); return; }
  const c = casesIci(), g = lisCases();
  partIci = c.filter(x=>x.checked).length/c.length;
  if(ici<BLOCS.length) g[ici] = { n:c.length, c:c.map((x,k)=>x.checked ? k : -1).filter(k=>k>=0) };
  if(!APERCU) try{ localStorage.setItem(casesDe, JSON.stringify(g)); }catch(e){}
  barre();
});
/* Rappels (Vincent, 12/11/2026) : une information demandée plus tôt revient d'elle-même, au lieu d'un « retiens ».
   - Une réponse « enquete » enregistrée est gardée sur le poste, sous l'adresse de l'élève, comme les cases :
     { "5": { H:"…", F:"…" } }, 5 = numéro du bloc (à partir de 1), H, F = les clés des champs.
   - Dans le texte d'un bloc (ou de la page) : <span data-rappel="5:F">le fichier choisi</span> affiche le champ F
     du bloc 5 ; <span data-rappel="nom">…</span> affiche RAPPELS.nom() de la fiche (calculé de l'adresse, par exemple).
     Sans valeur (autre poste, aperçu, fiche hors suivi), le texte d'origine reste : il doit se lire tel quel.
   - B.rappel = [{ de:"2:H", titre:"Ton hypothèse de départ" }] : un encadré 🔁 sous le but du bloc. */
const cleReponses = () => CLE+":"+(emailMoteur||"")+":reponses";
const reponsesGardees = () => { if(APERCU) return {}; try{ return JSON.parse(localStorage.getItem(cleReponses())) || {}; }catch(e){ return {}; } };
function gardeReponse(bloc, valeurs){
  if(APERCU) return;
  const r = reponsesGardees(); r[bloc] = valeurs;
  try{ localStorage.setItem(cleReponses(), JSON.stringify(r)); }catch(e){}
}
function rappelDe(ref){
  const [b, c] = String(ref).split(":");
  if(c===undefined){
    const f = typeof RAPPELS!=="undefined" && RAPPELS[b];
    try{ return f ? String(f(lisPartage(), { classe:classeMoteur, email:emailMoteur }) || "") : String(lisPartage()[b] || "").trim(); }catch(e){ return ""; }
  }
  const r = reponsesGardees()[b];
  return r && r[c] ? String(r[c]) : "";
}
function remplitRappels(racine){
  racine.querySelectorAll("[data-rappel]").forEach(s=>{
    if(!("origine" in s.dataset)) s.dataset.origine = s.textContent;
    const v = rappelDe(s.dataset.rappel);
    s.textContent = v || s.dataset.origine; s.classList.toggle("rappele", !!v);
  });
}
function encadreRappel(B){
  if(!B.rappel || !B.rappel.length) return null;
  const a = el("aside","repere rappel"); a.append(txt("h3",null,"🔁 Ce que tu as écrit plus tôt"));
  B.rappel.forEach(r=>{
    const v = rappelDe(r.de), p = el("p");
    p.append(txt("b",null,r.titre+" : "), v ? txt("q",null,v) : txt("span","note",r.sinon || "écrite sur un autre poste. Relis-la dans ta mémoire, ou demande au professeur : il la voit au tableau."));
    a.append(p);
  });
  return a;
}
/* État partagé entre les blocs (Messagerie 01, 16/11/2026) : ce que l'élève écrit dans un bloc sert aux suivants
   (un mail construit champ par champ, relu en entier, puis une réponse qui reprend son objet). Gardé sur le poste,
   sous l'adresse de l'élève, comme les cases : { cle: texte }. Y écrivent les rédactions « commun:true ».
   La fiche peut déclarer  const PARTAGE = { depart, apercu } :
   - depart(email) → les valeurs de départ quand rien n'est encore gardé (un brouillon d'avant, par exemple) ;
   - apercu(valeurs, i, { classe }) → le HTML de l'aperçu en direct (#apercu-direct dans la page), redessiné à chaque
     frappe et à chaque bloc ; i = rang du bloc affiché, à partir de 0 ; "" = aperçu caché.
   Les rappels lisent aussi cet état : <span data-rappel="objet">…</span>, et RAPPELS.x(valeurs, { classe, email }). */
const clePartage = () => CLE+":"+(emailMoteur||"")+":partage";
let partage = null, partageDe = null;
function lisPartage(){
  if(partageDe===clePartage() && partage) return partage;
  partageDe = clePartage(); partage = null;
  if(!APERCU) try{ partage = JSON.parse(localStorage.getItem(partageDe)); }catch(e){}
  if(!partage || typeof partage!=="object"){
    partage = {};
    if(!APERCU && typeof PARTAGE!=="undefined" && PARTAGE.depart) try{ partage = PARTAGE.depart(emailMoteur) || {}; }catch(e){ partage = {}; }
  }
  return partage;
}
function gardePartage(k, v){
  lisPartage()[k] = v;
  if(!APERCU) try{ localStorage.setItem(partageDe, JSON.stringify(partage)); }catch(e){}
  apercuDirect();
}
function apercuDirect(){
  const n = document.getElementById("apercu-direct");
  if(!n || typeof PARTAGE==="undefined" || !PARTAGE.apercu) return;
  const h = PARTAGE.apercu(lisPartage(), ici, { classe:classeMoteur }) || "";
  n.hidden = !h; n.innerHTML = h;
}
/* Une rédaction (ou l'activité d'une question « mixte ») dont la zone est déjà commencée : elle se rouvre seule (q.ouvre). */
const commencee = Q => !!Q && (Q.type==="mixte" ? commencee(Q.activite) : !!(Q.commun && Q.zone && String(lisPartage()[Q.zone.cle || "texte"] || "").trim()));

/* À l'affichage d'un bloc : on recoche ses cases gardées. L'événement « change » rejoue ce qu'une coche fait
   (animation de la case suivante, camembert). */
function recocheCases(){
  if(DECLARATIF){   // les cases viennent du serveur (ou du poste, hors suivi) : rien n'est renvoyé
    recoche = true;
    casesIci().forEach((x,k)=>{ if(etat.cases[(ici+1)+"."+(k+1)] && !x.checked){ x.checked = true; x.dispatchEvent(new Event("change",{bubbles:true})); } });
    recoche = false; return;
  }
  const g = lisCases()[ici], c = casesIci();
  if(!g || !c.length || g.n!==c.length) return;   // la consigne a changé : on ne recoche rien
  g.c.forEach(k=>{ const x = c[k]; if(x && !x.checked){ x.checked = true; x.dispatchEvent(new Event("change",{bubbles:true})); } });
}

/* Les blocs ouverts : le professeur (ou le moment « atelier » de la séquence) ouvre la classe
   jusqu'à un bloc ; les suivants portent un cadenas dans la barre. Il arrive avec etat() au démarrage, puis avec moment() toutes les 5 s
   (sequence-eleve.js appelle PAS_A_PAS.plafond). Les blocs déjà validés restent lisibles. */
let plafond = null;
const enPause = () => !!plafond && !APERCU && plafond.bloc<BLOCS.length && ici>=plafond.bloc && (DECLARATIF ? !complet(ici) : ici>=etat.atteint);
function recoitPlafond(p){
  p = p && Number(p.bloc)>0 ? { bloc:Number(p.bloc), message:String(p.message||"") } : null;
  if(JSON.stringify(p)===JSON.stringify(plafond)) return;
  const avant = enPause(); plafond = p;
  if(avant || enPause()) affiche(); else barre();
}
function pause(z){
  z.append(txt("div","numero","🔒 Blocs 1 à "+plafond.bloc+" ouverts"), txt("h2",null,"Le bloc "+(plafond.bloc+1)+" n’est pas encore ouvert"),
    txt("p","stop",plafond.message || "On attend la correction ensemble."),
    txt("p",null,"En attendant, reviens sur tes blocs : clique sur une pastille ✓, juste au-dessus. Pour chacun, sais-tu expliquer l’erreur à ton voisin, sans lire l’explication ?"),
    txt("p","note","Le professeur ouvre la suite : le cadenas 🔒 disparaîtra tout seul, sans recharger la page."));
  const nav = el("div","actions"), avant = txt("button","btn vide","← Bloc précédent"); avant.type = "button";
  avant.addEventListener("click",()=>{ ici = Math.min(ici, BLOCS.length, plafond.bloc)-1; affiche(); });
  nav.append(avant);
  /* Les prolongements vivent hors du fil des blocs (<details id="plus-loin"> de la page) : l'attente y mène. */
  const loin = document.getElementById("plus-loin");
  if(loin){ loin.hidden = false; const b = txt("button","btn vide","⚡ En attendant : un prolongement"); b.type = "button";
    b.addEventListener("click",()=>{ loin.open = true; loin.scrollIntoView({ behavior:"smooth", block:"start" }); }); nav.append(b); }
  z.append(nav);
  document.body.dataset.pret = "1";
}

/* B.gestes = une liste de consignes (HTML permis) : une case à cocher par geste, à l'impératif.
   Un geste peut porter son « ne fais pas » : {geste:'…', attention:'⚠️ …'}, un encadré sous la case, jamais dans son texte.
   {geste:'…', sous:'<img …>'} : du HTML sous la case (un extrait à recopier, une aide repliée).
   {geste:'…', trous:{ titre, intro, bravo, variantes:[{ texte, mots, pieges }] }} : un texte à trous d'entraînement sous
   la case, corrigé dans la page, jamais enregistré, qui ne bloque rien ; une variante tirée au hasard à chaque affichage. */
const gestesHtml = l => !l ? "" : '<ol class="etapes">'+l.map(g=>{const [t,a,s]=typeof g==="string"?[g,"",""]:[g.geste,g.attention,g.sous];
  return '<li><label><input type="checkbox"><span>'+t+'</span></label>'+(a?'<p class="attention">'+a+'</p>':'')+(s?'<div class="sous-case">'+s+'</div>':'')+'</li>';}).join("")+'</ol>';
function entrainements(z, B){
  const lis = z.querySelectorAll(".faire > ol.etapes > li");
  (B.gestes||[]).forEach((g,k)=>{
    const T = g && g.trous; if(!T || !lis[k]) return;
    const V = T.variantes[Math.floor(Math.random()*T.variantes.length)];
    const boite = el("div","trous-bloc"), zone = el("div"), dit = txt("p","note",""); dit.setAttribute("role","status");
    if(T.titre) boite.append(txt("h3",null,T.titre));
    if(T.intro) boite.append(txt("p",null,T.intro));
    boite.append(zone, dit); lis[k].append(boite);
    trous(zone, V, ()=>{ dit.textContent = T.bravo || "Juste !"; boite.classList.add("reussi"); }, m=>{ dit.textContent = m; });
  });
}
/* const REPRISE (voir le mode déclaratif) : les gestes pour retrouver son travail, puis un bouton vers la première étape pas finie. */
function boiteReprise(){
  const k = Math.min(premierManque(), BLOCS.length-1), box = el("aside","repere reprendre");
  box.append(txt("h3",null,REPRISE.titre), el("div",null,REPRISE.html));
  const b = txt("button","btn plein","C’est fait : je reprends à l’étape "+(k+1)+" — "+BLOCS[k].titre); b.type = "button";
  b.addEventListener("click",()=>{ repriseVue = false; ici = k; affiche(); scrollTo(0,0); });
  box.append(b); return box;
}
/* E = { q:"question", choix:[["libellé","retour"],…], apres:"<p>l'analyse</p>", suite:"libellé du bouton de preuve" } */
function essaiHtml(E, fini){
  if(!document.getElementById("style-essai")){
    const st = el("style"); st.id = "style-essai";
    st.textContent = ".essai{display:grid;gap:10px}.essai .q-essai{font-weight:700;margin:0}.essai .choix-essai{display:flex;flex-wrap:wrap;gap:8px}.essai .retour-essai{display:grid;gap:6px;border-left:4px solid var(--accent,#1f5c73);padding:8px 12px;background:var(--fond-doux,rgba(31,92,115,.07));border-radius:8px}.essai .retour-essai p{margin:0}";
    document.head.append(st);
  }
  const d = el("div","faire essai"), ch = el("div","choix-essai"), r = el("div","retour-essai"); r.hidden = true;
  d.append(el("p","q-essai",E.q));
  E.choix.forEach(c=>{ const b = txt("button","btn vide",c[0]); b.type = "button";
    b.addEventListener("click",()=>{ ch.querySelectorAll("button").forEach(x=>{ x.className = "btn vide"; }); b.className = "btn plein";
      r.replaceChildren(el("p",null,"<b>"+c[1]+"</b>"), el("div",null,E.apres||"")); r.hidden = false; fini(); });
    ch.append(b); });
  d.append(ch, r); return d;
}
function affiche(){
  if(DECLARATIF && ici!==placeNotee){   // la place de l'élève : gardée, et visible au tableau (« ouvert »)
    if(placeNotee>=0) envoie({ etape:Math.min(ici,BLOCS.length-1)+1, type:"ouvert" });
    placeNotee = ici; etat.ici = ici; ecrit(etat);
  }
  partIci = 0; barre(); if(MISSIONS) bulle(); apercuDirect();
  queueMicrotask(recocheCases);   // une fois le bloc construit, ses animations comprises
  const z = document.getElementById("bloc"); z.replaceChildren();
  const liste = document.getElementById("coince-liste"); liste.replaceChildren();
  document.getElementById("coince").open = false;
  if(typeof DemoLecteur!=="undefined" && DemoLecteur.arrete) DemoLecteur.arrete();
  /* Les prolongements (#plus-loin) ne s'affichent que lorsqu'on attend (cadenas) ou qu'on a fini (Vincent, 12/11/2026). */
  const loin = document.getElementById("plus-loin"); if(loin){ loin.hidden = true; loin.open = false; }
  if(enPause()){ pause(z); return; }
  if(ici >= BLOCS.length){ fin(z); return; }
  const B = blocVu(ici);
  let essaiFait = !(MISSIONS && B.essai), apresEssai = null;

  const num = el("div","numero");
  const groupe=groupeCourant();
  if(groupe){
    num.append(txt("span",null,groupe.titre));
    if(groupe.fin-groupe.debut>1)num.append(txt("span",null,"Étape "+(ici-groupe.debut+1)+" sur "+(groupe.fin-groupe.debut)));
  }
  else num.append(txt("span",null,"Bloc "+(ici+1)+" sur "+BLOCS.length+" · Partie "+B.partie.split(" — ")[0]), txt("span",null,"⏱ "+B.min+" min"));
  z.append(num, txt("h2",null,groupe ? B.titre : (ici+1)+". "+B.titre));
  const avecReprise = repriseVue && typeof REPRISE!=="undefined";
  if(avecReprise) z.append(boiteReprise());
  if(APERCU && B._n>1){
    const sel = el("div","actions"); sel.append(txt("span","note","Version de la preuve :"));
    for(let k=1;k<=B._n;k++){ const b = txt("button","btn "+(k===B._v ? "plein" : "vide"),String(k)); b.type="button";
      b.addEventListener("click",()=>{ apercuV[ici]=k; affiche(); }); sel.append(b); }
    z.append(sel);
  }

  if(MISSIONS){
    /* Présentation « missions » (Labo 07) : le but en une phrase, les cases, puis ce qu'on vérifie.
       Pas d'étiquettes répétées à chaque bloc. */
    if(B.veux) z.append(el("p","but",B.veux));
    const rappel = encadreRappel(B); if(rappel) z.append(rappel);
    /* B.avant = ce qu'il faut avoir sous les yeux AVANT de cocher (un exemple analysé, un tableau à lire) : les
       cases ne demandent jamais de lire ce qui n'est pas encore à l'écran, comme la question de preuve. */
    if(B.avant) z.append(el("div","avant",B.avant));
    /* Démo animée « Regarde comment faire ». Deux façons, au choix de la fiche :
       - un bloc porte `demos` (Labo 07) : une animation sous chaque case qu'elle montre (voir demosSousCases) ;
       - sinon, une démo par étape avant les cases : Demo.pour (Python, pas-a-pas/demos-python.js).
       Le lecteur lui-même est commun à tous les cours : pas-a-pas/demo-lecteur.js. */
    const demo = !B.demos && typeof Demo!=="undefined" && Demo.pour ? Demo.pour(ici) : null;
    if(demo) z.append(demo);
    /* B.essai = une question d'essai sur ce qui est montré dans `avant`, À LA PLACE des cases : l'élève se prononce
       (« Je ne sais pas » compris), puis lit l'analyse. Rien n'est noté ni envoyé : la preuve vient après. */
    if(B.essai) z.append(essaiHtml(B.essai, ()=>{ essaiFait = true; if(apresEssai) apresEssai(); }));
    else { z.append(el("div","faire",B.fais || gestesHtml(B.gestes))); entrainements(z, B); }
    const v = el("aside","repere verification"); v.append(txt("h3",null,"✅ À vérifier"), el("p",null,B.vois)); z.append(v);
  } else {
    const dl = el("dl","lignes");
    [["🎯 Je veux","veux",B.veux],["👉 Je fais","fais",B.fais],["👀 Je vois","vois",B.vois]].forEach(([t,c,h])=>{
      const d = el("div","ligne "+c); d.append(txt("dt",null,t), el("dd",null,h)); dl.append(d);
    });
    z.append(dl);
  }
  if(B.extra) z.append(el("div",null,B.extra));
  if(B.stop) z.append(txt("p","stop",MISSIONS ? "🛑 STOP — ne continue pas avant d’avoir vérifié." : "🛑 STOP — je ne continue pas tant que je ne vois pas ça."));

  B.coince.forEach((c,i)=>{
    if(!B.indices){ liste.append(c && c.html ? el("li",null,c.html) : txt("li",null,c)); return; }   // {html:'…'} : une aide avec du gras ou des touches
    const li=el("li"), d=el("details");
    d.append(txt("summary",null,"Indice "+(i+1)+(i===0 ? " — une piste" : " — un geste précis")),txt("p",null,c));
    li.append(d); liste.append(li);
  });

  const pr = el("div","preuve");
  const fait = DECLARATIF || (!APERCU && etat.atteint > ici);   // en aperçu, chaque version reste à essayer
  /* q.ouvre = le libellé d'un bouton à cliquer pour faire apparaître la question (« ↶ Répondre à Camille ») ;
     une rédaction déjà commencée se rouvre seule. */
  const direct = () => {
    if(!B.q.ouvre || commencee(B.q)){ preuve(pr,B); return; }
    const go = txt("button","btn plein ouvre-preuve",B.q.ouvre); go.type = "button";
    go.addEventListener("click",()=>{ go.remove(); preuve(pr,B); }); pr.append(go);
  };
  const declare_ = ["enquete","rapport"].includes(B.q && B.q.type==="mixte" && B.q.validation ? B.q.validation.type : B.q && B.q.type);   // étape déclarée, pas corrigée
  if(DECLARATIF){
    /* Pas de preuve : les cases sont la déclaration, et on avance librement. */
  } else if(!fait && ["enquete","rapport","mixte"].includes(B.q.type)){
    direct();
  } else if(fait && B.q.type==="code"){
    relecture(pr, B);
  } else if(fait){
    pr.append(txt("p","retour juste",declare_ ? "✅ Étape déjà enregistrée. Les preuves du rapport restent à examiner par le professeur." : "✅ Bloc déjà validé."));
  } else if(B.cases){
    pr.append(txt("div","etiquette","✅ Les cinq points (mon message est noté sur 5)"));
    const ul = el("ul","cases");
    B.cases.forEach(c=>{ const li=el("li"); const lab=el("label"); const cb=el("input"); cb.type="checkbox";
      lab.append(cb, txt("span",null,c)); li.append(lab); ul.append(li); });
    const go = txt("button","btn plein","Les cinq points sont bons, j'ai cliqué sur Envoyer"); go.type="button"; go.disabled=true;
    ul.addEventListener("change",()=>{ go.disabled = [...ul.querySelectorAll("input")].some(x=>!x.checked); });
    go.addEventListener("click",()=>{ ul.remove(); go.remove(); preuve(pr,B); });
    pr.append(ul, go);
  } else if(["code","ordre","trace","ligne","redaction"].includes(B.q.type)){
    direct();
  } else {
    const go = txt("button","btn plein ouvre-preuve",B.essai && B.essai.suite ? B.essai.suite : MISSIONS ? "✅ C’est vérifié" : "👀 Je vois ça"); go.type="button";
    if(!essaiFait){ go.disabled = true; apresEssai = ()=>{ go.disabled = false; }; }
    go.addEventListener("click",()=>{ go.remove(); preuve(pr,B); });
    pr.append(go);
  }
  /* q.colle (12/11/2026) : la question et sa zone de réponse juste sous les cases, sans « À vérifier » ni encadrés
     entre les deux : « à ton avis… » et « mon hypothèse » se lisent d'un seul tenant. Le reste du bloc suit. */
  if(B.q && B.q.colle && MISSIONS && !B.essai){
    const faire = z.querySelector(".faire");
    if(faire) faire.after(pr);
  }
  remplitRappels(document.body);   // le bloc, et la page autour (fenêtre « Mon rapport »)
  document.body.dataset.pret = "1";
  if(!fait && SUIVI && !APERCU && B._n>1) pr.append(txt("p","note","Ton voisin a peut-être une autre version que toi : c'est normal, chacun a la sienne."));
  if(!DECLARATIF && !pr.parentNode) z.append(pr);   // déjà placé sous les cases (q.colle)

  const nav = el("div","actions");
  const avant = txt("button","btn vide",groupe || DECLARATIF ? "← Étape précédente" : "← Bloc précédent"); avant.type="button"; avant.disabled = ici===0;
  avant.addEventListener("click",()=>{ ici--; affiche(); });
  nav.append(avant, el("span","espace"));
  if(fait || (APERCU && ici+1<BLOCS.length)){ const s=txt("button","btn plein",suite()); s.type="button"; s.addEventListener("click",()=>{ici++;affiche();if(DECLARATIF)scrollTo(0,0);}); nav.append(s); }
  demosSousCases(z, Object.assign({}, B.demos, avecReprise ? REPRISE.demos : null));
  // Avec l'encadré « Je reprends », aucune animation de case ne s'ouvre seule : pas deux animations à la fois.
  if(avecReprise) z.querySelectorAll(".faire details.demo-case[open]").forEach(d=>{ d.open = false; });
  z.append(nav);
  basEtape(z);
  if(DECLARATIF) nav.after(txt("p","note","Tu peux continuer même si une case reste vide. Coche quand tu as terminé ; le professeur examine ton document."));
}

/* Encadrés de bas d'étape, facultatifs : la fiche les décrit dans BAS_ETAPE (Labo 07 : « À la sonnerie » et
   « Je reprends mon cours », comme dans Le rat de ville). Fermer et rouvrir ne sont pas des étapes : chacun le
   fait à la sonnerie, où qu'il en soit. Pas de case à cocher, rien d'enregistré.
   BAS_ETAPE = [{ classe, titre, gestes:[{ texte (HTML), note, demo (clé de Demo.cree) }] }]. */
function basEtape(z){
  if(typeof BAS_ETAPE==="undefined") return;
  BAS_ETAPE.forEach(E=>{
    const a = el("aside","repere "+E.classe), ol = el("ol");
    E.gestes.forEach(g=>{
      const li = el("li",null,g.texte);
      if(g.note) li.append(txt("p","note",g.note));
      if(g.demo && typeof Demo!=="undefined" && Demo.cree){
        const d = el("details","demo-case"); let box = null;
        d.append(txt("summary",null,"👀 Regarde comment faire"));
        d.addEventListener("toggle",()=>{
          if(d.open){ if(!box){ box = Demo.cree(g.demo,false); if(box) d.append(box); } if(box) setTimeout(()=>box.joue(),80); }
          else if(box) box.stop();
        });
        li.append(d);
      }
      ol.append(li);
    });
    a.append(txt("h3",null,E.titre), ol); z.append(a);
  });
}

/* Un programme validé reste lisible quand on revient sur le bloc : le code de départ, le programme
   de l'élève, les lignes changées surlignées et l'explication (Q.juste) — pour pouvoir expliquer
   l'erreur, à son voisin ou au professeur. Le programme est gardé sur le poste, par élève. */
const programmesValides = {};
const cleProgramme = i => CLE+":"+(emailMoteur||"")+":"+(i+1)+":valide";
function gardeProgramme(i, code){
  programmesValides[i] = code;
  if(APERCU) return; try{ localStorage.setItem(cleProgramme(i), code); }catch(e){}
}
function programmeValide(i){
  if(programmesValides[i]!=null) return programmesValides[i];
  try{ return localStorage.getItem(cleProgramme(i)); }catch(e){ return null; }
}
/* Les essais ratés d'un bloc « code » : le programme, ce que Python a affiché, l'explication de la fiche.
   Les 12 derniers, gardés comme le programme validé. */
const essaisRates = {};
const cleEssais = i => CLE+":"+(emailMoteur||"")+":"+(i+1)+":essais";
function essaisDe(i){
  if(essaisRates[i]) return essaisRates[i];
  let l = []; try{ l = JSON.parse(localStorage.getItem(cleEssais(i))) || []; }catch(e){}
  return essaisRates[i] = Array.isArray(l) ? l : [];
}
function gardeEssai(i, essai){
  const l = essaisDe(i); l.push(essai); if(l.length>12) l.splice(0, l.length-12);
  if(APERCU) return; try{ localStorage.setItem(cleEssais(i), JSON.stringify(l)); }catch(e){}
}
function oublieProgrammes(){
  BLOCS.forEach((_,i)=>{ delete essaisRates[i]; delete programmesValides[i];
    try{ localStorage.removeItem(cleEssais(i)); localStorage.removeItem(cleProgramme(i)); }catch(e){} });
}
function relecture(pr, B){
  const Q = B.q, mien = programmeValide(ici), depart = Q.depart || "";
  const net = t => t.replace(/\s+$/,"").split("\n");
  const cadre = (titre, code, autre, couleur) => {
    const hors = new Set(autre==null ? [] : net(autre).map(l=>l.trim()));
    const pre = el("pre","console relu");
    net(code).forEach(l=>{
      const s = txt("span",null,l || " "); s.style.display = "block";
      if(autre!=null && l.trim() && !hors.has(l.trim())){
        s.className = "change"; s.style.background = "var(--"+couleur+"-pale)";
        s.style.boxShadow = "-4px 0 0 var(--"+couleur+")"; s.style.fontWeight = "700";
      }
      pre.append(s);
    });
    pr.append(txt("div","etiquette",titre), pre);
  };
  const rates = () => essaisDe(ici).forEach((e,k)=>{
    cadre("Essai raté "+(k+1), e.code, depart || null, "faux");
    if(e.ecran){ pr.append(txt("pre","console",e.ecran)); }
    const r = el("div","retour faux"); r.append(txt("strong",null,"Pourquoi ça ne passait pas"));
    [].concat(e.pourquoi||[]).forEach(x=>r.append(txt("p",null,x))); pr.append(r);
  });
  pr.append(txt("p","retour juste","✅ Bloc déjà validé."));
  if(mien==null){
    if(depart) cadre("Le code de départ", depart, null);
    rates();
    pr.append(txt("p","note","Ton programme validé n’est pas gardé sur ce poste."));
  } else if(depart && net(depart).join("\n")!==net(mien).join("\n")){
    cadre("Le code de départ — en gras, ce qui a changé", depart, mien, "faux");
    rates();
    cadre("Mon programme validé — en gras, ce que j’ai écrit", mien, depart, "juste");
  } else { rates(); cadre("Mon programme validé", mien, null); }
  if(Q.juste){ const r = el("div","retour juste"); r.append(txt("strong",null,"L’explication"), txt("p",null,Q.juste)); pr.append(r); }
}

/* « Regarde comment faire » sous chaque case : le volet est commun à tous les moteurs (DemoLecteur.sousCases,
   pas-a-pas/demo-lecteur.js). La fiche décrit seulement les données, dans le bloc :
     demos: { "3": ["gestionnaire", [4]], "incident 2.4": ["fenetres", [3]] } */
function demosSousCases(z, demos){
  if(!Object.keys(demos).length || typeof Demo==="undefined" || !Demo.cree || typeof DemoLecteur==="undefined" || !DemoLecteur.sousCases) return;
  DemoLecteur.sousCases(z, demos, Demo.cree);
}

/* Texte à trous — « Explique avec tes mots », en deux temps (Vincent, 10/11/2026).
   1. Q.texte porte un trou par « ___ » ; Q.mots = le bon mot de chaque trou, dans l'ordre ;
      Q.pieges = les intrus de la banque. Corrigé ici : c'est la preuve du bloc. Trois versions du
      même bloc par `variantes`, comme les autres questions.
   2. Q.phrase (facultatif) = la question à laquelle l'élève répond par une phrase libre. Elle est
      enregistrée SANS verdict (événement « phrase » du Journal) : le professeur la lit au tableau,
      panneau « Leurs phrases », pour la correction ensemble. Le bloc s'ouvre après la phrase. */
function styleTrous(){
  if(document.getElementById("style-trous")) return;
  const st = el("style"); st.id = "style-trous";
  st.textContent = ".trous{line-height:2.5;margin:0}"
    +".trous .trou{font:inherit;font-weight:700;min-width:5.5rem;min-height:2.2rem;margin:0 3px;padding:2px 10px;border-radius:8px;border:2px dashed var(--doux);background:var(--papier);color:var(--encre);cursor:pointer;vertical-align:baseline}"
    +".trous .trou.plein{border-style:solid;border-color:var(--encre-bouton);background:var(--carte)}"
    +".trous .trou.ici{outline:3px solid var(--fromage,#b7791f);outline-offset:2px}"
    +".trous .trou.faux{border-style:solid;border-color:var(--faux);background:var(--faux-pale)}"
    +".trous .trou.juste{border-style:solid;border-color:var(--juste);background:var(--juste-pale);cursor:default}"
    +".banque{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border:1px dashed var(--trait);border-radius:10px}"
    +".banque button{font:inherit;font-weight:700;min-height:2.4rem;padding:4px 14px;border-radius:1.2rem;border:2px solid var(--encre-bouton);background:var(--carte);color:var(--encre-bouton);cursor:pointer}"
    +".banque button:disabled{opacity:.35;cursor:default;border-style:dashed}"
    +".banque button:focus-visible,.trous .trou:focus-visible{outline:3px solid var(--fromage,#b7791f);outline-offset:2px}"
    +".phrase-libre textarea{width:100%;box-sizing:border-box;font:inherit;padding:10px;border:2px solid var(--trait);border-radius:8px}";
  document.head.append(st);
}
function trous(zone, Q, reussi, rate){
  styleTrous();
  const morceaux = Q.texte.split("___"), n = Q.mots.length;
  const banque = melange(Q.mots.concat(Q.pieges || []));
  const places = Q.mots.map(()=>null);   // pour chaque trou : le numéro du mot de la banque posé dedans
  let vise = 0, fige = false, rouges = [];
  const p = el("p","trous"), boite = el("div","banque");
  boite.setAttribute("role","group"); boite.setAttribute("aria-label","Banque de mots");
  const boutonsTrous = [], boutonsMots = [];
  morceaux.forEach((m,i)=>{
    p.append(m);
    if(i>=n) return;
    const b = el("button","trou"); b.type = "button";
    b.addEventListener("click",()=>{ if(fige) return; places[i] = null; vise = i; rouges = rouges.filter(x=>x!==i); dessine(); });
    boutonsTrous.push(b); p.append(b);
  });
  banque.forEach((mot,k)=>{
    const b = txt("button",null,mot); b.type = "button";
    b.addEventListener("click",()=>{
      if(fige) return;
      places[vise] = k; rouges = rouges.filter(x=>x!==vise);
      const libre = places.indexOf(null); if(libre>=0) vise = libre;
      dessine();
    });
    boutonsMots.push(b); boite.append(b);
  });
  const ok = txt("button","btn plein","Vérifier ma phrase"); ok.type = "button";
  const actions = el("div","actions"); actions.append(ok);
  const consigne = txt("p","note","Clique sur un mot : il va dans le trou entouré. Clique sur un trou pour le vider.");
  function dessine(){
    boutonsTrous.forEach((b,i)=>{
      const plein = places[i]!=null;
      b.textContent = plein ? banque[places[i]] : "…";
      b.className = "trou" + (plein ? " plein" : "") + (fige ? " juste" : rouges.includes(i) ? " faux" : "") + (!fige && i===vise ? " ici" : "");
      b.setAttribute("aria-label","Trou "+(i+1)+" : "+(plein ? banque[places[i]] : "vide"));
      b.disabled = fige;
    });
    boutonsMots.forEach((b,k)=>{ b.disabled = fige || places.includes(k); });
    ok.disabled = fige || places.includes(null);
  }
  dessine();
  zone.append(p, boite, consigne, actions);
  let tentatives = 0;
  ok.addEventListener("click",async ()=>{
    if(ok.disabled) return;
    const choisis = places.map(k=>banque[k]), reponse = choisis.join(" | ");
    rouges = choisis.map((m,i)=>norm(m)===norm(Q.mots[i]) ? -1 : i).filter(i=>i>=0);
    /* Question « serveur » (preuves.json), fiche suivie : c'est Code.gs qui tranche et écrit juste / faux au Journal. */
    const serveur = Q.serveur && SUIVI && !APERCU;
    if(serveur){
      ok.disabled = true;
      try { const r = await correctionServeur(Q, reponse, ++tentatives); rouges = r.juste ? [] : (Array.isArray(r.rouges) && r.rouges.length ? r.rouges : (rouges.length ? rouges : [0])); }
      catch(e){ ok.disabled = false; consigne.textContent = e.message; return; }
      ok.disabled = false;
    }
    if(rouges.length){
      dessine();
      rate(Q.faux || (rouges.length===1 ? "Un mot n’est pas à sa place : le trou rouge." : rouges.length+" mots ne sont pas à leur place : les trous rouges.")
        +" Clique sur un trou rouge pour le vider, puis choisis un autre mot. Relis la phrase entière à voix basse.", reponse, serveur);
      return;
    }
    fige = true; dessine(); consigne.remove(); actions.remove();
    if(!Q.phrase){ reussi(reponse); return; }
    // Deuxième temps : la phrase libre. Ni juste ni faux ici ; on vérifie seulement qu'il y a une phrase.
    const f = el("form","bilan phrase-libre"), lab = el("label"), ta = el("textarea");
    ta.rows = 3; ta.maxLength = 200; ta.required = true; ta.setAttribute("autocapitalize","sentences");
    lab.append(txt("span",null,"✅ Les mots sont à leur place. Maintenant, avec tes mots : "+Q.phrase), ta);
    const statut = txt("p","note","La fiche ne dit ni juste ni faux à ta phrase. Ton professeur la lit, et la classe corrige ensemble.");
    const go = txt("button","btn plein","Enregistrer ma phrase"); go.type = "submit";
    f.append(lab, statut, go); zone.append(f); ta.focus();
    f.addEventListener("submit",e=>{
      e.preventDefault(); if(go.disabled) return;
      const t = ta.value.trim().replace(/\s+/g," ");
      if(t.split(" ").length<4){ statut.textContent = "Écris une phrase complète : au moins quatre mots."; return; }
      go.disabled = true; ta.readOnly = true; go.remove();
      statut.textContent = SUIVI && !APERCU ? "Phrase enregistrée. Ton professeur la lira avec la classe." : "Phrase gardée pour cet essai (rien n’est envoyé).";
      envoie({ etape:ici+1, type:"phrase", reponse:t });
      reussi(reponse);
    });
  });
}

/* La question de preuve. Faux : on explique, on compte, et on recommence. */
function preuve(pr, B, apres){
  const Q = B.q;
  const v = r => (B._n>1 ? "v"+B._v+":" : "") + (r==null ? "" : r);   // le Journal note la version
  if(Q.type!=="mixte") pr.append(txt("div","etiquette", Q.etiquette ? Q.etiquette : ["code","ordre"].includes(Q.type) ? "Mon programme" : Q.type==="trous" ? "J’explique" : Q.type==="rapport" ? "Mon rapport individuel" : typeof PARCOURS!=="undefined" ? "Je vérifie mon raisonnement" : "Je prouve que j’ai fait le bloc"));
  if(Q.q) pr.append(txt("p","question",Q.q));
  if(Q.serveur && Q.aide) pr.append(txt("p","note",Q.aide));
  const retour = el("div","retour"); retour.hidden = true;
  const zone = el("div"); pr.append(zone, retour);
  let essais = 0, derniereErreur = null, termine = false;

  const reussi = (reponse) => {
    if(termine)return;termine=true;
    retour.className="retour juste"; retour.replaceChildren(txt("strong",null,Q.type==="rapport" ? "Étape déclarée faite." : Q.type==="enquete" ? (SUIVI && !APERCU ? "Réponse enregistrée." : "Réponse saisie pour cet essai.") : "Oui, c'est ça."));
    if(Q.juste) retour.append(txt("p",null,Q.juste));
    retour.hidden=false;
    if(apres){
      envoie({etape:ici+1,type:"ouvert",reponse:"activité:"+v(reponse)});
      apres();return; // L’exercice prépare la mission ; sa réussite ne valide pas le rapport.
    }
    if(Q.type==="code" && !apres) gardeProgramme(ici, String(reponse));
    if(!["enquete","rapport"].includes(Q.type) && !Q.serveur) envoie({ etape:ici+1, type:"juste", essais:essais, reponse:v(reponse) });   // serveur : verifier() l'a écrit
    const g0 = groupeCourant(), avant = etat.atteint;
    etat.atteint = Math.max(etat.atteint, ici+1); ecrit(etat); barre();
    if(MISSIONS && etat.atteint>avant){
      if(g0 && etat.atteint===g0.fin) bravo("⭐ "+g0.titre+" : terminé !", true);
      else bravo(["Bien joué !","C’est enregistré, continue !","Une étape de plus !"][ici%3], false);
    }
    if(etat.atteint>avant && typeof CONFETTIS!=="undefined" && CONFETTIS) confettis();   // au choix de la fiche : const CONFETTIS = true
    if(enAide) basculeAide();
    const s = txt("button","btn plein",typeof PARCOURS!=="undefined" ? suite() : (ici+1<BLOCS.length ? "Bloc suivant →" : "J'ai fini ✓")); s.type="button";
    s.addEventListener("click",()=>{ ici++; affiche(); });
    pr.append(s); s.focus();
  };
  /* contenu (facultatif) = tout ce que l'élève a écrit, quand la réponse notée n'en est qu'une partie : une
     tentative n'est « identique » que si rien n'a changé. */
  const rate = (explication, reponse, dejaNote, contenu) => {
    if(termine)return;
    const empreinte=String(contenu ?? reponse ?? "");
    if(empreinte===derniereErreur){retour.hidden=false;if(!retour.querySelector(".sans-doublon"))retour.append(txt("p","sans-doublon","Modifie ta réponse avant de vérifier à nouveau. Cette tentative identique ne compte pas une erreur de plus."));return;}
    derniereErreur=empreinte;
    essais++; etat.erreurs++; ecrit(etat);
    if(Q.type==="code" && !apres){ const c = zone.querySelector("pre.console"); gardeEssai(ici, { code:String(reponse ?? ""), ecran:c && !c.hidden ? c.innerText.trim() : "", pourquoi:explication }); }
    if(!dejaNote) envoie({ etape:ici+1, type:"faux", essais:essais, reponse:v(reponse) });
    const expl = Array.isArray(explication) ? el("ul") : txt("p",null,explication);
    if(Array.isArray(explication)) explication.forEach(x=>expl.append(txt("li",null,x)));
    retour.className="retour faux"; retour.replaceChildren(txt("strong",null,"Pas encore."), expl);
    if(essais>=2){ retour.append(txt("p",null,"Ouvre « Ça coince ? » juste en dessous.")); document.getElementById("coince").open = true; }
    if(essais>=3) retour.append(txt("p",null,"Toujours bloqué : demande à ton voisin, puis clique sur « J'attends de l'aide »."));
    retour.hidden=false;
  };

  if(Q.type==="mixte"){
    preuve(zone,Object.assign({},B,{q:Q.activite}),()=>{
      const validation=el("div");pr.append(validation);
      preuve(validation,Object.assign({},B,{q:Q.validation}));
    });
    return;
  }
  if(Q.type==="ordre-gestes"){
    let cartes=melange(Q.cartes);
    if(cartes.join("|")===Q.cartes.join("|")) cartes=cartes.slice(1).concat(cartes[0]);
    const liste=el("ol","ordre"), verifier=txt("button","btn plein","Vérifier mon ordre");verifier.type="button";
    const dessine=()=>{
      liste.replaceChildren();
      cartes.forEach((t,i)=>{
        const li=el("li"),texte=txt("span",null,t);
        const haut=txt("button","fleche","▲"),bas=txt("button","fleche","▼");haut.type=bas.type="button";
        haut.setAttribute("aria-label","Monter l’étape "+(i+1));bas.setAttribute("aria-label","Descendre l’étape "+(i+1));
        haut.disabled=i===0;bas.disabled=i===cartes.length-1;
        const bouge=j=>{[cartes[i],cartes[j]]=[cartes[j],cartes[i]];dessine();liste.children[j].querySelector("button:not(:disabled)").focus();};
        haut.addEventListener("click",()=>bouge(i-1));bas.addEventListener("click",()=>bouge(i+1));
        li.append(texte,haut,bas);liste.append(li);
      });
    };
    dessine();zone.append(liste,verifier);
    verifier.addEventListener("click",()=>{
      const reponse=cartes.join(" | ");
      if(cartes.every((x,i)=>x===Q.cartes[i])){verifier.disabled=true;liste.querySelectorAll("button").forEach(b=>b.disabled=true);reussi(reponse);}
      else rate(Q.faux || "Quel élément faut-il formuler AVANT de tester ? La conclusion vient après l’indice observé.",reponse);
    });
    return;
  }
  if(Q.type==="rapport"){
    // Déclaration d’avancement uniquement : aucun document ni fichier n’est lu par le site.
    // Q.liste (facultatif) = ce que l'élève vérifie dans son document, une case par point ; sinon la seule Q.confirmation.
    // Un essai d'enregistrer avec des cases vides les nomme TOUTES d'un coup (12/11/2026) : jamais un manque à la fois.
    const f=el("form","bilan"), items=Q.liste && Q.liste.length ? Q.liste : [Q.confirmation];
    const cbs=items.map(t=>{ const label=el("label"), cb=el("input"); cb.type="checkbox"; label.append(cb,txt("span",null,t)); f.append(label); return cb; });
    const note=txt("p","note","Le site enregistre seulement cette déclaration. Il ne lit pas ton document et ne vérifie ni la pièce jointe ni la remise Classroom.");
    const manque=el("div","retour faux manques"); manque.hidden=true;
    const ok=txt("button","btn plein","Enregistrer cette étape");ok.type="submit";
    f.append(manque,note,ok);zone.append(f);
    f.addEventListener("change",()=>{ if(!manque.hidden && cbs.every(c=>c.checked)) manque.hidden=true; });
    f.addEventListener("submit",e=>{
      e.preventDefault();
      const vides=cbs.map((c,k)=>c.checked ? null : items[k]).filter(x=>x!==null);
      cbs.forEach(c=>c.closest("label").classList.toggle("manque",!c.checked));
      if(vides.length){
        const ul=el("ul"); vides.forEach(t=>ul.append(txt("li",null,t)));
        manque.replaceChildren(txt("strong",null,vides.length===1 ? (items.length===1 ? "Coche la case quand c’est fait." : "Il reste un point à vérifier :") : "Il reste "+vides.length+" points à vérifier :"), ...(items.length>1 ? [ul] : []));
        manque.hidden=false; return;
      }
      ok.disabled=true;
      const fini=()=>{note.textContent="";cbs.forEach(c=>c.disabled=true);reussi(Q.trace);};
      if(!SUIVI || APERCU){fini();return;}
      note.textContent="Enregistrement en cours…";
      google.script.run.withSuccessHandler(fini).withFailureHandler(()=>{
        ok.disabled=false;note.textContent="Étape non enregistrée. Ton rapport reste dans Docs. Réessaie, puis clique sur « J'attends de l'aide » si nécessaire.";
      }).noter(COURS,{etape:ici+1,type:"juste",reponse:Q.trace});
    });
    return;
  }
  if(Q.type==="enquete"){
    // Réutilise noter() et le Journal (200 caractères). « juste » = étape faite, jamais une cote.
    // Chaque champ dit, pendant la frappe, s'il est rempli ; un envoi incomplet nomme TOUS les manques d'un coup
    // (12/11/2026, après l'étape 8 de Messagerie 01 : un manque à la fois fait buter de correction en correction).
    const MIN=3, propre=t=>t.value.trim().replace(/\s+/g," ");
    const f=el("form","bilan"), etats=[], champs=Q.champs.map(c=>{
      const label=el("label"), ta=el("textarea"), signe=txt("small","etat-champ",""); ta.rows=2; ta.maxLength=c.max; ta.placeholder=c.exemple || "";
      const suit=()=>{ const n=propre(ta).length; signe.textContent=(n>=MIN ? "✓ écrit" : "✗ encore vide")+" · "+n+" / "+c.max+" caractères"; signe.classList.toggle("ok",n>=MIN); if(n>=MIN) label.classList.remove("manque"); };
      ta.addEventListener("input",suit); suit();
      label.append(txt("span",null,c.nom),ta,signe);
      f.append(label); etats.push(label); return ta;
    });
    const ok=txt("button","btn plein",SUIVI && !APERCU ? "Enregistrer ma réponse" : "Garder pour cet essai"); ok.type="submit";
    const manque=el("div","retour faux manques"); manque.hidden=true;
    const statut=txt("p","note","La fiche vérifie seulement que les champs sont remplis. Le professeur examine ton raisonnement.");
    f.append(manque,statut,ok); zone.append(f);
    f.addEventListener("input",()=>{ if(!manque.hidden && champs.every(t=>propre(t).length>=MIN)) manque.hidden=true; });
    f.addEventListener("submit",e=>{
      e.preventDefault();
      const r=champs.map((t,i)=>Q.champs[i].cle+":"+propre(t)).join(" | ");
      const manques=champs.map((t,i)=>propre(t).length<MIN ? "« "+Q.champs[i].nom+" » : encore vide." : null).filter(Boolean);
      if(r.length>200) manques.push("Trop long : "+r.length+" caractères au total, 200 au plus. Raccourcis "+(champs.length>1 ? "un des champs." : "ta réponse."));
      etats.forEach((l,i)=>l.classList.toggle("manque",propre(champs[i]).length<MIN));
      if(manques.length){
        const ul=el("ul"); manques.forEach(t=>ul.append(txt("li",null,t)));
        manque.replaceChildren(txt("strong",null,manques.length===1 ? "Il manque une chose :" : "Il manque "+manques.length+" choses :"), ul);
        manque.hidden=false; return;
      }
      ok.disabled=true;
      const fini=()=>{ statut.textContent=""; champs.forEach(t=>t.disabled=true);
        gardeReponse(ici+1, Object.fromEntries(Q.champs.map((c,i)=>[c.cle, propre(champs[i])])));   // rappelée plus loin (data-rappel)
        reussi(r); };
      if(!SUIVI || APERCU){fini();return;}
      statut.textContent="Enregistrement en cours…";
      google.script.run.withSuccessHandler(fini).withFailureHandler(()=>{
        ok.disabled=false;statut.textContent="Réponse non enregistrée. Garde cette page ouverte et réessaie, puis clique sur « J'attends de l'aide » si nécessaire.";
      }).noter(COURS,{etape:ici+1,type:"juste",reponse:r});
    });
    return;
  }
  /* Corrigé ici, ou par le serveur pour une question « serveur » quand la fiche est suivie. */
  const juge = (reponse, juste, explication) => Q.serveur && SUIVI && !APERCU
    ? correctionServeur(Q, reponse, essais+1).then(r=>({ juste:!!r.juste, texte:r.texte || explication, note:true }))
    : Promise.resolve({ juste, texte:explication, note:false });
  if(Q.type==="redaction"){
    zone.addEventListener("input",()=>{ if(!termine && retour.classList.contains("faux")) retour.hidden = true; });   // on corrige : le refus d'avant s'efface
    redaction(zone, Q, reussi, rate, juge); return;
  }
  if(typeof Q.guide==="function"){Q.guide(zone,Q,reussi,rate,()=>{retour.hidden=true;});return;}
  if(Q.type==="trous"){ trous(zone, Q, reussi, rate); return; }
  if(Q.type==="code"){ editeur(zone, Q, reussi, rate); return; }
  if(Q.type==="ordre"){ ordre(zone, Q, reussi, rate); return; }
  if(Q.type==="trace"){ trace(zone, Q, reussi, rate); return; }
  if(Q.type==="ligne"){ ligneFautive(zone, Q, reussi, rate); return; }
  if(Q.type==="qcm"){
    const tour = () => {
      zone.replaceChildren();
      const liste = el("div","choix"); const boutons=[];
      melange(Q.c.map((_,k)=>k)).forEach((k,pos)=>{
        const b = el("button"); b.type="button";
        b.append(txt("span","lettre",LETTRES[pos]), typeof Q.rendu==="function" ? el("span",null,Q.rendu(Q.c[k])) : txt("span",null,Q.c[k]));
        b.addEventListener("click",()=>{
          boutons.forEach(x=>x.disabled=true);
          juge(Q.c[k], k===0, Q.p && Q.p[k]).then(r=>{
            if(r.juste){ b.classList.add("juste"); boutons.forEach(x=>{ if(x!==b) x.classList.add("estompe"); }); reussi(Q.c[k]); return; }
            b.classList.add("faux"); rate(r.texte || "Ce n’est pas la bonne réponse. Relis la question.", Q.c[k], r.note);
            const re = txt("button","btn vide","Réessayer"); re.type="button";
            re.addEventListener("click",()=>{ re.remove(); retour.hidden=true; tour(); });
            zone.append(re);
          }).catch(e=>{ boutons.forEach(x=>x.disabled=false); retour.className="retour faux"; retour.replaceChildren(txt("p",null,e.message)); retour.hidden=false; });
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
      const bon = Q.regle ? regle(Q.regle, r) : Q.ok(r);
      ok.disabled = true;
      juge(r, bon, typeof Q.faux==="function" ? Q.faux(r) : Q.faux).then(x=>{
        if(x.juste){ inp.disabled=true; reussi(r); } else { ok.disabled=false; rate(x.texte, r, x.note); inp.select(); }
      }).catch(e=>{ ok.disabled=false; retour.className="retour faux"; retour.replaceChildren(txt("p",null,e.message)); retour.hidden=false; });
    });
    zone.append(f); inp.focus();
  }
}

/* Rédaction guidée (type "redaction") : l'élève prépare un texte ici, la fiche contrôle la forme
   (Q.controle(texte, valeurs, {classe}) → liste d'erreurs, vide si tout va bien), puis il le copie
   ailleurs (Outlook, Docs). Champs : Q.champs [{cle, nom, aide, max}], Q.zone {nom, aide, lignes, max},
   Q.modele (texte affiché), Q.copier (bouton « Copier »). Le brouillon reste sur le poste.
   Depuis le 16/11/2026 (Messagerie 01), au choix de la question :
   - commun:true : champs et zone (Q.zone.cle) lisent et écrivent l'état partagé entre les blocs (PARTAGE) ; le
     contrôle reçoit alors toutes les valeurs partagées, et l'aperçu en direct suit la frappe ;
   - zone:false : pas de grande zone, seulement des champs ; un champ {lignes:3} est une zone de plusieurs lignes ;
     un champ {siVide:true} n'est demandé que si sa valeur partagée manque (reprise sur un autre poste) ;
   - criteres(texte, valeurs, {classe}) → [{nom, err}] : la liste des critères, cochée pendant la frappe ; « Vérifier »
     donne toutes les erreurs d'un coup, jamais une à la fois ;
   - reponse(valeurs, texte, {classe, refus}) → ce qui part au serveur et au Journal (sinon le texte de la zone) ;
     refus = vrai quand la page vient de refuser : la fiche peut alors nommer les champs en cause pour le tableau ;
   - bouton : le libellé de « Vérifier ». */
function redaction(zone, Q, reussi, rate, juge){
  const cle = k => CLE+":"+(emailMoteur||"")+":"+(ici+1)+":"+k;
  const garde = (k, v) => { if(Q.commun){ gardePartage(k, v); return; } if(APERCU) return; try{ localStorage.setItem(cle(k), v); }catch(e){} };
  const relit = k => { if(Q.commun) return String(lisPartage()[k] || ""); try{ return localStorage.getItem(cle(k)) || ""; }catch(e){ return ""; } };
  if(Q.modele){ const m = el("div","modele"); m.append(txt("span","etiquette","Modèle"), txt("pre",null,Q.modele)); zone.append(m); }
  const f = el("form","redaction");
  let suit = () => {};
  const liste = (Q.champs||[]).filter(c=>!(c.siVide && relit(c.cle).trim()));
  const champs = liste.map(c=>{
    const lab = el("label"), inp = el(c.lignes ? "textarea" : "input"); if(c.lignes) inp.rows = c.lignes; else inp.type="text";
    inp.maxLength = c.max || 80; inp.value = relit(c.cle);
    inp.addEventListener("input",()=>{ garde(c.cle, inp.value); suit(); });
    lab.append(txt("span",null,c.nom)); if(c.aide) lab.append(txt("small","note",c.aide)); lab.append(inp); f.append(lab); return inp;
  });
  const Z = Q.zone===false ? null : (Q.zone || {}), ta = Z ? el("textarea") : null;
  if(Z){
    const lab = el("label"), kz = Z.cle || "texte";
    ta.rows = Z.lignes || 8; ta.maxLength = Z.max || 700; ta.value = relit(kz);
    ta.addEventListener("input",()=>{ garde(kz, ta.value); suit(); });
    lab.append(txt("span",null,Z.nom || "Mon texte")); if(Z.aide) lab.append(txt("small","note",Z.aide)); lab.append(ta); f.append(lab);
  }
  const texte = () => ta ? ta.value : "", ctx = () => ({ classe:classeMoteur });
  const valeurs = () => { const v = Q.commun ? Object.assign({}, lisPartage()) : {}; liste.forEach((c,i)=>{ v[c.cle] = champs[i].value.trim(); }); return v; };
  if(typeof Q.criteres==="function"){
    if(!document.getElementById("style-criteres")){
      const st = el("style"); st.id = "style-criteres";
      st.textContent = ".criteres{list-style:none;padding-left:0;margin:0;display:grid;gap:2px}.criteres li{color:var(--doux)}.criteres li.ok{color:var(--juste);font-weight:700}";
      document.head.append(st);
    }
    const ul = el("ul","criteres"); ul.setAttribute("aria-live","polite"); f.append(ul);
    suit = () => ul.replaceChildren(...Q.criteres(texte(), valeurs(), ctx()).map(c=>txt("li", c.err ? "" : "ok", (c.err ? "○ " : "✓ ")+c.nom)));
    suit();
  }
  const act = el("div","actions"), ok = txt("button","btn plein",Q.bouton || "Vérifier"); ok.type="submit"; act.append(ok);
  if(Q.copier && ta){
    const c = txt("button","btn vide","📋 Copier mon texte"), dit = txt("span","note",""); c.type="button";
    c.addEventListener("click",()=>{
      const fait = () => dit.textContent = "✓ Copié. Colle-le : Ctrl+V.";
      if(navigator.clipboard) navigator.clipboard.writeText(ta.value).then(fait, ()=>{ ta.select(); dit.textContent = "Texte sélectionné : Ctrl+C."; });
      else { ta.select(); dit.textContent = "Texte sélectionné : Ctrl+C."; }
    });
    act.append(c, dit);
  }
  f.append(act); zone.append(f);
  f.addEventListener("submit", e=>{
    e.preventDefault(); if(ok.disabled) return;
    const v = valeurs(), t = texte(), tout = JSON.stringify([v, t]);
    const erreurs = (typeof Q.criteres==="function" ? Q.criteres(t, v, ctx()).filter(c=>c.err).map(c=>c.err) : [])
      .concat(typeof Q.controle==="function" ? Q.controle(t, v, ctx()) : []);
    const r = String(typeof Q.reponse==="function" ? Q.reponse(v, t, Object.assign(ctx(), { refus:erreurs.length>0 })) : t).trim().slice(0,190);
    if(erreurs.length){ rate(erreurs, r, false, tout); return; }
    ok.disabled = true;
    const fige = () => { if(Q.commun) f.querySelectorAll("input,textarea").forEach(x=>{ x.readOnly = true; }); };
    juge(r, Q.regle ? regle(Q.regle, r) : true, Q.faux || "Relis le modèle.").then(x=>{
      if(x.juste){ fige(); reussi(r); } else { ok.disabled = false; rate(x.texte, r, x.note, tout); }
    }).catch(err=>{ ok.disabled = false; rate(err.message, r, true, tout); });
  });
}

/* La phrase de la fin : code commun à tous les cours, pas-a-pas/phrase-fin.js (PhraseFin.figure).
   Si une page ancienne ne charge pas ce fichier, l'écran de fin s'affiche sans la citation. */
function citation(c){ return typeof PhraseFin!=="undefined" ? PhraseFin.figure(c) : null; }

function fin(z){
  const loin = document.getElementById("plus-loin"); if(loin) loin.hidden = false;
  if(DECLARATIF) z.append(txt("div","numero","Étape finale · après les "+BLOCS.length+" étapes"));
  z.append(txt("h2",null,FIN.titre), txt("p",null,FIN.texte));
  if(typeof GRILLE!=="undefined") z.append(grilleMoi());
  if(FIN.revision){
    const revision=el("div","encart"),lien=txt("a","btn vide",FIN.revision.titre);
    lien.href=FIN.revision.url;lien.target="_blank";lien.rel="noopener";
    revision.append(txt("p",null,FIN.revision.texte),lien);z.append(revision);
  }
  // Déclaratif : la phrase de la fin attend que toutes les étapes soient terminées (on vient ici librement).
  const phrase = FIN.citation && (!DECLARATIF || premierManque()>=BLOCS.length) && citation(FIN.citation); if(phrase) z.append(phrase);
  const plus = el("div","encart");
  if(FIN.plus) plus.append(txt("h3",null,MISSIONS ? "⚡ Fini avant les autres ?" : "⚡ J'ai fini avant les autres"), txt("p",null,FIN.plus));
  if(FIN.lien) plus.append(el("p",null,(MISSIONS ? "Puis révise : " : "Puis je révise : ")+FIN.lien+"."));
  if(!plus.children.length) plus.hidden = true;
  const nav = el("div","actions");
  const avant = txt("button","btn vide",DECLARATIF ? "← Étape "+BLOCS.length : "← Revoir les blocs"); avant.type="button";
  avant.addEventListener("click",()=>{ ici=DECLARATIF ? BLOCS.length-1 : 0; affiche(); });
  nav.append(avant);
  if(!SUIVI){
    const zero = txt("button","btn vide","Recommencer à zéro"); zero.type="button";
    zero.addEventListener("click",()=>{ etat = { atteint:0, erreurs:0, cases:{}, moi:{} }; ecrit(etat); oublieProgrammes(); try{ localStorage.removeItem(cleCases()); }catch(e){} casesDe = null; ici=0; humeur(); affiche(); });
    nav.append(zero);
  }
  z.append(bilan(), plus, nav);
  if(!DECLARATIF && !etat.fini){ etat.fini = true; ecrit(etat); envoie({ etape:BLOCS.length, type:"fini" }); }
}
/* La grille d'auto-évaluation « Moi » (const GRILLE) : une lettre par critère, enregistrée comme une case. */
function grilleMoi(){
  if(!document.getElementById("style-grille-moi")){
    const st = el("style"); st.id = "style-grille-moi";
    st.textContent = ".grille-moi{display:grid;gap:12px}.grille-moi .defile{overflow:auto}.grille-moi table{border-collapse:collapse;width:100%}"
      +".grille-moi th,.grille-moi td{border:1px solid var(--trait);padding:10px;text-align:left;vertical-align:top}"
      +".grille-moi td{min-width:11rem}.grille-moi td.moi{min-width:0}.grille-moi th:first-child{min-width:14rem}.grille-moi th p{font-weight:400;margin:4px 0 0}.grille-moi select{font:inherit}";
    document.head.append(st);
  }
  const G = GRILLE, lettres = Object.keys(G.niveaux), d = el("div","grille-moi");
  if(G.intro) d.append(el("div",null,G.intro));
  const table = el("table"), tete = el("tr"), corps = el("tbody"), defile = el("div","defile");
  ["Critère et attendu","Moi"].concat(lettres.map(k=>k+(G.niveaux[k] ? " — "+G.niveaux[k] : ""))).forEach(t=>tete.append(txt("th",null,t)));
  G.criteres.forEach((c,i)=>{
    const tr = el("tr"), th = el("th"), td = el("td","moi"), sel = el("select");
    th.scope = "row"; th.append(txt("b",null,c.n+(c.inc ? " ★" : "")), txt("p",null,c.regarde));
    sel.dataset.critere = i+1; sel.setAttribute("aria-label","Moi — critère "+(i+1));
    [""].concat(lettres).forEach(v=>{ const o = txt("option",null,v || "À choisir"); o.value = v; sel.append(o); });
    sel.value = etat.moi[i+1] || "";
    sel.addEventListener("change",()=>{
      if(sel.value) etat.moi[i+1] = sel.value; else delete etat.moi[i+1];
      ecrit(etat); declare({ etape:0, type:"moi", reponse:(i+1)+":"+sel.value });
    });
    td.append(sel); tr.append(th, td, ...lettres.map(k=>txt("td",null,c[k]))); corps.append(tr);
  });
  const thead = el("thead"); thead.append(tete); table.append(thead, corps); defile.append(table); d.append(defile);
  if(G.legende) d.append(el("div",null,G.legende));
  return d;
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

/* « J'attends de l'aide » : l'équivalent de la case entourée, et le signal pour le professeur.
   Avant de sonner : avertissement et 3 sonneries par heure au plus (code commun pas-a-pas/cloche.js ;
   le serveur compte et refuse la 4e). Se débloquer ne demande rien et ne compte pas.
   Le bouton choisi dit le motif (consigne, ecran, accord) : il part dans la colonne Réponse de la ligne « aide ».
   « accord » n'est proposé que si la fiche le demande : const CLOCHE_ACCORD = true (accord avant la remise). */
function allumeAide(on, motif){
  enAide = on;
  document.getElementById("aide").classList.toggle("active", enAide);
  document.getElementById("aide-texte").textContent = enAide
    ? motif==="accord" ? "🔔 Le professeur sait que tu attends son accord. Je rends quand il me l’a donné."
    : (MISSIONS ? "🔔 Le professeur sait que tu attends" : "✋ Ton professeur sait que tu attends")+" "+(groupeCourant() ? "dans « "+groupeCourant().titre+" »" : "au bloc "+(ici+1))+". "+(MISSIONS ? "Continue ce qui reste possible et relis « Ça coince ? »." : "Je continue ailleurs, et en attendant je relis « Ça coince ? ».")
    : (MISSIONS ? AIDE_REPOS : "Je suis bloqué malgré « Ça coince ? » et mon voisin :");
  libelleAide(enAide ? "Je me suis débloqué" : "J'attends de l'aide");
}
function basculeAide(){
  const ancre = document.getElementById("aide"), etape = Math.min(ici,BLOCS.length-1)+1, commun = typeof Cloche!=="undefined";
  if(enAide){ if(commun) Cloche.ferme(ancre); allumeAide(false); envoie({ etape, type:"aide-fin" }); return; }
  const sonne = motif => {
    allumeAide(true, motif);
    if(!SUIVI || APERCU){ if(commun) Cloche.sonnee(); return; }
    google.script.run.withSuccessHandler(()=>{ if(commun) Cloche.sonnee(); }).withFailureHandler(err=>{
      const m = String(err && err.message || "");
      allumeAide(false);
      document.getElementById("aide-texte").textContent = /sonneries/.test(m) ? m.replace(/^(Exception|Error): /,"") : "Cloche non transmise. Réessaie dans un instant.";
    }).noter(COURS, { etape, type:"aide", reponse: motif || "" });
  };
  if(!commun){ sonne(); return; }
  if(Cloche.ouvert(ancre)){ Cloche.ferme(ancre); return; }
  Cloche.verifie({ ancre, etape: groupeCourant() ? "de « "+groupeCourant().titre+" »" : "du bloc "+(ici+1),
    info: SUIVI && !APERCU ? new Promise(ok=>google.script.run.withSuccessHandler(ok).withFailureHandler(()=>ok(null)).cloches(COURS)) : null,
    coince: document.getElementById("coince"), accord: typeof CLOCHE_ACCORD!=="undefined" && CLOCHE_ACCORD, sonne });
}
/* En mode missions, le bouton est une cloche : l'icône reste, le mot passe dans l'étiquette accessible. */
const AIDE_REPOS = MISSIONS ? document.getElementById("aide-texte").textContent : "";
function libelleAide(mot){
  const b = document.getElementById("aide-btn");
  if(!MISSIONS){ b.textContent = mot; return; }
  b.replaceChildren("🔔", txt("span","mot",mot)); b.setAttribute("aria-label",mot); b.title = enAide ? mot : AIDE_REPOS;
}
document.getElementById("aide-btn").addEventListener("click", basculeAide);
document.getElementById("memo-btn").addEventListener("click",()=>document.getElementById("memo").showModal());

/* Démarrage. Avec le suivi : on reprend où le serveur s'est arrêté (autre poste, onglet fermé). */
const qui = document.getElementById("qui"), pied = document.getElementById("pied");
/* Sans fichier de preuves, tout reste synchrone, comme avant ; avec, on attend preuves.json. */
const pretPreuves = chargePreuves();
const quandPret = f => typeof PREUVES==="undefined" ? f() : pretPreuves.then(f);
/* La cloche reste allumée après un rechargement (autre poste, onglet fermé). */
function restaureAide(){
  google.script.run.withSuccessHandler(r=>{
    if(!r || r.active!==true || enAide) return;
    enAide = true; document.getElementById("aide").classList.add("active"); libelleAide("Je me suis débloqué");
    document.getElementById("aide-texte").textContent = (MISSIONS ? "🔔 Le professeur sait que tu attends. " : "✋ Ton professeur sait que tu attends. ")+"Continue ce qui reste possible.";
  }).withFailureHandler(()=>{}).etatAide(COURS);
}
if(APERCU){
  ici = Math.max(0, Math.min(BLOCS.length-1, parseInt(location.hash.slice(6),10)-1));
  qui.textContent = "👁 Aperçu professeur : navigation libre, rien n'est enregistré.";
  pied.textContent = "Aperçu : les réponses ne sont ni envoyées ni gardées.";
  document.getElementById("aide").hidden = true;
  humeur();
  quandPret(affiche);
} else if(SUIVI){
  pied.textContent = "Ton avancement est visible par ton professeur.";
  /* Le suivi peut caler quelques secondes (verrou du Journal, 12/11/2026) : etat() est redemandé deux fois
     (après 2 s, puis 5 s) avant d'afficher la fiche sans la reprise du serveur. */
  const chargeEtat = essai => google.script.run.withSuccessHandler(s=>{
    if(s && s.email){ emailMoteur = s.email; if(typeof EMAIL!=="undefined") EMAIL = s.email; }
    if(s && s.classe) classeMoteur = String(s.classe).trim();
    if(s && s.email){ qui.textContent = "Connecté : "; qui.append(txt("strong",null,s.email)); if(s.classe) qui.append(" · "+s.classe); }
    if(preuvesRatees) qui.append(" — "+preuvesRatees);   // l'avertissement ne disparaît pas quand le suivi répond après lui
    if(s && s.humeur) etat.humeur = s.humeur;
    if(s && s.avis) etat.avis = s.avis;
    humeur();
    if(s && s.plafond) plafond = { bloc:Number(s.plafond.bloc), message:String(s.plafond.message||"") };
    if(DECLARATIF && s){   // cases et lettres de toutes les périodes ; la place : la dernière connue, sinon la première étape pas finie
      etat.cases = s.cases || {}; etat.moi = s.moi || {};
      ici = s.position>=1 && s.position<=BLOCS.length ? s.position-1 : Math.min(premierManque(), BLOCS.length-1);
      repriseVue = Object.keys(etat.cases).length>0 && !!s.derniere && Date.now()-s.derniere > 5*60000;
      placeNotee = ici;   // demarre() l'envoie (« ouvert »)
    } else if(s && s.atteint){ etat.atteint = s.atteint; etat.fini = s.atteint >= BLOCS.length; ici = Math.min(s.atteint, BLOCS.length); }
    const demarre = () => { affiche(); envoie({ etape:Math.min(ici,BLOCS.length-1)+1, type:"ouvert" }); restaureAide(); };
    if(typeof PREUVES==="undefined") demarre(); else pretPreuves.then(variantesServeur).then(demarre);
  }).withFailureHandler(()=>{
    if(essai < 2){ qui.textContent = "Connexion au suivi du professeur…"; setTimeout(()=>chargeEtat(essai+1), [2000,5000][essai]); return; }
    qui.textContent = "Le suivi du professeur ne répond pas : recharge la page (F5) dans un moment.";
    humeur(); quandPret(affiche);
  }).etat(COURS);
  chargeEtat(0);
  /* const SEQUENCE = { contenus:true, classe:"…" } dans la fiche : les champs facultatifs décrits en tête de sequence-eleve.js. */
  window.PAS_A_PAS = Object.assign({ cours: COURS, envoie, plafond: recoitPlafond }, typeof SEQUENCE!=="undefined" ? SEQUENCE : null);   // lu par sequence-eleve.js (chargé en différé : il ne bloque jamais la fiche)
} else {
  qui.textContent = typeof HORS_SUIVI!=="undefined" ? HORS_SUIVI : "Garde deux fenêtres : cette fiche, et Thonny quand elle le demande.";
  pied.textContent = "Ton avancement reste sur cet ordinateur. Aucune donnée n'est envoyée.";
  if(DECLARATIF) repriseVue = location.hash==="#reprise";
  humeur();
  quandPret(affiche);
}


/* Le serveur renvoie un petit état mis en cache, sans relire le journal à chaque poste. */
if(SUIVI && !APERCU){
  setInterval(()=>{
    if(!enAide)return;
    google.script.run.withSuccessHandler(r=>{
      if(!r || r.active!==false || !enAide)return;
      enAide=false;
      document.getElementById("aide").classList.remove("active");
      libelleAide("J’attends de l’aide");
      document.getElementById("aide-texte").textContent="Demande traitée. Tu peux sonner à nouveau si besoin.";
    }).withFailureHandler(()=>{}).etatAide(COURS);
  },15000);
}


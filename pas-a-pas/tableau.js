/* Les fiches sur GitHub Pages : « Bloc N » ouvre la fiche en aperçu à ce bloc (#bloc=N). */
const FICHES = Object.create(null), NB_BLOCS = Object.create(null), TITRES_COURS = Object.create(null);
const lienBloc = (i, texte) => {
  const url = FICHES[$("cours").value];
  if(!url) return txt("span", null, texte);
  const a = txt("a", null, texte); a.href = url + "#bloc=" + i; a.target = "_blank"; a.rel = "noopener";
  a.title = "Ouvrir le bloc " + i + " en aperçu (rien n'est enregistré)"; return a;
};
/* « 👁 Voir le cours » : le cours choisi, du bloc 1, en aperçu. Navigation libre, rien n'est enregistré.
   Créé ici si le HTML encore en cache chez Apps Script ne l'a pas. */
function majVoirCours(){
  let a = $("voir-cours");
  if(!a){ a = txt("a","btn vide","👁 Voir le cours"); a.id = "voir-cours"; a.target = "_blank"; a.rel = "noopener"; $("cours").after(a); }
  const url = FICHES[$("cours").value];
  a.hidden = !url; if(!url) return;
  a.href = url + "#bloc=1";
  a.title = "Ouvrir « " + (TITRES_COURS[$("cours").value] || $("cours").value) + " » en lecture seule : tous les blocs sont ouverts, rien n'est enregistré";
}
/* Mêmes listes que dans les fiches : l'humeur est enregistrée « emoji libellé ». */
const HUMEURS = [["😄","Super"],["🙂","Bien"],["😐","Bof"],["🙁","Pas top"],["😣","Pas bien"]];
const AVIS = [["plu","Ce qui m'a plu"],["progres","Ce qui m'a aidé à progresser"],["gene","Ce qui m'a gêné dans le cours en ligne"]];
const RAFRAICHIR = 15000;
const INACTIF = 8 * 60000;
/* Coincé sans sonner : 10 min sur le même bloc, encore actif (pas inactif), sans cloche. */
const SILENCIEUX = 10 * 60000;
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;

const $ = id => document.getElementById(id);
const txt = (tag, cls, t) => { const n=document.createElement(tag); if(cls) n.className=cls; if(t!=null) n.textContent=t; return n; };
const nom = email => email.split("@")[0].split(/[._]/).filter(Boolean).map(m=>m[0].toUpperCase()+m.slice(1)).join(" ");
const ilya = ms => {
  const m=Math.max(0,Math.floor(ms/60000));
  if(m<1)return "à l'instant";
  if(m<60)return "il y a "+m+" min";
  if(m<1440)return "il y a "+Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");
  return "il y a "+Math.floor(m/1440)+" j";
};
const derniereAction = (t,terminee,maintenant) => !t ? "—" : terminee
  ? new Date(t).toLocaleString("fr-BE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})
  : ilya(maintenant-t);

let SEANCES = [];
/* Filtre de la liste : un compteur cliqué (aide, bute, silencieux, inactif, fini), ou aucun. */
let filtreEleves=null,dernieresDonnees=null;
const estInactif=(e,d)=>!e.fini && d.maintenant - e.derniere > INACTIF;
const estSilencieux=(e,d)=>!e.fini && !e.aide && !!e.depuisBloc && d.maintenant - e.depuisBloc > SILENCIEUX && !estInactif(e,d);
const FILTRES={
  aide:{titre:"Attendent de l'aide", garde:e=>!!e.aide},
  bute:{titre:"Butent (3 erreurs ou +)", garde:e=>!e.fini && e.erreursIci>=3},
  silencieux:{titre:"Coincés sans sonner (10 min)", garde:estSilencieux},
  inactif:{titre:"Inactifs > 8 min", garde:estInactif},
  fini:{titre:"Ont fini", garde:e=>e.fini}
};
function filtreCompteur(cle){
  filtreEleves = filtreEleves===cle ? null : cle;
  if($("filtre-aide")) $("filtre-aide").checked = filtreEleves==="aide";
  if(dernieresDonnees) dessine(dernieresDonnees);
}
const heure = t => new Date(t).toLocaleString("fr-BE",{weekday:"short",day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"});
const choisie = () => SEANCES[Number($("seance").value)] || { classe:"", debut:0, fin:null };

/* Ressources privées du cours sélectionné : aucune URL Drive dans le site public. */
let demandeRessources = 0;
async function chargeRessourcesProf(){
  const zone = $("ressources-prof");
  if(!zone) return; // compatible avec l'ancien HTML encore en cache
  const demande = ++demandeRessources, cours = $("cours").value;
  zone.replaceChildren();
  if(!SUIVI){ zone.textContent = "Les liens Drive sont disponibles dans le tableau scolaire."; return; }
  zone.textContent = "Chargement de la préparation…";
  try {
    const liens = await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).ressourcesProf(cours));
    if(demande !== demandeRessources || cours !== $("cours").value) return;
    zone.replaceChildren();
    for(const [cle, libelle] of [["preparation","Fiche professeur — préparation et corrigé"],["dossier","Dossier Drive"]]){
      if(!liens || !liens[cle]) continue;
      const url = new URL(liens[cle]);
      if(url.protocol !== "https:" || !["docs.google.com","drive.google.com","github.com"].includes(url.hostname)) continue;
      const a = txt("a","btn vide",libelle); a.href = url.href; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.title = libelle + " — nouvel onglet"; zone.append(a);
    }
    if(!zone.children.length) zone.textContent = "Préparation non renseignée pour ce cours.";
  } catch(e) {
    if(demande === demandeRessources) zone.textContent = "Préparation indisponible. Recharge le tableau ; si cela persiste, vérifie la version Apps Script.";
  }
}

/* La liste des séances : la plus récente d'abord, sélectionnée par défaut ; `garder` (un début) la garde choisie. */
function remplitSeances(liste, garder){
  SEANCES = liste;
  const sel = $("seance");
  sel.replaceChildren(...(liste.length ? liste : [{classe:"", debut:0}]).map((s,i)=>{
    const o = txt("option", null, s.debut ? (enCours(s,i) ? "En cours · " : "") + s.classe + " · " + heure(s.debut) : "Toutes (aucune séance démarrée)");
    o.value = i; return o; }));
  const k = garder ? liste.findIndex(s=>s.debut===garder) : -1;
  if(k >= 0) sel.value = String(k);
  caseAutresClasses();
  etatTerminer();
  charge();
  chargeSequence();
}
/* Deux classes en même temps dans le local (co-enseignement) : une séance par classe côté serveur, mais UN tableau.
   La case ajoute à la séance choisie les élèves des autres classes dont la séance de ce cours est en cours.
   Rien ne change côté serveur : un appel donnees() par classe, réunis ici. Les boutons d'un élève (Recommencer,
   Aide traitée) agissent sur la séance de SA classe. Cadenas et cours collectif restent ceux de la séance choisie. */
/* Les classes réunies : une case par classe, cochée par le professeur et gardée sur le poste. Une classe proposée =
   une classe qui a ce cours ouvert (panneau « Mes cours ») ou qui a déjà eu une séance de ce cours. Pour chacune : sa
   séance la plus récente, en cours ou non ; sans aucune séance, tout son historique (début 0), comme le fait etat()
   pour ses élèves. Aucune séance n'est créée ni reprise : l'avancement des élèves ne bouge pas. */
let classesVues = [];
try { classesVues = JSON.parse(localStorage.getItem("tableau:classes-vues") || "[]"); } catch(e){}
function classesPossibles(){
  const s = choisie(), cours = $("cours").value, noms = new Set(SEANCES.map(x=>x.classe).filter(Boolean));
  if(CL && CL.classes) Object.keys(CL.classes).forEach(c=>{ if((CL.classes[c]||[]).includes(cours)) noms.add(c); });
  noms.delete(s.classe);
  return [...noms].sort((a,b)=>a.localeCompare(b,"fr",{numeric:true}));
}
const seanceDe = c => { const i = SEANCES.findIndex((x,k)=>x.classe===c && derniere(x,k)); return i>=0 ? SEANCES[i] : { classe:c, debut:0, fin:null, sansSeance:true }; };
const autresSeances = () => { const possibles = classesPossibles(); return classesVues.filter(c=>possibles.includes(c)).map(seanceDe); };
function caseAutresClasses(){
  if(!SUIVI) return;
  let z = $("autres-classes-label");
  if(!z){
    z = txt("div","filtre-aide"); z.id = "autres-classes-label"; z.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;width:100%;font-weight:700";
    $("seance").after(z);
    $("seance").addEventListener("change", caseAutresClasses);
  }
  const possibles = classesPossibles();
  z.hidden = !SUIVI || !possibles.length || !choisie().debut;
  z.replaceChildren(txt("span",null,"Voir aussi :"), ...possibles.map(c=>{
    const lab = txt("label"), cb = txt("input"), se = seanceDe(c), k = SEANCES.indexOf(se);
    lab.style.cssText = "display:inline-flex;gap:5px;align-items:center;font-weight:400";
    cb.type = "checkbox"; cb.dataset.classe = c; cb.checked = classesVues.includes(c);
    cb.addEventListener("change",()=>{
      classesVues = classesVues.filter(x=>x!==c).concat(cb.checked ? [c] : []);
      try { localStorage.setItem("tableau:classes-vues", JSON.stringify(classesVues)); } catch(e){}
      contexteAffiche = ""; charge();
    });
    lab.title = se.sansSeance ? "Pas de séance pour cette classe : tout son historique sur ce cours." : (k>=0 && enCours(se,k) ? "Séance en cours" : "Dernière séance (pas en cours)") + " : " + heure(se.debut);
    lab.append(cb, txt("span",null,c + (se.sansSeance ? " (sans séance)" : k>=0 && enCours(se,k) ? " (en séance)" : "")));
    return lab; }));
}
/* Une séance par cours ET par classe : `derniere` = la plus récente de sa classe (serveur depuis le
   06/11/2026) ; un ancien serveur ne l'envoie pas, et seule la toute première de la liste compte. */
const derniere = (s,i) => s.derniere !== undefined ? !!s.derniere : i===0 && !s.fin;
const enCours = (s,i) => !!s.debut && derniere(s,i) && s.active!==false;
function chargeSeances(){
  if(!SUIVI){ remplitSeances(demoSeances()); return; }
  google.script.run.withSuccessHandler(remplitSeances).withFailureHandler(erreur).seances($("cours").value);
}
const erreur = err => {let note=$("erreur-tableau");if(!note){note=txt("p");note.id="erreur-tableau";note.setAttribute("role","alert");document.querySelector("header").after(note);}note.textContent="Échec de l’action : "+(err.message||String(err));};

/* Les blocs ouverts à la classe (plafonnerSeance dans Code.gs) : une pastille par bloc, sous les
   commandes de séance. Un clic sur la pastille N ouvre les blocs 1 à N ; les suivants portent un
   cadenas sur les postes, sans rechargement. Passer à un autre moment de la séquence rouvre tout. */
const MESSAGES_PLAFOND = ["On attend la correction ensemble.", "On reprend en séquence collective."];
let clePlafond = "";
function dessinePlafond(){
  let z = $("plafond-seance");
  if(!z){
    z = txt("div"); z.id = "plafond-seance"; z.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;align-items:center;width:100%;padding:4px 0";
    const titre = txt("strong",null,"Blocs ouverts :"), rang = txt("span"); rang.id = "plafond-blocs"; rang.style.cssText = "display:flex;gap:4px;flex-wrap:wrap";
    const msg = document.createElement("input"); msg.id = "plafond-message"; msg.type = "text"; msg.maxLength = 200; msg.style.cssText = "flex:1;min-width:14rem;font:inherit;padding:6px 10px";
    msg.setAttribute("aria-label","Mon message aux élèves"); msg.placeholder = "Mon message aux élèves";
    const dl = document.createElement("select"); dl.id = "plafond-choix"; dl.setAttribute("aria-label","Message affiché sous le cadenas");
    [...MESSAGES_PLAFOND, "Autre message…"].forEach((m,k)=>{ const o = txt("option",null,m); o.value = k<MESSAGES_PLAFOND.length ? m : ""; dl.append(o); });
    dl.addEventListener("change",()=>{ msg.hidden = !!dl.value; if(dl.value) msg.value = dl.value; else { msg.value = ""; msg.focus(); } });
    const tout = txt("button","btn vide","Tout ouvrir"); tout.type = "button"; tout.id = "plafond-tout";
    const etat = txt("span","astuce"); etat.id = "plafond-etat"; etat.style.width = "100%";
    z.ouvre = n => { const s = choisie(); z.querySelectorAll("button").forEach(b=>b.disabled = true);
      serveur("plafonnerSeance", $("cours").value, s.debut, n, msg.value).then(l=>{ clePlafond = ""; remplitSeances(l, s.debut); })
        .catch(e=>{ clePlafond = ""; dessinePlafond(); erreur(e); }); };
    tout.addEventListener("click",()=>z.ouvre(0));
    z.append(titre, rang, tout, dl, msg, etat); document.querySelector("header .reglages").after(z);
  }
  const i = Number($("seance").value), s = SEANCES[i] || {}, cours = $("cours").value;
  z.hidden = !SUIVI || !enCours(s,i);
  if(z.hidden) return;
  const n = NB_BLOCS[cours] || 1, cle = [cours, s.debut, s.plafond||0, s.messagePlafond||"", n].join("|");
  if(cle === clePlafond) return;          // ne pas défaire ce que le professeur est en train de choisir
  clePlafond = cle;
  const dernier = s.plafond && s.plafond<n ? s.plafond : n;
  $("plafond-blocs").replaceChildren(...Array.from({length:n},(_,k)=>{
    const ouvert = k<dernier, b = txt("button","btn "+(ouvert ? "plein" : "vide"),(ouvert ? "" : "🔒 ")+(k+1)); b.type = "button"; b.dataset.bloc = k+1;
    b.style.cssText = "min-width:2.6rem;padding:4px 8px"; b.title = "Ouvrir les blocs 1 à "+(k+1)+(k+1<n ? ", fermer les suivants" : "");
    b.setAttribute("aria-label", b.title); b.setAttribute("aria-pressed", String(ouvert));
    b.addEventListener("click",()=>z.ouvre(k+1<n ? k+1 : 0)); return b; }));
  $("plafond-message").value = s.messagePlafond || MESSAGES_PLAFOND[0];
  $("plafond-choix").value = MESSAGES_PLAFOND.includes($("plafond-message").value) ? $("plafond-message").value : "";
  $("plafond-message").hidden = !!$("plafond-choix").value;
  $("plafond-tout").hidden = dernier===n; $("plafond-tout").disabled = false;
  $("plafond-etat").textContent = dernier<n ? "🔒 Blocs 1 à "+dernier+" ouverts ; les suivants portent un cadenas sur les postes." : "Tous les blocs sont ouverts. Clique sur un numéro pour fermer les blocs suivants (l’atelier d’une séquence le fait aussi).";
}
/* Les cloches en attente se voient partout : titre de l'onglet (le tableau peut être derrière une autre fenêtre)
   et bandeau de la projection. Un nombre seulement, jamais de nom : la projection est vue par toute la classe. */
const TITRE_PAGE = document.title;
function signaleCloches(n){
  document.title = (n ? "🔔 " + n + " · " : "") + TITRE_PAGE;
  const c = $("seq-cloches"); if(!c) return;
  c.hidden = !n; c.textContent = "🔔 " + n;
  c.title = n + (n > 1 ? " élèves attendent" : " élève attend") + " de l’aide";
}
function dessine(d){
  dernieresDonnees = d;
  signaleCloches((d.eleves||[]).filter(e=>e.aide).length);
  if($("ramener-classe"))$("ramener-classe").hidden=true;
  if(!$("filtre-aide")){
    const label=txt("label","filtre-aide"),filtre=document.createElement("input");filtre.type="checkbox";filtre.id="filtre-aide";filtre.checked=filtreEleves==="aide";
    label.append(filtre,txt("span",null,"Besoin d’aide seulement"));
    filtre.addEventListener("change",()=>{if((filtreEleves==="aide")!==filtre.checked)filtreCompteur("aide");});
    $("filtres-eleves").append(label);
  }

  /* Cours déclaratif (des cases, pas de preuves : d.declaratif) : les deux colonnes d'erreurs deviennent les cases
     cochées et les lettres « Moi » ; la barre montre les étapes terminées et la place de l'élève. */
  const decl = !!d.declaratif, totalCases = decl ? Object.values(d.cases||{}).reduce((a,b)=>a+b,0) : 0;
  const tetes = $("lignes").closest("table").querySelectorAll("thead th");
  if(tetes.length>=6){ tetes[4].textContent = decl ? "Cases cochées" : "Erreurs ici"; tetes[5].textContent = decl ? "Moi" : "Erreurs"; }
  // Pour tous les cours : la classe de la séance choisie revient à l'étape N (ceux qui l'ont dépassée la refont).
  if(!$("ramener-classe")){const b=txt("button","btn vide","Ramener la classe à une étape…");b.type='button';b.id='ramener-classe';b.addEventListener('click',()=>{const s=choisie(),cours=$("cours").value;choisirEtape("Toute la classe "+s.classe,NB_BLOCS[cours]||1,null).then(bloc=>{if(!bloc)return;b.disabled=true;google.script.run.withSuccessHandler(r=>{b.disabled=false;$("maj").textContent=r.repris+' élève(s) ramené(s) à l’étape '+bloc+'. Ils rechargent leur fiche.';charge();}).withFailureHandler(err=>{b.disabled=false;erreur(err);}).noter(cours,{type:'prof-ramener',debut:s.debut,bloc});});});$("gestion-actions").append(b);}
  $("ramener-classe").hidden=!(SUIVI&&d.reprisesParSuivi&&d.peutReprendre);
  dessinePlafond();
  $("gestion-attente").hidden=!SUIVI||!!d.reprisesParSuivi;
  const n = NB_BLOCS[$("cours").value] || Math.max(1, ...d.eleves.map(e=>e.atteint+1));
  const el = d.eleves.slice().sort((a,b)=>
    (!!b.aide - !!a.aide) || (a.aide && b.aide ? a.aide.depuis - b.aide.depuis : 0) ||
    (a.fini - b.fini) || (a.atteint - b.atteint) || (b.erreursIci - a.erreursIci));

  const median = el.length ? el.map(e=>e.atteint).sort((a,b)=>a-b)[Math.floor(el.length/2)] : 0;
  const compte = cle => el.filter(e=>FILTRES[cle].garde(e,d)).length;
  // Un compteur se clique : la liste ne montre plus que ces élèves ; un second clic remet tout.
  // « Coincés sans sonner » n'apparaît qu'avec un serveur qui envoie depuisBloc.
  const cles = ["aide","bute"].concat(el.some(e=>e.depuisBloc) ? ["silencieux"] : [], ["inactif","fini"]);
  $("chiffres").replaceChildren(txt("div","chiffre"), ...cles.map(cle=>{
    const v = compte(cle), x = txt("button","chiffre"+(v && cle!=="fini" ? " alerte" : ""));
    x.type = "button"; x.setAttribute("aria-pressed", String(filtreEleves===cle));
    x.title = filtreEleves===cle ? "Revoir toute la classe" : "Ne montrer que ces élèves";
    x.append(txt("b",null,v), txt("span",null,FILTRES[cle].titre));
    x.addEventListener("click",()=>filtreCompteur(cle)); return x;
  }), txt("div","chiffre"));
  const [eff, med] = [$("chiffres").firstChild, $("chiffres").lastChild];
  eff.append(txt("b",null,el.length), txt("span",null,"Élèves")); med.append(txt("b",null,median+" / "+n), txt("span",null,"Bloc médian validé"));

  const tb = $("lignes"); tb.replaceChildren();
  if(!el.length){ const tr=txt("tr"); const td=txt("td","vide","Personne n'a encore ouvert la fiche sur cette période."); td.colSpan=8; tr.append(td); tb.append(tr); }
  const vus = filtreEleves ? el.filter(e=>FILTRES[filtreEleves].garde(e,d)) : el;
  if(el.length && !vus.length){ const tr=txt("tr"); const td=txt("td","vide","Personne dans « "+FILTRES[filtreEleves].titre+" ». Clique à nouveau sur le compteur pour revoir toute la classe."); td.colSpan=8; tr.append(td); tb.append(tr); }
  vus.forEach(e=>{
    const tr = txt("tr", e.aide ? "aide" : e.fini ? "fini" : "");
    const td = (cls,t) => { const c=txt("td",cls,t); tr.append(c); return c; };
    const n1 = td("nom", nom(e.email)); n1.title = e.email;
    if(d._classes){ const c = txt("span","qui"," · "+e.classe); c.style.cssText = "color:var(--doux);font-weight:400"; n1.append(c); }
    if(SUIVI&&(e._d||d).reprisesParSuivi&&(e._d||d).peutReprendre){const cours=$("cours").value,seance=e._seance||choisie();const r=txt("button","btn vide","Recommencer");r.type="button";r.setAttribute("aria-label","Faire recommencer "+nom(e.email));r.addEventListener("click",()=>{choisirEtape(nom(e.email),NB_BLOCS[cours]||n,e.atteint).then(bloc=>{if(!bloc)return;r.disabled=true;google.script.run.withSuccessHandler(()=>{charge();}).withFailureHandler(err=>{r.disabled=false;erreur(err);}).noter(cours,{type:'prof-reprise',email:e.email,debut:seance.debut,bloc:bloc});});});n1.append(r);}
    n1.append(caseRecompense(e));
    const h = td("hum", e.humeur ? e.humeur.split(" ")[0] : ""); if(e.humeur) h.title = e.humeur;
    const b = txt("div","barre");
    for(let i=0;i<n;i++){ const s=txt("span");
      if(e.etapes){ s.className = e.etapes[i] ? "fait" : (i===e.position-1 ? "ici" : ""); s.title = "Étape "+(i+1)+" : "+((e.parts||[])[i]||0)+" / "+((d.cases||{})[i+1]||0)+" cases"+(i===e.position-1 ? " — sa place" : ""); }
      else s.className = i<e.atteint ? "fait" : (i===e.atteint && !e.fini ? "ici" : "");
      b.append(s); }
    td().append(b);
    const nb = td("num"); nb.append(e.fini ? txt("span",null,"fini") : lienBloc(blocDe(Object.assign({},e,{aide:null})), blocDe(Object.assign({},e,{aide:null}))+" / "+n));
    if(decl){ td("num", (e.cochees||0)+" / "+totalCases); td("num", Array.from({length:d.criteres||0},(_,k)=>(e.moi||{})[k+1]||"—").join(" · ")); }
    else { td("num", e.fini ? "" : e.erreursIci || ""); td("num", e.erreurs || ""); }
    const etat = td();
    // Cours à preuves avec une auto-évaluation de fin (« criteres » au catalogue) : les lettres « Moi », une par question.
    if(!decl && d.criteres && e.moi && Object.keys(e.moi).length){ const m = txt("span","pastille silence","Moi : "+Array.from({length:d.criteres},(_,k)=>e.moi[k+1]||"—").join(" · ")); m.title = "Auto-évaluation de fin de cours : une lettre par question, choisie par l’élève. Non cotée."; etat.append(m, " "); }
    if(e.aide){
      etat.append(txt("span","pastille aide"+(e.aide.motif==="accord" ? " accord" : ""),"🔔 "+(MOTIFS_CLOCHE[e.aide.motif]||"aide")+" · bloc "+e.aide.bloc+" · "+ilya(d.maintenant-e.aide.depuis).replace("il y a ","")));
      if(SUIVI && (e._d||d).peutCloreAide){
        const cours=$("cours").value,seance=e._seance||choisie(),depuis=e.aide.depuis;
        // Motif « accord » (Rat de ville, case de l'accord) : le même geste vaut accord, la case de l'élève se coche seule.
        const acc=e.aide.motif==="accord", mot=acc?"Accord donné":"Aide traitée";
        const b=txt("button","btn vide",acc?"✓ Donner l’accord":mot);b.type="button";
        b.setAttribute("aria-label",(acc?"Donner l’accord de remise à ":"Aide traitée pour ")+nom(e.email));
        if(acc)b.title="J’ai regardé son document : il peut rendre. Sa case « accord » se coche toute seule.";
        b.addEventListener("click",()=>{
          if(b.disabled)return;b.disabled=true;b.textContent="Enregistrement…";
          google.script.run.withSuccessHandler(r=>{
            if(!r?.traitee){b.disabled=false;b.textContent="Réessayer";return;}
            b.textContent="✓ "+mot;charge();
          }).withFailureHandler(err=>{b.disabled=false;b.textContent="Réessayer : "+mot.toLowerCase();erreur(err);}).cloreAide(cours,e.email,seance.debut,depuis);
        });
        etat.append(b);
      }
      /* Écrire au professeur passe par la cloche : le mot de l'élève se lit ici, dans la file, et la réponse part
         d'une petite fenêtre (le tableau se redessine sans cesse : un champ dans la ligne perdrait ce qu'on y tape). */
      if(e.aide.mot) etat.append(txt("span","mot-eleve","« "+e.aide.mot+" »"));
      if(e.aide.reponse) etat.append(txt("span","mot-prof","↳ "+e.aide.reponse));
      if(SUIVI && (e._d||d).peutCloreAide && e.aide.motif!=="accord" && typeof google.script.run.repondreAide==="function"){
        const cours=$("cours").value, r=txt("button","btn vide",e.aide.reponse?"Répondre encore":"Répondre");r.type="button";
        r.setAttribute("aria-label","Répondre par écrit à "+nom(e.email));
        r.title="Une ligne, que cet élève seul lit sous sa cloche. La cloche reste allumée.";
        r.addEventListener("click",()=>{
          const t=(prompt("Réponse à "+nom(e.email)+" (une ligne, 200 caractères au plus) :"+(e.aide.mot?"\n\nSon mot : « "+e.aide.mot+" »":""),"")||"").trim();
          if(!t)return;
          r.disabled=true;
          google.script.run.withSuccessHandler(()=>charge()).withFailureHandler(err=>{r.disabled=false;erreur(err);}).repondreAide(cours,e.email,e.aide.bloc,t.slice(0,200));
        });
        etat.append(r);
      }
    }
    else if(e.fini) etat.append(txt("span","pastille fini","✓ fini"));
    else if(e.erreursIci>=3) etat.append(txt("span","pastille bute","bute"));
    else if(estSilencieux(e,d)) etat.append(txt("span","pastille silence","⏳ "+ilya(d.maintenant-e.depuisBloc).replace("il y a ","")+" sur ce bloc, sans sonner"));
    const der = td("num", derniereAction(e.derniere, !!choisie().fin || e.fini, d.maintenant));
    der.title=e.derniere?new Date(e.derniere).toLocaleString("fr-BE"):"Aucune action";
    if(!e.fini && d.maintenant - e.derniere > INACTIF) der.classList.add("inactif");
    tb.append(tr);
  });

  syntheses(d, el, n);
  ouEstLaClasse(d, el, n);
  const s = choisie(); $("titre-classe").textContent = d._classes ? d._classes.join(" + ") + " · " : s.classe ? s.classe + " · " : "";
  if($("tresor")){ const t = Number(d.tresor)||0; $("tresor").hidden = !t; $("tresor").textContent = t ? "⭐ "+t+(t>1?" étoiles":" étoile")+" · trésor de la classe" : ""; }
  $("maj").textContent = "Mis à jour à " + new Date(d.maintenant).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit",second:"2-digit"}) + mesure(d);
}

/* Mesure (proposition 9 de l'audit) : aller-retour vu du navigateur, et ce qu'en dit le serveur (durée, lignes
   du Journal relues). Si le serveur reste sous la seconde en fin de séquence, le résumé incrémental est inutile. */
const secondes = ms => (ms/1000).toLocaleString("fr-BE",{minimumFractionDigits:1,maximumFractionDigits:1}) + " s";
function mesure(d){
  if(!d._allerRetour) return "";
  const m = d.mesure;
  return " · " + secondes(d._allerRetour) + (m ? " (serveur " + secondes(m.ms) + ", " + m.lignes.toLocaleString("fr-BE") + " lignes lues)" : "");
}
const resume = (id, texte) => { if($(id)) $(id).textContent = "— " + texte; };

/* Où est la classe : élèves sur chaque bloc maintenant, et la part de ceux qui coincent. Et le bandeau
   « N élèves coincés au bloc B — corriger ensemble » dès SEUIL_COMMUN élèves coincés au même bloc. */
const SEUIL_COMMUN = 4;
let bandeauMasque = null;   // {cle, n} : « Pas maintenant » cache le bandeau jusqu'à ce que le nombre augmente
/* Le motif de la cloche (bouton choisi par l'élève). « accord » = il a fini et attend l'accord avant de rendre : il n'est pas coincé. */
const MOTIFS_CLOCHE = {consigne:"consigne", ecran:"écran", accord:"accord"};
const enPanne = e => !!e.aide && e.aide.motif!=="accord";
const estCoince = (e,d) => !e.fini && (enPanne(e) || e.erreursIci>=3 || estSilencieux(e,d));
const blocDe = e => e.aide ? Number(e.aide.bloc) : e.position || e.atteint+1;   // position : la place d'un élève en cours déclaratif
function ouEstLaClasse(d, el, n){
  const pli = $("pli-classe"); if(pli) pli.hidden = !d;
  let ban = $("bandeau-commun");
  if(!ban){ ban = txt("div","bandeau-commun"); ban.id = "bandeau-commun"; ban.setAttribute("role","status"); $("chiffres").after(ban); }
  ban.hidden = true;
  if(!d) return;
  const ici = Array(n+1).fill(0), coinces = Array(n+1).fill(0), detail = Array.from({length:n+1},()=>({aide:0,bute:0,silence:0}));
  el.forEach(e=>{
    if(e.fini) return;
    const b = Math.min(n, Math.max(1, blocDe(e))); ici[b]++;
    if(!estCoince(e,d)) return;
    coinces[b]++; detail[b][enPanne(e) ? "aide" : e.erreursIci>=3 ? "bute" : "silence"]++;
  });
  const finis = el.filter(e=>e.fini).length, max = Math.max(1, finis, ...ici);
  const z = $("ou-classe");
  if(z){
    z.replaceChildren();
    for(let b=1;b<=n;b++){
      const r = txt("div","bl ou"), j = txt("div","jauge"), w = txt("div");
      j.style.width = (ici[b]/max*100)+"%"; if(!ici[b]) j.style.opacity = ".15";
      const c = txt("span","coince"), reste = txt("span","reste");
      c.style.width = (ici[b] ? coinces[b]/ici[b]*100 : 0)+"%"; reste.style.width = (ici[b] ? 100-coinces[b]/ici[b]*100 : 100)+"%";
      j.append(c, reste); w.append(j);
      if(coinces[b]) w.title = coinces[b]+" sur "+ici[b]+" coincé"+(coinces[b]>1?"s":"");
      r.append(lienBloc(b, "Bloc "+b), w, txt("span","num",ici[b] || "")); z.append(r);
    }
    const r = txt("div","bl ou"), j = txt("div","jauge"), w = txt("div");
    j.style.width = (finis/max*100)+"%"; j.style.background = "var(--juste)"; if(!finis) j.style.opacity = ".15";
    w.append(j); r.append(txt("span",null,"Fini"), w, txt("span","num",finis || "")); z.append(r);
  }
  let haut = 0; for(let b=1;b<=n;b++) if(ici[b] > ici[haut]) haut = b;   // ici[0] vaut toujours 0
  resume("resume-classe", haut ? "le plus d’élèves : bloc "+haut+" ("+ici[haut]+(coinces[haut] ? ", dont "+coinces[haut]+" coincé"+(coinces[haut]>1?"s":"") : "")+")" : (finis ? "tout le monde a fini" : "personne n’a commencé"));
  // Le bandeau : le bloc où le plus d'élèves coincent, à partir de SEUIL_COMMUN.
  let pire = 0; for(let b=1;b<=n;b++) if(coinces[b] > (coinces[pire]||0)) pire = b;
  if(!pire || coinces[pire] < SEUIL_COMMUN) return;
  const cle = $("cours").value+":"+pire;
  if(bandeauMasque && bandeauMasque.cle===cle && coinces[pire] <= bandeauMasque.n) return;
  const x = detail[pire], parts = [[x.aide,"cloche"],[x.bute,"bute","butent"],[x.silence,"sans sonner","sans sonner"]]
    .filter(([v])=>v).map(([v,un,plus])=>v+" "+(v>1 ? (plus || un+"s") : un));
  const proj = lienBloc(pire, "Corriger ensemble : projeter le bloc "+pire); proj.classList.add("btn");
  const plusTard = txt("button","btn vide","Pas maintenant"); plusTard.type = "button";
  plusTard.addEventListener("click",()=>{ bandeauMasque = {cle, n:coinces[pire]}; ban.hidden = true; });
  const t = txt("span"); t.append("🧩 ", txt("b",null,coinces[pire]+" élèves coincés au bloc "+pire), " ("+parts.join(", ")+")");
  ban.replaceChildren(t, txt("span","espace"), proj, plusTard); ban.hidden = false;
}

/* Les sections repliées : le navigateur retient ce qui est ouvert (confort, rien d'autre). */
function plis(){
  let ouverts = {}; try { ouverts = JSON.parse(localStorage.getItem("tableau-plis") || "{}"); } catch(e) {}
  document.querySelectorAll("details.replie").forEach(p=>{
    if(ouverts[p.id] !== undefined) p.open = !!ouverts[p.id];
    p.addEventListener("toggle",()=>{ ouverts[p.id] = p.open; try { localStorage.setItem("tableau-plis", JSON.stringify(ouverts)); } catch(e) {} });
  });
  // « ⚙ Plus » se ferme d'un clic ailleurs ou avec Esc.
  const plus = $("plus");
  if(plus){
    document.addEventListener("click", e=>{ if(plus.open && !plus.contains(e.target)) plus.open = false; });
    document.addEventListener("keydown", e=>{ if(e.key==="Escape" && plus.open) plus.open = false; });
  }
}
plis();

/* Les trois encadrés communs à tous les cours : où le groupe bute, son humeur, ses avis.
   Cours déclaratif (formatif) : « où ça bute » compte les élèves qui ont sonné la cloche à chaque étape. */
/* ids (formatif) : la jauge k lit parBloc[ids[k]] et s'affiche « Étape k+1 » ; sinon blocs 1 à n. */
function syntheses(d, el, n, ids){
  $("blocs-titre").textContent = d.declaratif ? "Où le groupe bute — cloches par étape" : "Où le groupe bute — erreurs par bloc";
  $("blocs-astuce").textContent = d.declaratif
    ? "Nombre d’élèves qui ont sonné la cloche 🔔 à chaque étape sur la période choisie. Clic sur « Étape N » : la fiche s’ouvre à cette étape, en aperçu."
    : "Clic sur « Bloc N » (ici ou dans la colonne Bloc) : la fiche s’ouvre à ce bloc, en aperçu, pour la projeter. Rien n’y est enregistré. Chaque élève a sa variante de la question : survoler la jauge donne les erreurs par variante.";
  const zb = $("blocs"); zb.replaceChildren();
  const max = Math.max(1, ...Object.values(d.parBloc));
  for(let k=1;k<=n;k++){
    const i = ids ? ids[k-1] : k, v = d.parBloc[i] || 0;
    const r = txt("div","bl"); const j = txt("div","jauge"); j.style.width = (v/max*100)+"%"; if(!v) j.style.opacity=".15";
    const w = txt("div"); w.append(j);
    r.append(lienBloc(i, (d.declaratif ? "Étape " : "Bloc ")+k), w, txt("span","num",v)); zb.append(r);
    /* Cours à variantes : le détail au survol. Une variante qui fait bien plus d'erreurs que les autres est mal écrite. */
    const dv = d.variantes && d.variantes[i];
    if(dv){ r.classList.add("detail"); w.title = r.lastChild.title = dv.map(x=>"Variante "+x.v+" : "+x.erreurs+" erreur"+(x.erreurs>1?"s":"")+", "+x.eleves+" élève"+(x.eleves>1?"s":"")).join(" · "); }
  }
  const zh = $("humeurs"); zh.replaceChildren();
  const parHumeur = HUMEURS.map(([m])=>el.filter(e=>e.humeur.split(" ")[0]===m).length);
  const maxH = Math.max(1, ...parHumeur);
  HUMEURS.forEach(([m,t],i)=>{
    const r = txt("div","hm"); const j = txt("div","jauge"); j.style.width = (parHumeur[i]/maxH*100)+"%"; if(!parHumeur[i]) j.style.opacity=".15";
    const w = txt("div"); w.append(j);
    r.append(txt("span","emoji",m), txt("span",null,t), w, txt("span","num",parHumeur[i])); zh.append(r);
  });
  const sans = el.filter(e=>!e.humeur).length;
  if(sans) zh.append(txt("p","astuce",sans+" élève"+(sans>1?"s n'ont":" n'a")+" pas encore choisi."));
  resume("resume-humeur", HUMEURS.map(([m],i)=>parHumeur[i] ? m+" "+parHumeur[i] : "").filter(Boolean).join(" · ") || "pas encore de réponse");
  const pires = Array.from({length:n},(_,k)=>[k+1, d.parBloc[ids ? ids[k] : k+1] || 0]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,2);
  resume("resume-blocs", pires.length ? (d.declaratif ? "le plus de cloches : " : "le plus d’erreurs : ") + pires.map(([k,v])=>(d.declaratif ? "étape " : "bloc ")+k+" ("+v+")").join(", ") : (d.declaratif ? "aucune cloche" : "aucune erreur") + " pour l’instant");

  const za = $("avis"); za.replaceChildren();
  AVIS.forEach(([k,t])=>{
    const col = txt("div"); col.append(txt("h3",null,t));
    const rep = el.filter(e=>e.avis && e.avis[k]);
    if(!rep.length) col.append(txt("p","vide","Pas encore de réponse."));
    else { const ul = txt("ul"); rep.forEach(e=>{ const li = txt("li",null,e.avis[k]+" "); li.append(txt("span","qui","— "+nom(e.email))); ul.append(li); }); col.append(ul); }
    za.append(col);
  });
  const nAvis = el.filter(e=>e.avis && AVIS.some(([k])=>e.avis[k])).length;
  resume("resume-avis", nAvis ? nAvis+(nAvis>1?" élèves ont donné leur avis":" élève a donné son avis") : "pas encore d’avis");
  phrasesLibres(el);
}
/* « Explique avec tes mots » : les phrases libres des blocs à trous, non jugées par la fiche, pour la
   correction ensemble. Sans les noms tant que la case n'est pas cochée : le panneau peut être projeté.
   Le panneau est créé ici (pas dans tableau.html) et reste caché tant qu'aucune phrase n'est arrivée. */
let phrasesAvecNoms = false;
function phrasesLibres(el){
  let section = $("panneau-phrases");
  if(!section){
    section = txt("section","panneau"); section.id = "panneau-phrases";
    const titre = txt("h2",null,"Leurs phrases — « Explique avec tes mots »");
    const astuce = txt("p","astuce","La fiche a corrigé le texte à trous, pas ces phrases : elles sont à lire et à corriger ensemble. La dernière phrase de chaque élève, par bloc.");
    const lab = txt("label","astuce"), cb = txt("input"); cb.type = "checkbox"; cb.id = "phrases-noms";
    cb.addEventListener("change",()=>{ phrasesAvecNoms = cb.checked; section.querySelectorAll(".qui").forEach(x=>x.hidden=!phrasesAvecNoms); });
    lab.append(cb," Afficher les noms (à décocher avant de projeter)");
    const zone = txt("div","avis"); zone.id = "phrases";
    section.append(titre, astuce, lab, zone);
    $("avis").closest(".panneau").before(section);
  }
  const parBloc = {};
  el.forEach(e=>Object.keys(e.phrases||{}).forEach(b=>(parBloc[b]||(parBloc[b]=[])).push([e.email, e.phrases[b]])));
  const blocs = Object.keys(parBloc).map(Number).sort((a,b)=>a-b);
  section.hidden = !blocs.length;
  const zone = $("phrases"); zone.replaceChildren();
  blocs.forEach(b=>{
    const col = txt("div"), ul = txt("ul");
    col.append(txt("h3",null,"Bloc "+b+" — "+parBloc[b].length+" phrase"+(parBloc[b].length>1?"s":"")));
    parBloc[b].forEach(([email,phrase])=>{ const li = txt("li",null,phrase+" "); const q = txt("span","qui","— "+nom(email)); q.hidden = !phrasesAvecNoms; li.append(q); ul.append(li); });
    col.append(ul); zone.append(col);
  });
}
let numeroChargement=0,contexteAffiche="";
function charge(){
  if(!SUIVI){ dessine(demo()); return; }
  const s = choisie();
  const cours=$("cours").value,demande=++numeroChargement;
  const contexte=cours+":"+s.debut;
  if(contexte!==contexteAffiche){$("lignes").replaceChildren();if($("python-plafond"))$("python-plafond").hidden=true;}
  const autres = s.debut ? autresSeances() : [], depart = Date.now();
  if(autres.length){
    return Promise.all([s].concat(autres).map(x=>serveur("donnees", cours, x.debut, x.fin, x.classe))).then(l=>{
      if(demande!==numeroChargement || $("cours").value!==cours || choisie().debut!==s.debut) return;
      const d = l[0]; d._allerRetour = Date.now() - depart; d.eleves.forEach(e=>{ e.classe = s.classe; });
      l.slice(1).forEach((dk,k)=>{
        dk.eleves.forEach(e=>{ e.classe = autres[k].classe; e._seance = autres[k]; e._d = dk; });
        d.eleves = d.eleves.concat(dk.eleves);
        Object.keys(dk.parBloc||{}).forEach(b=>{ d.parBloc[b] = (d.parBloc[b]||0) + dk.parBloc[b]; });
        d.tresor = (Number(d.tresor)||0) + (Number(dk.tresor)||0);   // plusieurs classes affichées ensemble : leurs étoiles s'additionnent
      });
      d._classes = [s.classe].concat(autres.map(x=>x.classe));
      contexteAffiche = contexte; dessine(d);
    }).catch(err=>{ if(demande===numeroChargement) erreur(err); });
  }
  return new Promise(fin=>google.script.run.withSuccessHandler(d=>{if(demande===numeroChargement&&$("cours").value===cours&&choisie().debut===s.debut){d._allerRetour=Date.now()-depart;contexteAffiche=contexte;dessine(d);}fin();}).withFailureHandler(err=>{if(demande===numeroChargement)erreur(err);fin();}).donnees(cours, s.debut, s.fin, s.classe));
}
/* Rafraîchissement : le tour suivant part RAFRAICHIR après la réponse du précédent, jamais avant — un serveur lent
   n'empile pas les appels. Onglet caché : plus aucun appel ; au retour, un tour tout de suite. Une réponse qui
   n'arrive pas en 60 s n'arrête pas la boucle. */
let minuterieTableau=0,tourEnCours=false;
function planifieCharge(){clearTimeout(minuterieTableau);minuterieTableau=document.hidden||tourEnCours?0:setTimeout(tourCharge,RAFRAICHIR);}
function tourCharge(){
  if(tourEnCours) return;
  clearTimeout(minuterieTableau);minuterieTableau=0;tourEnCours=true;
  Promise.race([Promise.resolve(charge()),new Promise(fin=>setTimeout(fin,60000))]).catch(()=>{}).finally(()=>{tourEnCours=false;planifieCharge();});
}
function rafraichitSelonOnglet(){
  if(document.hidden){clearTimeout(minuterieTableau);minuterieTableau=0;}
  else tourCharge();
}


/* Données fictives : l'aperçu hors Apps Script. */
function demo(){
  const t = Date.now(), m = 60000;
  const e = (email, atteint, erreurs, erreursIci, derniere, extra) => Object.assign({email, atteint, erreurs, erreursIci, aide:null, fini:false, derniere:t-derniere*m, humeur:"", avis:null}, extra||{});
  const vr = (...l) => l.map(([erreurs,eleves],k)=>({v:k+1, erreurs, eleves}));
  return { maintenant:t, tresor:57, parBloc:{1:2,4:5,5:3,6:9,8:4,9:6,10:2,12:1},
    variantes:{1:vr([1,3],[1,2],[0,3]), 4:vr([1,3],[4,3],[0,2]), 6:vr([2,3],[1,2],[6,3]), 9:vr([2,2],[2,3],[2,3])}, eleves:[
    e("lina.dubois@arcampin.be",5,7,4,1,{aide:{bloc:6,depuis:t-3*m,motif:"consigne"}, humeur:"🙁 Pas top"}),
    e("noah.martin@arcampin.be",9,3,1,0,{depuisBloc:t-2*m, humeur:"🙂 Bien", phrases:{2:"Parce que le message dit la ligne où chercher, sinon je change des trucs au hasard."}}),
    e("ines.lambert@arcampin.be",12,2,0,2,{fini:true, humeur:"😄 Super", avis:{plu:"Les questions pour passer au bloc suivant, on sait tout de suite si c'est juste.", progres:"Ça coince ? quand je me trompais.", gene:""}}),
    e("adam.peeters@arcampin.be",3,5,3,1,{depuisBloc:t-9*m, humeur:"😣 Pas bien"}),
    e("lucas.renard@arcampin.be",4,1,1,2,{depuisBloc:t-14*m, humeur:"😐 Bof"}),
    e("sara.janssens@arcampin.be",7,4,0,11,{phrases:{2:"Si je lis pas le message je sais pas quelle erreur c'est."}}),
    e("yanis.leroy@arcampin.be",8,6,2,0,{aide:{bloc:9,depuis:t-1*m,motif:"accord"}, humeur:"😐 Bof"}),
    e("emma.dupont@arcampin.be",12,1,0,1,{fini:true, humeur:"🙂 Bien", avis:{plu:"Travailler à mon rythme.", progres:"Refaire le programme moi-même.", gene:"Attendre que la page charge au début."}})
  ]};
}

function demoSeances(){
  const t = Date.now(), h = 3600000;
  return [{classe:"1C", debut:t-40*60000, fin:null}, {classe:"1B", debut:t-2*h, fin:t-40*60000}, {classe:"2F", debut:t-26*h, fin:t-2*h}];
}

/* Ouvrir le cours pour une ou plusieurs classes (deux classes prises ensemble) : la séance de cette année de
   chaque classe est reprise, même avancement et même suivi ; la première fois, elle est créée (ouvrirSeances).
   « Recommencer à zéro », rare, crée une nouvelle séance : les élèves repartent du bloc 1 (nouvelleSeance). */
$("nouvelle").addEventListener("click", async()=>{
  const bouton=$("nouvelle");bouton.disabled=true;
  try{
    if(!CL)await chargeClasses();
    const noms=Object.keys(CL?.classes||{}).sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));
    if(!noms.length){erreur(Error('La liste des classes est vide ou indisponible. Vérifie le panneau Classes et cours.'));return;}
    const zone=$("dlg-classes");
    zone.replaceChildren(txt("legend",null,"Classes"),...noms.map(n=>{
      const lab=txt("label","filtre-aide"),cb=txt("input");
      cb.type="checkbox";cb.name="classe";cb.value=n;lab.append(cb,txt("span",null,n));return lab;}));
    $("dlg").returnValue="";$("dlg").showModal();zone.querySelector("input").focus();
  }finally{bouton.disabled=false;}
});
/* Terminer : la séance en cours s'arrête, les élèves ne sont plus envoyés sur ce cours. Rien n'est effacé. */
function etatTerminer(){
  const i=Number($("seance").value),s=SEANCES[i]||{};
  $("terminer").hidden=!enCours(s,i);
  /* Reprendre : la plus récente DE SA CLASSE, expirée (3 h) ou terminée, redevient la séance de ses élèves, même suivi. */
  $("reprendre-seance").hidden=!(s.debut && derniere(s,i) && s.active===false);
  $("reprendre-seance").textContent="Rouvrir pour "+(s.classe||"la classe");
}
$("seance").addEventListener("change", ()=>{etatTerminer();chargeSequence();});
$("terminer").addEventListener("click", ()=>{
  const s=choisie();if(!s||!s.debut)return;
  if(!confirm("Terminer la séance "+s.classe+" ? Les élèves ne seront plus envoyés sur ce cours. Rien n'est effacé."))return;
  if(!SUIVI){ remplitSeances(SEANCES.map(x=>x===s?Object.assign({},x,{active:false}):x),s.debut); return; }
  const b=$("terminer");b.disabled=true;
  google.script.run.withSuccessHandler(l=>{b.disabled=false;remplitSeances(l,s.debut);}).withFailureHandler(e=>{b.disabled=false;erreur(e);}).terminerSeance($("cours").value, s.debut);
});
$("reprendre-seance").addEventListener("click", ()=>{
  const s=choisie();if(!s||!s.debut)return;
  if(!confirm("Reprendre la séance "+s.classe+" du "+heure(s.debut)+" ? Les élèves y sont renvoyés pour 3 h ; leur progression et le suivi restent ceux de cette séance."))return;
  if(!SUIVI){ remplitSeances(SEANCES.map(x=>x===s?Object.assign({},x,{active:true}):x),s.debut); return; }
  const b=$("reprendre-seance");b.disabled=true;
  google.script.run.withSuccessHandler(l=>{b.disabled=false;remplitSeances(l,s.debut);$("maj").textContent="Séance reprise.";}).withFailureHandler(e=>{b.disabled=false;erreur(e);}).reprendreSeance($("cours").value, s.debut);
});
$("dlg").addEventListener("close", async()=>{
  const quoi=$("dlg").returnValue, cours=$("cours").value;
  const choix=[...$("dlg-classes").querySelectorAll("input:checked")].map(c=>c.value);
  if(quoi!=="ok"&&quoi!=="zero")return;
  if(!choix.length){erreur(Error("Coche au moins une classe."));return;}
  const zero=quoi==="zero", qui=choix.join(" et ");
  if(zero&&!confirm("Recommencer à zéro pour "+qui+" ? Les élèves repartent du bloc 1. Rien n'est effacé : l'ancienne séance reste dans la liste."))return;
  /* La première classe cochée est la séance affichée ; les autres s'ajoutent à « Voir aussi ». */
  const affiche=liste=>{
    if(choix.length>1){classesVues=classesVues.filter(c=>!choix.includes(c)).concat(choix.slice(1));
      try{localStorage.setItem("tableau:classes-vues",JSON.stringify(classesVues));}catch(e){}contexteAffiche="";}
    const s=liste.find((x,k)=>x.classe===choix[0]&&derniere(x,k));
    remplitSeances(liste,s?s.debut:undefined);
    $("maj").textContent=(zero?"Nouvelle séance : ":"Cours ouvert : ")+qui+".";
  };
  if(!SUIVI){
    let l=SEANCES.map((x,k)=>Object.assign({},x,{derniere:derniere(x,k)}));
    choix.forEach((c,n)=>{const i=l.findIndex(x=>x.classe===c&&x.derniere);
      if(!zero&&i>=0){l[i]=Object.assign({},l[i],{active:true});return;}
      const t=Date.now()-n;l=[{classe:c,debut:t,fin:null,derniere:true},...l.map(x=>x.classe===c&&x.derniere?Object.assign({},x,{derniere:false,fin:t}):x)];});
    affiche(l);return;
  }
  const b=$("nouvelle");b.disabled=true;
  try{
    let l;
    if(zero)for(const c of choix)l=await serveur("nouvelleSeance",cours,c);
    else l=await serveur("ouvrirSeances",cours,choix);
    affiche(l);
  }catch(e){
    erreur(/ouvrirSeances/.test(String(e&&e.message||e))?Error("le serveur Apps Script n'est pas à jour : redéploie Code.gs (branche main), puis recharge le tableau."):e);
  }finally{b.disabled=false;}
});

/* ===== Mode séquence =====
   Le contenu vient de sequences.json (le serveur le lit ; l'aperçu le charge à côté de cette page).
   Le serveur tient le moment en cours : la fiche de l'élève n'affiche que lui.
   À l'écran, rien de nominatif : les noms restent dans l'onglet Journal. */
const SEQ = { contenu:null, etat:null, rep:null, depuis:0, montre:false, choisi:null, minuterie:null };
const cleSeq = quoi => "pas-a-pas-seq:" + $("cours").value + ":" + (SEQ.etat ? SEQ.etat.lance : 0) + ":" + quoi;
const litSeq = (quoi, defaut) => { try { return JSON.parse(localStorage.getItem(cleSeq(quoi))) ?? defaut; } catch(e){ return defaut; } };
const ecritSeq = (quoi, v) => { try { localStorage.setItem(cleSeq(quoi), JSON.stringify(v)); } catch(e){} };

/* Un seul chemin vers le serveur ; sans Apps Script, une imitation pour l'aperçu.
   « Répéter sans les élèves » (SEQ.apercu) : le pilotage reste sur ce poste, même dans le tableau scolaire.
   Aucune séance n'est nécessaire, rien n'est écrit, aucun poste élève ne change ; les réponses sont fictives. */
const PILOTAGE = ["piloter", "reprendreSequence", "arreterSequence", "reponses", "partagerCommun"];
function serveur(fn, ...args){
  if(SUIVI && !(SEQ.apercu && PILOTAGE.includes(fn))) return new Promise((ok, ko) => google.script.run.withSuccessHandler(ok).withFailureHandler(ko)[fn](...args));
  return Promise.resolve(DEMO_SEQ[fn](...args));
}
let DEMO_CONTENU = null, DEMO_ETAT = null;
const DEMO_SEQ = {
  sequence: () => fetch("sequences.json").then(r=>r.json()).then(j=>{ DEMO_CONTENU = j; return { sequence: j[$("cours").value] || null, etat: DEMO_ETAT }; }).catch(()=>({ sequence:null, etat:null })),
  piloter: (cours, i, phase, nouvelle) => {
    const m = SEQ.contenu.moments[i];
    DEMO_ETAT = { lance: nouvelle || !DEMO_ETAT ? Date.now() : DEMO_ETAT.lance, i, phase: phase || (m.type==="vote" ? "ouvert" : "") };
    return DEMO_ETAT;
  },
  reprendreSequence: () => DEMO_ETAT,
  partagerCommun: () => false,
  arreterSequence: () => { DEMO_ETAT = null; return null; },
  reponses: (cours, i) => {
    const m = SEQ.contenu.moments[i], t = Math.floor((Date.now() - DEMO_ETAT.lance) / 4000);
    // Réponses fictives : celles du moment (« exemples » dans sequences.json), sinon des réponses neutres.
    const mots = (m.exemples || [["réponse A",5],["réponse B",4],["réponse C",3],["réponse D",2],["réponse E",1]])
      .slice(0, Math.min(12, 3 + t)).map(([texte,n])=>({ cle:texte, texte, n }));
    return { maintenant: Date.now(), repondants: Math.min(21, 4 + 2*t), mots: m.type==="vote" ? [] : mots,
      votes: m.type==="vote" ? m.situations.map((_,k)=>m.choix.map((_,j)=>j===(k % m.choix.length) ? 15 : 3)) : [] };
  }
};

/* L'état dans l'en-tête du tableau : lancer, reprendre, arrêter. */
function dessineEtatSeq(){
  const z = $("seq-etat"); z.replaceChildren();
  dessineConducteur();
  if(!SEQ.contenu){ z.hidden = true; return; }
  z.hidden = false;
  const b = (t, cls, f) => { const x = txt("button", "btn "+cls, t); x.type = "button"; x.addEventListener("click", f); z.append(x); };
  if(SEQ.apercu){ z.append(txt("span","maj","Répétition en cours, sans les élèves")); return; }
  if(SEQ.etat){
    z.append(txt("span","maj","Cours collectif en cours · moment "+(SEQ.etat.i+1)+" / "+SEQ.contenu.moments.length));
    b("Reprendre le cours collectif", "", ()=>serveur("reprendreSequence", $("cours").value, choisie().classe).then(e=>{ SEQ.etat = e; ouvreProjection(); }).catch(erreur));
    b("Arrêter", "vide", ()=>serveur("arreterSequence", $("cours").value, choisie().classe).then(()=>{ SEQ.etat = null; dessineEtatSeq(); }).catch(erreur));
  } else if(SEANCES.length) b("Lancer le cours collectif", "", ()=>allerA(0, "", true));
  else z.append(txt("span","maj","Pour lancer avec la classe : Ouvrir pour une classe…"));
  b("Répéter sans les élèves", "vide", repeter);
}
/* Voir la projection avant le cours : rien ne part au serveur, la séquence réelle de la classe n'est pas touchée. */
function repeter(){
  SEQ.reel = SEQ.etat; SEQ.apercu = true; SEQ.etat = null; SEQ.depuis = 0;
  allerA(0, "", true);
}
function finRepetition(){
  SEQ.apercu = false; SEQ.etat = SEQ.reel || null; SEQ.reel = null; SEQ.depuis = 0; SEQ.rep = null;
  dessineEtatSeq();
}
function dessineConducteur(){
  const c = SEQ.contenu, panneau = $("conducteur");
  panneau.hidden = !c;
  if(!c) return;
  $("conducteur-titre").textContent = "Cours collectif — " + c.titre;
  const duree = c.moments.reduce((n,m)=>n+(m.min||0),0);
  $("conducteur-objectif").textContent = (c.objectif || "") + " · Environ " + duree + " min, à adapter au groupe.";
  const prep = $("conducteur-preparation"); prep.replaceChildren();
  if(c.rappel){ const p = txt("p"), a = txt("a","btn vide","Rappel à projeter en début de cours ↗"); a.href = c.rappel; a.target = "_blank"; a.rel = "noopener"; p.append(a); prep.append(p); }
  (c.preparation || []).forEach(t=>prep.append(txt("p",null,t)));
  (c.competences || []).forEach(t=>prep.append(txt("p","astuce",t)));
  const liste = $("conducteur-liste"); liste.replaceChildren();
  let cumul=0;
  c.moments.forEach((m,i)=>{
    const debut=cumul;cumul+=m.min||0;
    const li = txt("li"), b = txt("button","btn vide",m.titre+" · ≈"+(m.min||0)+" min · repère "+debut+"–"+cumul+" min");
    b.type="button"; b.addEventListener("click",()=>allerA(i)); li.append(b);
    if(m.type === "atelier") li.append(txt("p","atelier-note","Fiches accessibles pendant ce moment."));
    (m.lignes || []).forEach(t=>li.append(txt("p",null,t)));
    (m.questions || []).forEach(t=>li.append(txt("p",null,"À demander : "+t)));
    if(m.code) li.append(txt("pre","programme-projete",m.code));
    if(m.trace) li.append(tableTrace(m.trace));
    if(m.exemple) li.append(txt("p",null,m.exemple));
    if(m.repere) li.append(txt("p","astuce",m.repere));
    if(m.blocs){
      const liens = txt("p",null,"Fiche élève : ");
      liens.append(lienBloc(m.blocs[0],"bloc "+m.blocs[0]));
      if(m.blocs[1]!==m.blocs[0]) liens.append(" à ", lienBloc(m.blocs[1],"bloc "+m.blocs[1]));
      li.append(liens);
    }
    liste.append(li);
  });
}
function tableTrace(lignes){
  const table = txt("table","trace-projetee");
  lignes.forEach((ligne,i)=>{ const tr=txt("tr"); ligne.forEach(t=>tr.append(txt(i ? "td" : "th",null,t))); table.append(tr); });
  return table;
}
/* Le cours collectif de la classe de la séance choisie : chaque classe a le sien. */
let demandeSequence = 0;
function chargeSequence(frais = false){
  const demande = ++demandeSequence;
  SEQ.contenu = null; SEQ.etat = null; dessineEtatSeq();
  serveur("sequence", $("cours").value, frais, choisie().classe).then(r=>{ if(demande !== demandeSequence) return; SEQ.contenu = r.sequence; SEQ.etat = r.etat; dessineEtatSeq(); }).catch(()=>{});
}

function allerA(i, phase, nouvelle){
  const n = SEQ.contenu.moments.length;
  if(i < 0 || i >= n) return;
  serveur("piloter", $("cours").value, i, phase || "", !!nouvelle, choisie().classe).then(e=>{
    if(!SEQ.etat || e.i !== SEQ.etat.i || nouvelle){ SEQ.depuis = Date.now(); SEQ.montre = false; SEQ.choisi = null; SEQ.rep = null; }
    SEQ.etat = e; ouvreProjection();
    const s = choisie(); if(!SEQ.apercu && s.plafond){ delete s.plafond; delete s.messagePlafond; dessinePlafond(); }   // piloter() a levé le blocage
  }).catch(erreur);
}
function ouvreProjection(){
  $("projection").hidden = false; document.body.style.overflow = "hidden";
  if(!SEQ.depuis) SEQ.depuis = Date.now();
  dessineEtatSeq(); scene(); rafraichitReponses();
  clearInterval(SEQ.minuterie);
  SEQ.minuterie = setInterval(()=>{ chrono(); rafraichitReponses(); }, 3000);
}
function fermeProjection(){
  $("projection").hidden = true; document.body.style.overflow = "";
  clearInterval(SEQ.minuterie);
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  if(SEQ.apercu) finRepetition();
}
const momentCourant = () => SEQ.contenu.moments[SEQ.etat.i];
/* Le moment dont on lit les réponses : le tri range les mots récoltés plus tôt. */
const momentLu = () => { const m = momentCourant(); return m.type === "tri" ? m.source : ["mots","vote"].includes(m.type) ? SEQ.etat.i : null; };

/* Toutes les 3 s en projection, mais pas tant que la réponse précédente n'est pas revenue, ni onglet caché. */
function rafraichitReponses(){
  if(!SEQ.etat || $("projection").hidden || document.hidden || SEQ.lecture) return;
  const i = momentLu(); if(i == null) return;
  const avant = SEQ.etat.i;
  SEQ.lecture = true;
  serveur("reponses", $("cours").value, i, choisie().classe).then(r=>{ if(SEQ.etat && SEQ.etat.i === avant){ SEQ.rep = r; scene(); } }).catch(erreur).finally(()=>{ SEQ.lecture = false; });
}

function chrono(){
  const m = momentCourant(), s = Math.floor((Date.now() - SEQ.depuis)/1000);
  const c = $("seq-chrono");
  c.textContent = Math.floor(s/60) + ":" + String(s%60).padStart(2,"0") + (m.min ? " / ≈" + m.min + " min" : "");
  c.classList.toggle("depasse", !!m.min && s > m.min*60);
}

/* L'action propre au moment, dans la barre du bas. */
function action(){
  const m = momentCourant(), a = $("seq-action"), ph = SEQ.etat.phase;
  let t = "", f = null;
  if(m.type === "mots" && !SEQ.montre){ t = "Montrer les mots"; f = ()=>{ SEQ.montre = true; scene(); }; }
  if(m.type === "vote" && ph === "ouvert"){ t = "Clore le vote"; f = ()=>allerA(SEQ.etat.i, "clos"); }
  if(m.type === "vote" && ph === "clos"){ t = m.situations.some(s => s.bonne != null) ? "Montrer la bonne réponse" : "Montrer la mise en commun"; f = ()=>allerA(SEQ.etat.i, "corrige"); }
  if(m.saisie){   // réponse écrite (saisie « texte ») : afficher, clore, corriger
    if(ph === 'corrige'){ t=''; f=null; }
    else if(ph === 'clos'){ t='Corriger ensemble'; f=()=>allerA(SEQ.etat.i,'corrige'); }
    else if(SEQ.montre){ t='Clore les réponses'; f=()=>allerA(SEQ.etat.i,'clos'); }
    else { t='Afficher les réponses'; f=()=>{ SEQ.montre=true; scene(); }; }
  }
  a.hidden = !f; a.textContent = t; a.onclick = f;
}

/* « Aussi sur les postes » : ce qui est projeté part aussi vers les postes des élèves (cours à distance, ou élève
   qui voit mal le tableau). Exactement l'écran projeté, rien de plus : les mots seulement une fois montrés, sans les
   mots masqués ; les barres seulement une fois le vote clos. Éteint, les postes ne reçoivent rien.
   Le choix est gardé sur ce navigateur ; allumé par défaut (Vincent, 24/11/2026). */
const PARTAGE = { actif: true, dernier: "" };
try { PARTAGE.actif = localStorage.getItem("pas-a-pas-partage") !== "non"; } catch(e){}
function communCourant(){
  if(!PARTAGE.actif || !SEQ.etat) return null;
  const m = momentCourant(), r = SEQ.rep, ph = SEQ.etat.phase || "", c = { i: SEQ.etat.i, phase: ph };
  const masques = litSeq("masques", []), visibles = r ? r.mots.filter(x=>!masques.includes(x.cle)) : [];
  const mot = x => ({ texte: x.texte, n: x.n });
  if(m.type === "ecran" && !m.visuel && !SEQ.contenu.ecransSurPostes)
    c.ecran = { lignes: m.lignes || [], questions: m.questions || [], paires: m.paires || [], exemple: m.exemple || "" };
  if(m.type === "mots" && SEQ.montre && r) c.mots = visibles.map(mot);
  if(m.type === "tri" && r){
    const place = litSeq("tri", {});
    c.tri = { reserve: visibles.filter(x=>place[x.cle] == null).map(mot),
      colonnes: m.colonnes.map((titre, k)=>({ titre, mots: visibles.filter(x=>place[x.cle] === k).map(mot) })) };
  }
  if(m.type === "vote" && ph !== "ouvert" && r) c.votes = m.situations.map((_, k)=>m.choix.map((_, j)=>(r.votes[k] || [])[j] || 0));
  return c;
}
function pousseCommun(){
  if(!SEQ.etat || SEQ.apercu) return;
  // Un serveur pas encore republié ne connaît pas partagerCommun : on se tait.
  if(SUIVI && typeof google.script.run.partagerCommun !== "function") return;
  const snap = communCourant(), cle = $("cours").value + "|" + choisie().classe + "|" + SEQ.etat.lance + "|" + JSON.stringify(snap);
  if(cle === PARTAGE.dernier) return;
  PARTAGE.dernier = cle;
  serveur("partagerCommun", $("cours").value, choisie().classe, snap).catch(()=>{ PARTAGE.dernier = ""; });
}
/* L'interrupteur vit dans la barre de commande de la projection ; posé ici pour qu'une page gardée en cache l'ait aussi. */
function interrupteurPartage(){
  if($("seq-partage") || !$("seq-action")) return;
  const l = txt("label", "partage"), cb = txt("input"); cb.type = "checkbox"; cb.id = "seq-partage"; cb.checked = PARTAGE.actif;
  l.title = "Ce qui est projeté s’affiche aussi sur les postes des élèves. Décoche pour garder tous les regards au tableau.";
  cb.addEventListener("change", ()=>{ PARTAGE.actif = cb.checked; try { localStorage.setItem("pas-a-pas-partage", cb.checked ? "oui" : "non"); } catch(e){} pousseCommun(); });
  l.append(cb, document.createTextNode(" Aussi sur les postes"));
  $("seq-action").before(l);
}

function scene(){
  const m = momentCourant(), n = SEQ.contenu.moments.length, r = SEQ.rep;
  interrupteurPartage();
  const box = txt("div");
  if(SEQ.contenu.classe) box.classList.add(SEQ.contenu.classe);   // l'habillage du cours (sequences.json)
  // Un moment peut porter un « visuel » (Visuels[nom], chargé par la page) : il remplace ses lignes et sa correction,
  // qui en sont la version texte, lue si le visuel n'est pas chargé.
  const vis = m.visuel && window.Visuels && Visuels[m.visuel] ? Visuels[m.visuel]({ corrige: SEQ.etat.phase === "corrige" }) : null;
  box.append(txt("p","sur", m.titre));
  $("seq-ou").replaceChildren(...(SEQ.apercu ? [txt("b","apercu-marque","Répétition — rien n’est envoyé, réponses fictives · ")] : []), txt("b",null,(SEQ.etat.i+1)+" / "+n+" · "+m.titre), " — "+(m.methode||""));
  $("seq-prec").disabled = SEQ.etat.i === 0;
  $("seq-suiv").disabled = SEQ.etat.i === n-1;
  if(vis && m.type === "ecran") box.append(...(m.question ? [txt("h2","grand",m.question)] : []), vis);
  if(!vis && (m.type === "ecran" || m.type === "fin" || m.type === "atelier")){
    (m.lignes||[]).forEach((l,k)=>box.append(txt(k ? "p" : "h2", k ? "moyen" : "grand", l)));
    if(m.paires){ const g = txt("div","paires"); m.paires.forEach(([a,b])=>{ const c = txt("div","paire"); c.append(txt("b",null,a), txt("span",null,b)); g.append(c); }); box.append(g); }
    if(m.exemple && !m.trace) box.append(txt("p","exemple", m.exemple));   // avec un tableau (trace), l'exemple est la version texte des postes élèves
  }
  if(m.code) box.append(txt("pre","programme-projete",m.code));
  if(m.trace) box.append(tableTrace(m.trace));
  if(m.questions){
    const q = txt("div","questions-orales");
    m.questions.forEach(t=>q.append(txt("p",null,t))); box.append(q);
  }
  if(m.type === "atelier"){
    box.append(txt("p","atelier-note","Travail autonome : les fiches restent accessibles sur les postes."));
    if(m.blocs){ const l=txt("p"); l.append(lienBloc(m.blocs[0],"Voir le bloc "+m.blocs[0]+" en aperçu")); box.append(l); }
  }
  if(m.repere){
    const d=txt("details","repere-prof"); d.append(txt("summary",null,"Repère professeur — visible si ouvert au projecteur"),txt("p",null,m.repere)); box.append(d);
  }
  if(m.type === "mots"){
    box.append(txt("h2","grand", m.question));
    if(m.saisie === 'texte'){   // la situation (ou son visuel), les champs à remplir, puis la correction
      if(vis) box.append(vis); else (m.lignes||[]).forEach(l=>box.append(txt('p','ecrire-situation',l)));
      if(m.champs && m.champs.length > 1) box.append(txt('p','ecrire-situation','À remplir : '+m.champs.join(' · ')));
      box.append(txt('p','moyen',SEQ.etat.phase==='corrige'?'ENSEMBLE — compare ta réponse à la correction.':SEQ.etat.phase==='clos'?'RÉPONSES FERMÉES — juste ou faux ? Explique avec la règle.':'À TOI D’ÉCRIRE — chacun seul, sur ton écran.'));
    }
    const masques = litSeq("masques", []);
    const mots = r ? r.mots.filter(x=>!masques.includes(x.cle)) : [];
    // Saisie écrite à plusieurs champs : l'ordre des champs (Salutation, Formule de fin, Signature), puis le
    // nombre d'élèves. Le serveur trie par nombre puis par ordre alphabétique (« Formule » avant « Salutation »).
    if(m.saisie === 'texte' && m.champs && m.champs.length > 1){
      const rang = x => { const k = m.champs.findIndex(c => x.texte.startsWith(c + ' :')); return k < 0 ? m.champs.length : k; };
      mots.sort((a, b) => rang(a) - rang(b) || b.n - a.n);
    }
    if(!SEQ.montre){
      box.append(txt("div","compteur", r ? r.repondants : "…"), txt("p","moyen", (r && r.repondants === 1 ? "élève a" : "élèves ont") + (m.saisie === "texte" ? " répondu. Écris ta réponse sur ton poste." : " répondu. Tape tes mots sur ton poste.")));
    } else {
      const max = Math.max(1, ...mots.map(x=>x.n)), nu = txt("div","nuage");
      if(!mots.length) nu.append(txt("p","moyen","Pas encore de mot."));
      mots.forEach(x=>{
        const s = txt("span","mot", x.texte); s.style.fontSize = "clamp(1.2rem," + (1.6 + 2.6*x.n/max).toFixed(2) + "vw,5rem)";
        if(x.n > 1) s.append(txt("sup",null,"×"+x.n));
        const k = txt("button","masquer","×"); k.type = "button"; k.title = "Masquer ce mot (il reste dans le Journal)";
        k.addEventListener("click", ()=>{ ecritSeq("masques", [...litSeq("masques", []), x.cle]); scene(); });
        s.append(k); nu.append(s);
      });
      box.append(nu);
    }
    // « On écrit ensemble » corrigé : la correction sous les réponses, qui restent visibles pour la discussion.
    if(m.saisie === 'texte' && SEQ.etat.phase === 'corrige' && !vis){ const c=txt('div','correction-texte'); (m.correction||[]).forEach(l=>c.append(txt('p',null,l))); box.append(c); }
  }
  if(m.type === "tri") box.append(tri(m, r));
  if(m.type === "vote") box.append(vote(m, r, SEQ.etat.phase));
  $("scene").replaceChildren(box);
  action(); chrono(); pousseCommun();
}

/* Mise en commun : glisser un mot dans une colonne, ou cliquer le mot puis la colonne. */
function tri(m, r){
  const masques = litSeq("masques", []), place = litSeq("tri", {});
  const mots = r ? r.mots.filter(x=>!masques.includes(x.cle)) : [];
  const ranger = (cle, col) => { const p = litSeq("tri", {}); if(col == null) delete p[cle]; else p[cle] = col; ecritSeq("tri", p); SEQ.choisi = null; scene(); };
  const jeton = x => {
    const j = txt("button","jeton"+(SEQ.choisi === x.cle ? " choisi" : ""), x.texte); j.type = "button"; j.draggable = true;
    j.addEventListener("dragstart", e=>{ e.dataTransfer.setData("text/plain", x.cle); });
    j.addEventListener("click", e=>{ e.stopPropagation(); SEQ.choisi = SEQ.choisi === x.cle ? null : x.cle; scene(); });
    return j;
  };
  const cible = (zone, col) => {
    zone.addEventListener("dragover", e=>{ e.preventDefault(); zone.classList.add("cible"); });
    zone.addEventListener("dragleave", ()=>zone.classList.remove("cible"));
    zone.addEventListener("drop", e=>{ e.preventDefault(); ranger(e.dataTransfer.getData("text/plain"), col); });
    zone.addEventListener("click", ()=>{ if(SEQ.choisi) ranger(SEQ.choisi, col); });
  };
  const t = txt("div","tri"), res = txt("div","reserve");
  const libres = mots.filter(x=>place[x.cle] == null);
  if(!libres.length) res.append(txt("span","maj", mots.length ? "Tous les mots sont rangés." : "Pas de mot récolté."));
  libres.forEach(x=>res.append(jeton(x)));
  cible(res, null);
  const cols = txt("div","colonnes");
  m.colonnes.forEach((c,k)=>{
    const z = txt("div","colonne"+(m.colonnes.length === 3 && k === 1 ? " milieu" : "")), l = txt("div","liste");
    z.append(txt("h3",null,c), l);
    mots.filter(x=>place[x.cle] === k).forEach(x=>l.append(jeton(x)));
    cible(z, k); cols.append(z);
  });
  t.append(res, cols);
  return t;
}

/* Vote : le nombre de votants pendant le vote, les barres après la clôture, la bonne réponse ensuite. */
function situationVote(texte, numero){
  if(!$("cours").value.startsWith("python-")) return txt("p","moyen",numero+". "+texte);
  const zone = txt("div","situation");
  const pre = txt("pre","programme-projete");
  pre.append(txt("code",null,texte));
  zone.append(txt("p","moyen","Programme "+numero),pre);
  return zone;
}
function vote(m, r, phase){
  const z = txt("div","situations");
  z.append(txt("h2","grand", m.question));
  if(phase === "ouvert"){
    z.style.textAlign = "center";
    z.append(txt("div","compteur", r ? r.repondants : "…"), txt("p","moyen", (r && r.repondants === 1 ? "élève a" : "élèves ont") + " voté. Vote sur ton poste."));
    m.situations.forEach((s,k)=>z.append(situationVote(s.texte,k+1)));
    return z;
  }
  m.situations.forEach((s,k)=>{
    const d = txt("div","situation"); d.append(situationVote(s.texte,k+1));
    const c = (r && r.votes[k]) || [], tot = m.choix.reduce((a,_,j)=>a+(c[j]||0), 0), b = txt("div","barres");
    m.choix.forEach((ch,j)=>{
      const v = c[j] || 0, bon = phase === "corrige" && s.bonne === j;
      const l = txt("div","vb"+(bon ? " bonne" : "")), w = txt("div"), g = txt("div","jauge");
      g.style.width = (tot ? v/tot*100 : 0) + "%"; w.append(g);
      l.append(txt("span",null,(bon ? "✓ " : "")+ch), w, txt("span","num", v+(tot ? " · "+Math.round(v/tot*100)+" %" : "")));
      b.append(l);
    });
    d.append(b);if(phase === "corrige" && s.explication)d.append(txt("p","moyen",s.explication));z.append(d);
  });
  return z;
}

$("seq-prec").addEventListener("click", ()=>allerA(SEQ.etat.i-1));
$("seq-suiv").addEventListener("click", ()=>allerA(SEQ.etat.i+1));
$("seq-tableau").addEventListener("click", fermeProjection);
$("seq-plein").addEventListener("click", ()=>document.fullscreenElement ? document.exitFullscreen() : $("projection").requestFullscreen().catch(()=>{}));
/* Clavier et télécommande de présentation (elle envoie Page suivante / Page précédente). */
document.addEventListener("keydown", e=>{
  if($("projection").hidden || e.target.closest("input,select,textarea")) return;
  if(["ArrowRight","PageDown"].includes(e.key) || (e.key === " " && e.target === document.body)){ e.preventDefault(); allerA(SEQ.etat.i+1); }
  else if(["ArrowLeft","PageUp"].includes(e.key)){ e.preventDefault(); allerA(SEQ.etat.i-1); }
  else if(e.key === "f" || e.key === "F") $("seq-plein").click();
});

$("conducteur-actualiser").addEventListener("click",()=>chargeSequence(true));

/* ===== Mes cours : classes, cours ouverts, classe de chaque élève ===== */
let CL = null;
const DEMO_CL = {
  fil: [],
  d: { cours:[],
       classes:{ "2B":["messagerie-1"], "2E":["messagerie-1"], "3F":["python-1"] },
       modes:{}, chats:{}, classroom:["2B","3F"],
       eleves:[{email:"lea.dupont@arcampin.be",classe:"2B"},{email:"noah.martin@arcampin.be",classe:"2E"},{email:"sami.benali@arcampin.be",classe:"2B"}] },
  classesEtCours(){ return this.d; },
  devoirsClasse(c){ const j = 86400000, t = Date.now();
    return { classe:c, lien:"https://classroom.google.com/", travaux:[
        { id:"b", titre:"Mon premier message", echeance:t + 2 * j, sur:10, lien:"" }, { id:"a", titre:"Le tour de Drive", echeance:t - 5 * j, sur:20, lien:"" }],
      eleves:[{ nom:"Léa Dupont", remises:{ a:{ etat:"corrige", note:16.5 }, b:{ etat:"rendu" } } },
        { nom:"Noah Martin", remises:{ a:{ etat:"retard" }, b:{ etat:"a-rendre" } } },
        { nom:"Sami Benali", remises:{ a:{ etat:"corrige", note:11 } } }] }; },
  ajouterClasse(c){ this.d.classes[c] = this.d.classes[c] || []; return this.d; },
  retirerClasse(c){ delete this.d.classes[c]; return this.d; },
  activerCours(c, k, oui){ const l = this.d.classes[c].filter(x=>x!==k); if(oui) l.push(k); this.d.classes[c] = l; return this.d; },
  modeCours(c, k, min){ this.d.modes[c] = { debut: Date.now(), jusqua: Date.now() + min * 60000, cours: k }; return this.d; },
  arreterModeCours(c){ delete this.d.modes[c]; return this.d; },
  chatOuvrir(c, min){ this.d.chats[c] = { debut: Date.now(), jusqua: Date.now() + min * 60000, muets: [] }; this.fil = []; return this.d.chats; },
  chatFermer(c){ delete this.d.chats[c]; return this.d.chats; },
  chatLire(depuis, c){ const s = this.d.chats[c]; if(!s) return { ouvert:false };
    return { ouvert:true, classe:c, salon:s.debut, jusqua:s.jusqua, muet:false, muets:s.muets, dernier:this.fil.length,
      masques:this.fil.filter(m=>m.masque).map(m=>m.id), messages:this.fil.filter(m=>m.id > depuis).map(m=>({ ...m })) }; },
  chatEcrire(t, depuis, c){ this.fil.push({ id:this.fil.length + 1, t:Date.now(), nom:"Le professeur", email:"prof@arcampin.be", texte:t, moi:true, masque:false }); return this.chatLire(depuis, c); },
  chatMasquer(c, id, oui){ this.fil.find(m=>m.id === id).masque = oui; return this.chatLire(0, c); },
  chatParole(c, e, oui){ const s = this.d.chats[c]; s.muets = s.muets.filter(x=>x !== e); if(oui) s.muets.push(e); return this.chatLire(0, c); },
  changerClasse(e, c){ if(c) this.d.eleves.find(x=>x.email===e).classe = c; else this.d.eleves = this.d.eleves.filter(x=>x.email!==e); return this.d; }
};
function serveurCl(fn, ...args){
  if(SUIVI) return new Promise((ok, ko) => google.script.run.withSuccessHandler(ok).withFailureHandler(ko)[fn](...args));
  return Promise.resolve(DEMO_CL[fn](...args));
}
const appelCl = (fn, ...args) => serveurCl(fn, ...args).then(dessineClasses, erreur);
/* Mode cours (extension Chrome « Campin — cours ») : pendant ce temps, le Chrome des élèves de la classe ouvre le
   cours et ne laisse passer que ses sites (pas-a-pas/sites.json). On choisit une durée, pas une heure à taper :
   passé ce délai le mode tombe seul, un élève ne reste jamais bloqué au cours suivant. « Arrêter » le lève tout de suite.
   Un serveur antérieur n'envoie pas « modes » : la colonne reste vide, sans erreur. */
const DUREES_MODE = [25, 50, 100];
const libelleMode = m => "🔒 jusqu’à " + new Date(m.jusqua).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"});
function caseModeCours(n, d){
  const boite = txt("div", "cl-mode"), m = d.modes && d.modes[n];
  if(!d.modes) return null;
  if(m){
    const b = txt("button", "btn vide", "Arrêter"); b.type = "button";
    const c = m.cours && d.cours.find(x=>x.cle === m.cours);
    b.setAttribute("aria-label", "Arrêter le mode cours de " + n);
    b.addEventListener("click", ()=>{ b.disabled = true; appelCl("arreterModeCours", n); });
    boite.classList.add("actif");
    boite.append(txt("span", "mode-actif", libelleMode(m)), ...(c ? [txt("span", "cl-mode-cours", c.titre)] : []), b);
    return boite;
  }
  /* Le cours se choisit ici, parmi ceux ouverts à la classe : sur cette page, le menu du haut du tableau n'est pas affiché. */
  const ouverts = d.cours.filter(c=>d.classes[n].includes(c.cle));
  const quoi = txt("select", "cl-mode-quoi"), sel = txt("select"), b = txt("button", "btn vide", "🔒 Lancer"); b.type = "button";
  quoi.replaceChildren(...(ouverts.length ? ouverts.map(c=>[c.cle, c.titre]) : [["", "Aucun cours ouvert"]]).map(([v, t])=>{ const o = txt("option", null, t); o.value = v; return o; }));
  const haut = $("cours") ? $("cours").value : "", garde = CHOIX_MODE[n];
  quoi.value = ouverts.some(c=>c.cle === garde) ? garde : ouverts.some(c=>c.cle === haut) ? haut : ouverts.length ? ouverts[ouverts.length - 1].cle : "";
  quoi.addEventListener("change", ()=>{ CHOIX_MODE[n] = quoi.value; });
  quoi.setAttribute("aria-label", "Cours du mode cours pour " + n);
  sel.replaceChildren(...DUREES_MODE.map(v=>{ const o = txt("option", null, v + " min"); o.value = v; return o; }));
  sel.value = 50; sel.setAttribute("aria-label", "Durée du mode cours pour " + n);
  b.setAttribute("aria-label", "Lancer le mode cours pour " + n);
  b.title = "Le Chrome des élèves de " + n + " ouvre ce cours et ne laisse passer que ses sites.";
  b.addEventListener("click", ()=>{ b.disabled = true; appelCl("modeCours", n, quoi.value, Number(sel.value)); });
  boite.append(txt("span", "cl-etiquette", "Mode cours"), quoi, sel, b);
  return boite;
}
/* Le chat de classe : un interrupteur par classe, rangé à côté du mode cours. Rend null tant que le serveur
   n'envoie pas « chats » : rien ne s'affiche, la place reste prête. */
const DUREES_CHAT = [15, 25, 50, 100], CHATS_VUS = new Set();
let filChat = null;
function chargeChat(){
  if(window.CampinChat) return Promise.resolve();
  return new Promise((ok, ko) => { const s = document.createElement("script");
    s.src = "https://root75.github.io/campin-public/chat/chat.js?v=ferme-20261124"; s.onload = ok; s.onerror = ko; document.head.append(s); });
}
function caseChat(n, d){
  if(!d.chats) return null;
  const boite = txt("div", "cl-mode cl-chat"), c = d.chats[n];
  if(!c){
    CHATS_VUS.delete(n);
    const sel = txt("select"), b = txt("button", "btn vide", "💬 Ouvrir"); b.type = "button";
    sel.replaceChildren(...DUREES_CHAT.map(v=>{ const o = txt("option", null, v + " min"); o.value = v; return o; }));
    sel.value = 50; sel.setAttribute("aria-label", "Durée du chat pour " + n);
    b.setAttribute("aria-label", "Ouvrir le chat de " + n);
    b.title = "Les élèves de " + n + " voient le chat sur leur portail. Il se ferme seul à la fin de la durée, ou quand tu termines la séance.";
    b.addEventListener("click", ()=>{ b.disabled = true; CHATS_VUS.add(n); serveurCl("chatOuvrir", n, Number(sel.value)).then(chats=>{ CL.chats = chats; dessineClasses(CL); }, erreur); });
    boite.append(txt("span", "cl-etiquette", "Chat de la classe"), sel, b);
    return boite;
  }
  const fermer = txt("button", "btn vide", "Fermer"), voir = txt("button", "btn vide", CHATS_VUS.has(n) ? "Replier" : "Lire et modérer"); fermer.type = voir.type = "button";
  fermer.setAttribute("aria-label", "Fermer le chat de " + n); voir.setAttribute("aria-label", (CHATS_VUS.has(n) ? "Replier" : "Lire et modérer") + " le chat de " + n);
  fermer.addEventListener("click", ()=>{ fermer.disabled = true; CHATS_VUS.delete(n); serveurCl("chatFermer", n).then(chats=>{ CL.chats = chats; dessineClasses(CL); }, erreur); });
  voir.addEventListener("click", ()=>{ if(CHATS_VUS.has(n)) CHATS_VUS.delete(n); else CHATS_VUS.add(n); dessineClasses(CL); });
  boite.classList.add("actif");
  boite.append(txt("span", "cl-etiquette", "Chat de la classe"),
    txt("span", "mode-actif", "💬 ouvert jusqu’à " + new Date(c.jusqua).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})), voir, fermer);
  if(CHATS_VUS.has(n)){
    /* Le fil vit dans sa propre boîte, gardée d'un dessin à l'autre : redessiner les cartes ne le vide pas. */
    if(!filChat || filChat.classe !== n){
      if(filChat) filChat.fil.arrete();
      const zone = txt("div", "cl-chat-fil"); filChat = { classe: n, zone, fil: { arrete(){} } };
      chargeChat().then(()=>{ if(filChat && filChat.zone === zone) filChat.fil = window.CampinChat.monte(zone, { appel: serveurCl, classe: n, prof: true }); }, erreur);
    }
    boite.append(filChat.zone);
  } else if(filChat && filChat.classe === n){ filChat.fil.arrete(); filChat = null; }
  return boite;
}
/* Les devoirs Classroom de la classe : qui a rendu quoi. Le tableau se projette parfois devant la classe : les
   points sont cachés tant que la case « Montrer les points » n'est pas cochée, et elle repart décochée à chaque
   ouverture de la page. Rend null tant que le serveur n'envoie pas « classroom », ou pour une classe sans cours noté. */
const DEVOIRS_VUS = new Set(), DEVOIRS = {}, MOTS_REMISE = { "retard":"En retard", "a-rendre":"À rendre", "rendu":"Rendu", "corrige":"Corrigé" };
let POINTS_VISIBLES = false;
const RAISONS_DEVOIRS = {
  "sans-cours": "Cette classe n’a pas de cours Classroom noté sur le serveur.",
  "service": "Le service Classroom n’est pas ajouté au projet : Apps Script ▸ Services ▸ + ▸ Google Classroom API ▸ Ajouter.",
  "refus": "Classroom n’a pas répondu. La première fois, il faut accepter l’autorisation : éditeur Apps Script ▸ choisir la fonction « devoirsClasse » ▸ Exécuter ▸ Examiner les autorisations ▸ Autoriser."
};
const frCote = v => String(Math.round(v * 100) / 100).replace(".", ",");
/** Ce que le tableau écrit : par devoir, le compte des rendus ; par élève et par devoir, un mot et une classe.
 *  La cote ne remplace « Corrigé » que si « points » est vrai. */
function grilleDevoirs(r, points){
  const travaux = (r.travaux || []).map(w=>{
    const cases = (r.eleves || []).map(e=>e.remises && e.remises[w.id]).filter(Boolean);
    return { ...w, attendus: cases.length, rendus: cases.filter(c=>c.etat === "rendu" || c.etat === "corrige").length };
  });
  // Classroom rend le nom du compte, suffixe compris : « Prénom NOM (élève) », « (student) » sur les anciens comptes.
  const eleves = (r.eleves || []).map(e=>({ nom: String(e.nom || "").replace(/\s*\((élève|eleve|student)\)\s*$/i, ""), cases: travaux.map(w=>{
    const c = e.remises && e.remises[w.id];
    if(!c || !MOTS_REMISE[c.etat]) return { mot: "—", classe: "absent" };
    const note = points && c.etat === "corrige" && typeof c.note === "number" && w.sur > 0 ? frCote(c.note) + " / " + frCote(w.sur) : "";
    return { mot: note || MOTS_REMISE[c.etat], classe: c.etat };
  }) }));
  return { travaux, eleves };
}
function chargeDevoirs(n, frais){
  DEVOIRS[n] = { attente: true };
  serveurCl("devoirsClasse", n, !!frais).then(r=>{ DEVOIRS[n] = r || { travaux: null, raison: "refus" }; dessineClasses(CL); },
    ()=>{ DEVOIRS[n] = { travaux: null, raison: "refus" }; dessineClasses(CL); });
}
function caseDevoirs(n, d){
  if(!Array.isArray(d.classroom) || !d.classroom.includes(n)) return null;
  const boite = txt("div", "cl-mode cl-devoirs"), ouvert = DEVOIRS_VUS.has(n);
  const voir = txt("button", "btn vide", ouvert ? "Replier" : "📋 Qui a rendu ?"); voir.type = "button";
  voir.setAttribute("aria-label", (ouvert ? "Replier les devoirs de " : "Voir les devoirs de ") + n);
  voir.addEventListener("click", ()=>{ if(ouvert) DEVOIRS_VUS.delete(n); else { DEVOIRS_VUS.add(n); chargeDevoirs(n); } dessineClasses(CL); });
  boite.append(txt("span", "cl-etiquette", "Devoirs Classroom"), voir);
  if(!ouvert) return boite;
  const r = DEVOIRS[n] || { attente: true }, zone = txt("div", "cl-devoirs-zone");
  boite.append(zone);
  if(r.attente){ zone.append(txt("p", "moyen", "Lecture de Classroom…")); return boite; }
  if(!Array.isArray(r.travaux)){ zone.append(txt("p", "moyen", RAISONS_DEVOIRS[r.raison] || RAISONS_DEVOIRS.refus)); return boite; }
  const outils = txt("div", "cl-devoirs-outils"), l = txt("label", "cl-points"), cb = txt("input"), relire = txt("button", "btn vide", "Relire Classroom");
  cb.type = "checkbox"; cb.checked = POINTS_VISIBLES; relire.type = "button";
  cb.addEventListener("change", ()=>{ POINTS_VISIBLES = cb.checked; dessineClasses(CL); });
  relire.addEventListener("click", ()=>{ chargeDevoirs(n, true); dessineClasses(CL); });
  l.append(cb, document.createTextNode("Montrer les points"));
  outils.append(l, relire);
  if(r.lien){ const a = txt("a", null, "Ouvrir dans Classroom ▸"); a.href = r.lien; a.target = "_blank"; a.rel = "noopener"; outils.append(a); }
  zone.append(outils);
  const g = grilleDevoirs(r, POINTS_VISIBLES);
  if(!g.travaux.length || !g.eleves.length){ zone.append(txt("p", "moyen", g.travaux.length ? "Aucun élève dans ce cours Classroom." : "Aucun devoir publié dans ce cours.")); return boite; }
  const table = txt("table", "cl-devoirs-table"), tete = txt("tr");
  tete.append(txt("th", null, "Élève"), ...g.travaux.map(w=>{
    const th = txt("th"), quand = w.echeance ? new Date(w.echeance).toLocaleDateString("fr-BE", { day: "numeric", month: "short" }) : "sans date";
    // Titre sur deux lignes au plus (le titre entier au survol) : douze devoirs tiennent à l'écran sans mot coupé.
    th.title = w.titre;
    th.append(txt("b", null, w.titre), txt("span", "maj", quand), txt("span", "maj", w.rendus + " / " + w.attendus + " rendus")); return th; }));
  table.append(tete, ...g.eleves.map(e=>{
    const tr = txt("tr"); tr.append(txt("th", null, e.nom), ...e.cases.map(c=>txt("td", "remise " + c.classe, c.mot))); return tr; }));
  const defile = txt("div", "cl-devoirs-defile"); defile.append(table); zone.append(defile);
  return boite;
}
/* Une carte par classe : le nom, puis les actions (mode cours, chat, devoirs), puis ses cours ouverts. La liste complète
   des cours reste repliée : elle s'allonge au fil de l'année, les actions ne doivent pas partir au bout de la ligne. */
const CHOIX_MODE = {}, PLIS_CL = new Set();
function carteClasse(n, d){
  const carte = txt("article", "cl-carte"), tete = txt("div", "cl-tete"), actions = txt("div", "cl-actions");
  const ouverts = d.cours.filter(c=>d.classes[n].includes(c.cle)), nb = d.eleves.filter(e=>e.classe === n).length;
  const x = txt("button", "retirer", "Retirer"); x.type = "button";
  x.setAttribute("aria-label", "Retirer la classe " + n);
  x.addEventListener("click", ()=>{ if(confirm("Retirer la classe " + n + " ? Ses élèves ne verront plus aucun cours tant que tu ne les as pas déplacés.")) appelCl("retirerClasse", n); });
  tete.append(txt("h3", "nom", n), txt("span", "maj", nb + " élève" + (nb > 1 ? "s" : "")), x);
  actions.append(...[caseModeCours(n, d), caseChat(n, d), caseDevoirs(n, d)].filter(Boolean));
  if(DEVOIRS_VUS.has(n)) carte.classList.add("large");   // le tableau des devoirs prend toute la largeur
  const puces = txt("ul", "cl-ouverts");
  puces.replaceChildren(...ouverts.map(c=>{ const li = txt("li", null, c.titre); li.title = c.cle; return li; }));
  if(!ouverts.length) puces.append(txt("li", "vide", "Aucun cours ouvert pour l’instant."));
  const pli = txt("details", "cl-tous"), resume = txt("summary", null, "Choisir les cours — " + ouverts.length + " ouvert" + (ouverts.length > 1 ? "s" : "") + " sur " + d.cours.length);
  pli.open = PLIS_CL.has(n);
  pli.addEventListener("toggle", ()=>{ if(pli.open) PLIS_CL.add(n); else PLIS_CL.delete(n); });
  const choix = txt("div", "cl-choix");
  choix.replaceChildren(...d.cours.map(c=>{
    const l = txt("label"), cb = txt("input"); cb.type = "checkbox"; cb.checked = d.classes[n].includes(c.cle);
    l.title = c.cle;
    cb.setAttribute("aria-label", c.titre + " pour " + n);
    cb.addEventListener("change", ()=>appelCl("activerCours", n, c.cle, cb.checked));
    l.append(cb, document.createTextNode(c.titre)); return l; }));
  pli.append(resume, choix);
  carte.append(tete, ...(actions.childNodes.length ? [actions] : []), puces, pli);
  if(d.modes && d.modes[n]) carte.classList.add("en-mode");
  return carte;
}
function dessineClasses(d){
  CL = d;
  if($("seance")) caseAutresClasses();   // les classes qui ont ce cours ouvert viennent d'arriver
  const noms = Object.keys(d.classes).sort();
  /* Une page gardée en cache par le serveur porte encore l'ancien tableau : on le remplace sur place. */
  let liste = $("cl-liste");
  if(!liste){ liste = txt("div", "cl-liste"); liste.id = "cl-liste"; $("cl-corps").closest(".defile").replaceWith(liste); }
  liste.replaceChildren(...noms.map(n=>carteClasse(n, d)));
  if(!noms.length) liste.replaceChildren(txt("p", "vide", "Aucune classe : ajoute-en une ci-dessous."));
  const filtre = $("el-filtre"), avant = filtre.value;
  filtre.replaceChildren(...[["", "Toutes les classes"], ...noms.map(n=>[n, n]), ["?", "Classe retirée"]].map(([v, t])=>{ const o = txt("option", null, t); o.value = v; return o; }));
  filtre.value = [...filtre.options].some(o=>o.value===avant) ? avant : "";
  dessineEleves();
  $("panneau-classes").hidden = false;
  $("eleves-statut").textContent="Liste à jour. Les changements de classe sont enregistrés après confirmation du serveur.";
}
/* « Je m'occupe » : une case 🎁 à côté du nom. Cochée = la récompense est ouverte une heure pour cet élève.
   Partagée par le suivi en direct et la liste des élèves. */
function caseRecompense(e, apres){
  const fin = Number(e.recompense) || 0, l = txt("label", "recompense"), c = txt("input");
  c.type = "checkbox"; c.checked = !!fin;
  l.title = fin ? "Je m’occupe ouvert jusqu’à " + new Date(fin).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"}) + " — décocher pour retirer" : "Cocher pour ouvrir Je m’occupe (1 h)";
  c.setAttribute("aria-label", (fin ? "Retirer Je m’occupe à " : "Ouvrir Je m’occupe pour ") + nom(e.email));
  l.append(c, document.createTextNode("🎁"));
  if(fin) l.append(txt("span", null, new Date(fin).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})));
  c.addEventListener("change", ()=>{
    if(!SUIVI){ c.checked = !c.checked; return; }
    c.disabled = true;
    google.script.run.withSuccessHandler(()=>{ (apres || charge)(); })
      .withFailureHandler(err=>{ c.disabled = false; c.checked = !c.checked; erreur(err); })
      .recompenser(e.email, c.checked);
  });
  return l;
}
function dessineEleves(){
  const noms = Object.keys(CL.classes).sort(), f = $("el-filtre").value;
  const liste = CL.eleves.filter(e => !f || (f === "?" ? !CL.classes[e.classe] : e.classe === f))
    .sort((a, b) => a.classe.localeCompare(b.classe) || nom(a.email).localeCompare(nom(b.email)));
  $("el-compte").textContent = liste.length + " élève" + (liste.length > 1 ? "s" : "");
  $("el-corps").replaceChildren(...liste.map(e=>{
    const tr = txt("tr"), td = txt("td"), sel = txt("select");
    const nomEl = txt("td", "nom", nom(e.email)); nomEl.title = e.email; nomEl.append(caseRecompense(e, chargeClasses));
    const options = [["", "À choisir"], ...(CL.classes[e.classe] ? [] : [[e.classe, e.classe + " (retirée)"]]), ...noms.map(n=>[n, n])];
    sel.replaceChildren(...options.map(([v, t])=>{ const o = txt("option", null, t); o.value = v; return o; }));
    sel.value = e.classe; sel.setAttribute("aria-label", "Classe de " + nom(e.email));
    sel.addEventListener("change", ()=>appelCl("changerClasse", e.email, sel.value));
    td.append(sel); tr.append(nomEl, td); return tr; }));
}
$("el-filtre").addEventListener("change", dessineEleves);
$("cl-ajout").addEventListener("submit", ev=>{ ev.preventDefault(); const n = $("cl-nom").value.trim(); if(n){ $("cl-nom").value = ""; appelCl("ajouterClasse", n); } });
/* Un déploiement antérieur ne connaît pas classesEtCours : le panneau reste caché, sans erreur. */
const chargeClasses = () => serveurCl("classesEtCours").then(dessineClasses, ()=>{
  $("eleves-statut").textContent="La liste ne se charge pas. Recharge cette page avec le compte professeur.";
});

function lecteurCatalogue(){
  return globalThis.CatalogueCours ? Promise.resolve(globalThis.CatalogueCours)
    : new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://root75.github.io/campin-public/pas-a-pas/catalogue.js';s.onload=()=>ok(globalThis.CatalogueCours);s.onerror=()=>ko(Error('Le lecteur du catalogue ne se charge pas.'));document.head.append(s);});
}
function cataloguePublic(frais=false){return lecteurCatalogue().then(c=>c.charger(frais));}

let tableauDemarre=false;
function demarre(cours){
  const avant=$("cours").value;
  $("cours").replaceChildren(...cours.map(c=>{const o=txt("option",null,TITRES_COURS[c]||c);o.value=c;return o;}));
  const meme=cours.includes(avant);
  if(meme) $("cours").value=avant;
  if(!tableauDemarre){
    $("cours").addEventListener("change",()=>{majVoirCours();chargeRessourcesProf();chargeSeances();});
    $("seance").addEventListener("change",charge);
    document.addEventListener("visibilitychange",rafraichitSelonOnglet);planifieCharge();tableauDemarre=true;
  }
  if(!meme || !$("seance").options.length) chargeSeances(); else charge();
  majVoirCours();chargeRessourcesProf();chargeSequence();chargeClasses();
}
function appliqueCatalogue(data){
  for(const obj of [FICHES,NB_BLOCS,TITRES_COURS]) Object.keys(obj).forEach(k=>delete obj[k]);
  data.cours.forEach(c=>{FICHES[c.id]=CatalogueCours.BASE+c.chemin;NB_BLOCS[c.id]=c.etapes;TITRES_COURS[c.id]=c.titre;});
  DEMO_CL.d.cours=data.cours.map(c=>({cle:c.id,titre:c.titre}));
}
// Compatibilité avec le HTML gardé temporairement en cache par Apps Script.
function prepareOutils(){
 const header=document.querySelector("header");
 for(const [id,titre] of [["gestion","Gestion des parcours"],["ressources","Ressources professeur"]]){
  if(!$(id+"-menu")){const d=txt("details"),corps=txt("div","contenu-menu");d.id=id+"-menu";d.append(txt("summary",null,titre),corps);header.append(d);}
 }
 if(!$("gestion-actions")){const d=txt("div");d.id="gestion-actions";$("gestion-menu").querySelector(".contenu-menu").append(d);}
 if(!$("gestion-attente")){const d=txt("p","astuce","Les commandes de reprise attendent la confirmation du serveur.");d.id="gestion-attente";d.hidden=true;$("gestion-menu").querySelector(".contenu-menu").append(d);}
 if(!$("filtres-eleves")){const d=txt("div");d.id="filtres-eleves";$("lignes").closest("section").prepend(d);}
}
prepareOutils();
const actualiser=txt("button","btn vide","Actualiser le catalogue");actualiser.type="button";actualiser.id="catalogue-actualiser";
$("gestion-actions").append(actualiser);
const catalogueEtat=txt("p","astuce");catalogueEtat.id="catalogue-etat";catalogueEtat.setAttribute("role","status");
$("gestion-menu").querySelector(".contenu-menu").append(catalogueEtat);
async function chargeCatalogue(frais=false){
  actualiser.disabled=true;catalogueEtat.textContent="Chargement du catalogue…";
  try{
    let data, liste, avertissement="";
    if(SUIVI){
      try{
        const d=await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).catalogueCours(frais));
        // Le même schéma est vérifié dans le navigateur ; le serveur garde son contrôle indépendant.
        await lecteurCatalogue(); // ne relit pas le JSON : le serveur peut utiliser son dernier catalogue valide
        data=CatalogueCours.valider({version:d.version,cours:d.cours});liste=data.cours.map(c=>c.id);
        avertissement=d.avertissement||"";
      }catch(e){
        // Ancien serveur : garder uniquement ses cours réellement reconnus, jamais en inventer.
        liste=await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).listeCours());
        data=await cataloguePublic(frais);
        liste=liste.filter(id=>data.cours.some(c=>c.id===id));
        avertissement="Le serveur utilise encore sa liste fixe : mettre à jour Code.gs une fois pour activer le catalogue dynamique.";
      }
    }else{
      data=await cataloguePublic(frais);liste=data.cours.map(c=>c.id);
    }
    appliqueCatalogue(data);demarre(liste);
    catalogueEtat.textContent=avertissement || ("Catalogue à jour · "+data.cours.length+" cours. Actualiser ne modifie ni les ouvertures ni la séance.");
  }catch(e){catalogueEtat.textContent="Catalogue non actualisé : "+e.message+" Les réglages et la séance sont conservés.";}
  finally{actualiser.disabled=false;}
}
actualiser.addEventListener("click",()=>chargeCatalogue(true));
if(!SUIVI){document.title="APERÇU FICTIF — tableau professeur";$("demo").hidden=false;}
const ADRESSE_TABLEAU='https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec?vue=prof';
/* Trois pages : le tableau du cours ; ?onglet=eleves (la classe de chaque élève) ;
   ?onglet=classes (les cours ouverts à chaque classe). Même script, mêmes droits professeur. */
const ONGLETS={eleves:{id:'gestion-eleves',titre:'Gestion des élèves',autre:'classes',autreTitre:'Cours et classes'},
  classes:{id:'panneau-classes',titre:'Cours et classes',autre:'eleves',autreTitre:'Gestion des élèves'}};
function ouvreVueProf(parametres){
  const lien=o=>SUIVI?ADRESSE_TABLEAU+'&onglet='+o:location.pathname+'?onglet='+o;
  $("gestion-eleves-lien").href=lien('eleves');$("gestion-classes-lien").href=lien('classes');
  const o=ONGLETS[parametres.onglet];
  if(!o){chargeCatalogue();return;}
  document.body.classList.add('vue-onglet');$(o.id).classList.add('onglet-actif');document.title=o.titre+' — Mes cours';
  document.querySelector('header h1').textContent=o.titre;
  const navigation=txt('nav','navigation-eleves'),retour=txt('a','btn vide','← Retour au tableau'),autre=txt('a','btn vide',o.autreTitre+' →');
  retour.href=SUIVI?ADRESSE_TABLEAU:location.pathname;retour.target='_top';autre.href=lien(o.autre);autre.target='_top';
  navigation.append(retour,autre);document.querySelector('header').append(navigation);
  $(o.id).hidden=false;chargeClasses();
}
// L'URL extérieure est obtenue par le pont Apps Script, sans modifier les droits professeur.
if(SUIVI&&google.script.url?.getLocation)google.script.url.getLocation(l=>ouvreVueProf(l.parameter||{}));
else ouvreVueProf(Object.fromEntries(new URLSearchParams(location.search)));




/* « Recommencer » : une petite fenêtre demande à quelle étape l'élève reprend. Les étapes d'avant restent validées ;
   celle-ci et les suivantes sont à refaire. Rend le numéro choisi, ou 0 si on annule. */
function choisirEtape(qui, n, atteint){
  let d = document.getElementById("dlg-reprise");
  if(!d){
    d = document.createElement("dialog"); d.id = "dlg-reprise";
    d.innerHTML = '<form method="dialog"><h2>Faire recommencer</h2><p id="dlg-reprise-qui"></p>'
      +'<label>Reprendre à l’étape <select id="dlg-reprise-etape" aria-label="Étape de reprise"></select></label>'
      +'<p class="astuce" id="dlg-reprise-effet"></p>'
      +'<div class="reglages"><button class="btn" value="ok">Recommencer</button><button class="btn vide" value="annuler" formnovalidate>Annuler</button></div></form>';
    document.body.append(d);
  }
  const sel = d.querySelector("#dlg-reprise-etape"), effet = d.querySelector("#dlg-reprise-effet");
  sel.replaceChildren(...Array.from({length:n},(_,i)=>{ const o = txt("option",null,"Étape "+(i+1)+(i+1<=atteint ? " ✓" : "")); o.value = i+1; return o; }));
  sel.value = "1";
  const dit = () => { const k = Number(sel.value);
    effet.textContent = (k>1 ? "Les étapes 1 à "+(k-1)+" restent validées. " : "")+"L’étape "+k+" et les suivantes sont à refaire. L’historique est conservé."; };
  sel.onchange = dit; dit();
  d.querySelector("#dlg-reprise-qui").textContent = atteint == null ? qui+" : ceux qui ont dépassé l’étape choisie la refont, les autres ne changent rien."
    : qui+" : jusqu’ici, "+Math.min(atteint,n)+" étape(s) validée(s) sur "+n+".";
  return new Promise(ok => { d.onclose = () => ok(d.returnValue==="ok" ? Number(sel.value) : 0); d.returnValue = ""; d.showModal(); });
}

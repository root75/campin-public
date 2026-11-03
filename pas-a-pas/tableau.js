/* Les fiches sur GitHub Pages : « Bloc N » ouvre la fiche en aperçu à ce bloc (#bloc=N). */
const FICHES = Object.create(null), NB_BLOCS = Object.create(null), TITRES_COURS = Object.create(null);
const lienBloc = (i, texte) => {
  const url = FICHES[$("cours").value];
  if(!url) return txt("span", null, texte);
  const a = txt("a", null, texte); a.href = url + "#bloc=" + i; a.target = "_blank"; a.rel = "noopener";
  a.title = "Ouvrir le bloc " + i + " en aperçu (rien n'est enregistré)"; return a;
};
/* Mêmes listes que dans les fiches : l'humeur est enregistrée « emoji libellé ». */
const HUMEURS = [["😄","Super"],["🙂","Bien"],["😐","Bof"],["🙁","Pas top"],["😣","Pas bien"]];
const AVIS = [["plu","Ce qui m'a plu"],["progres","Ce qui m'a aidé à progresser"],["gene","Ce qui m'a gêné dans le cours en ligne"]];
const RAFRAICHIR = 15000;
const INACTIF = 8 * 60000;
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
let seulementAide=false;
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
      if(url.protocol !== "https:" || !["docs.google.com","drive.google.com"].includes(url.hostname)) continue;
      const a = txt("a","btn vide",libelle); a.href = url.href; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.title = libelle + " — nouvel onglet"; zone.append(a);
    }
    if(!zone.children.length) zone.textContent = "Préparation non renseignée pour ce cours.";
  } catch(e) {
    if(demande === demandeRessources) zone.textContent = "Préparation indisponible. Recharge le tableau ; si cela persiste, vérifie la version Apps Script.";
  }
}

/* La liste des séances : la plus récente d'abord, sélectionnée par défaut. */
function remplitSeances(liste){
  SEANCES = liste;
  const sel = $("seance");
  sel.replaceChildren(...(liste.length ? liste : [{classe:"", debut:0}]).map((s,i)=>{
    const o = txt("option", null, s.debut ? (i===0 && !s.fin ? "En cours · " : "") + s.classe + " · " + heure(s.debut) : "Toutes (aucune séance démarrée)");
    o.value = i; return o; }));

  charge();
}
function chargeSeances(){
  if(!SUIVI){ remplitSeances(demoSeances()); return; }
  google.script.run.withSuccessHandler(remplitSeances).withFailureHandler(erreur).seances($("cours").value);
}
const erreur = err => {let note=$("erreur-tableau");if(!note){note=txt("p");note.id="erreur-tableau";note.setAttribute("role","alert");document.querySelector("header").after(note);}note.textContent="Échec de l’action : "+(err.message||String(err));};

function dessine(d){
  ["messagerie-recommencer","python-plafond","guide-messagerie"].forEach(id=>{if($(id))$(id).hidden=true;});
  if(!$("filtre-aide")){
    const label=txt("label","filtre-aide"),filtre=document.createElement("input");filtre.type="checkbox";filtre.id="filtre-aide";filtre.checked=seulementAide;
    label.append(filtre,txt("span",null,"Besoin d’aide seulement"));
    filtre.addEventListener("change",()=>{seulementAide=filtre.checked;charge();});
    $("filtres-eleves").append(label);
  }

  if(globalThis.FormatifProf) {
    FormatifProf.presentation($("cours").value === 'rat-de-ville-formatif');
    if($("cours").value === 'rat-de-ville-formatif') { FormatifProf.dessine(d); return; }
  }
  if(!$("guide-messagerie")){const lien=txt("a","btn vide","Repères professeur — Messagerie 01");lien.id="guide-messagerie";lien.href='https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec?vue=guide-prof';lien.target='_blank';lien.rel='noopener';$("guide-actions").append(lien);}
  if(!$("messagerie-recommencer")){const b=txt("button","btn vide","Recommencer Messagerie 01 pour tous");b.type='button';b.id='messagerie-recommencer';b.addEventListener('click',()=>{if(!confirm('Remettre tous les participants de Messagerie 01 au début ? L’historique est conservé.'))return;b.disabled=true;google.script.run.withSuccessHandler(r=>{b.disabled=false;$("maj").textContent=r.repris+' participants remis au début.';charge();}).withFailureHandler(err=>{b.disabled=false;erreur(err);}).noter('messagerie-1',{type:'prof-recommencer'});});$("gestion-actions").append(b);}
  $("messagerie-recommencer").hidden=!(SUIVI&&d.reprisesParSuivi&&$("cours").value==='messagerie-1');
  $("guide-messagerie").hidden=$("cours").value!=='messagerie-1';
  if(!$("python-plafond")){const b=txt("button","btn vide","Ramener les élèves au maximum à l’étape 8");b.type='button';b.id='python-plafond';b.addEventListener('click',()=>{const s=choisie();if(!confirm('Les élèves ayant dépassé l’étape 8 devront la refaire. Continuer ?'))return;b.disabled=true;google.script.run.withSuccessHandler(r=>{$("maj").textContent=r.repris+' élèves remis à l’étape 8. Ils doivent recharger leur fiche.';b.disabled=false;charge();}).withFailureHandler(err=>{b.disabled=false;erreur(err);}).noter('python-1',{type:'prof-plafond',debut:s.debut});});$("gestion-actions").append(b);}
  $("python-plafond").hidden=!(SUIVI&&d.reprisesParSuivi&&d.peutReprendre&&$("cours").value==='python-1'&&/^3/.test(choisie().classe));
  $("gestion-attente").hidden=!SUIVI||!!d.reprisesParSuivi;
  const n = NB_BLOCS[$("cours").value] || Math.max(1, ...d.eleves.map(e=>e.atteint+1));
  const el = d.eleves.slice().sort((a,b)=>
    (!!b.aide - !!a.aide) || (a.aide && b.aide ? a.aide.depuis - b.aide.depuis : 0) ||
    (a.fini - b.fini) || (a.atteint - b.atteint) || (b.erreursIci - a.erreursIci));

  const attend = el.filter(e=>e.aide).length, finis = el.filter(e=>e.fini).length;
  const butent = el.filter(e=>!e.fini && e.erreursIci>=3).length;
  const median = el.length ? el.map(e=>e.atteint).sort((a,b)=>a-b)[Math.floor(el.length/2)] : 0;
  $("chiffres").replaceChildren(...[
    ["Élèves", el.length, ""], ["Attendent de l'aide", attend, attend ? "alerte" : ""],
    ["Butent (3 erreurs ou +)", butent, butent ? "alerte" : ""], ["Ont fini", finis, ""],
    ["Bloc médian validé", median+" / "+n, ""]
  ].map(([t,v,c])=>{ const x=txt("div","chiffre "+c); x.append(txt("b",null,v), txt("span",null,t)); return x; }));

  const tb = $("lignes"); tb.replaceChildren();
  if(!el.length){ const tr=txt("tr"); const td=txt("td","vide","Personne n'a encore ouvert la fiche sur cette période."); td.colSpan=8; tr.append(td); tb.append(tr); }
  el.filter(e=>!seulementAide||e.aide).forEach(e=>{
    const tr = txt("tr", e.aide ? "aide" : e.fini ? "fini" : "");
    const td = (cls,t) => { const c=txt("td",cls,t); tr.append(c); return c; };
    const n1 = td("nom", nom(e.email)); n1.title = e.email;
    if(SUIVI&&d.reprisesParSuivi&&d.peutReprendre){const cours=$("cours").value,seance=choisie();const r=txt("button","btn vide","Recommencer");r.type="button";r.setAttribute("aria-label","Faire recommencer "+nom(e.email));r.addEventListener("click",()=>{if(!confirm("Faire recommencer ce cours à "+nom(e.email)+" ? L’historique est conservé."))return;r.disabled=true;google.script.run.withSuccessHandler(()=>{charge();}).withFailureHandler(err=>{r.disabled=false;erreur(err);}).noter(cours,{type:'prof-reprise',email:e.email,debut:seance.debut});});n1.append(r);}
    const h = td("hum", e.humeur ? e.humeur.split(" ")[0] : ""); if(e.humeur) h.title = e.humeur;
    const b = txt("div","barre");
    for(let i=0;i<n;i++){ const s=txt("span"); s.className = i<e.atteint ? "fait" : (i===e.atteint && !e.fini ? "ici" : ""); b.append(s); }
    td().append(b);
    const nb = td("num"); nb.append(e.fini ? txt("span",null,"fini") : lienBloc(e.atteint+1, (e.atteint+1)+" / "+n));
    td("num", e.fini ? "" : e.erreursIci || "");
    td("num", e.erreurs || "");
    const etat = td();
    if(e.aide){
      etat.append(txt("span","pastille aide","✋ aide · bloc "+e.aide.bloc+" · "+ilya(d.maintenant-e.aide.depuis).replace("il y a ","")));
      if(SUIVI && d.peutCloreAide){
        const cours=$("cours").value,seance=choisie(),depuis=e.aide.depuis;
        const b=txt("button","btn vide","Aide traitée");b.type="button";
        b.setAttribute("aria-label","Aide traitée pour "+nom(e.email));
        b.addEventListener("click",()=>{
          if(b.disabled)return;b.disabled=true;b.textContent="Enregistrement…";
          google.script.run.withSuccessHandler(r=>{
            if(!r?.traitee){b.disabled=false;b.textContent="Réessayer";return;}
            b.textContent="✓ Aide traitée";charge();
          }).withFailureHandler(err=>{b.disabled=false;b.textContent="Réessayer : aide traitée";erreur(err);}).cloreAide(cours,e.email,seance.debut,depuis);
        });
        etat.append(b);
      }
    }
    else if(e.fini) etat.append(txt("span","pastille fini","✓ fini"));
    else if(e.erreursIci>=3) etat.append(txt("span","pastille bute","bute"));
    const der = td("num", derniereAction(e.derniere, !!choisie().fin || e.fini, d.maintenant));
    der.title=e.derniere?new Date(e.derniere).toLocaleString("fr-BE"):"Aucune action";
    if(!e.fini && d.maintenant - e.derniere > INACTIF) der.classList.add("inactif");
    tb.append(tr);
  });

  const zb = $("blocs"); zb.replaceChildren();
  const max = Math.max(1, ...Object.values(d.parBloc));
  for(let i=1;i<=n;i++){
    const v = d.parBloc[i] || 0;
    const r = txt("div","bl"); const j = txt("div","jauge"); j.style.width = (v/max*100)+"%"; if(!v) j.style.opacity=".15";
    const w = txt("div"); w.append(j);
    r.append(lienBloc(i, "Bloc "+i), w, txt("span","num",v)); zb.append(r);
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

  const za = $("avis"); za.replaceChildren();
  AVIS.forEach(([k,t])=>{
    const col = txt("div"); col.append(txt("h3",null,t));
    const rep = el.filter(e=>e.avis && e.avis[k]);
    if(!rep.length) col.append(txt("p","vide","Pas encore de réponse."));
    else { const ul = txt("ul"); rep.forEach(e=>{ const li = txt("li",null,e.avis[k]+" "); li.append(txt("span","qui","— "+nom(e.email))); ul.append(li); }); col.append(ul); }
    za.append(col);
  });

  const s = choisie(); $("titre-classe").textContent = s.classe ? s.classe + " · " : "";
  $("maj").textContent = "Mis à jour à " + new Date(d.maintenant).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
}

let numeroChargement=0,contexteAffiche="";
function charge(){
  if(!SUIVI){ dessine(demo()); return; }
  const s = choisie();
  const cours=$("cours").value,demande=++numeroChargement;
  const contexte=cours+":"+s.debut;
  if(contexte!==contexteAffiche){$("lignes").replaceChildren();if($("python-plafond"))$("python-plafond").hidden=true;}
  google.script.run.withSuccessHandler(d=>{if(demande===numeroChargement&&$("cours").value===cours&&choisie().debut===s.debut){contexteAffiche=contexte;dessine(d);}}).withFailureHandler(err=>{if(demande===numeroChargement)erreur(err);}).donnees(cours, s.debut, s.fin);
}

/* Données fictives : l'aperçu hors Apps Script. */
function demo(){
  const t = Date.now(), m = 60000;
  const e = (email, atteint, erreurs, erreursIci, derniere, extra) => Object.assign({email, atteint, erreurs, erreursIci, aide:null, fini:false, derniere:t-derniere*m, humeur:"", avis:null}, extra||{});
  const vr = (...l) => l.map(([erreurs,eleves],k)=>({v:k+1, erreurs, eleves}));
  return { maintenant:t, parBloc:{1:2,4:5,5:3,6:9,8:4,9:6,10:2,12:1},
    variantes:{1:vr([1,3],[1,2],[0,3]), 4:vr([1,3],[4,3],[0,2]), 6:vr([2,3],[1,2],[6,3]), 9:vr([2,2],[2,3],[2,3])}, eleves:[
    e("lina.dubois@arcampin.be",5,7,4,1,{aide:{bloc:6,depuis:t-3*m}, humeur:"🙁 Pas top"}),
    e("noah.martin@arcampin.be",9,3,1,0,{humeur:"🙂 Bien"}),
    e("ines.lambert@arcampin.be",12,2,0,2,{fini:true, humeur:"😄 Super", avis:{plu:"Les questions pour passer au bloc suivant, on sait tout de suite si c'est juste.", progres:"Ça coince ? quand je me trompais.", gene:""}}),
    e("adam.peeters@arcampin.be",3,5,3,1,{humeur:"😣 Pas bien"}),
    e("sara.janssens@arcampin.be",7,4,0,11),
    e("yanis.leroy@arcampin.be",8,6,2,0,{aide:{bloc:9,depuis:t-1*m}, humeur:"😐 Bof"}),
    e("emma.dupont@arcampin.be",12,1,0,1,{fini:true, humeur:"🙂 Bien", avis:{plu:"Travailler à mon rythme.", progres:"Refaire le programme moi-même.", gene:"Attendre que la page charge au début."}})
  ]};
}

function demoSeances(){
  const t = Date.now(), h = 3600000;
  return [{classe:"1C", debut:t-40*60000, fin:null}, {classe:"1B", debut:t-2*h, fin:t-40*60000}, {classe:"2F", debut:t-26*h, fin:t-2*h}];
}

/* Nouvelle séance : demande la classe, la démarre côté serveur, recharge la liste. */
$("nouvelle").addEventListener("click", async()=>{
  const bouton=$("nouvelle");bouton.disabled=true;
  try{
    if(!CL)await chargeClasses();
    const noms=Object.keys(CL?.classes||{}).sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));
    if(!noms.length){erreur(Error('La liste des classes est vide ou indisponible. Vérifie le panneau Classes et cours.'));return;}
    const choix=$("dlg-classe");
    choix.replaceChildren(...[["","Choisir une classe"],...noms.map(n=>[n,n])].map(([valeur,texte])=>{const o=txt('option',null,texte);o.value=valeur;return o;}));
    choix.value='';$("dlg").showModal();choix.focus();
  }finally{bouton.disabled=false;}
});
$("dlg").addEventListener("close", ()=>{
  const classe = $("dlg-classe").value.trim();
  if($("dlg").returnValue !== "ok" || !classe) return;
  if(!SUIVI){ const l = demoSeances(); l[0].fin = Date.now(); remplitSeances([{classe, debut:Date.now(), fin:null}, ...l]); return; }
  google.script.run.withSuccessHandler(remplitSeances).withFailureHandler(erreur).nouvelleSeance($("cours").value, classe);
});

/* ===== Mode séquence =====
   Le contenu vient de sequences.json (le serveur le lit ; l'aperçu le charge à côté de cette page).
   Le serveur tient le moment en cours : la fiche de l'élève n'affiche que lui.
   À l'écran, rien de nominatif : les noms restent dans l'onglet Journal. */
const SEQ = { contenu:null, etat:null, rep:null, depuis:0, montre:false, choisi:null, minuterie:null };
const cleSeq = quoi => "pas-a-pas-seq:" + $("cours").value + ":" + (SEQ.etat ? SEQ.etat.lance : 0) + ":" + quoi;
const litSeq = (quoi, defaut) => { try { return JSON.parse(localStorage.getItem(cleSeq(quoi))) ?? defaut; } catch(e){ return defaut; } };
const ecritSeq = (quoi, v) => { try { localStorage.setItem(cleSeq(quoi), JSON.stringify(v)); } catch(e){} };

/* Un seul chemin vers le serveur ; sans Apps Script, une imitation pour l'aperçu. */
function serveur(fn, ...args){
  if(SUIVI) return new Promise((ok, ko) => google.script.run.withSuccessHandler(ok).withFailureHandler(ko)[fn](...args));
  return Promise.resolve(DEMO_SEQ[fn](...args));
}
let DEMO_CONTENU = null, DEMO_ETAT = null;
const DEMO_SEQ = {
  sequence: () => fetch("sequences.json").then(r=>r.json()).then(j=>{ DEMO_CONTENU = j; return { sequence: j[$("cours").value] || null, etat: DEMO_ETAT }; }).catch(()=>({ sequence:null, etat:null })),
  piloter: (cours, i, phase, nouvelle) => {
    const m = DEMO_CONTENU[cours].moments[i];
    DEMO_ETAT = { lance: nouvelle || !DEMO_ETAT ? Date.now() : DEMO_ETAT.lance, i, phase: phase || (m.type==="vote" ? "ouvert" : "") };
    return DEMO_ETAT;
  },
  reprendreSequence: () => DEMO_ETAT,
  arreterSequence: () => { DEMO_ETAT = null; return null; },
  reponses: (cours, i) => {
    const m = DEMO_CONTENU[cours].moments[i], t = Math.floor((Date.now() - DEMO_ETAT.lance) / 4000);
    const mots = [["lent",5],["une lettre",4],["pour les profs",3],["sérieux",3],["on attend la réponse",2],["Outlook",2],["@",2],["avec un objet",1],["officiel",1],["long",1],["gratuit",1],["message",2]]
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
  if(SEQ.etat){
    z.append(txt("span","maj","Cours collectif en cours · moment "+(SEQ.etat.i+1)+" / "+SEQ.contenu.moments.length));
    b("Reprendre le cours collectif", "", ()=>serveur("reprendreSequence", $("cours").value).then(e=>{ SEQ.etat = e; ouvreProjection(); }).catch(erreur));
    b("Arrêter", "vide", ()=>serveur("arreterSequence", $("cours").value).then(()=>{ SEQ.etat = null; dessineEtatSeq(); }).catch(erreur));
  } else b("Lancer le cours collectif", "", ()=>allerA(0, "", true));
}
function dessineConducteur(){
  const c = SEQ.contenu, panneau = $("conducteur");
  panneau.hidden = !c;
  if(!c) return;
  $("conducteur-titre").textContent = "Cours collectif — " + c.titre;
  const duree = c.moments.reduce((n,m)=>n+(m.min||0),0);
  $("conducteur-objectif").textContent = (c.objectif || "") + " · Environ " + duree + " min, à adapter au groupe.";
  const prep = $("conducteur-preparation"); prep.replaceChildren();
  if($("cours").value==="labo-07") prep.append(txt("p","astuce","Labo 07 : les blocs verts indiquent une hypothèse enregistrée (étapes internes 1, 3, 6) ou une mission déclarée faite. Trois missions et un défi final sont affichés aux élèves. Un seul incident est rédigé ; les trois autres sont vérifiés à deux ; le professeur garde le contrôle individuel final et intervient sur les blocages persistants. Preuves et conclusions dans le document Classroom : le site ne le lit pas et ne vérifie pas sa remise. Ne jamais projeter le Journal ou les copies."));
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
function chargeSequence(frais = false){
  SEQ.contenu = null; SEQ.etat = null; dessineEtatSeq();
  serveur("sequence", $("cours").value, frais).then(r=>{ SEQ.contenu = r.sequence; SEQ.etat = r.etat; dessineEtatSeq(); }).catch(()=>{});
}

function allerA(i, phase, nouvelle){
  const n = SEQ.contenu.moments.length;
  if(i < 0 || i >= n) return;
  serveur("piloter", $("cours").value, i, phase || "", !!nouvelle).then(e=>{
    if(!SEQ.etat || e.i !== SEQ.etat.i || nouvelle){ SEQ.depuis = Date.now(); SEQ.montre = false; SEQ.choisi = null; SEQ.rep = null; }
    SEQ.etat = e; ouvreProjection();
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
}
const momentCourant = () => SEQ.contenu.moments[SEQ.etat.i];
/* Le moment dont on lit les réponses : le tri range les mots récoltés plus tôt. */
const momentLu = () => { const m = momentCourant(); return m.type === "tri" ? m.source : ["mots","vote"].includes(m.type) ? SEQ.etat.i : null; };

function rafraichitReponses(){
  if(!SEQ.etat || $("projection").hidden) return;
  const i = momentLu(); if(i == null) return;
  const avant = SEQ.etat.i;
  serveur("reponses", $("cours").value, i).then(r=>{ if(SEQ.etat && SEQ.etat.i === avant){ SEQ.rep = r; scene(); } }).catch(erreur);
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
  if(m.type === "vote" && ph === "clos"){ t = "Montrer la bonne réponse"; f = ()=>allerA(SEQ.etat.i, "corrige"); }
  if(m.saisie === 'domaine'){
    if(ph === 'corrige'){ t=''; f=null; }
    else if(ph === 'clos'){ t='Corriger ensemble'; f=()=>allerA(SEQ.etat.i,'corrige'); }
    else if(SEQ.montre){ t='Clore les réponses'; f=()=>allerA(SEQ.etat.i,'clos'); }
    else { t='Afficher les réponses'; f=()=>{ SEQ.montre=true; scene(); }; }
  }
  a.hidden = !f; a.textContent = t; a.onclick = f;
}

function scene(){
  const m = momentCourant(), n = SEQ.contenu.moments.length, r = SEQ.rep;
  const box = txt("div");
  if($("cours").value === "messagerie-1")box.classList.add("messagerie-scene");
  box.append(txt("p","sur", m.titre));
  $("seq-ou").replaceChildren(txt("b",null,(SEQ.etat.i+1)+" / "+n+" · "+m.titre), " — "+(m.methode||""));
  $("seq-prec").disabled = SEQ.etat.i === 0;
  $("seq-suiv").disabled = SEQ.etat.i === n-1;
  const mailVisuel = $("cours").value === "messagerie-1" && m.titre === "Avant d’écrire : observe le mail" && window.MessagerieVisuels;
  if(mailVisuel)box.append(txt('h2','grand','Comment est construit cet email ?'),txt('p','moyen','ENSEMBLE — explore les parties, puis explique leur rôle.'),MessagerieVisuels.email());
  if(!mailVisuel && (m.type === "ecran" || m.type === "fin" || m.type === "atelier")){
    (m.lignes||[]).forEach((l,k)=>box.append(txt(k ? "p" : "h2", k ? "moyen" : "grand", l)));
    if(m.paires){ const g = txt("div","paires"); m.paires.forEach(([a,b])=>{ const c = txt("div","paire"); c.append(txt("b",null,a), txt("span",null,b)); g.append(c); }); box.append(g); }
    if(m.exemple) box.append(txt("p","exemple", m.exemple));
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
    if(m.saisie === 'domaine'){
      if(window.MessagerieVisuels)box.append(MessagerieVisuels.adresse({corrige:SEQ.etat.phase==='corrige'}));
      else (m.lignes||[]).forEach(l=>box.append(txt('p','moyen',l)));
      box.append(txt('p','moyen',SEQ.etat.phase==='corrige'?'ENSEMBLE — vérifiez et expliquez.':SEQ.etat.phase==='clos'?'RÉPONSES FERMÉES — explique ton raisonnement.':'À TOI D’ÉCRIRE — réponds sur ton écran.'));
      if(SEQ.etat.phase==='corrige'&&!window.MessagerieVisuels)(m.correction||[]).forEach(l=>box.append(txt('p','moyen',l)));
    }
    const masques = litSeq("masques", []);
    const mots = r ? r.mots.filter(x=>!masques.includes(x.cle)) : [];
    if(!SEQ.montre){
      box.append(txt("div","compteur", r ? r.repondants : "…"), txt("p","moyen", (r && r.repondants === 1 ? "élève a" : "élèves ont") + (m.saisie === "domaine" ? " répondu. Écris le domaine sur ton poste." : " répondu. Tape tes mots sur ton poste.")));
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
  }
  if(m.type === "tri") box.append(tri(m, r));
  if(m.type === "vote") box.append(vote(m, r, SEQ.etat.phase));
  $("scene").replaceChildren(box);
  action(); chrono();
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
  d: { cours:[],
       classes:{ "2B":["messagerie-1"], "2E":["messagerie-1"], "3F":["python-1"] },
       eleves:[{email:"lea.dupont@arcampin.be",classe:"2B"},{email:"noah.martin@arcampin.be",classe:"2E"},{email:"sami.benali@arcampin.be",classe:"2B"}] },
  classesEtCours(){ return this.d; },
  ajouterClasse(c){ this.d.classes[c] = this.d.classes[c] || []; return this.d; },
  retirerClasse(c){ delete this.d.classes[c]; return this.d; },
  activerCours(c, k, oui){ const l = this.d.classes[c].filter(x=>x!==k); if(oui) l.push(k); this.d.classes[c] = l; return this.d; },
  changerClasse(e, c){ if(c) this.d.eleves.find(x=>x.email===e).classe = c; else this.d.eleves = this.d.eleves.filter(x=>x.email!==e); return this.d; }
};
function serveurCl(fn, ...args){
  if(SUIVI) return new Promise((ok, ko) => google.script.run.withSuccessHandler(ok).withFailureHandler(ko)[fn](...args));
  return Promise.resolve(DEMO_CL[fn](...args));
}
const appelCl = (fn, ...args) => serveurCl(fn, ...args).then(dessineClasses, erreur);
function dessineClasses(d){
  CL = d;
  const noms = Object.keys(d.classes).sort();
  const tete = txt("tr"); tete.append(txt("th", null, "Classe"), ...d.cours.map(c=>{ const th = txt("th", null, c.titre); th.title = c.cle; return th; }), txt("th"));
  $("cl-tete").replaceChildren(tete);
  $("cl-corps").replaceChildren(...noms.map(n=>{
    const tr = txt("tr"); tr.append(txt("td", "nom", n));
    d.cours.forEach(c=>{
      const td = txt("td"), cb = txt("input"); cb.type = "checkbox"; cb.checked = d.classes[n].includes(c.cle);
      cb.setAttribute("aria-label", c.titre + " pour " + n);
      cb.addEventListener("change", ()=>appelCl("activerCours", n, c.cle, cb.checked));
      td.append(cb); tr.append(td); });
    const td = txt("td"), x = txt("button", "retirer", "Retirer"); x.type = "button";
    x.addEventListener("click", ()=>{ if(confirm("Retirer la classe " + n + " ? Ses élèves ne verront plus aucun cours tant que tu ne les as pas déplacés.")) appelCl("retirerClasse", n); });
    td.append(x); tr.append(td); return tr; }));
  if(!noms.length) $("cl-corps").replaceChildren(Object.assign(txt("tr"), { innerHTML:'<td colspan="9" class="vide">Aucune classe : ajoute-en une ci-dessous.</td>' }));
  const filtre = $("el-filtre"), avant = filtre.value;
  filtre.replaceChildren(...[["", "Toutes les classes"], ...noms.map(n=>[n, n]), ["?", "Classe retirée"]].map(([v, t])=>{ const o = txt("option", null, t); o.value = v; return o; }));
  filtre.value = [...filtre.options].some(o=>o.value===avant) ? avant : "";
  dessineEleves();
  $("panneau-classes").hidden = false;
  $("eleves-statut").textContent="Liste à jour. Les changements de classe sont enregistrés après confirmation du serveur.";
}
function dessineEleves(){
  const noms = Object.keys(CL.classes).sort(), f = $("el-filtre").value;
  const liste = CL.eleves.filter(e => !f || (f === "?" ? !CL.classes[e.classe] : e.classe === f))
    .sort((a, b) => a.classe.localeCompare(b.classe) || nom(a.email).localeCompare(nom(b.email)));
  $("el-compte").textContent = liste.length + " élève" + (liste.length > 1 ? "s" : "");
  $("el-corps").replaceChildren(...liste.map(e=>{
    const tr = txt("tr"), td = txt("td"), sel = txt("select");
    const nomEl = txt("td", "nom", nom(e.email)); nomEl.title = e.email;
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
    $("cours").addEventListener("change",()=>{chargeRessourcesProf();chargeSeances();chargeSequence();if(globalThis.FormatifProf)FormatifProf.charge();});
    $("seance").addEventListener("change",charge);
    setInterval(charge,RAFRAICHIR);tableauDemarre=true;
  }
  if(!meme || !$("seance").options.length) chargeSeances(); else charge();
  chargeRessourcesProf();chargeSequence();chargeClasses();
  if(globalThis.FormatifProf) FormatifProf.charge();
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
 if(!$("guide-actions")){const d=txt("div");d.id="guide-actions";$("ressources-menu").querySelector(".contenu-menu").append(d);}
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
function ouvreVueProf(parametres){
  const eleves=parametres.onglet==='eleves';
  $("gestion-eleves-lien").href=SUIVI?ADRESSE_TABLEAU+'&onglet=eleves':location.pathname+'?onglet=eleves';
  if(!eleves){chargeCatalogue();return;}
  document.body.classList.add('vue-eleves');document.title='Gestion des élèves — Mes cours';
  document.querySelector('header h1').textContent='Gestion des élèves';
  const navigation=txt('nav','navigation-eleves'),retour=txt('a','btn vide','← Retour au tableau');
  retour.href=SUIVI?ADRESSE_TABLEAU:location.pathname;retour.target='_top';navigation.append(retour);document.querySelector('header').append(navigation);
  $("gestion-eleves").hidden=false;chargeClasses();
}
// L'URL extérieure est obtenue par le pont Apps Script, sans modifier les droits professeur.
if(SUIVI&&google.script.url?.getLocation)google.script.url.getLocation(l=>ouvreVueProf(l.parameter||{}));
else ouvreVueProf(Object.fromEntries(new URLSearchParams(location.search)));




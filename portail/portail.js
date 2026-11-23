(() => {
/* Mon portail — le script de portail/index.html.
   Servie par Apps Script, la page demande « portail » au serveur et se remplit avec l'élève reconnu.
   Ouverte sur GitHub Pages, elle reste publique et pose une seule question au serveur : « ce navigateur
   a-t-il un compte de l'école ? » (réponse oui / non, sans identité). Si oui, elle passe à la page connectée. */
const EXEC = "https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec";
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;
const $ = id => document.getElementById(id);

/* ----- Mode clair / sombre : un confort par navigateur, la page marche sans. ----- */
const racine = document.documentElement;
function theme(t){ racine.dataset.theme = t; $("theme").textContent = t === "light" ? "Mode sombre" : "Mode clair"; }
let garde = ""; try { garde = localStorage.getItem("portail-theme") || ""; } catch(e) {}
theme(garde === "light" ? "light" : "dark");
$("theme").addEventListener("click", () => {
  const t = racine.dataset.theme === "light" ? "dark" : "light";
  theme(t); try { localStorage.setItem("portail-theme", t); } catch(e) {}
});

/* ----- La date du jour, en toutes lettres, et sous la forme qui sert à nommer un travail. ----- */
function dateNom(d){ return String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
function dateJour(d){ const t = d.toLocaleDateString("fr-BE", { weekday:"long", day:"numeric", month:"long", year:"numeric" }); return t.charAt(0).toUpperCase() + t.slice(1); }
{ const d = new Date(); $("date-jour").textContent = dateJour(d); $("date-nom").textContent = dateNom(d); $("date").hidden = false; }

/* Les cours (identifiants de pas-a-pas/cours.json) où l'élève crée un document et le nomme « AAAAMMJJ Titre – Prénom Nom ».
   Ajouter un cours ici = la ligne « Pour nommer ton travail » apparaît pour les classes qui le suivent. */
const NOMMER = ["rat-de-ville-formatif"];

/* ----- État connecté : tout vient du serveur. ----- */
function affiche(d){
  if(!d || !d.email) return;            // compte hors école : la page reste dans son état public
  $("non-connecte").hidden = true;
  $("coince-compte").hidden = true;
  $("bonjour").textContent = "Bonjour " + (d.prenom || "") + ", par où commences-tu ?";
  $("compte").replaceChildren("Connecté avec ", gras(d.email), d.prof ? " · professeur" : d.classe ? " · classe " : " · classe à choisir dans « Mes cours »", d.prof || !d.classe ? "" : gras(d.classe));
  $("compte").hidden = false;
  $("porte-cours").href = d.mesCours;
  if(d.devoirs){
    $("porte-devoirs").href = d.devoirs;
    $("devoirs-detail").textContent = "Classroom, directement dans le cours de " + d.classe;
  }
  if(d.seance){
    $("seance-titre").textContent = d.seance.titre;
    $("seance-lien").href = d.seance.url;
    $("maintenant").hidden = false;
  }
  if(d.prof && d.tableau){ $("lien-prof").href = d.tableau; $("lien-prof").hidden = false; }
  const annee = /^[123]/.test(d.classe || "") ? d.classe[0] : "";
  if(annee) $("porte-revise").href = SITE + "revisions/?niveau=" + annee;
  mesRevisions(d.cours);
  // La date sous la forme AAAAMMJJ : seulement pour une classe qui suit un cours où l'on crée et nomme un document.
  if(Array.isArray(d.cours) && d.cours.some(c => NOMMER.includes(c))) $("date-nommer").hidden = false;
  if(!d.prof && d.devoirs && SUIVI){
    // Un serveur pas encore republié ne connaît pas mesDevoirs : la porte « Mes devoirs » suffit alors.
    try {
      const appel = google.script.run.withSuccessHandler(r => montreDevoirs(r && r.liste)).withFailureHandler(() => {});
      if(typeof appel.mesDevoirs === "function") appel.mesDevoirs();
    } catch(e) {}
    // Les dernières annonces du flux du cours ; même prudence pour un serveur qui ne connaît pas mesAnnonces.
    try {
      const appel = google.script.run.withSuccessHandler(r => montreAnnonces(r && r.liste, d.devoirs)).withFailureHandler(() => {});
      if(typeof appel.mesAnnonces === "function") appel.mesAnnonces();
    } catch(e) {}
  }
}

/* ----- Mes devoirs : la liste lue par le serveur dans le cours Classroom de la classe. ----- */
const MOTS_DEVOIR = { "retard": "En retard", "a-rendre": "À rendre", "rendu": "Rendu", "corrige": "Corrigé" };
/** Ce que le portail écrit pour chaque devoir : [{ titre, lien, classe, mot, quand }]. Un état inconnu ou un titre
 *  vide sont écartés ; un lien qui ne mène pas à Classroom est retiré (la ligne reste, sans lien). */
function devoirsA(liste, maintenant){
  const sortie = [];
  for(const x of Array.isArray(liste) ? liste : []){
    if(!x || typeof x.titre !== "string" || !x.titre.trim() || !Object.prototype.hasOwnProperty.call(MOTS_DEVOIR, x.etat)) continue;
    const fait = x.etat === "rendu" || x.etat === "corrige";
    const e = Number(x.echeance) || 0;
    let quand = "";
    if(e && !fait){
      const jour = new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Brussels" }).format(new Date(e));
      const cle = t => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Brussels" }).format(new Date(t));
      quand = cle(e) === cle(maintenant) ? "pour aujourd'hui" : cle(e) === cle(maintenant + 86400000) ? "pour demain" : (e < maintenant ? "c'était pour le " : "pour le ") + jour;
    }
    sortie.push({ titre: x.titre.trim(), lien: typeof x.lien === "string" && x.lien.startsWith("https://classroom.google.com/") ? x.lien : "",
      classe: fait ? "fait" : x.etat, mot: MOTS_DEVOIR[x.etat], quand });
  }
  return sortie;
}
function montreDevoirs(liste){
  if(!Array.isArray(liste)) return;   // service Classroom absent ou en panne : la porte « Mes devoirs » suffit
  const lignes = devoirsA(liste, Date.now());
  const ul = $("devoirs-liste");
  if(!lignes.length){
    const li = document.createElement("li"); li.className = "devoir"; li.textContent = "Aucun devoir pour le moment dans ce cours.";
    ul.replaceChildren(li);
  } else ul.replaceChildren(...lignes.map(d => {
    const li = document.createElement("li"); li.className = d.classe;
    const boite = document.createElement(d.lien ? "a" : "div");
    if(d.lien){ boite.href = d.lien; boite.target = "_top"; } else boite.className = "devoir";
    const etat = document.createElement("span"); etat.className = "etat"; etat.textContent = d.mot;
    const b = document.createElement("b"); b.textContent = d.titre;
    boite.append(etat, b);
    if(d.quand){ const q = document.createElement("span"); q.className = "quand"; q.textContent = d.quand; boite.append(q); }
    li.append(boite); return li;
  }));
  $("devoirs").hidden = false;
}

/* ----- Les annonces : les dernières du flux Classroom du cours, lues par le serveur. ----- */
/** Ce que le portail écrit : [{ texte, quand, lien }], trois au plus. Une annonce sans texte est écartée ; un lien
 *  qui ne mène pas à Classroom est retiré (l'annonce reste, sans lien). */
function annoncesA(liste){
  const sortie = [];
  for(const x of Array.isArray(liste) ? liste : []){
    if(!x || typeof x.texte !== "string" || !x.texte.trim()) continue;
    const t = Number(x.date) || 0;
    sortie.push({ texte: x.texte.trim(),
      quand: t ? new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Brussels" }).format(new Date(t)) : "",
      lien: typeof x.lien === "string" && x.lien.startsWith("https://classroom.google.com/") ? x.lien : "" });
  }
  return sortie.slice(0, 3);
}
/** La mise en page d'une annonce, sans jamais lire son texte comme du HTML : des blocs { type: "p" | "ul", lignes },
 *  chaque ligne étant une suite de morceaux { t: "texte" | "gras" | "lien", v }. Reconnus : **gras**, les lignes qui
 *  commencent par « - », « * » ou « • » (une liste), les adresses http(s) (un lien), une ligne vide (un nouveau paragraphe). */
function morceaux(ligne){
  const sortie = [], motif = /\*\*([^*\n]+?)\*\*|https?:\/\/[^\s<>"']+/g;
  let fin = 0, m;
  const texte = v => { if(v) sortie.push({ t: "texte", v }); };
  while((m = motif.exec(ligne))){
    texte(ligne.slice(fin, m.index));
    if(m[1] !== undefined){ sortie.push({ t: "gras", v: m[1].trim() }); fin = motif.lastIndex; }
    else {
      const url = m[0].replace(/[.,;:!?)»…]+$/, "");   // la ponctuation de la phrase n'appartient pas à l'adresse
      sortie.push({ t: "lien", v: url }); fin = m.index + url.length; motif.lastIndex = fin;
    }
  }
  texte(ligne.slice(fin));
  return sortie;
}
function miseEnForme(texte){
  const blocs = [];
  let courant = null;
  for(const brute of String(texte || "").split("\n")){
    const ligne = brute.trim();
    if(!ligne){ courant = null; continue; }
    const puce = /^[-*•]\s+(.*)$/.exec(ligne);
    const type = puce ? "ul" : "p";
    if(!courant || courant.type !== type){ courant = { type, lignes: [] }; blocs.push(courant); }
    courant.lignes.push(morceaux(puce ? puce[1] : ligne));
  }
  return blocs;
}
function ecrisLigne(parent, ligne){
  for(const x of ligne){
    if(x.t === "gras"){ const b = document.createElement("b"); b.textContent = x.v; parent.append(b); }
    else if(x.t === "lien"){ const a = document.createElement("a"); a.href = x.v; a.target = "_top"; a.rel = "noopener"; a.textContent = x.v; parent.append(a); }
    else parent.append(x.v);
  }
}
function montreAnnonces(liste, cours){
  const lignes = annoncesA(liste);
  if(!lignes.length) return;          // rien à lire, ou service en panne : pas de panneau vide
  $("annonces-liste").replaceChildren(...lignes.map(a => {
    const li = document.createElement("li");
    // Une boîte, pas un lien : l'annonce porte ses propres liens, et un lien dans un lien ne marche pas.
    const boite = document.createElement("div"); boite.className = "annonce";
    if(a.quand){ const q = document.createElement("span"); q.className = "quand"; q.textContent = a.quand; boite.append(q); }
    const corps = document.createElement("div"); corps.className = "texte";
    for(const bloc of miseEnForme(a.texte)){
      const b = document.createElement(bloc.type);
      bloc.lignes.forEach((ligne, i) => {
        if(bloc.type === "ul"){ const item = document.createElement("li"); ecrisLigne(item, ligne); b.append(item); }
        else { if(i) b.append(document.createElement("br")); ecrisLigne(b, ligne); }
      });
      corps.append(b);
    }
    boite.append(corps);
    if(a.lien){ const s = document.createElement("a"); s.className = "suite"; s.href = a.lien; s.target = "_top"; s.textContent = "Lire dans Classroom"; boite.append(s); }
    li.append(boite); return li;
  }));
  $("annonces").hidden = false;
}

/* ----- Mes révisions : celles des cours ouverts pour la classe, dans l'ordre des cours. ----- */
const REVISIONS = "https://root75.github.io/campin-public/revisions/revisions.json";
const SITE = "https://root75.github.io/campin-public/";
/** Les révisions à proposer : seulement les cours de l'élève, sans doublon, et des chemins du site (jamais une autre adresse).
 *  Rend [{ id, titre, activites: [{ genre, url, jeu }] }] ; « jeu » = l'activité s'ouvre dans le portail. */
function revisionsDe(cours, table){
  const vus = new Set(), liste = [];
  for(const id of Array.isArray(cours) ? cours : []){
    if(vus.has(id) || !table || !Object.prototype.hasOwnProperty.call(table, id)) continue;
    vus.add(id);
    const c = table[id];
    if(!c || typeof c.titre !== "string" || !c.titre) continue;
    const activites = [];
    for(const x of Array.isArray(c.activites) ? c.activites : []){
      if(!x || typeof x.genre !== "string" || !x.genre || typeof x.chemin !== "string") continue;
      if(!/^[a-z0-9][a-z0-9\-\/.]*(\?(cours|jeu)=[a-z0-9\-]+)?(#[a-z]+)?$/.test(x.chemin) || x.chemin.includes("..")) continue;
      activites.push({ genre: x.genre, url: SITE + x.chemin, jeu: x.jeu === "mots-croises" ? "mots-croises" : "" });
    }
    if(activites.length) liste.push({ id, titre: c.titre, activites });
  }
  return liste;
}
function mesRevisions(cours){
  if(!Array.isArray(cours) || !cours.length || typeof fetch !== "function") return;
  fetch(REVISIONS).then(r => r.ok ? r.json() : Promise.reject()).then(t => {
    const liste = revisionsDe(cours, t.cours);
    if(!liste.length) return;
    $("revisions-liste").replaceChildren(...liste.map(c => {
      const carte = document.createElement("div"); carte.className = "revision";
      const b = document.createElement("b"); b.textContent = c.titre;
      const acts = document.createElement("div"); acts.className = "revision-activites";
      for(const a of c.activites){
        if(a.jeu){
          // Les mots croisés se jouent ici même : l'élève ne quitte pas son portail.
          const bouton = document.createElement("button"); bouton.type = "button"; bouton.className = "jouer"; bouton.textContent = a.genre + " ▸ jouer ici";
          bouton.addEventListener("click", () => joue(c.id, c.titre, a.url));
          acts.append(bouton);
        } else {
          const lien = document.createElement("a"); lien.target = "_top"; lien.href = a.url; lien.textContent = a.genre;
          acts.append(lien);
        }
      }
      carte.append(b, acts); return carte;
    }));
    $("revisions").hidden = false;
  }).catch(() => {});
}

/* ----- Jouer dans le portail : la grille du cours s'ouvre sous « Mes révisions ». ----- */
const JEU = SITE + "mots-croises/";
let outils = null;
/** Charge une seule fois le jeu (ses styles, le calcul de la grille, l'écran) et les mots de tous les cours. */
function outilsDuJeu(){
  if(outils) return outils;
  const script = src => new Promise((oui, non) => { const s = document.createElement("script"); s.src = src; s.onload = oui; s.onerror = non; document.head.append(s); });
  const style = document.createElement("link"); style.rel = "stylesheet"; style.href = JEU + "jeu.css"; document.head.append(style);
  outils = Promise.all([
    fetch(JEU + "grilles.json").then(r => r.ok ? r.json() : Promise.reject()),
    script(SITE + "assets/progres.js"), script(JEU + "grille.js").then(() => script(JEU + "jeu.js"))
  ]).then(([d]) => d.grilles).catch(e => { outils = null; throw e; });
  return outils;
}
function joue(id, titre, secours){
  const zone = $("jeu-portail");
  $("jeu-titre").textContent = "Mots croisés · " + titre;
  $("jeu-zone").textContent = "Chargement…";
  zone.hidden = false;
  if(zone.scrollIntoView) zone.scrollIntoView({ behavior: "smooth", block: "start" });
  outilsDuJeu().then(grilles => {
    if(!Object.prototype.hasOwnProperty.call(grilles, id)) throw new Error("grille absente");
    MotsCroises.monte($("jeu-zone"), id, grilles[id]);
  }).catch(() => {
    // Le jeu ne se charge pas ici : il reste sa page.
    const a = document.createElement("a"); a.target = "_top"; a.href = secours; a.textContent = "Ouvrir la grille dans sa page ▸";
    $("jeu-zone").replaceChildren("La grille ne s'ouvre pas ici. ", a);
  });
}
$("jeu-fermer").addEventListener("click", () => { $("jeu-portail").hidden = true; $("jeu-zone").replaceChildren(); });
function gras(t){ const b = document.createElement("b"); b.textContent = t; return b; }

if(SUIVI){
  google.script.run.withSuccessHandler(affiche).withFailureHandler(() => {}).portail();
} else if(location.protocol === "https:" && !/[?&]public\b/.test(location.search)){
  // « ?public » garde la page publique, pour la montrer sans être redirigé.
  // Sans compte de l'école, Google répond par sa page de connexion : le navigateur la refuse comme script, rien ne se passe.
  window.campinConnecte = oui => { if(oui === true) location.replace(EXEC + "?vue=portail"); };
  const s = document.createElement("script");
  s.src = EXEC + "?vue=connecte"; s.async = true; s.onerror = () => {};
  document.head.append(s);
}

/* ----- Météo : Open-Meteo, sans clé ni compte. Si le poste la bloque, le panneau reste caché. ----- */
const CIEL = [[0,"ciel dégagé"],[2,"quelques nuages"],[3,"ciel couvert"],[48,"brouillard"],[57,"bruine"],[67,"pluie"],[77,"neige"],[82,"averses"],[86,"averses de neige"],[99,"orage"]];
function ciel(code){ for(const [max, mot] of CIEL) if(code <= max) return mot; return ""; }
function conseil(t, code){
  if(code >= 51 && code <= 67 || code >= 80 && code <= 82 || code >= 95) return "Pour la récré : prends de quoi te couvrir de la pluie.";
  if(t <= 5) return "Pour la récré : il fait froid, prends ta veste.";
  if(t >= 25) return "Pour la récré : il fait chaud, pense à boire de l'eau.";
  return "";
}
if(typeof fetch === "function"){
  fetch("https://api.open-meteo.com/v1/forecast?latitude=50.6056&longitude=3.3878&current=temperature_2m,weather_code&timezone=Europe%2FBrussels")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(m => {
      const t = Math.round(m.current.temperature_2m), code = m.current.weather_code;
      if(!Number.isFinite(t)) return;
      $("meteo-temp").textContent = t + "°";
      $("meteo-ciel").textContent = ciel(code);
      $("meteo-conseil").textContent = conseil(t, code);
      $("meteo").hidden = false;
    }).catch(() => {});
}
/* ----- Quelques nouvelles : un titre différent à chaque visite, et à chaque clic sur « Une autre ». ----- */
const ACTUS = "https://root75.github.io/campin-public/portail/actus.json";
/** Un titre au hasard, jamais celui qu'on vient de voir quand il y en a d'autres. Seuls les liens https passent. */
function tire(actus, dernier, hasard = Math.random){
  const bons = (Array.isArray(actus) ? actus : []).filter(a => a && typeof a.titre === "string" && a.titre && /^https:\/\//.test(a.lien || ""));
  const choix = bons.length > 1 ? bons.filter(a => a.lien !== dernier) : bons;
  return choix.length ? choix[Math.floor(hasard() * choix.length)] : null;
}
if(typeof fetch === "function"){
  fetch(ACTUS).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
    let dernier = ""; try { dernier = localStorage.getItem("portail-nouvelle") || ""; } catch(e) {}
    const vus = new Set();
    const montre = () => {
      // Pendant la visite, on fait le tour de tous les titres avant d'en revoir un.
      let reste = (d.actus || []).filter(x => x && !vus.has(x.lien));
      if(!reste.length){ vus.clear(); reste = d.actus; }
      const a = tire(reste, dernier); if(!a) return;
      vus.add(a.lien);
      dernier = a.lien; try { localStorage.setItem("portail-nouvelle", dernier); } catch(e) {}
      $("nouvelle-lien").textContent = a.titre; $("nouvelle-lien").href = a.lien;
      $("nouvelle-source").textContent = a.source || "";
      $("nouvelle").hidden = false; $("nouvelle-repli").hidden = true;
    };
    $("nouvelle-autre").addEventListener("click", montre);
    montre();
  }).catch(() => {});
}
globalThis.PortailEssai = { tire, ciel, conseil, dateNom, dateJour, revisionsDe, devoirsA, annoncesA, miseEnForme };
})();
